"""
Script de Migração - ESTOQUE POR DESCRIÇÃO
===========================================
Migra estoque usando DESCRIÇÃO do produto para mapear (não ID)
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

# Estatísticas
stats = {
    "estoque_migrado": 0,
    "estoque_pulado": 0,
    "estoque_erro": 0,
    "produtos_nao_encontrados": 0,
    "total_unidades_migradas": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def escolher_modo():
    """Escolhe o modo de migração"""
    print("\n" + "=" * 70)
    print("MIGRAÇÃO DE ESTOQUE - POR DESCRIÇÃO DO PRODUTO")
    print("=" * 70)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"BANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  Esta operação irá:")
    print("   ✅ Buscar produtos pela DESCRIÇÃO (não pelo ID)")
    print("   ✅ Migrar quantidades da tabela 'estoque_lojas'")
    print("   ✅ Pular registros já existentes")
    print("\n📋 ESCOLHA O MODO DE MIGRAÇÃO:")
    print("   1 - MODO AUTOMÁTICO: Migra tudo de uma vez (rápido)")
    print("   2 - MODO MANUAL: Confirma cada produto antes de migrar (lento, para verificar)")
    print("\n")
    
    while True:
        modo = input("Digite 1 ou 2: ").strip()
        if modo in ["1", "2"]:
            return modo
        print("❌ Opção inválida! Digite 1 ou 2.")
    

def confirmar_inicio():
    """Pede confirmação final antes de iniciar"""
    resposta = input("\nDeseja continuar? (digite 'SIM'): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    print("\n✅ Iniciando migração...\n")


def migrar_estoque(modo_manual=False):
    """Migra estoque usando descrição dos produtos"""
    log("📊 Iniciando migração de ESTOQUE POR DESCRIÇÃO...")
    
    if modo_manual:
        log("🔍 MODO MANUAL ATIVADO - Você confirmará cada produto", "INFO")
    else:
        log("⚡ MODO AUTOMÁTICO ATIVADO - Migrando tudo de uma vez", "INFO")
    
    try:
        # =====================================================
        # 1. CARREGAR PRODUTOS DO BANCO ANTIGO
        # =====================================================
        log("📦 Carregando produtos do banco ANTIGO...")
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
        
        # Criar dicionário: id_antigo -> descricao
        produtos_antigos_dict = {p["id"]: p["descricao"] for p in produtos_antigos}
        log(f"✅ {len(produtos_antigos)} produtos carregados do banco antigo")
        
        # =====================================================
        # 2. CARREGAR PRODUTOS DO BANCO NOVO
        # =====================================================
        log("📦 Carregando produtos do banco NOVO...")
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
        
        # Criar dicionário: descricao -> uuid_novo
        produtos_novos_dict = {p["descricao"]: p["id"] for p in produtos_novos}
        log(f"✅ {len(produtos_novos)} produtos carregados do banco novo")
        
        # =====================================================
        # 3. CARREGAR ESTOQUE JÁ EXISTENTE NO BANCO NOVO
        # =====================================================
        log("📊 Verificando estoque já existente no banco novo...")
        estoques_existentes = set()
        offset = 0
        
        while True:
            resultado = supabase_novo.table("estoque_lojas").select("id_produto, id_loja").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            for e in resultado.data:
                chave = (str(e["id_produto"]), str(e["id_loja"]))
                estoques_existentes.add(chave)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"ℹ️  {len(estoques_existentes)} registros de estoque já existem (serão pulados)")
        
        # =====================================================
        # 4. CARREGAR ESTOQUE DO BANCO ANTIGO
        # =====================================================
        log("📦 Carregando estoque do banco ANTIGO...")
        estoques_antigo = []
        offset = 0
        
        while True:
            resultado = supabase_antigo.table("estoque_lojas").select("*").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            estoques_antigo.extend(resultado.data)
            offset += page_size
            log(f"  Carregados {len(estoques_antigo)} registros...", "INFO")
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ Encontrados {len(estoques_antigo)} registros de estoque no banco antigo")
        
        # =====================================================
        # 5. AGRUPAR ESTOQUE POR PRODUTO
        # =====================================================
        log("🔄 Agrupando estoque por produto...")
        from collections import defaultdict
        
        produtos_estoque = defaultdict(list)  # produto_id_antigo -> [estoques]
        
        for estoque in estoques_antigo:
            produto_id_antigo = estoque["produto_id"]
            if produto_id_antigo in produtos_antigos_dict:
                descricao = produtos_antigos_dict[produto_id_antigo]
                if descricao in produtos_novos_dict:
                    produtos_estoque[produto_id_antigo].append(estoque)
        
        produtos_unicos = list(produtos_estoque.keys())
        log(f"✅ {len(produtos_unicos)} produtos únicos para migrar")
        
        # =====================================================
        # 6. MIGRAR ESTOQUE (AGRUPADO POR PRODUTO)
        # =====================================================
        log("🚀 Iniciando migração de estoque...")
        
        produtos_processados = 0
        
        for idx, produto_id_antigo in enumerate(produtos_unicos):
            try:
                # Buscar descrição e UUID
                descricao = produtos_antigos_dict[produto_id_antigo]
                produto_uuid_novo = produtos_novos_dict[descricao]
                
                # Pegar todos os estoques deste produto
                estoques_produto = produtos_estoque[produto_id_antigo]
                total_quantidade_produto = sum(int(e.get("quantidade", 0)) for e in estoques_produto)
                
                # MODO MANUAL: Mostrar detalhes e pedir confirmação
                if modo_manual:
                    print("\n" + "=" * 70)
                    print(f"📦 PRODUTO {idx + 1}/{len(produtos_unicos)}")
                    print("=" * 70)
                    print(f"   Descrição: {descricao}")
                    print(f"   UUID Novo: {produto_uuid_novo}")
                    print(f"   Total Geral: {total_quantidade_produto} unidades")
                    print(f"\n   📍 Estoque por loja:")
                    
                    for e in estoques_produto:
                        print(f"      Loja {e['loja_id']}: {e.get('quantidade', 0)} unidades")
                    
                    print("\n   Opções:")
                    print("   [S] Sim - Migrar TODAS as lojas deste produto")
                    print("   [N] Não - Pular este produto completamente")
                    print("   [T] Todos - Migrar este e todos os próximos (modo automático)")
                    print("   [Q] Quit - Parar migração")
                    
                    while True:
                        resposta = input("\n   Digite sua escolha [S/N/T/Q]: ").strip().upper()
                        
                        if resposta == "Q":
                            print("\n⚠️  Migração interrompida pelo usuário")
                            raise KeyboardInterrupt
                        
                        elif resposta == "T":
                            print("\n⚡ Mudando para MODO AUTOMÁTICO...")
                            modo_manual = False
                            # Não criar novo iterador, apenas continuar processando
                            break
                        
                        elif resposta == "N":
                            print("   ⏭️  Produto pulado")
                            for e in estoques_produto:
                                stats["estoque_pulado"] += 1
                            break
                        
                        elif resposta == "S":
                            break
                        
                        else:
                            print("   ❌ Opção inválida! Digite S, N, T ou Q")
                    
                    if resposta == "N":
                        continue
                
                # Mostrar barra de progresso apenas no modo automático
                if not modo_manual and idx == 0:
                    # Criar barra apenas uma vez ao entrar no modo automático
                    from tqdm import tqdm
                    print(f"\n📊 Processando produtos restantes...")
                
                # Migrar TODAS as lojas deste produto
                lojas_migradas = 0
                for estoque in estoques_produto:
                    try:
                        loja_id = estoque["loja_id"]
                        quantidade = int(estoque.get("quantidade", 0))
                        
                        # Verificar se já existe
                        chave_verificacao = (str(produto_uuid_novo), str(loja_id))
                        if chave_verificacao in estoques_existentes:
                            stats["estoque_pulado"] += 1
                            continue
                        
                        # Inserir registro de estoque
                        dados_estoque = {
                            "id_produto": produto_uuid_novo,
                            "id_loja": loja_id,
                            "quantidade": quantidade,
                            "atualizado_em": estoque.get("updatedat", datetime.now().isoformat())
                        }
                        
                        supabase_novo.table("estoque_lojas").insert(dados_estoque).execute()
                        stats["estoque_migrado"] += 1
                        stats["total_unidades_migradas"] += quantidade
                        lojas_migradas += 1
                        
                        # Adicionar ao set para evitar duplicatas
                        estoques_existentes.add(chave_verificacao)
                        
                    except Exception as e:
                        error_msg = str(e)
                        if "duplicate key" in error_msg or "23505" in error_msg:
                            stats["estoque_pulado"] += 1
                            estoques_existentes.add((str(produto_uuid_novo), str(loja_id)))
                        else:
                            stats["estoque_erro"] += 1
                            log(f"❌ Erro ao migrar estoque loja {loja_id}: {e}", "ERROR")
                
                if modo_manual:
                    print(f"   ✅ Produto migrado! {lojas_migradas} loja(s) adicionada(s)")
                elif idx > 0 and idx % 100 == 0:
                    # Mostrar progresso a cada 100 produtos no modo automático
                    percentual = (idx / len(produtos_unicos)) * 100
                    print(f"   📊 Progresso: {idx}/{len(produtos_unicos)} produtos ({percentual:.1f}%)")
                
                produtos_processados += 1
                
            except Exception as e:
                stats["estoque_erro"] += 1
                log(f"❌ Erro ao processar produto {produto_id_antigo}: {e}", "ERROR")
        
        log(f"✅ {stats['estoque_migrado']} registros de estoque migrados com sucesso")
        log(f"✅ {stats['total_unidades_migradas']} unidades migradas no total")
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
    print(f"\n✅ Estoque migrado:             {stats['estoque_migrado']} registros")
    print(f"✅ Total de unidades:           {stats['total_unidades_migradas']} unidades")
    print(f"⏭️  Estoque já existia:          {stats['estoque_pulado']} registros")
    print(f"⚠️  Produto não encontrado:      {stats['produtos_nao_encontrados']} registros")
    print(f"❌ Estoque com erro:            {stats['estoque_erro']} registros")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        modo = escolher_modo()
        confirmar_inicio()
        
        modo_manual = (modo == "2")
        migrar_estoque(modo_manual=modo_manual)
        
        exibir_resumo()
        log("\n🎉 MIGRAÇÃO DE ESTOQUE CONCLUÍDA!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        exibir_resumo()
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
