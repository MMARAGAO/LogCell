"""
Script de Migração - APENAS ESTOQUE (QUANTIDADES)
=================================================
Migra as quantidades em estoque do banco antigo para o novo
IMPORTANTE: Execute primeiro o script de migração de produtos!
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

# Mapeamento de IDs (descrição produto antigo -> UUID produto novo)
mapeamento_produtos: Dict[str, str] = {}

# Estatísticas
stats = {
    "estoque_migrado": 0,
    "estoque_pulado": 0,
    "estoque_erro": 0,
    "produtos_nao_encontrados": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def confirmar():
    """Pede confirmação antes de iniciar"""
    print("\n" + "=" * 70)
    print("MIGRAÇÃO DE ESTOQUE (QUANTIDADES)")
    print("=" * 70)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"BANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  Esta operação irá:")
    print("   ✅ Migrar quantidades da tabela 'estoque_lojas'")
    print("   ⚠️  Requer que os produtos já estejam migrados!")
    print("   ❌ NÃO migra produtos (execute o outro script primeiro)")
    print("\n")
    
    resposta = input("Deseja continuar? (digite 'SIM'): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    print("\n✅ Iniciando migração...\n")


def criar_mapeamento_produtos():
    """Cria mapeamento entre produtos do banco antigo e novo"""
    log("🔗 Criando mapeamento de produtos...")
    
    try:
        # Buscar todos os produtos do banco ANTIGO
        log("Buscando produtos do banco antigo...")
        produtos_antigos = []
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase_antigo.table("estoque").select("id, descricao").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            produtos_antigos.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ {len(produtos_antigos)} produtos encontrados no banco antigo")
        
        # Buscar todos os produtos do banco NOVO
        log("Buscando produtos do banco novo...")
        produtos_novos = []
        offset = 0
        
        while True:
            resultado = supabase_novo.table("produtos").select("id, descricao").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            produtos_novos.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ {len(produtos_novos)} produtos encontrados no banco novo")
        
        # Criar dicionário: descricao -> UUID
        produtos_novos_dict = {p["descricao"]: p["id"] for p in produtos_novos}
        
        # Mapear produtos antigos para novos
        for produto_antigo in produtos_antigos:
            descricao = produto_antigo["descricao"]
            if descricao in produtos_novos_dict:
                # Mapear ID antigo (int) -> UUID novo
                mapeamento_produtos[produto_antigo["id"]] = produtos_novos_dict[descricao]
        
        log(f"✅ {len(mapeamento_produtos)} produtos mapeados com sucesso")
        
        produtos_nao_mapeados = len(produtos_antigos) - len(mapeamento_produtos)
        if produtos_nao_mapeados > 0:
            log(f"⚠️  {produtos_nao_mapeados} produtos do banco antigo não encontrados no novo", "WARN")
        
    except Exception as e:
        log(f"❌ Erro ao criar mapeamento: {str(e)}", "ERROR")
        raise


def migrar_estoque():
    """Migra quantidades em estoque (tabela estoque_lojas)"""
    log("📊 Iniciando migração de ESTOQUE POR LOJA...")
    
    try:
        # Buscar registros já existentes no banco novo - RECARREGAR SEMPRE
        log("Verificando registros de estoque já existentes...")
        estoques_existentes = set()
        offset_existentes = 0
        page_size = 1000
        
        while True:
            resultado_existentes = supabase_novo.table("estoque_lojas").select("id_produto, id_loja").range(offset_existentes, offset_existentes + page_size - 1).execute()
            if not resultado_existentes.data:
                break
            for e in resultado_existentes.data:
                # Garantir que a chave seja uma tupla de strings
                chave = (str(e["id_produto"]), str(e["id_loja"]))
                estoques_existentes.add(chave)
            offset_existentes += page_size
            if len(resultado_existentes.data) < page_size:
                break
        
        log(f"ℹ️  {len(estoques_existentes)} registros de estoque já existem (serão pulados)")
        
        # Buscar TODOS os registros de estoque do banco antigo
        estoques = []
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
                
                # Verificar se o produto está no mapeamento
                if produto_id_antigo not in mapeamento_produtos:
                    stats["produtos_nao_encontrados"] += 1
                    continue
                
                produto_id_novo = mapeamento_produtos[produto_id_antigo]
                loja_id = estoque["loja_id"]
                
                # Verificar se já existe - CONVERTER TUDO PARA STRING
                chave_verificacao = (str(produto_id_novo), str(loja_id))
                if chave_verificacao in estoques_existentes:
                    stats["estoque_pulado"] += 1
                    continue
                
                # Inserir registro de estoque
                dados_estoque = {
                    "id_produto": produto_id_novo,
                    "id_loja": loja_id,
                    "quantidade": int(estoque.get("quantidade", 0)),
                    "atualizado_em": estoque.get("updatedat", datetime.now().isoformat())
                    # NÃO incluir atualizado_por - evita erro de foreign key
                }
                
                supabase_novo.table("estoque_lojas").insert(dados_estoque).execute()
                stats["estoque_migrado"] += 1
                
                # Adicionar ao set para evitar duplicatas nas próximas iterações
                estoques_existentes.add(chave_verificacao)
                
            except Exception as e:
                error_msg = str(e)
                # Se for erro de chave duplicada, apenas pular silenciosamente
                if "duplicate key" in error_msg or "23505" in error_msg:
                    stats["estoque_pulado"] += 1
                    # Adicionar ao set mesmo assim
                    estoques_existentes.add((str(produto_id_novo), str(loja_id)))
                else:
                    stats["estoque_erro"] += 1
                    log(f"❌ Erro ao migrar estoque produto_id={estoque.get('produto_id')}, loja_id={estoque.get('loja_id')}: {e}", "ERROR")
        
        log(f"✅ {stats['estoque_migrado']} registros de estoque migrados com sucesso")
        log(f"⏭️  {stats['estoque_pulado']} registros já existiam (pulados)")
        if stats["produtos_nao_encontrados"] > 0:
            log(f"⚠️  {stats['produtos_nao_encontrados']} registros com produto não encontrado (pulados)", "WARN")
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
    print(f"\n✅ Estoque migrado:             {stats['estoque_migrado']}")
    print(f"⏭️  Estoque já existia:          {stats['estoque_pulado']}")
    print(f"⚠️  Produto não encontrado:      {stats['produtos_nao_encontrados']}")
    print(f"❌ Estoque com erro:            {stats['estoque_erro']}")
    print(f"\n📦 Total de produtos mapeados:  {len(mapeamento_produtos)}")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        confirmar()
        criar_mapeamento_produtos()
        migrar_estoque()
        exibir_resumo()
        log("\n🎉 MIGRAÇÃO DE ESTOQUE CONCLUÍDA!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
