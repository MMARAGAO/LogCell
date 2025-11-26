"""
Script para verificar de onde vem o total de 36.227 unidades no sistema antigo
"""

from supabase import create_client, Client

BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

supabase = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)

print("\n" + "=" * 80)
print("INVESTIGANDO TOTAL DE 36.227 UNIDADES DO SISTEMA ANTIGO")
print("=" * 80)

# 1. Verificar tabela ESTOQUE (produtos)
print("\n📦 1. TABELA: estoque (produtos)")
print("   Verificando campo 'total_estoque'...")

produtos = []
offset = 0
page_size = 1000

while True:
    resultado = supabase.table("estoque").select("id, descricao, total_estoque").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    produtos.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

total_campo_estoque = sum(p.get("total_estoque", 0) or 0 for p in produtos)
print(f"   ✅ Total campo 'total_estoque': {total_campo_estoque:,} unidades")
print(f"   📊 Registros: {len(produtos)} produtos")

# 2. Verificar tabela ESTOQUE_LOJAS
print("\n🏪 2. TABELA: estoque_lojas")

estoques = []
offset = 0

while True:
    resultado = supabase.table("estoque_lojas").select("*").range(offset, offset + page_size - 1).execute()
    if not resultado.data:
        break
    estoques.extend(resultado.data)
    offset += page_size
    if len(resultado.data) < page_size:
        break

total_estoque_lojas = sum(e.get("quantidade", 0) for e in estoques)
print(f"   ✅ Total campo 'quantidade': {total_estoque_lojas:,} unidades")
print(f"   📊 Registros: {len(estoques)} (produto + loja)")

# 3. Resumo
print("\n" + "=" * 80)
print("📊 RESUMO")
print("=" * 80)
print(f"\n   🎯 SISTEMA ANTIGO mostrava: 36.227 unidades")
print(f"   📦 Tabela 'estoque.total_estoque': {total_campo_estoque:,} unidades")
print(f"   🏪 Tabela 'estoque_lojas.quantidade': {total_estoque_lojas:,} unidades")
print(f"\n   💡 Conclusão:")
if abs(total_campo_estoque - 36227) < 10:
    print(f"   ✅ O sistema antigo usava o campo 'total_estoque' da tabela produtos!")
    print(f"   ✅ Esse campo é a SOMA das quantidades de todas as lojas")
elif abs(total_estoque_lojas - 36227) < 10:
    print(f"   ✅ O sistema antigo usava a soma de 'estoque_lojas.quantidade'!")
else:
    print(f"   ⚠️  Nenhum dos totais corresponde exatamente a 36.227")
    print(f"   🔍 Diferença (total_estoque): {abs(total_campo_estoque - 36227):,}")
    print(f"   🔍 Diferença (estoque_lojas): {abs(total_estoque_lojas - 36227):,}")

print("\n" + "=" * 80)
