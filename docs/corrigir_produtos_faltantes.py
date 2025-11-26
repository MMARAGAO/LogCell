"""
Corrigir Produtos Faltantes
============================
Migra os 5 produtos que não foram transferidos
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

# Mapeamento de IDs das lojas (ANTIGO → NOVO)
# No banco novo, id_loja continua sendo INTEGER, não UUID!
LOJAS_MAP = {
    1: 1,  # ESTOQUE
    3: 3,  # ATACADO
    4: 4   # Loja Feira
}

produtos_corrigir = [
    {
        "descricao": "DISPLAY XIAOMI MACAQUINHO REDMI NOTE 10 4G/NOTE 10S/POCO M5S C/ARO PRETA",
        "uuid": "428bcf34-d2ae-4df3-a8a0-17c8ecf7f5f6",
        "registros": [{"loja": 3, "qtd": 1}]
    },
    {
        "descricao": "VIDRO INFINIX SMART 9+OCA PRETA",
        "uuid": "2c958482-080e-411a-ac86-d44d54bb5a1a",
        "registros": [{"loja": 3, "qtd": 5}]
    },
    {
        "descricao": "TOUCH IPAD PRO 12.9 2º GERACAO G+OCA BRANCA",
        "uuid": "a291230e-3fd2-4b57-93c6-5d47f783ca3f",
        "registros": [{"loja": 3, "qtd": 3}]
    },
    {
        "descricao": "TOUCH IPAD PRO 10.5 G+OCA BRANCA",
        "uuid": "df5a715a-197d-4426-8d28-caeca330c339",
        "registros": [{"loja": 3, "qtd": 2}]
    },
    {
        "descricao": "TOUCH IPAD PRO 9.7 G+OCA PRETA",
        "uuid": "4bff949a-a607-48ce-b156-32295a0eabfb",
        "registros": [
            {"loja": 1, "qtd": 5},
            {"loja": 3, "qtd": 10},
            {"loja": 4, "qtd": 21}
        ]
    }
]

print("\n" + "=" * 80)
print("CORRIGINDO PRODUTOS FALTANTES")
print("=" * 80)

total_inserido = 0
total_registros = 0

for produto in produtos_corrigir:
    print(f"\n📦 {produto['descricao']}")
    
    for reg in produto['registros']:
        loja_id_antigo = reg['loja']
        loja_uuid = LOJAS_MAP.get(loja_id_antigo)
        quantidade = reg['qtd']
        
        if not loja_uuid:
            print(f"   ❌ Loja {loja_id_antigo} não encontrada no mapeamento!")
            continue
        
        # Inserir no banco novo
        try:
            resultado = supabase_novo.table("estoque_lojas").insert({
                "id_produto": produto['uuid'],
                "id_loja": loja_uuid,
                "quantidade": quantidade
            }).execute()
            
            print(f"   ✅ Loja {loja_id_antigo}: {quantidade} unidades inseridas")
            total_inserido += quantidade
            total_registros += 1
            
        except Exception as e:
            print(f"   ❌ Erro ao inserir Loja {loja_id_antigo}: {e}")

print("\n" + "=" * 80)
print("RESUMO DA CORREÇÃO:")
print("=" * 80)
print(f"Total de registros inseridos: {total_registros}")
print(f"Total de unidades inseridas:  {total_inserido}")
print("=" * 80)

# Verificar novo total
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
print(f"📊 Esperado: 36,256 unidades (36,209 + 47)")
