"""
Script de Verificação de Estoque
=================================
Compara quantidades entre banco antigo e novo para encontrar diferenças
"""

from supabase import create_client, Client
from collections import defaultdict

# =====================================================
# CONFIGURAÇÕES DOS BANCOS
# =====================================================

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo: Client = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo: Client = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 80)
print("VERIFICAÇÃO DE ESTOQUE - COMPARAÇÃO ENTRE BANCOS")
print("=" * 80)

# =====================================================
# 1. VERIFICAR ESTRUTURA DAS TABELAS
# =====================================================
print("\n📋 1. VERIFICANDO ESTRUTURA DAS TABELAS...")

print("\n   BANCO ANTIGO:")
print("   - Tabela: estoque_lojas")
resultado = supabase_antigo.table("estoque_lojas").select("*", count="exact").limit(1).execute()
print(f"   - Total de registros: {resultado.count}")

resultado = supabase_antigo.table("estoque_lojas").select("quantidade").execute()
total_antigo = sum(r.get("quantidade", 0) for r in resultado.data)
print(f"   - Total de unidades: {total_antigo:,}")

print("\n   BANCO NOVO:")
print("   - Tabela: estoque_lojas")
resultado = supabase_novo.table("estoque_lojas").select("*", count="exact").limit(1).execute()
print(f"   - Total de registros: {resultado.count}")

# Buscar TODAS as quantidades do banco novo (paginação)
print("   - Carregando todas as quantidades...")
estoques_novo = []
offset = 0
page_size = 1000

while True:
    resultado = supabase_novo.table("estoque_lojas").select("id_produto, id_loja, quantidade").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    estoques_novo.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

total_novo = sum(e.get("quantidade", 0) for e in estoques_novo)
print(f"   - Total de unidades: {total_novo:,}")

# =====================================================
# 2. COMPARAR TOTAIS
# =====================================================
print("\n" + "=" * 80)
print("📊 2. COMPARAÇÃO DE TOTAIS")
print("=" * 80)
print(f"\n   Banco ANTIGO: {total_antigo:,} unidades")
print(f"   Banco NOVO:   {total_novo:,} unidades")
print(f"   DIFERENÇA:    {total_antigo - total_novo:,} unidades faltando")
print(f"   PERCENTUAL:   {(total_novo / total_antigo * 100):.1f}% migrado")

# =====================================================
# 3. VERIFICAR REGISTROS FALTANTES
# =====================================================
print("\n" + "=" * 80)
print("🔍 3. VERIFICANDO REGISTROS FALTANTES")
print("=" * 80)

print("\n   Carregando registros do banco antigo...")
estoques_antigo = []
offset = 0

while True:
    resultado = supabase_antigo.table("estoque_lojas").select("produto_id, loja_id, quantidade").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    estoques_antigo.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

print(f"   ✅ {len(estoques_antigo)} registros carregados do banco antigo")

# Criar mapeamento de produtos
print("\n   Criando mapeamento de produtos...")
produtos_antigos = []
offset = 0

while True:
    resultado = supabase_antigo.table("estoque").select("id, descricao").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    produtos_antigos.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

produtos_novos = []
offset = 0

while True:
    resultado = supabase_novo.table("produtos").select("id, descricao").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    produtos_novos.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

produtos_novos_dict = {p["descricao"]: p["id"] for p in produtos_novos}
mapeamento = {}
for p in produtos_antigos:
    if p["descricao"] in produtos_novos_dict:
        mapeamento[p["id"]] = produtos_novos_dict[p["descricao"]]

print(f"   ✅ {len(mapeamento)} produtos mapeados")

# Criar sets para comparação
registros_antigo = set()
for e in estoques_antigo:
    if e["produto_id"] in mapeamento:
        produto_uuid = str(mapeamento[e["produto_id"]])
        loja_id = str(e["loja_id"])
        registros_antigo.add((produto_uuid, loja_id))

registros_novo = set()
for e in estoques_novo:
    produto_uuid = str(e["id_produto"])
    loja_id = str(e["id_loja"])
    registros_novo.add((produto_uuid, loja_id))

faltantes = registros_antigo - registros_novo
print(f"\n   ⚠️  {len(faltantes)} registros faltando no banco novo")

if len(faltantes) > 0:
    print(f"\n   Primeiros 10 registros faltantes:")
    for i, (prod_id, loja_id) in enumerate(list(faltantes)[:10]):
        # Buscar quantidade no banco antigo
        estoque_antigo = next((e for e in estoques_antigo if str(mapeamento.get(e["produto_id"])) == prod_id and str(e["loja_id"]) == loja_id), None)
        if estoque_antigo:
            # Buscar descrição do produto
            produto_antigo = next((p for p in produtos_antigos if p["id"] == estoque_antigo["produto_id"]), None)
            descricao = produto_antigo["descricao"][:50] if produto_antigo else "Produto não encontrado"
            print(f"   {i+1}. Produto: {descricao}... | Loja: {loja_id} | Qtd: {estoque_antigo['quantidade']}")

# =====================================================
# 4. VERIFICAR QUANTIDADES DIFERENTES
# =====================================================
print("\n" + "=" * 80)
print("🔢 4. VERIFICANDO QUANTIDADES DIFERENTES")
print("=" * 80)

quantidades_diferentes = []
for e_novo in estoques_novo:
    produto_uuid = str(e_novo["id_produto"])
    loja_id = str(e_novo["id_loja"])
    
    # Buscar no banco antigo
    for e_antigo in estoques_antigo:
        if e_antigo["produto_id"] in mapeamento:
            if str(mapeamento[e_antigo["produto_id"]]) == produto_uuid and str(e_antigo["loja_id"]) == loja_id:
                if e_antigo["quantidade"] != e_novo["quantidade"]:
                    quantidades_diferentes.append({
                        "produto_uuid": produto_uuid,
                        "loja_id": loja_id,
                        "qtd_antigo": e_antigo["quantidade"],
                        "qtd_novo": e_novo["quantidade"]
                    })
                break

print(f"\n   ⚠️  {len(quantidades_diferentes)} registros com quantidades diferentes")

if len(quantidades_diferentes) > 0:
    print(f"\n   Primeiros 10 registros com diferenças:")
    for i, diff in enumerate(quantidades_diferentes[:10]):
        # Buscar descrição
        produto = next((p for p in produtos_novos if p["id"] == diff["produto_uuid"]), None)
        descricao = produto["descricao"][:50] if produto else "Produto não encontrado"
        print(f"   {i+1}. {descricao}... | Loja: {diff['loja_id']} | Antigo: {diff['qtd_antigo']} | Novo: {diff['qtd_novo']}")

# =====================================================
# RESUMO FINAL
# =====================================================
print("\n" + "=" * 80)
print("📊 RESUMO DA VERIFICAÇÃO")
print("=" * 80)
print(f"\n   Total de unidades:")
print(f"   - Banco ANTIGO: {total_antigo:,} unidades")
print(f"   - Banco NOVO:   {total_novo:,} unidades")
print(f"   - FALTANDO:     {total_antigo - total_novo:,} unidades ({100 - (total_novo / total_antigo * 100):.1f}%)")
print(f"\n   Registros:")
print(f"   - Banco ANTIGO: {len(registros_antigo):,} registros")
print(f"   - Banco NOVO:   {len(registros_novo):,} registros")
print(f"   - FALTANDO:     {len(faltantes):,} registros")
print(f"   - DIFERENTES:   {len(quantidades_diferentes):,} registros com quantidades diferentes")
print("\n" + "=" * 80)
