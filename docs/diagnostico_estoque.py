"""
Script de Diagnóstico - ESTOQUE
================================
Monitora mudanças no estoque em tempo real
"""

from supabase import create_client, Client
from datetime import datetime
import time

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 80)
print("DIAGNÓSTICO DE ESTOQUE - MONITORAMENTO EM TEMPO REAL")
print("=" * 80)
print("\nMonitorando alterações no estoque a cada 5 segundos...")
print("Pressione Ctrl+C para parar\n")

def obter_estatisticas():
    """Obtém estatísticas atuais do estoque"""
    try:
        # Buscar TODOS os registros com paginação
        all_estoques = []
        offset = 0
        page_size = 1000
        
        while True:
            resultado = supabase.table("estoque_lojas").select("id_produto, id_loja, quantidade").range(offset, offset + page_size - 1).execute()
            if not resultado.data:
                break
            all_estoques.extend(resultado.data)
            offset += page_size
            if len(resultado.data) < page_size:
                break
        
        total_registros = len(all_estoques)
        total_unidades = sum(e.get("quantidade", 0) for e in all_estoques)
        
        # Agrupar por loja
        lojas_count = {}
        for e in all_estoques:
            loja_id = e["id_loja"]
            if loja_id not in lojas_count:
                lojas_count[loja_id] = {"registros": 0, "unidades": 0}
            lojas_count[loja_id]["registros"] += 1
            lojas_count[loja_id]["unidades"] += e.get("quantidade", 0)
        
        return {
            "total_registros": total_registros,
            "total_unidades": total_unidades,
            "por_loja": lojas_count,
            "timestamp": datetime.now()
        }
    except Exception as e:
        print(f"❌ Erro ao obter estatísticas: {e}")
        return None

# Primeira leitura
stats_anterior = obter_estatisticas()
if stats_anterior:
    print(f"[{stats_anterior['timestamp'].strftime('%H:%M:%S')}] Inicial:")
    print(f"   📦 Registros: {stats_anterior['total_registros']}")
    print(f"   📊 Unidades:  {stats_anterior['total_unidades']:,}")
    print(f"   🏪 Lojas:")
    for loja_id, dados in sorted(stats_anterior['por_loja'].items()):
        print(f"      Loja {loja_id}: {dados['registros']} registros, {dados['unidades']} unidades")

try:
    while True:
        time.sleep(5)  # Aguardar 5 segundos
        
        stats_atual = obter_estatisticas()
        if not stats_atual:
            continue
        
        # Calcular diferenças
        diff_registros = stats_atual['total_registros'] - stats_anterior['total_registros']
        diff_unidades = stats_atual['total_unidades'] - stats_anterior['total_unidades']
        
        # Mostrar apenas se houve mudança
        if diff_registros != 0 or diff_unidades != 0:
            print(f"\n[{stats_atual['timestamp'].strftime('%H:%M:%S')}] MUDANÇA DETECTADA:")
            
            if diff_registros > 0:
                print(f"   ✅ Registros: {stats_atual['total_registros']} (+{diff_registros})")
            elif diff_registros < 0:
                print(f"   ⚠️  Registros: {stats_atual['total_registros']} ({diff_registros})")
            else:
                print(f"   📦 Registros: {stats_atual['total_registros']} (sem mudança)")
            
            if diff_unidades > 0:
                print(f"   ✅ Unidades:  {stats_atual['total_unidades']:,} (+{diff_unidades:,})")
            elif diff_unidades < 0:
                print(f"   ⚠️  Unidades:  {stats_atual['total_unidades']:,} ({diff_unidades:,})")
            else:
                print(f"   📊 Unidades:  {stats_atual['total_unidades']:,} (sem mudança)")
            
            # Mostrar diferenças por loja
            print(f"   🏪 Por loja:")
            todas_lojas = set(stats_anterior['por_loja'].keys()) | set(stats_atual['por_loja'].keys())
            for loja_id in sorted(todas_lojas):
                dados_anterior = stats_anterior['por_loja'].get(loja_id, {"registros": 0, "unidades": 0})
                dados_atual = stats_atual['por_loja'].get(loja_id, {"registros": 0, "unidades": 0})
                
                diff_reg_loja = dados_atual["registros"] - dados_anterior["registros"]
                diff_uni_loja = dados_atual["unidades"] - dados_anterior["unidades"]
                
                if diff_reg_loja != 0 or diff_uni_loja != 0:
                    status = "✅" if diff_reg_loja >= 0 and diff_uni_loja >= 0 else "⚠️"
                    print(f"      {status} Loja {loja_id}: {dados_atual['registros']} reg ({diff_reg_loja:+d}), {dados_atual['unidades']} un ({diff_uni_loja:+d})")
            
            stats_anterior = stats_atual
        else:
            # Apenas mostrar ponto para indicar que está monitorando
            print(".", end="", flush=True)

except KeyboardInterrupt:
    print("\n\n⚠️  Monitoramento interrompido pelo usuário")
    print("\n" + "=" * 80)
    print("📊 ESTATÍSTICAS FINAIS")
    print("=" * 80)
    if stats_anterior:
        print(f"\n   📦 Total de Registros: {stats_anterior['total_registros']}")
        print(f"   📊 Total de Unidades:  {stats_anterior['total_unidades']:,}")
        print(f"   🏪 Por Loja:")
        for loja_id, dados in sorted(stats_anterior['por_loja'].items()):
            print(f"      Loja {loja_id}: {dados['registros']} registros, {dados['unidades']} unidades")
    print("=" * 80)
