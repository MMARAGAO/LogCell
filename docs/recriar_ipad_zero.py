"""
Recriar TOUCH IPAD PRO 9.7 do Zero
===================================
Deleta TODOS os registros e recria corretamente
"""

from supabase import create_client

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

PRODUTO_UUID = "4bff949a-a607-48ce-b156-32295a0eabfb"

print("\n" + "=" * 80)
print("RECRIANDO TOUCH IPAD PRO 9.7 G+OCA PRETA DO ZERO")
print("=" * 80)

# 1. Buscar TODOS os registros atuais
print("\n📊 Buscando TODOS os registros atuais...")
resultado = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", PRODUTO_UUID).execute()

print(f"✅ {len(resultado.data)} registros encontrados")
total_antes = sum(r['quantidade'] for r in resultado.data)
print(f"📊 Total ANTES: {total_antes} unidades")

for reg in resultado.data:
    print(f"   ID: {reg['id']} | Loja: {reg['id_loja']} | Qtd: {reg['quantidade']}")

# 2. DELETAR TODOS os registros
print("\n🗑️  Deletando TODOS os registros...")
try:
    supabase_novo.table("estoque_lojas").delete().eq("id_produto", PRODUTO_UUID).execute()
    print("✅ Todos os registros deletados")
except Exception as e:
    print(f"❌ Erro ao deletar: {e}")
    exit(1)

# 3. Verificar se foi deletado
resultado_apos = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", PRODUTO_UUID).execute()
print(f"📊 Registros após delete: {len(resultado_apos.data)}")

if len(resultado_apos.data) > 0:
    print("❌ ERRO: Ainda há registros! Eles não foram deletados.")
    for reg in resultado_apos.data:
        print(f"   ID: {reg['id']} | Loja: {reg['id_loja']} | Qtd: {reg['quantidade']}")
    exit(1)

# 4. RECRIAR com as quantidades corretas do banco ANTIGO
print("\n✨ Recriando registros com quantidades corretas...")

registros_corretos = [
    {"loja": 1, "quantidade": 5},
    {"loja": 3, "quantidade": 12},
    {"loja": 4, "quantidade": 21}
]

total_inserido = 0

for reg in registros_corretos:
    try:
        supabase_novo.table("estoque_lojas").insert({
            "id_produto": PRODUTO_UUID,
            "id_loja": reg['loja'],
            "quantidade": reg['quantidade']
        }).execute()
        
        print(f"   ✅ Loja {reg['loja']}: {reg['quantidade']} unidades inseridas")
        total_inserido += reg['quantidade']
        
    except Exception as e:
        print(f"   ❌ Erro ao inserir Loja {reg['loja']}: {e}")

print(f"\n📊 Total inserido: {total_inserido} unidades")

# 5. Verificar resultado final
print("\n🔍 Verificando resultado final...")
resultado_final = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", PRODUTO_UUID).execute()

print(f"✅ {len(resultado_final.data)} registros criados")
total_final = sum(r['quantidade'] for r in resultado_final.data)
print(f"📊 Total FINAL: {total_final} unidades")

for reg in resultado_final.data:
    print(f"   ID: {reg['id']} | Loja: {reg['id_loja']} | Qtd: {reg['quantidade']}")

if total_final == 38:
    print("\n✅ SUCESSO! Total correto: 38 unidades")
else:
    print(f"\n❌ ERRO! Total esperado: 38, obtido: {total_final}")

print("\n" + "=" * 80)
print("FIM DA RECRIAÇÃO")
print("=" * 80)
