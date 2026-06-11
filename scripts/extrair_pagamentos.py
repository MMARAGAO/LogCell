#!/usr/bin/env python3
"""
Extrai valores individuais de cada forma de pagamento do texto descritivo.
Gera CSV com colunas separadas para cada tipo de pagamento.
"""
import csv, re, os, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from analisar_importacao import (
    parse_brl, to_date, normalizar_forma, extrair_troca,
    LOJA_MAP, VENDEDOR_MAP, limpar_acentos
)

def parse_real(v):
    """Converte string monetaria brasileira para float, robusto."""
    if not v: return 0.0
    v = v.strip()
    # Encontra o ultimo separador (. ou ,) — esse e o decimal
    last_sep = max(v.rfind('.'), v.rfind(','))
    if last_sep == -1:
        try: return float(v)
        except: return 0.0
    before = v[:last_sep].replace('.', '').replace(',', '')
    after = v[last_sep+1:]
    try: return float(before + '.' + after)
    except: return 0.0

def extrair_valores_individuais(texto):
    """
    Extrai valores individuais de pagamento do texto descritivo.
    Retorna dict: {'pix': 123.45, 'cartao_credito': 678.90, 'troca_aparelho': 200.0, ...}
    """
    if not texto:
        return {}
    
    # Normalizar
    t = texto.upper()
    t = limpar_acentos(t)
    t = t.replace('R$', 'R$')
    t = re.sub(r'\s+', ' ', t).strip()
    
    valores = defaultdict(float)
    
    # --- ESTRATEGIA 1: ENTRADA / TROCA (padrao com modelo) ---
    # Extrair trocas primeiro, pois tem formato especial
    trocas = extrair_troca(texto)
    for troca in trocas:
        valores['troca_aparelho'] += troca['valor']
    
    # Remover trechos de ENTRADA/TROCA do texto para nao confundir
    t_clean = t
    # Remover "ENTRADA ... R$ valor" 
    t_clean = re.sub(r'ENTRADA\s+.+?R?\$?\s*[\d]+\s*[.,]\s*[\d]+', '', t_clean)
    # Remover "entrou ... na troca por valor"
    t_clean = re.sub(r'ENTROU\s+.+?NA\s+TROCA\s+POR\s+R?\$?\s*[\d.,]+', '', t_clean)
    # Remover "PEGANDO ... PRO valor"
    t_clean = re.sub(r'PEGANDO\s+.+?\s+PRO\s+R?\$?\s*[\d.,]+', '', t_clean)
    # Remover "valor (referente a|de) entrada ... modelo"
    t_clean = re.sub(r'[\d.,]+\s+(?:RESTANTE\s+)?(?:A\s+)?(?:REFERENTE\s+A\s+)?(?:DE\s+)?ENTRADA\s+.+?$', '', t_clean)
    # Remover "um aparelho na troca ... por valor"
    t_clean = re.sub(r'(?:UM\s+)?APARELHO\s+(?:NA\s+)?TROCA[.,;: ]+.+?POR\s+R?\$?\s*[\d.,]+', '', t_clean)
    t_clean = re.sub(r'\s+', ' ', t_clean).strip()
    
    # --- ESTRATEGIA 2: ENCONTRAR PIX ---
    # Padroes: "PIX R$ 2500", "2500 PIX", "2500,00 pix", "R$ 2500 PIX"
    # Tambem: "PIX: 2500", "2500 no pix"
    pix_matches = list(re.finditer(
        r'(?:PIX\s*(?::)?\s*R?\$?\s*([\d.,]+)|'  # "PIX R$ 2500" ou "PIX: 2500"
        r'([\d.,]+)\s*(?:DE\s+)?PIX|'              # "2500 PIX" ou "2500 no pix"
        r'R?\$?\s*([\d.,]+)\s*(?:NO\s+)?PIX)',      # "R$ 2500 PIX"
        t_clean
    ))
    for m in pix_matches:
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            valores['pix'] += v
            t_clean = t_clean.replace(m.group(0), '', 1)
    
    # --- ESTRATEGIA 3: DINHEIRO ---
    dinheiro_matches = list(re.finditer(
        r'(?:DINHEIRO\s*(?::)?\s*R?\$?\s*([\d.,]+)|'  # "DINHEIRO R$ 2500"
        r'([\d.,]+)\s*(?:DE\s+)?DINHEIRO)',            # "2500 dinheiro"
        t_clean
    ))
    for m in dinheiro_matches:
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            valores['dinheiro'] += v
            t_clean = t_clean.replace(m.group(0), '', 1)
    
    # --- ESTRATEGIA 4: CARTAO CREDITO ---
    # Padroes: "CREDITO R$ 3000", "3000 CREDITO", "R$ 3000 em 10x", "3000 no cartao em 3x"
    cred_matches = list(re.finditer(
        r'(?:(?:CREDITO|CRED|CARTAO(?:[^A-Z]|$))(?::)?\s*(?:EM\s+\d+X\s+)?R?\$?\s*([\d.,]+)|'  # "CREDITO R$ 3000" ou "CARTAO: 3000"
        r'([\d.,]+)\s*(?:EM\s+\d+X\s+)?(?:NO\s+)?(?:CREDITO|CARTAO(?:[^A-Z]|$)))',               # "3000 credito" ou "3000 em 12x no cartao"
        t_clean
    ))
    for m in cred_matches:
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            valores['cartao_credito'] += v
            t_clean = t_clean.replace(m.group(0), '', 1)
    
    # --- ESTRATEGIA 5: CARTAO DEBITO ---
    deb_matches = list(re.finditer(
        r'(?:DEBITO\s*(?::)?\s*R?\$?\s*([\d.,]+)|'
        r'([\d.,]+)\s*(?:DE\s+)?DEBITO)',
        t_clean
    ))
    for m in deb_matches:
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            valores['cartao_debito'] += v
            t_clean = t_clean.replace(m.group(0), '', 1)
    
    # --- ESTRATEGIA 6: VALORES RESTANTES (nao categorizados) ---
    # Se sobrou algum valor numerico, tentar categorizar pelo contexto
    # Ou simplesmente ignorar valores pequenos / residuais
    
    return dict(valores)


# ====================================================================
# GERAR CSV
# ====================================================================
INPUT = os.path.join(ROOT, 'venda_aparelhos.csv')
OUTPUT = os.path.join(ROOT, 'scripts', 'vendas_pagamentos_detalhados.csv')

with open(INPUT, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    linhas = list(reader)

fieldnames = [
    'data', 'data_iso', 'modelo', 'imei',
    'valor_venda', 'brinde', 'custo', 'lucro',
    'pix', 'dinheiro', 'cartao_credito', 'cartao_debito',
    'troca_aparelho', 'outros_pagamentos',
    'soma_pagamentos', 'diferenca',
    'tem_troca', 'modelo_troca', 'valor_troca',
    'vendedor', 'loja', 'loja_id',
]

rows = []
problemas_soma = []

for row in linhas:
    data = row.get('DATA', '').strip()
    data_iso = to_date(data)
    modelo = row.get('MODELO', '').strip()
    imei = row.get('IMEI', '').strip().replace(' ', '')
    valor_venda = parse_brl(row.get('VALOR DE VENDA', ''))
    brinde = parse_brl(row.get('BRINDE', ''))
    custo = parse_brl(row.get('CUSTO APARELHO', ''))
    lucro = parse_brl(row.get('LUCRO', ''))
    vendedor = row.get('VENDEDOR', '').strip().title()
    loja = row.get('LOJA', '').strip().upper() or 'CELL'
    forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
    loja_id = LOJA_MAP.get(loja)
    
    if valor_venda is None:
        continue
    
    # Extrair valores individuais
    valores = extrair_valores_individuais(forma_orig)
    
    # Trocas
    trocas = extrair_troca(forma_orig) if 'troca_aparelho' in normalizar_forma(forma_orig) else []
    modelo_troca = '; '.join(t['modelo'] for t in trocas)
    valor_troca = sum(t['valor'] for t in trocas)
    
    soma = sum(valores.values())
    diferenca = round(valor_venda - soma, 2)
    
    if abs(diferenca) > 0.01:
        problemas_soma.append({
            'modelo': modelo, 'data': data, 'vendedor': vendedor,
            'valor_venda': valor_venda, 'soma': soma, 'diferenca': diferenca,
            'forma_orig': forma_orig[:100],
        })
    
    rows.append({
        'data': data,
        'data_iso': data_iso or '',
        'modelo': modelo,
        'imei': imei or '',
        'valor_venda': valor_venda,
        'brinde': brinde,
        'custo': custo,
        'lucro': lucro,
        'pix': valores.get('pix', 0),
        'dinheiro': valores.get('dinheiro', 0),
        'cartao_credito': valores.get('cartao_credito', 0),
        'cartao_debito': valores.get('cartao_debito', 0),
        'troca_aparelho': valores.get('troca_aparelho', 0),
        'outros_pagamentos': 0,
        'soma_pagamentos': soma,
        'diferenca': diferenca,
        'tem_troca': 'SIM' if trocas else 'NAO',
        'modelo_troca': modelo_troca,
        'valor_troca': valor_troca,
        'vendedor': vendedor,
        'loja': loja,
        'loja_id': loja_id or '',
    })

with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(rows)

print(f'CSV salvo: {OUTPUT} ({len(rows)} linhas)')
print()

# Estatisticas
print('--- SOMATORIO DOS PAGAMENTOS ---')
totals = defaultdict(float)
for r in rows:
    for k in ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'troca_aparelho', 'outros_pagamentos']:
        totals[k] += r[k]
for k, v in sorted(totals.items(), key=lambda x: -x[1]):
    print(f'  {k:20s}: R$ {v:>10,.2f}')
print(f'  {"TOTAL PAGAMENTOS":20s}: R$ {sum(totals.values()):>10,.2f}')
print(f'  {"TOTAL VENDAS":20s}: R$ {sum(r["valor_venda"] for r in rows):>10,.2f}')

print()
diferencas = [r for r in rows if abs(r['diferenca']) > 0.01]
print(f'Registros com diferenca > R$ 0,01: {len(diferencas)}/{len(rows)}')
if diferencas:
    print('\nTop 10 maiores diferencas:')
    for d in sorted(diferencas, key=lambda x: -abs(x['diferenca']))[:10]:
        print(f'  R$ {d["diferenca"]:>8,.2f} | {d["data"]} | {d["modelo"][:40]} | {d["vendedor"]}')
