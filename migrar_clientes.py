"""
Script de Migração - CLIENTES
==============================
Migra clientes do banco antigo para o novo banco
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
    "clientes_migrados": 0,
    "clientes_pulados": 0,
    "clientes_erro": 0,
    "clientes_sem_cpf": 0
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def escolher_modo():
    """Escolhe o modo de migração"""
    print("\n" + "=" * 70)
    print("MIGRAÇÃO DE CLIENTES")
    print("=" * 70)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"BANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  Esta operação irá:")
    print("   ✅ Migrar todos os clientes do banco antigo")
    print("   ✅ Mapear campo 'doc' → 'cpf'")
    print("   ✅ Mapear campo 'endereco' → 'logradouro'")
    print("   ✅ Adicionar observações sobre Instagram e WhatsApp")
    print("   ✅ Pular clientes já existentes (por CPF)")
    print("\n📋 ESCOLHA O MODO DE MIGRAÇÃO:")
    print("   1 - MODO AUTOMÁTICO: Migra tudo de uma vez (rápido)")
    print("   2 - MODO MANUAL: Confirma cada cliente antes de migrar (lento, para verificar)")
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


def migrar_clientes(modo_manual=False):
    """Migra clientes do banco antigo para o novo"""
    log("👥 Iniciando migração de CLIENTES...")
    
    if modo_manual:
        log("🔍 MODO MANUAL ATIVADO - Você confirmará cada cliente", "INFO")
    else:
        log("⚡ MODO AUTOMÁTICO ATIVADO - Migrando tudo de uma vez", "INFO")
    
    try:
        # =====================================================
        # 1. CARREGAR CLIENTES JÁ EXISTENTES NO BANCO NOVO
        # =====================================================
        log("📊 Verificando clientes já existentes no banco novo...")
        clientes_existentes = set()
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase_novo.table("clientes").select("cpf").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            for c in resultado.data:
                if c.get("cpf"):
                    clientes_existentes.add(c["cpf"])
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        log(f"ℹ️  {len(clientes_existentes)} clientes já existem (serão pulados por CPF)")
        
        # =====================================================
        # 2. CARREGAR CLIENTES DO BANCO ANTIGO
        # =====================================================
        log("📦 Carregando clientes do banco ANTIGO...")
        clientes_antigos = []
        offset = 0
        
        while True:
            resultado = supabase_antigo.table("clientes").select("*").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            clientes_antigos.extend(resultado.data)
            offset += page_size
            log(f"  Carregados {len(clientes_antigos)} clientes...", "INFO")
            if len(resultado.data) < page_size:
                break
        
        log(f"✅ Encontrados {len(clientes_antigos)} clientes no banco antigo")
        
        # =====================================================
        # 3. MIGRAR CLIENTES
        # =====================================================
        log("🚀 Iniciando migração de clientes...")
        
        for idx, cliente_antigo in enumerate(clientes_antigos):
            try:
                # Função auxiliar para limpar strings
                def limpar_string(valor):
                    """Retorna string limpa ou None"""
                    if valor is None:
                        return None
                    valor_limpo = str(valor).strip()
                    return valor_limpo if valor_limpo else None
                
                cpf = limpar_string(cliente_antigo.get("doc"))
                nome = limpar_string(cliente_antigo.get("nome")) or "Cliente sem nome"
                telefone = limpar_string(cliente_antigo.get("telefone"))
                
                # Se CPF for maior que 14 caracteres, desconsiderar (colocar NULL)
                if cpf and len(cpf) > 14:
                    cpf = None
                    stats["clientes_sem_cpf"] += 1
                
                # Se não tem CPF, registrar mas continuar
                if not cpf:
                    stats["clientes_sem_cpf"] += 1
                    cpf = None  # Permitir NULL no banco novo
                
                # Verificar se já existe (por CPF)
                if cpf and cpf in clientes_existentes:
                    stats["clientes_pulados"] += 1
                    if modo_manual:
                        print(f"\n⏭️  Cliente '{nome}' (CPF: {cpf}) já existe - pulado")
                    continue
                
                # MODO MANUAL: Mostrar detalhes e pedir confirmação
                if modo_manual:
                    print("\n" + "=" * 70)
                    print(f"👤 CLIENTE {idx + 1}/{len(clientes_antigos)}")
                    print("=" * 70)
                    print(f"   Nome:      {nome}")
                    print(f"   CPF:       {cpf or '(sem CPF)'}")
                    print(f"   Email:     {cliente_antigo.get('email', '(vazio)')}")
                    print(f"   Telefone:  {cliente_antigo.get('telefone', '(vazio)')}")
                    print(f"   Endereço:  {cliente_antigo.get('endereco', '(vazio)')}")
                    print(f"   Instagram: {cliente_antigo.get('instagram', '(vazio)')}")
                    print(f"   WhatsApp:  {'Sim' if cliente_antigo.get('whatsapp') else 'Não'}")
                    
                    print("\n   Opções:")
                    print("   [S] Sim - Migrar este cliente")
                    print("   [N] Não - Pular este cliente")
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
                            break
                        
                        elif resposta == "N":
                            print("   ⏭️  Cliente pulado")
                            stats["clientes_pulados"] += 1
                            break
                        
                        elif resposta == "S":
                            break
                        
                        else:
                            print("   ❌ Opção inválida! Digite S, N, T ou Q")
                    
                    if resposta == "N":
                        continue
                
                # Preparar observações
                observacoes_lista = []
                if cliente_antigo.get("instagram"):
                    observacoes_lista.append(f"Instagram: {cliente_antigo['instagram']}")
                if cliente_antigo.get("whatsapp"):
                    observacoes_lista.append("WhatsApp: Sim")
                
                observacoes = " | ".join(observacoes_lista) if observacoes_lista else None
                
                # Preparar dados para inserção
                dados_cliente = {
                    "nome": nome,
                    "cpf": cpf,
                    "telefone": telefone,
                    "email": limpar_string(cliente_antigo.get("email")),
                    "logradouro": limpar_string(cliente_antigo.get("endereco")),
                    "observacoes": observacoes,
                    "ativo": True,
                    "criado_em": cliente_antigo.get("createdat", datetime.now().isoformat()),
                    "atualizado_em": cliente_antigo.get("updated_at", datetime.now().isoformat())
                }
                
                # Remover campos vazios (exceto telefone que sempre tem valor)
                dados_cliente = {k: v for k, v in dados_cliente.items() if v is not None or k == "telefone"}
                
                # Inserir cliente
                supabase_novo.table("clientes").insert(dados_cliente).execute()
                stats["clientes_migrados"] += 1
                
                # Adicionar CPF ao set de existentes
                if cpf:
                    clientes_existentes.add(cpf)
                
                if modo_manual:
                    print(f"   ✅ Cliente migrado com sucesso!")
                elif idx > 0 and idx % 100 == 0:
                    percentual = (idx / len(clientes_antigos)) * 100
                    print(f"   📊 Progresso: {idx}/{len(clientes_antigos)} clientes ({percentual:.1f}%)")
                
            except Exception as e:
                error_msg = str(e)
                if "duplicate key" in error_msg or "23505" in error_msg:
                    stats["clientes_pulados"] += 1
                    if cpf:
                        clientes_existentes.add(cpf)
                    if modo_manual:
                        print(f"   ⏭️  Cliente já existe (CPF duplicado)")
                else:
                    stats["clientes_erro"] += 1
                    log(f"❌ Erro ao migrar cliente '{nome}': {e}", "ERROR")
        
        log(f"✅ {stats['clientes_migrados']} clientes migrados com sucesso")
        log(f"⏭️  {stats['clientes_pulados']} clientes já existiam (pulados)")
        if stats["clientes_sem_cpf"] > 0:
            log(f"⚠️  {stats['clientes_sem_cpf']} clientes sem CPF (migrados mesmo assim)", "WARN")
        if stats["clientes_erro"] > 0:
            log(f"⚠️  {stats['clientes_erro']} clientes com erro", "WARN")
        
    except Exception as e:
        log(f"❌ Erro fatal ao migrar clientes: {str(e)}", "ERROR")
        raise


def exibir_resumo():
    """Exibe resumo final da migração"""
    print("\n" + "=" * 70)
    print("📊 RESUMO DA MIGRAÇÃO DE CLIENTES")
    print("=" * 70)
    print(f"\n✅ Clientes migrados:           {stats['clientes_migrados']}")
    print(f"⏭️  Clientes já existiam:        {stats['clientes_pulados']}")
    print(f"⚠️  Clientes sem CPF:            {stats['clientes_sem_cpf']}")
    print(f"❌ Clientes com erro:           {stats['clientes_erro']}")
    print("=" * 70)


def main():
    """Função principal"""
    try:
        modo = escolher_modo()
        confirmar_inicio()
        
        modo_manual = (modo == "2")
        migrar_clientes(modo_manual=modo_manual)
        
        exibir_resumo()
        log("\n🎉 MIGRAÇÃO DE CLIENTES CONCLUÍDA!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        exibir_resumo()
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
