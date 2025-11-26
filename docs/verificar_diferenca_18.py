"""
Verificar Diferença de 18 Unidades
===================================
Compara os totais entre banco antigo e novo
"""

from supabase import create_client
from collections import defaultdict

# Banco ANTIGO (chave corrigida)
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 80)
print("VERIFICAÇÃO DE DIFERENÇA - 18 UNIDADES")
print("=" * 80)

# 1. Buscar estoque ANTIGO
print("\n📊 Carregando estoque do banco ANTIGO...")
estoque_antigo = []
offset = 0
while True:
    resultado = supabase_antigo.table("estoque_lojas").select("produto_id, loja_id, quantidade").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    estoque_antigo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

total_antigo = sum(e['quantidade'] for e in estoque_antigo)
print(f"✅ Total ANTIGO: {total_antigo:,} unidades ({len(estoque_antigo)} registros)")

# 2. Buscar estoque NOVO
print("\n📊 Carregando estoque do banco NOVO...")
estoque_novo = []
offset = 0
while True:
    resultado = supabase_novo.table("estoque_lojas").select("id_produto, id_loja, quantidade").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    estoque_novo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

total_novo = sum(e['quantidade'] for e in estoque_novo)
print(f"✅ Total NOVO: {total_novo:,} unidades ({len(estoque_novo)} registros)")

# 3. Calcular diferença
diferenca = total_antigo - total_novo
print(f"\n" + "=" * 80)
print(f"⚠️  DIFERENÇA: {diferenca} unidades")
print(f"   Antigo: {total_antigo:,}")
print(f"   Novo:   {total_novo:,}")
print("=" * 80)

# 4. Buscar produtos do banco antigo
print("\n📦 Carregando produtos do banco ANTIGO...")
produtos_antigo = []
offset = 0
while True:
    resultado = supabase_antigo.table("produto").select("id, descricao").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    produtos_antigo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

print(f"✅ {len(produtos_antigo)} produtos no banco ANTIGO")

# 5. Buscar produtos do banco novo
print("\n📦 Carregando produtos do banco NOVO...")
produtos_novo = []
offset = 0
while True:
    resultado = supabase_novo.table("produtos").select("id, descricao").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    produtos_novo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

print(f"✅ {len(produtos_novo)} produtos no banco NOVO")

# 6. Criar mapas de descrição -> id
descricao_para_id_antigo = {p['descricao']: p['id'] for p in produtos_antigo}
descricao_para_id_novo = {p['descricao']: p['id'] for p in produtos_novo}

# 7. Verificar produtos no antigo que NÃO estão no novo
print("\n🔍 Verificando produtos do ANTIGO que não têm correspondente no NOVO...")
produtos_nao_migrados = []
for p in produtos_antigo:
    if p['descricao'] not in descricao_para_id_novo:
        produtos_nao_migrados.append(p['descricao'])

if produtos_nao_migrados:
    print(f"⚠️  {len(produtos_nao_migrados)} produtos NÃO foram encontrados no banco novo:")
    for desc in produtos_nao_migrados[:20]:  # Mostrar primeiros 20
        print(f"   - {desc}")
    if len(produtos_nao_migrados) > 20:
        print(f"   ... e mais {len(produtos_nao_migrados) - 20} produtos")
else:
    print("✅ Todos os produtos do antigo existem no novo!")

# 8. Verificar se há estoque NÃO migrado
print("\n🔍 Verificando estoque não migrado...")
total_nao_migrado = 0
produtos_com_estoque_nao_migrado = []

for e in estoque_antigo:
    produto_antigo = next((p for p in produtos_antigo if p['id'] == e['produto_id']), None)
    if produto_antigo:
        descricao = produto_antigo['descricao']
        if descricao not in descricao_para_id_novo:
            total_nao_migrado += e['quantidade']
            produtos_com_estoque_nao_migrado.append({
                'descricao': descricao,
                'quantidade': e['quantidade']
            })

if total_nao_migrado > 0:
    print(f"⚠️  {total_nao_migrado} unidades NÃO foram migradas (produtos sem correspondência)")
    print("\n📋 Produtos com estoque não migrado:")
    for item in produtos_com_estoque_nao_migrado[:10]:
        print(f"   - {item['descricao']}: {item['quantidade']} unidades")
    if len(produtos_com_estoque_nao_migrado) > 10:
        print(f"   ... e mais {len(produtos_com_estoque_nao_migrado) - 10} produtos")
else:
    print("✅ Todo o estoque foi migrado!")

# 9. Análise detalhada da diferença
print("\n🔍 Análise detalhada...")

# Verificar se há produtos duplicados no antigo
descricoes_antigo = [p['descricao'] for p in produtos_antigo]
duplicados_antigo = len(descricoes_antigo) - len(set(descricoes_antigo))
if duplicados_antigo > 0:
    print(f"⚠️  {duplicados_antigo} descrições duplicadas no banco ANTIGO")

# Verificar produtos com quantidade 0 no antigo
zero_antigo = sum(1 for e in estoque_antigo if e['quantidade'] == 0)
if zero_antigo > 0:
    print(f"ℹ️  {zero_antigo} registros com quantidade 0 no banco ANTIGO")

# Verificar produtos com quantidade 0 no novo
zero_novo = sum(1 for e in estoque_novo if e['quantidade'] == 0)
if zero_novo > 0:
    print(f"ℹ️  {zero_novo} registros com quantidade 0 no banco NOVO")

print("\n" + "=" * 80)
print("📊 RESUMO FINAL:")
print("=" * 80)
print(f"Total ANTIGO:               {total_antigo:,} unidades ({len(estoque_antigo)} registros)")
print(f"Total NOVO:                 {total_novo:,} unidades ({len(estoque_novo)} registros)")
print(f"Diferença total:            {diferenca} unidades")
print(f"")
print(f"Produtos não migrados:      {len(produtos_nao_migrados)}")
print(f"Unidades não migradas:      {total_nao_migrado}")
print(f"Diferença inexplicada:      {diferenca - total_nao_migrado} unidades")
print(f"")
print(f"Registros com qtd 0 ANTIGO: {zero_antigo}")
print(f"Registros com qtd 0 NOVO:   {zero_novo}")
print("=" * 80)
