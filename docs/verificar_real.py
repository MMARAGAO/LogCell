"""Verificação rápida do banco NOVO"""
from supabase import create_client

supabase = create_client(
    'https://qyzjvkthuuclsyjeweek.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ'
)

print("Verificando estoque no banco NOVO...")

all_data = []
offset = 0

while True:
    result = supabase.table("estoque_lojas").select("quantidade").range(offset, offset + 999).execute()
    if not result.data:
        break
    all_data.extend(result.data)
    offset += 1000
    if len(result.data) < 1000:
        break

print(f"\n✅ Registros no banco: {len(all_data)}")
print(f"✅ Total de unidades: {sum(r['quantidade'] for r in all_data):,}")
