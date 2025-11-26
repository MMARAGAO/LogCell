"""
Investigar os DOIS produtos TOUCH IPAD PRO 9.7
==============================================
"""

from supabase import create_client

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTEwNDMzNSwiZXhwIjoyMDQ0NjgwMzM1fQ.uOy4qSSDLpI5vv5Fg-ZVMkAsPjHNfg20vZ0-MUQjxJY"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

UUID_GOCA = "4bff949a-a607-48ce-b156-32295a0eabfb"
UUID_APPLE = "5eda7292-2a09-4b60-9de6-18d18e71c6d1"

print("\n" + "=" * 80)
print("INVESTIGANDO OS DOIS PRODUTOS TOUCH IPAD PRO 9.7")
print("=" * 80)

# Buscar informações completas dos produtos no banco NOVO
print("\n🔍 Buscando informações dos produtos no banco NOVO...")

produto_goca = supabase_novo.table("produtos").select("*").eq("id", UUID_GOCA).execute()
produto_apple = supabase_novo.table("produtos").select("*").eq("id", UUID_APPLE).execute()

print("\n" + "=" * 80)
print("PRODUTO 1 - UUID: 4bff949a (G+OCA PRO)")
print("=" * 80)
if produto_goca.data:
    p = produto_goca.data[0]
    print(f"Descrição: {p['descricao']}")
    print(f"Marca: {p['marca']}")
    print(f"Preço Compra: R$ {p.get('preco_compra', 'N/A')}")
    print(f"Preço Venda: R$ {p.get('preco_venda', 'N/A')}")
    print(f"Código Barras: {p.get('codigo_barras', 'N/A')}")
    print(f"Criado em: {p.get('created_at', 'N/A')}")
else:
    print("❌ Produto não encontrado!")

print("\n" + "=" * 80)
print("PRODUTO 2 - UUID: 5eda7292 (APPLE)")
print("=" * 80)
if produto_apple.data:
    p = produto_apple.data[0]
    print(f"Descrição: {p['descricao']}")
    print(f"Marca: {p['marca']}")
    print(f"Preço Compra: R$ {p.get('preco_compra', 'N/A')}")
    print(f"Preço Venda: R$ {p.get('preco_venda', 'N/A')}")
    print(f"Código Barras: {p.get('codigo_barras', 'N/A')}")
    print(f"Criado em: {p.get('created_at', 'N/A')}")
else:
    print("❌ Produto não encontrado!")

# Buscar no banco ANTIGO por descrição
print("\n" + "=" * 80)
print("BUSCANDO NO BANCO ANTIGO")
print("=" * 80)

resultado_antigo = supabase_antigo.table("produtos").select("*").ilike("descricao", "%TOUCH IPAD PRO 9.7%").execute()

print(f"\n📊 {len(resultado_antigo.data)} produtos encontrados no banco ANTIGO:")

for p in resultado_antigo.data:
    print(f"\n   ID: {p['id']} | Marca: {p.get('marca', 'N/A')}")
    print(f"   Descrição: {p['descricao']}")
    print(f"   Preço Compra: R$ {p.get('preco_compra', 'N/A')} | Venda: R$ {p.get('preco_venda', 'N/A')}")
    print(f"   Código Barras: {p.get('codigo_barras', 'N/A')}")
    
    # Buscar estoque desse produto no banco antigo
    estoque = supabase_antigo.table("estoque_lojas").select("*").eq("produto_id", p['id']).execute()
    total = sum(e['quantidade'] for e in estoque.data)
    print(f"   📦 Estoque Total: {total} unidades em {len(estoque.data)} lojas")

# Verificar estoques atuais no banco NOVO
print("\n" + "=" * 80)
print("ESTOQUES NO BANCO NOVO")
print("=" * 80)

print("\n📦 Produto 1 - G+OCA PRO (4bff949a):")
estoque_goca = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", UUID_GOCA).execute()
for e in estoque_goca.data:
    print(f"   Loja {e['id_loja']}: {e['quantidade']} unidades")
print(f"   TOTAL: {sum(e['quantidade'] for e in estoque_goca.data)} unidades")

print("\n📦 Produto 2 - APPLE (5eda7292):")
estoque_apple = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", UUID_APPLE).execute()
for e in estoque_apple.data:
    print(f"   Loja {e['id_loja']}: {e['quantidade']} unidades")
print(f"   TOTAL: {sum(e['quantidade'] for e in estoque_apple.data)} unidades")

print("\n" + "=" * 80)
print("RESUMO")
print("=" * 80)
print(f"Total G+OCA PRO: {sum(e['quantidade'] for e in estoque_goca.data)} unidades")
print(f"Total APPLE: {sum(e['quantidade'] for e in estoque_apple.data)} unidades")
print(f"TOTAL GERAL: {sum(e['quantidade'] for e in estoque_goca.data) + sum(e['quantidade'] for e in estoque_apple.data)} unidades")
print("\n" + "=" * 80)
