"""
Teste de Paginação - Estoque Lojas
===================================
Testa se a paginação está funcionando corretamente
"""

from supabase import create_client

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 80)
print("TESTE DE PAGINAÇÃO - ESTOQUE_LOJAS")
print("=" * 80)

# Simular a mesma paginação do JavaScript
all_estoques = []
page_size = 1000
offset = 0
has_more = True
iteracao = 0

while has_more:
    iteracao += 1
    print(f"\n🔄 Iteração {iteracao}: buscando registros {offset} a {offset + page_size - 1}")
    
    resultado = supabase.table("estoque_lojas").select("id_produto, quantidade").range(offset, offset + page_size - 1).execute()
    
    data = resultado.data
    print(f"📥 Iteração {iteracao}: recebeu {len(data) if data else 0} registros")
    
    if data and len(data) > 0:
        all_estoques.extend(data)
        print(f"📦 Total acumulado: {len(all_estoques)} registros")
        offset += page_size
        has_more = len(data) == page_size
        
        if not has_more:
            print(f"⏹️ Última página! Recebeu {len(data)} registros (menos que {page_size})")
    else:
        print(f"⚠️ Nenhum dado recebido na iteração {iteracao}")
        has_more = False

print(f"\n" + "=" * 80)
print(f"✅ TOTAL FINAL: {len(all_estoques)} registros")

# Calcular total de unidades
total_unidades = sum(e['quantidade'] for e in all_estoques)
print(f"✅ TOTAL DE UNIDADES: {total_unidades:,}")

# Mostrar primeiros e últimos registros
print(f"\n📊 Primeiros 5 registros:")
for e in all_estoques[:5]:
    print(f"   - Produto: {e['id_produto']}, Quantidade: {e['quantidade']}")

print(f"\n📊 Últimos 5 registros:")
for e in all_estoques[-5:]:
    print(f"   - Produto: {e['id_produto']}, Quantidade: {e['quantidade']}")

print("=" * 80)
