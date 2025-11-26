"""
Script para LIMPAR PRODUTOS do Banco Novo
==========================================
⚠️ ATENÇÃO: Este script APAGA todos os produtos do banco novo!
Use com cuidado!
"""

import sys
from datetime import datetime
from supabase import create_client, Client
from tqdm import tqdm

# =====================================================
# CONFIGURAÇÕES DO BANCO NOVO
# =====================================================

BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_novo: Client = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

# Estatísticas
stats = {
    "fotos_deletadas": 0,
    "estoque_deletado": 0,
    "produtos_deletados": 0,
    "erros": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def confirmar():
    """Pede confirmação antes de apagar"""
    print("\n" + "=" * 70)
    print("⚠️  ATENÇÃO - OPERAÇÃO DESTRUTIVA ⚠️")
    print("=" * 70)
    print(f"\nBANCO: {BANCO_NOVO_URL}")
    print("\n🔥 Esta operação irá APAGAR:")
    print("   ❌ TODOS os produtos")
    print("   ❌ TODAS as fotos de produtos")
    print("   ❌ TODOS os registros de estoque")
    print("\n⚠️  Esta ação NÃO PODE ser desfeita!")
    print("\n")
    
    resposta = input("Tem certeza que deseja continuar? (digite 'APAGAR' em maiúsculas): ")
    if resposta.strip() != "APAGAR":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    # Segunda confirmação
    print("\n🚨 ÚLTIMA CONFIRMAÇÃO 🚨")
    resposta2 = input("Digite novamente 'APAGAR' para confirmar: ")
    if resposta2.strip() != "APAGAR":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    print("\n⚠️  Iniciando limpeza...\n")


def deletar_fotos_produtos():
    """Deleta todas as fotos de produtos"""
    log("🗑️  Deletando fotos de produtos...")
    
    try:
        # Buscar todas as fotos
        fotos = []
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase_novo.table("fotos_produtos").select("id").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            fotos.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"Encontradas {len(fotos)} fotos para deletar")
        
        # Deletar em lotes
        for foto in tqdm(fotos, desc="Deletando fotos"):
            try:
                supabase_novo.table("fotos_produtos").delete().eq("id", foto["id"]).execute()
                stats["fotos_deletadas"] += 1
            except Exception as e:
                stats["erros"] += 1
                log(f"❌ Erro ao deletar foto ID {foto['id']}: {e}", "ERROR")
        
        log(f"✅ {stats['fotos_deletadas']} fotos deletadas")
        
    except Exception as e:
        log(f"❌ Erro ao deletar fotos: {str(e)}", "ERROR")


def deletar_estoque():
    """Deleta todos os registros de estoque"""
    log("🗑️  Deletando registros de estoque...")
    
    try:
        # Buscar todos os registros de estoque
        estoques = []
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase_novo.table("estoque_lojas").select("id_produto, id_loja").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            estoques.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"Encontrados {len(estoques)} registros de estoque para deletar")
        
        # Deletar em lotes
        for estoque in tqdm(estoques, desc="Deletando estoque"):
            try:
                supabase_novo.table("estoque_lojas").delete().eq("id_produto", estoque["id_produto"]).eq("id_loja", estoque["id_loja"]).execute()
                stats["estoque_deletado"] += 1
            except Exception as e:
                stats["erros"] += 1
                log(f"❌ Erro ao deletar estoque produto={estoque['id_produto']}, loja={estoque['id_loja']}: {e}", "ERROR")
        
        log(f"✅ {stats['estoque_deletado']} registros de estoque deletados")
        
    except Exception as e:
        log(f"❌ Erro ao deletar estoque: {str(e)}", "ERROR")


def deletar_produtos():
    """Deleta todos os produtos"""
    log("🗑️  Deletando produtos...")
    
    try:
        # Buscar todos os produtos
        produtos = []
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase_novo.table("produtos").select("id").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            produtos.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"Encontrados {len(produtos)} produtos para deletar")
        
        # Deletar em lotes
        for produto in tqdm(produtos, desc="Deletando produtos"):
            try:
                supabase_novo.table("produtos").delete().eq("id", produto["id"]).execute()
                stats["produtos_deletados"] += 1
            except Exception as e:
                stats["erros"] += 1
                log(f"❌ Erro ao deletar produto ID {produto['id']}: {e}", "ERROR")
        
        log(f"✅ {stats['produtos_deletados']} produtos deletados")
        
    except Exception as e:
        log(f"❌ Erro ao deletar produtos: {str(e)}", "ERROR")


def exibir_resumo():
    """Exibe resumo final"""
    print("\n" + "=" * 70)
    print("📊 RESUMO DA LIMPEZA")
    print("=" * 70)
    print(f"\n🗑️  Fotos deletadas:            {stats['fotos_deletadas']}")
    print(f"🗑️  Estoque deletado:           {stats['estoque_deletado']}")
    print(f"🗑️  Produtos deletados:         {stats['produtos_deletados']}")
    print(f"\n❌ Erros:                       {stats['erros']}")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        confirmar()
        
        # Ordem de deleção (respeitar foreign keys)
        deletar_fotos_produtos()  # Primeiro as fotos (dependem de produtos)
        deletar_estoque()          # Depois o estoque (depende de produtos)
        deletar_produtos()         # Por último os produtos
        
        exibir_resumo()
        
        log("\n✅ LIMPEZA CONCLUÍDA!", "SUCCESS")
        log("ℹ️  Você pode agora executar o script de migração de produtos", "INFO")
        
    except KeyboardInterrupt:
        log("\n⚠️  Operação interrompida pelo usuário", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
