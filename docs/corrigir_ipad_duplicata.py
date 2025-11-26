"""
Corrigir TOUCH IPAD PRO 9.7 - Remover Duplicata
================================================
Ajusta as quantidades para o valor correto do banco antigo
"""

from supabase import create_client

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

PRODUTO_DESCRICAO = "TOUCH IPAD PRO 9.7 G+OCA PRETA"
PRODUTO_UUID = "4bff949a-a607-48ce-b156-32295a0eabfb"

print("\n" + "=" * 80)
print("CORRIGINDO TOUCH IPAD PRO 9.7 G+OCA PRETA")
print("=" * 80)

# 1. Buscar registros atuais
print("\n📊 Buscando registros atuais...")
resultado = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", PRODUTO_UUID).execute()

print(f"✅ {len(resultado.data)} registros encontrados")

for reg in resultado.data:
    print(f"   ID: {reg['id']} | Loja: {reg['id_loja']} | Quantidade: {reg['quantidade']}")

# 2. Ajustar quantidades
print("\n🔧 Ajustando quantidades...")

ajustes = [
    {"loja": 1, "qtd_correta": 5, "qtd_atual": 10},
    {"loja": 3, "qtd_correta": 12, "qtd_atual": 20},
    {"loja": 4, "qtd_correta": 21, "qtd_atual": 42}
]

total_reduzido = 0

for ajuste in ajustes:
    # Buscar o registro específico
    registro = next((r for r in resultado.data if r['id_loja'] == ajuste['loja']), None)
    
    if not registro:
        print(f"   ⚠️  Loja {ajuste['loja']}: Registro não encontrado!")
        continue
    
    # Atualizar quantidade
    try:
        supabase_novo.table("estoque_lojas").update({
            "quantidade": ajuste['qtd_correta']
        }).eq("id", registro['id']).execute()
        
        diferenca = ajuste['qtd_atual'] - ajuste['qtd_correta']
        total_reduzido += diferenca
        
        print(f"   ✅ Loja {ajuste['loja']}: {ajuste['qtd_atual']} → {ajuste['qtd_correta']} (-{diferenca})")
        
    except Exception as e:
        print(f"   ❌ Erro ao atualizar Loja {ajuste['loja']}: {e}")

print("\n" + "=" * 80)
print("RESUMO DA CORREÇÃO:")
print("=" * 80)
print(f"Total reduzido: {total_reduzido} unidades")
print("=" * 80)

# 3. Verificar novo total geral
print("\n🔍 Verificando novo total no banco...")
estoque_novo = []
offset = 0
while True:
    resultado = supabase_novo.table("estoque_lojas").select("quantidade").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    estoque_novo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

total_novo = sum(e['quantidade'] for e in estoque_novo)
print(f"✅ Novo total: {total_novo:,} unidades ({len(estoque_novo)} registros)")
print(f"📊 Esperado: 36,222 unidades (36,256 - 34)")
print(f"📊 Banco antigo: 36,227 unidades")
print(f"📊 Diferença final: {total_novo - 36227:+d} unidades")
