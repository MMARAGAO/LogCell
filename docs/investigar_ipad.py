"""
Investigar o que aconteceu com o TOUCH IPAD PRO 9.7
====================================================
"""

from supabase import create_client

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

PRODUTO_UUID = "4bff949a-a607-48ce-b156-32295a0eabfb"

print("\n📊 Verificando TOUCH IPAD PRO 9.7 G+OCA PRETA...")

# Buscar TODOS os registros desse produto
resultado = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", PRODUTO_UUID).execute()

print(f"\nTotal de registros: {len(resultado.data)}")
print(f"\nDetalhes:")

total = 0
for reg in resultado.data:
    print(f"   ID: {reg['id']}")
    print(f"   Loja: {reg['id_loja']}")
    print(f"   Quantidade: {reg['quantidade']}")
    print(f"   Criado em: {reg.get('created_at', 'N/A')}")
    print()
    total += reg['quantidade']

print(f"TOTAL: {total} unidades")
print(f"\nEsperado: 38 unidades (5 + 12 + 21)")

# Verificar se há duplicatas
lojas_count = {}
for reg in resultado.data:
    loja = reg['id_loja']
    lojas_count[loja] = lojas_count.get(loja, 0) + 1

print(f"\n🔍 Contagem por loja:")
for loja, count in sorted(lojas_count.items()):
    if count > 1:
        print(f"   ⚠️  Loja {loja}: {count} registros (DUPLICADO!)")
    else:
        print(f"   ✅ Loja {loja}: {count} registro")
