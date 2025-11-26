"""
Comparação Completa: Banco Antigo vs Banco Novo
================================================
Identifica todas as diferenças produto por produto
"""

from supabase import create_client
from collections import defaultdict

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 100)
print("COMPARAÇÃO COMPLETA: BANCO ANTIGO vs BANCO NOVO")
print("=" * 100)

# 1. Carregar todos os produtos do ANTIGO
print("\n📦 Carregando produtos do banco ANTIGO...")
produtos_antigo = []
offset = 0
while True:
    resultado = supabase_antigo.table("estoque").select("id, descricao").range(offset, offset + 999).execute()
    if not resultado.data or len(resultado.data) == 0:
        break
    produtos_antigo.extend(resultado.data)
    offset += 1000
    if len(resultado.data) < 1000:
        break

print(f"✅ {len(produtos_antigo)} produtos carregados")

# 2. Carregar todos os produtos do NOVO
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

print(f"✅ {len(produtos_novo)} produtos carregados")

# 3. Carregar todo o estoque do ANTIGO
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
print(f"✅ {len(estoque_antigo)} registros | {total_antigo:,} unidades")

# 4. Carregar todo o estoque do NOVO
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
print(f"✅ {len(estoque_novo)} registros | {total_novo:,} unidades")

# 5. Criar mapas de descrição -> dados
print("\n🔄 Processando dados...")
desc_to_id_antigo = {p['descricao']: p['id'] for p in produtos_antigo}
desc_to_id_novo = {p['descricao']: p['id'] for p in produtos_novo}

# 6. Agrupar estoque por produto e loja no ANTIGO
estoque_antigo_map = defaultdict(lambda: defaultdict(int))
for e in estoque_antigo:
    produto = next((p for p in produtos_antigo if p['id'] == e['produto_id']), None)
    if produto:
        descricao = produto['descricao']
        loja = e['loja_id']
        estoque_antigo_map[descricao][loja] += e['quantidade']

# 7. Agrupar estoque por produto e loja no NOVO
estoque_novo_map = defaultdict(lambda: defaultdict(int))
for e in estoque_novo:
    produto = next((p for p in produtos_novo if p['id'] == e['id_produto']), None)
    if produto:
        descricao = produto['descricao']
        loja = e['id_loja']
        estoque_novo_map[descricao][loja] += e['quantidade']

# 8. Comparar produto por produto
print("\n" + "=" * 100)
print("ANÁLISE DE DIFERENÇAS")
print("=" * 100)

produtos_com_diferenca = []
produtos_apenas_antigo = []
produtos_apenas_novo = []

# Produtos no antigo
for descricao in estoque_antigo_map.keys():
    qtd_antigo_total = sum(estoque_antigo_map[descricao].values())
    qtd_novo_total = sum(estoque_novo_map[descricao].values()) if descricao in estoque_novo_map else 0
    
    if qtd_antigo_total != qtd_novo_total:
        produtos_com_diferenca.append({
            'descricao': descricao,
            'antigo': qtd_antigo_total,
            'novo': qtd_novo_total,
            'diferenca': qtd_antigo_total - qtd_novo_total,
            'lojas_antigo': dict(estoque_antigo_map[descricao]),
            'lojas_novo': dict(estoque_novo_map[descricao]) if descricao in estoque_novo_map else {}
        })

# Produtos apenas no novo
for descricao in estoque_novo_map.keys():
    if descricao not in estoque_antigo_map:
        qtd_novo_total = sum(estoque_novo_map[descricao].values())
        produtos_apenas_novo.append({
            'descricao': descricao,
            'novo': qtd_novo_total,
            'lojas': dict(estoque_novo_map[descricao])
        })

# Ordenar por diferença absoluta
produtos_com_diferenca.sort(key=lambda x: abs(x['diferenca']), reverse=True)

print(f"\n📊 RESUMO:")
print(f"   Produtos com diferenças: {len(produtos_com_diferenca)}")
print(f"   Produtos só no NOVO:     {len(produtos_apenas_novo)}")

if produtos_com_diferenca:
    print(f"\n⚠️  PRODUTOS COM DIFERENÇAS (Top 30):")
    print(f"{'=' * 100}")
    
    total_diferenca = 0
    for idx, item in enumerate(produtos_com_diferenca[:30], 1):
        print(f"\n[{idx}] {item['descricao']}")
        print(f"    Antigo: {item['antigo']} | Novo: {item['novo']} | Diferença: {item['diferenca']:+d}")
        
        # Mostrar diferenças por loja
        todas_lojas = set(list(item['lojas_antigo'].keys()) + list(item['lojas_novo'].keys()))
        if len(todas_lojas) > 0:
            print(f"    Por loja:")
            for loja in sorted(todas_lojas):
                qtd_ant = item['lojas_antigo'].get(loja, 0)
                qtd_nov = item['lojas_novo'].get(loja, 0)
                if qtd_ant != qtd_nov:
                    print(f"      Loja {loja}: {qtd_ant} → {qtd_nov} ({qtd_ant - qtd_nov:+d})")
        
        total_diferenca += item['diferenca']
    
    if len(produtos_com_diferenca) > 30:
        for item in produtos_com_diferenca[30:]:
            total_diferenca += item['diferenca']
        print(f"\n   ... e mais {len(produtos_com_diferenca) - 30} produtos com diferenças")
    
    print(f"\n   📈 TOTAL DA DIFERENÇA: {total_diferenca:+d} unidades")

if produtos_apenas_novo:
    print(f"\n✨ PRODUTOS APENAS NO NOVO (não existiam no antigo):")
    print(f"{'=' * 100}")
    
    total_apenas_novo = 0
    for idx, item in enumerate(produtos_apenas_novo[:10], 1):
        print(f"[{idx}] {item['descricao']}: {item['novo']} unidades")
        total_apenas_novo += item['novo']
    
    if len(produtos_apenas_novo) > 10:
        for item in produtos_apenas_novo[10:]:
            total_apenas_novo += item['novo']
        print(f"   ... e mais {len(produtos_apenas_novo) - 10} produtos")
    
    print(f"\n   📈 TOTAL APENAS NO NOVO: {total_apenas_novo} unidades")

print("\n" + "=" * 100)
print("TOTAIS FINAIS:")
print("=" * 100)
print(f"Banco ANTIGO: {total_antigo:,} unidades ({len(estoque_antigo)} registros)")
print(f"Banco NOVO:   {total_novo:,} unidades ({len(estoque_novo)} registros)")
print(f"Diferença:    {total_novo - total_antigo:+,} unidades")
print("=" * 100)
