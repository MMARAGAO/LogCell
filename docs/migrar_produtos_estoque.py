"""
Script de Migração - APENAS PRODUTOS E ESTOQUE
===============================================
Migra produtos e quantidades em estoque do banco antigo para o novo
"""

import sys
from typing import Dict
from datetime import datetime
from supabase import create_client, Client
from tqdm import tqdm

# =====================================================
# CONFIGURAÇÕES DOS BANCOS
# =====================================================

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

# Clientes Supabase
supabase_antigo: Client = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo: Client = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

# Mapeamento de IDs (ID antigo -> ID novo UUID)
mapeamento_produtos: Dict[int, str] = {}

# Estatísticas
stats = {
    "produtos_migrados": 0,
    "produtos_pulados": 0,
    "produtos_erro": 0,
    "estoque_migrado": 0,
    "estoque_erro": 0,
    "fotos_migradas": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def confirmar():
    """Pede confirmação antes de iniciar"""
    print("\n" + "=" * 70)
    print("MIGRAÇÃO DE PRODUTOS E ESTOQUE")
    print("=" * 70)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"BANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  Esta operação irá:")
    print("   ✅ Migrar TODOS os produtos da tabela 'estoque'")
    print("   ✅ Migrar as quantidades da tabela 'estoque_lojas'")
    print("   ✅ Migrar fotos dos produtos")
    print("   ❌ NÃO migra usuários, clientes, vendas, etc.")
    print("\n")
    
    resposta = input("Deseja continuar? (digite 'SIM'): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    print("\n✅ Iniciando migração...\n")


def migrar_produtos():
    """Migra produtos (da tabela estoque do banco antigo)"""
    log("📦 Iniciando migração de PRODUTOS...")
    
    try:
        # Buscar produtos já existentes no banco novo para evitar duplicação
        log("Verificando produtos já existentes no banco novo...")
        produtos_existentes = []
        offset_existentes = 0
        page_size = 1000
        
        while True:
            resultado_existentes = supabase_novo.table("produtos").select("descricao").range(offset_existentes, offset_existentes + page_size - 1).execute()
            if not resultado_existentes.data:
                break
            produtos_existentes.extend([p["descricao"] for p in resultado_existentes.data])
            offset_existentes += page_size
            if len(resultado_existentes.data) < page_size:
                break
        
        produtos_existentes_set = set(produtos_existentes)
        log(f"ℹ️  {len(produtos_existentes_set)} produtos já existem no banco novo (serão pulados)")
        
        # Buscar TODOS os produtos do banco antigo (com paginação)
        produtos = []
        offset = 0
        
        log("Buscando produtos do banco antigo (pode levar alguns segundos)...")
        while True:
            resultado = supabase_antigo.table("estoque").select("*").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            produtos.extend(resultado.data)
            offset += page_size
            log(f"  Carregados {len(produtos)} produtos...", "INFO")
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ Encontrados {len(produtos)} produtos no banco antigo")
        
        stats["produtos_pulados"] = 0
        
        for produto in tqdm(produtos, desc="Migrando produtos"):
            try:
                # Pular se já existe (verificar por descrição)
                if produto["descricao"] in produtos_existentes_set:
                    stats["produtos_pulados"] += 1
                    continue
                
                # Preparar dados do produto (SEM foreign keys que causam erro)
                dados_produto = {
                    "descricao": produto["descricao"],
                    "modelos": produto.get("modelo"),
                    "marca": produto.get("marca"),
                    "preco_compra": produto.get("preco_compra"),
                    "preco_venda": produto.get("preco_venda"),
                    "quantidade_minima": int(produto.get("minimo", 0)),
                    "ativo": True,
                    "criado_em": produto.get("createdat", datetime.now().isoformat()),
                    "atualizado_em": produto.get("updatedat", datetime.now().isoformat())
                    # NÃO incluir criado_por - evita erro de foreign key
                }
                
                # Inserir produto no banco novo
                resultado_insert = supabase_novo.table("produtos").insert(dados_produto).execute()
                novo_id = resultado_insert.data[0]["id"]
                
                # Mapear ID antigo -> ID novo UUID
                mapeamento_produtos[produto["id"]] = novo_id
                stats["produtos_migrados"] += 1
                
                # Migrar fotos do produto
                if produto.get("fotourl") and len(produto["fotourl"]) > 0:
                    for idx, url in enumerate(produto["fotourl"]):
                        try:
                            foto = {
                                "produto_id": novo_id,
                                "url": url,
                                "nome_arquivo": f"foto_{idx + 1}.jpg",
                                "ordem": idx,
                                "is_principal": idx == 0,
                                "criado_em": datetime.now().isoformat()
                                # NÃO incluir criado_por
                            }
                            supabase_novo.table("fotos_produtos").insert(foto).execute()
                            stats["fotos_migradas"] += 1
                        except Exception as e:
                            log(f"⚠️  Erro ao migrar foto do produto '{produto['descricao']}': {e}", "WARN")
                
            except Exception as e:
                stats["produtos_erro"] += 1
                log(f"❌ Erro ao migrar produto ID {produto['id']} ('{produto.get('descricao', 'sem nome')}'): {e}", "ERROR")
        
        log(f"✅ {stats['produtos_migrados']} produtos migrados com sucesso")
        log(f"⏭️  {stats['produtos_pulados']} produtos já existiam (pulados)")
        log(f"✅ {stats['fotos_migradas']} fotos de produtos migradas")
        if stats["produtos_erro"] > 0:
            log(f"⚠️  {stats['produtos_erro']} produtos com erro", "WARN")
        
    except Exception as e:
        log(f"❌ Erro fatal ao migrar produtos: {str(e)}", "ERROR")
        raise


def migrar_estoque():
    """Migra quantidades em estoque (tabela estoque_lojas)"""
    log("📊 Iniciando migração de ESTOQUE POR LOJA...")
    
    try:
        # Buscar TODOS os registros de estoque (com paginação)
        estoques = []
        page_size = 1000
        offset = 0
        
        log("Buscando registros de estoque do banco antigo...")
        while True:
            resultado = supabase_antigo.table("estoque_lojas").select("*").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            estoques.extend(resultado.data)
            offset += page_size
            log(f"  Carregados {len(estoques)} registros...", "INFO")
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ Encontrados {len(estoques)} registros de estoque no banco antigo")
        
        for estoque in tqdm(estoques, desc="Migrando estoque"):
            try:
                produto_id_antigo = estoque["produto_id"]
                
                # Verificar se o produto foi mapeado
                if produto_id_antigo not in mapeamento_produtos:
                    # Produto não foi migrado - tentar buscar e criar
                    log(f"⚠️  Produto ID {produto_id_antigo} não encontrado no mapeamento", "WARN")
                    
                    try:
                        # Buscar produto no banco antigo
                        produto_antigo = supabase_antigo.table("estoque").select("*").eq("id", produto_id_antigo).execute()
                        
                        if not produto_antigo.data:
                            log(f"❌ Produto ID {produto_id_antigo} não existe no banco antigo", "ERROR")
                            stats["estoque_erro"] += 1
                            continue
                        
                        produto = produto_antigo.data[0]
                        
                        # Criar produto no banco novo
                        dados_produto = {
                            "descricao": produto["descricao"],
                            "modelos": produto.get("modelo"),
                            "marca": produto.get("marca"),
                            "preco_compra": produto.get("preco_compra"),
                            "preco_venda": produto.get("preco_venda"),
                            "quantidade_minima": int(produto.get("minimo", 0)),
                            "ativo": True,
                            "criado_em": produto.get("createdat", datetime.now().isoformat()),
                            "atualizado_em": produto.get("updatedat", datetime.now().isoformat())
                        }
                        
                        resultado_insert = supabase_novo.table("produtos").insert(dados_produto).execute()
                        novo_id = resultado_insert.data[0]["id"]
                        
                        # Adicionar ao mapeamento
                        mapeamento_produtos[produto_id_antigo] = novo_id
                        stats["produtos_migrados"] += 1
                        
                        log(f"✅ Produto '{produto['descricao']}' criado automaticamente", "INFO")
                        
                    except Exception as e:
                        log(f"❌ Erro ao criar produto ID {produto_id_antigo}: {e}", "ERROR")
                        stats["estoque_erro"] += 1
                        continue
                
                # Inserir registro de estoque
                dados_estoque = {
                    "id_produto": mapeamento_produtos[produto_id_antigo],
                    "id_loja": estoque["loja_id"],
                    "quantidade": int(estoque.get("quantidade", 0)),
                    "atualizado_em": estoque.get("updatedat", datetime.now().isoformat())
                    # NÃO incluir atualizado_por - evita erro de foreign key
                }
                
                supabase_novo.table("estoque_lojas").insert(dados_estoque).execute()
                stats["estoque_migrado"] += 1
                
            except Exception as e:
                stats["estoque_erro"] += 1
                log(f"❌ Erro ao migrar estoque produto_id={estoque.get('produto_id')}, loja_id={estoque.get('loja_id')}: {e}", "ERROR")
        
        log(f"✅ {stats['estoque_migrado']} registros de estoque migrados com sucesso")
        if stats["estoque_erro"] > 0:
            log(f"⚠️  {stats['estoque_erro']} registros com erro", "WARN")
        
    except Exception as e:
        log(f"❌ Erro fatal ao migrar estoque: {str(e)}", "ERROR")
        raise


def exibir_resumo():
    """Exibe resumo final da migração"""
    print("\n" + "=" * 70)
    print("📊 RESUMO DA MIGRAÇÃO")
    print("=" * 70)
    print(f"\n✅ Produtos migrados:           {stats['produtos_migrados']}")
    print(f"⏭️  Produtos já existiam:        {stats['produtos_pulados']}")
    print(f"❌ Produtos com erro:           {stats['produtos_erro']}")
    print(f"✅ Fotos migradas:              {stats['fotos_migradas']}")
    print(f"\n✅ Estoque migrado:             {stats['estoque_migrado']}")
    print(f"❌ Estoque com erro:            {stats['estoque_erro']}")
    print(f"\n📦 Total de mapeamentos:        {len(mapeamento_produtos)}")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        confirmar()
        
        # 1. Migrar produtos primeiro
        migrar_produtos()
        
        # 2. Migrar estoque usando os mapeamentos criados
        migrar_estoque()
        
        # 3. Exibir resumo
        exibir_resumo()
        
        log("\n🎉 MIGRAÇÃO CONCLUÍDA!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
