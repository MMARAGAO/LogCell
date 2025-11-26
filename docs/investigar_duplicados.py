"""
Investigação Detalhada dos Produtos Duplicados
===============================================
Analisa os 5 produtos com diferenças de quantidade
"""

from supabase import create_client

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

# Produtos com diferenças
produtos_investigar = [
    "DISPLAY XIAOMI MACAQUINHO REDMI NOTE 10 4G/NOTE 10S/POCO M5S C/ARO PRETA",
    "VIDRO INFINIX SMART 9+OCA PRETA",
    "TOUCH IPAD PRO 12.9 2º GERACAO G+OCA BRANCA",
    "TOUCH IPAD PRO 10.5 G+OCA BRANCA",
    "TOUCH IPAD PRO 9.7 G+OCA PRETA"
]

print("\n" + "=" * 100)
print("INVESTIGAÇÃO DETALHADA DOS PRODUTOS DUPLICADOS")
print("=" * 100)

for descricao in produtos_investigar:
    print(f"\n{'=' * 100}")
    print(f"🔍 PRODUTO: {descricao}")
    print(f"{'=' * 100}")
    
    # 1. Buscar produto no banco ANTIGO
    print("\n📦 BANCO ANTIGO:")
    produto_antigo = supabase_antigo.table("estoque").select("id").eq("descricao", descricao).execute()
    
    if not produto_antigo.data or len(produto_antigo.data) == 0:
        print(f"   ❌ Produto NÃO encontrado!")
        continue
    
    produto_id = produto_antigo.data[0]['id']
    print(f"   ✅ Produto ID: {produto_id}")
    
    # 2. Buscar TODOS os registros de estoque_lojas no ANTIGO
    estoque_antigo = supabase_antigo.table("estoque_lojas").select("*").eq("produto_id", produto_id).execute()
    
    print(f"\n   📊 Registros de estoque_lojas ({len(estoque_antigo.data)} registros):")
    total_antigo = 0
    for idx, reg in enumerate(estoque_antigo.data, 1):
        print(f"      [{idx}] Loja: {reg['loja_id']} | Quantidade: {reg['quantidade']} | ID: {reg.get('id', 'N/A')}")
        total_antigo += reg['quantidade']
    
    print(f"\n   📈 TOTAL NO ANTIGO: {total_antigo} unidades")
    
    # 3. Buscar produto no banco NOVO
    print("\n📦 BANCO NOVO:")
    produto_novo = supabase_novo.table("produtos").select("id").eq("descricao", descricao).execute()
    
    if not produto_novo.data or len(produto_novo.data) == 0:
        print(f"   ❌ Produto NÃO encontrado!")
        continue
    
    produto_uuid = produto_novo.data[0]['id']
    print(f"   ✅ Produto UUID: {produto_uuid}")
    
    # 4. Buscar TODOS os registros de estoque_lojas no NOVO
    estoque_novo = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", produto_uuid).execute()
    
    print(f"\n   📊 Registros de estoque_lojas ({len(estoque_novo.data)} registros):")
    total_novo = 0
    for idx, reg in enumerate(estoque_novo.data, 1):
        print(f"      [{idx}] Loja: {reg['id_loja']} | Quantidade: {reg['quantidade']} | ID: {reg.get('id', 'N/A')}")
        total_novo += reg['quantidade']
    
    print(f"\n   📈 TOTAL NO NOVO: {total_novo} unidades")
    
    # 5. Análise da diferença
    diferenca = total_antigo - total_novo
    print(f"\n   ⚠️  DIFERENÇA: {diferenca} unidades ({total_antigo} - {total_novo})")
    
    if len(estoque_antigo.data) > len(estoque_novo.data):
        print(f"   🔴 Registros duplicados no ANTIGO: {len(estoque_antigo.data)} registros → {len(estoque_novo.data)} no NOVO")
        print(f"   📌 {len(estoque_antigo.data) - len(estoque_novo.data)} registros foram consolidados")
    
    # 6. Comparar registros por loja
    print("\n   🔍 Comparação por Loja:")
    lojas_antigo = {}
    for reg in estoque_antigo.data:
        loja = reg['loja_id']
        if loja not in lojas_antigo:
            lojas_antigo[loja] = []
        lojas_antigo[loja].append(reg['quantidade'])
    
    lojas_novo = {}
    for reg in estoque_novo.data:
        loja = reg['id_loja']
        if loja not in lojas_novo:
            lojas_novo[loja] = []
        lojas_novo[loja].append(reg['quantidade'])
    
    for loja in sorted(set(list(lojas_antigo.keys()) + list(lojas_novo.keys()))):
        qtd_antigo = lojas_antigo.get(loja, [])
        qtd_novo = lojas_novo.get(loja, [])
        
        total_loja_antigo = sum(qtd_antigo)
        total_loja_novo = sum(qtd_novo)
        
        print(f"\n      Loja {loja}:")
        print(f"      Antigo: {qtd_antigo} = {total_loja_antigo} unidades ({len(qtd_antigo)} registro(s))")
        print(f"      Novo:   {qtd_novo} = {total_loja_novo} unidades ({len(qtd_novo)} registro(s))")
        
        if total_loja_antigo != total_loja_novo:
            print(f"      ⚠️  DIFERENÇA: {total_loja_antigo - total_loja_novo} unidades")
            
            if len(qtd_antigo) > 1:
                print(f"      💡 DUPLICADO NO ANTIGO! {len(qtd_antigo)} registros com quantidades: {qtd_antigo}")
                print(f"      💡 Soma esperada: {sum(qtd_antigo)} → Migrado: {total_loja_novo}")
                print(f"      🔴 PERDA: {sum(qtd_antigo) - total_loja_novo} unidades não foram migradas")

print("\n" + "=" * 100)
print("FIM DA INVESTIGAÇÃO")
print("=" * 100)
