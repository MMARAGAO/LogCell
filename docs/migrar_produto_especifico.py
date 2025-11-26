"""
Script de Migração - PRODUTO ESPECÍFICO
========================================
Migra estoque de um único produto do banco antigo para o novo
"""

from supabase import create_client, Client
from datetime import datetime

# =====================================================
# CONFIGURAÇÕES
# =====================================================

PRODUTO_DESCRICAO = "ACESSORIO CABO CARGA RAPIDA IMENSO 27W"

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

supabase_antigo: Client = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo: Client = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

print("\n" + "=" * 80)
print("MIGRAÇÃO DE PRODUTO ESPECÍFICO")
print("=" * 80)
print(f"\nProduto: {PRODUTO_DESCRICAO}")
print("\n" + "=" * 80)

# =====================================================
# 1. BUSCAR PRODUTO NO BANCO ANTIGO
# =====================================================
print("\n🔍 1. Buscando produto no banco ANTIGO...")

resultado = supabase_antigo.table("estoque").select("*").eq("descricao", PRODUTO_DESCRICAO).execute()

if not resultado.data or len(resultado.data) == 0:
    print(f"❌ Produto '{PRODUTO_DESCRICAO}' não encontrado no banco antigo!")
    exit(1)

produto_antigo = resultado.data[0]
produto_id_antigo = produto_antigo["id"]

print(f"✅ Produto encontrado no banco antigo!")
print(f"   ID: {produto_id_antigo}")
print(f"   Descrição: {produto_antigo['descricao']}")
print(f"   Total Estoque: {produto_antigo.get('total_estoque', 'N/A')}")

# =====================================================
# 2. BUSCAR ESTOQUE POR LOJA NO BANCO ANTIGO
# =====================================================
print("\n📦 2. Buscando estoque por loja no banco ANTIGO...")

resultado = supabase_antigo.table("estoque_lojas").select("*").eq("produto_id", produto_id_antigo).execute()

if not resultado.data or len(resultado.data) == 0:
    print(f"⚠️  Nenhum estoque encontrado para este produto no banco antigo!")
    exit(1)

estoques_antigo = resultado.data
total_quantidade_antigo = sum(e.get("quantidade", 0) for e in estoques_antigo)

print(f"✅ Encontrados {len(estoques_antigo)} registros de estoque:")
for estoque in estoques_antigo:
    print(f"   Loja ID: {estoque['loja_id']} | Quantidade: {estoque['quantidade']}")
print(f"\n   TOTAL: {total_quantidade_antigo} unidades")

# =====================================================
# 3. BUSCAR PRODUTO NO BANCO NOVO
# =====================================================
print("\n🔍 3. Buscando produto no banco NOVO...")

resultado = supabase_novo.table("produtos").select("*").eq("descricao", PRODUTO_DESCRICAO).execute()

if not resultado.data or len(resultado.data) == 0:
    print(f"❌ Produto '{PRODUTO_DESCRICAO}' não encontrado no banco novo!")
    print(f"   Certifique-se de que o produto foi migrado primeiro!")
    exit(1)

produto_novo = resultado.data[0]
produto_id_novo = produto_novo["id"]

print(f"✅ Produto encontrado no banco novo!")
print(f"   UUID: {produto_id_novo}")
print(f"   Descrição: {produto_novo['descricao']}")

# =====================================================
# 4. VERIFICAR ESTOQUE ATUAL NO BANCO NOVO
# =====================================================
print("\n📊 4. Verificando estoque atual no banco NOVO...")

resultado = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", produto_id_novo).execute()

if resultado.data and len(resultado.data) > 0:
    print(f"⚠️  Já existem {len(resultado.data)} registros de estoque para este produto:")
    for estoque in resultado.data:
        print(f"   Loja ID: {estoque['id_loja']} | Quantidade: {estoque['quantidade']}")
    
    resposta = input("\n   Deseja SOBRESCREVER o estoque existente? (digite 'SIM'): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Operação cancelada.")
        exit(0)
    
    # Deletar estoque existente
    print("\n   Deletando estoque existente...")
    supabase_novo.table("estoque_lojas").delete().eq("id_produto", produto_id_novo).execute()
    print("   ✅ Estoque existente deletado!")
else:
    print(f"✅ Nenhum estoque existente para este produto.")

# =====================================================
# 5. MIGRAR ESTOQUE
# =====================================================
print("\n🚀 5. Migrando estoque...")

migrados = 0
erros = 0

for estoque in estoques_antigo:
    try:
        dados_estoque = {
            "id_produto": produto_id_novo,
            "id_loja": estoque["loja_id"],
            "quantidade": int(estoque.get("quantidade", 0)),
            "atualizado_em": estoque.get("updatedat", datetime.now().isoformat())
        }
        
        supabase_novo.table("estoque_lojas").insert(dados_estoque).execute()
        print(f"   ✅ Loja {estoque['loja_id']}: {estoque['quantidade']} unidades migradas")
        migrados += 1
        
    except Exception as e:
        print(f"   ❌ Erro ao migrar loja {estoque['loja_id']}: {e}")
        erros += 1

# =====================================================
# 6. VERIFICAR RESULTADO
# =====================================================
print("\n📊 6. Verificando resultado...")

resultado = supabase_novo.table("estoque_lojas").select("*").eq("id_produto", produto_id_novo).execute()
total_quantidade_novo = sum(e.get("quantidade", 0) for e in resultado.data)

print(f"\n✅ Estoque no banco NOVO após migração:")
for estoque in resultado.data:
    print(f"   Loja ID: {estoque['id_loja']} | Quantidade: {estoque['quantidade']}")
print(f"\n   TOTAL: {total_quantidade_novo} unidades")

# =====================================================
# RESUMO
# =====================================================
print("\n" + "=" * 80)
print("📊 RESUMO DA MIGRAÇÃO")
print("=" * 80)
print(f"\nProduto: {PRODUTO_DESCRICAO}")
print(f"\n   Banco ANTIGO: {total_quantidade_antigo} unidades")
print(f"   Banco NOVO:   {total_quantidade_novo} unidades")
print(f"\n   ✅ Registros migrados: {migrados}")
if erros > 0:
    print(f"   ❌ Erros: {erros}")

if total_quantidade_antigo == total_quantidade_novo:
    print(f"\n   🎉 SUCESSO! Quantidades conferem!")
else:
    print(f"\n   ⚠️  ATENÇÃO! Diferença de {abs(total_quantidade_antigo - total_quantidade_novo)} unidades")

print("=" * 80)
