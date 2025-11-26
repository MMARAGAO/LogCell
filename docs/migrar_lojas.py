"""
Script de Migração - APENAS LOJAS
==================================
Migra todas as lojas e suas fotos do banco antigo para o novo
"""

import sys
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
    "lojas_migradas": 0,
    "lojas_puladas": 0,
    "lojas_erro": 0,
    "fotos_migradas": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def confirmar():
    """Pede confirmação antes de iniciar"""
    print("\n" + "=" * 70)
    print("MIGRAÇÃO DE LOJAS")
    print("=" * 70)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"\nBANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  Esta operação irá:")
    print("   ✅ Migrar TODAS as lojas")
    print("   ✅ Migrar fotos das lojas")
    print("   ✅ Preservar IDs das lojas (importante para estoque!)")
    print("\n")
    
    resposta = input("Deseja continuar? (digite 'SIM'): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Operação cancelada.")
        sys.exit(0)
    
    print("\n✅ Iniciando migração...\n")


def migrar_lojas():
    """Migra lojas e suas fotos"""
    log("🏪 Iniciando migração de LOJAS...")
    
    try:
        # Buscar lojas já existentes no banco novo
        log("Verificando lojas já existentes no banco novo...")
        lojas_existentes = []
        resultado_existentes = supabase_novo.table("lojas").select("id").execute()
        if resultado_existentes.data:
            lojas_existentes = [loja["id"] for loja in resultado_existentes.data]
        
        lojas_existentes_set = set(lojas_existentes)
        log(f"ℹ️  {len(lojas_existentes_set)} lojas já existem no banco novo (serão puladas)")
        
        # Buscar todas as lojas do banco antigo
        log("Buscando lojas do banco antigo...")
        resultado = supabase_antigo.table("lojas").select("*").execute()
        lojas = resultado.data
        
        log(f"✅ Encontradas {len(lojas)} lojas no banco antigo")
        
        for loja in tqdm(lojas, desc="Migrando lojas"):
            try:
                # Pular se já existe
                if loja["id"] in lojas_existentes_set:
                    stats["lojas_puladas"] += 1
                    continue
                
                # Preparar dados da loja
                dados_loja = {
                    "id": loja["id"],  # Preservar ID para manter compatibilidade com estoque
                    "nome": loja["nome"],
                    "telefone": loja.get("telefone"),
                    "endereco": loja.get("endereco"),
                    "ativo": True,
                    "criado_em": loja.get("createdat", datetime.now().isoformat()),
                    "atualizado_em": loja.get("updatedat", datetime.now().isoformat())
                }
                
                # Inserir loja no banco novo (usar upsert para evitar erro se já existir)
                supabase_novo.table("lojas").upsert(dados_loja).execute()
                stats["lojas_migradas"] += 1
                
                # Migrar fotos da loja
                if loja.get("fotourl") and len(loja["fotourl"]) > 0:
                    for idx, url in enumerate(loja["fotourl"]):
                        try:
                            foto = {
                                "loja_id": loja["id"],
                                "url": url,
                                "ordem": idx,
                                "is_principal": idx == 0,
                                "criado_em": datetime.now().isoformat()
                            }
                            supabase_novo.table("lojas_fotos").insert(foto).execute()
                            stats["fotos_migradas"] += 1
                        except Exception as e:
                            # Ignorar erro de foto duplicada
                            if "duplicate key value" not in str(e).lower():
                                log(f"⚠️  Erro ao migrar foto da loja '{loja['nome']}': {e}", "WARN")
                
            except Exception as e:
                stats["lojas_erro"] += 1
                log(f"❌ Erro ao migrar loja ID {loja['id']} ('{loja.get('nome', 'sem nome')}'): {e}", "ERROR")
        
        log(f"✅ {stats['lojas_migradas']} lojas migradas com sucesso")
        log(f"⏭️  {stats['lojas_puladas']} lojas já existiam (puladas)")
        log(f"✅ {stats['fotos_migradas']} fotos de lojas migradas")
        if stats["lojas_erro"] > 0:
            log(f"⚠️  {stats['lojas_erro']} lojas com erro", "WARN")
        
    except Exception as e:
        log(f"❌ Erro fatal ao migrar lojas: {str(e)}", "ERROR")
        raise


def exibir_resumo():
    """Exibe resumo final da migração"""
    print("\n" + "=" * 70)
    print("📊 RESUMO DA MIGRAÇÃO")
    print("=" * 70)
    print(f"\n✅ Lojas migradas:              {stats['lojas_migradas']}")
    print(f"⏭️  Lojas já existiam:           {stats['lojas_puladas']}")
    print(f"❌ Lojas com erro:              {stats['lojas_erro']}")
    print(f"✅ Fotos migradas:              {stats['fotos_migradas']}")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        confirmar()
        migrar_lojas()
        exibir_resumo()
        log("\n🎉 MIGRAÇÃO DE LOJAS CONCLUÍDA!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
