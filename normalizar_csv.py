#!/usr/bin/env python3
"""Script para normalizar o CSV venda_aparelhos.csv"""
import csv, re, sys
from collections import Counter

INPUT = 'venda_aparelhos.csv'
OUTPUT = 'venda_aparelhos_normalizado.csv'

def parse_brl(v):
    if not v or not v.strip(): return 0.0
    v = re.sub(r'^R\$\s*', '', v.strip())
    v = v.replace('.', '').replace(',', '.')
    try: return float(v)
    except: return 0.0

def fmt_brl(v):
    s = f'R$ {v:,.2f}'
    return s.replace(',', 'X').replace('.', ',').replace('X', '.')

def normalizar_forma(texto):
    if not texto or not texto.strip(): return 'nao_informado'
    t = texto.encode('latin-1', errors='replace').decode('utf-8', errors='replace')
    t = t.upper()
    # Remover acentos
    for ac, sem in [
        ('Ãƒ', 'A'), ('Ã', 'A'), ('Â', 'A'), ('Á', 'A'), ('À', 'A'),
        ('É', 'E'), ('Ê', 'E'), ('È', 'E'),
        ('Í', 'I'), ('Î', 'I'),
        ('Ó', 'O'), ('Ô', 'O'), ('Õ', 'O'), ('Ò', 'O'),
        ('Ú', 'U'), ('Û', 'U'), ('Ù', 'U'),
        ('Ç', 'C'), ('Ñ', 'N'),
        ('¢', 'C'), ('©', 'C'),
        ('€', 'E'),
    ]:
        t = t.replace(ac, sem)
    t = re.sub(r'[^A-Z0-9 /]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()

    f = []
    if 'PIX' in t: f.append('pix')
    if 'DINHEIRO' in t: f.append('dinheiro')
    if 'DEBITO' in t: f.append('cartao_debito')
    if 'CREDITO' in t or 'CARTAO' in t: f.append('cartao_credito')
    if 'BOLETO' in t: f.append('boleto')
    if 'ENTRADA' in t or 'TROCA' in t or 'DOWNG' in t or 'PEGANDO' in t:
        f.append('troca_aparelho')
    if 'PAGAMENTO JUNTO' in t: f.append('pagamento_junto')
    if 'GARANTIA' in t: f.append('garantia')
    return ' + '.join(f) if f else 'outros'

# Ler
with open(INPUT, 'r', encoding='latin-1') as f:
    reader = csv.DictReader(f)
    linhas = list(reader)

# Processar
novas = []
for row in linhas:
    venda = parse_brl(row.get('VALOR DE VENDA', ''))
    custo = parse_brl(row.get('CUSTO APARELHO', ''))
    brinde = parse_brl(row.get('BRINDE', ''))
    lucro = parse_brl(row.get('LUCRO', ''))
    forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
    forma_norm = normalizar_forma(forma_orig)
    vl = venda - brinde
    imei = row.get('IMEI', '').strip().replace(' ', '')
    vendedor = row.get('VENDEDOR', '').strip().title()
    loja = row.get('LOJA', '').strip().upper()

    novas.append({
        'DATA': row.get('DATA', '').strip(),
        'MODELO': row.get('MODELO', '').strip(),
        'IMEI': imei,
        'VALOR DE VENDA': fmt_brl(venda),
        'BRINDE': fmt_brl(brinde) if brinde > 0 else '',
        'CUSTO APARELHO': fmt_brl(custo),
        'FORMA DE PAGAMENTO': forma_orig,
        'FORMA NORMALIZADA': forma_norm,
        'VALOR LIQUIDO': fmt_brl(vl),
        'LUCRO': fmt_brl(lucro),
        'VENDEDOR': vendedor,
        'MES': row.get('MES', '').strip() or row.get('M\xcaS', '').strip(),
        'ANO': row.get('ANO', '').strip(),
        'LOJA': loja,
    })

# Escrever
campos = ['DATA', 'MODELO', 'IMEI', 'VALOR DE VENDA', 'BRINDE', 'CUSTO APARELHO',
          'FORMA DE PAGAMENTO', 'FORMA NORMALIZADA', 'VALOR LIQUIDO', 'LUCRO',
          'VENDEDOR', 'MES', 'ANO', 'LOJA']

with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=campos)
    writer.writeheader()
    writer.writerows(novas)

# Estatisticas
formas = Counter(r['FORMA NORMALIZADA'] for r in novas)
outros = sum(1 for r in novas if r['FORMA NORMALIZADA'] == 'outros')
print(f'Total registros: {len(novas)}')
print(f'Outros: {outros}')
print()
print('Distribuicao:')
for f, q in sorted(formas.items(), key=lambda x: -x[1]):
    print(f'  {q:4}x: {f}')
