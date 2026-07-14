#!/usr/bin/env python3
"""
Script de normalização e PREVIEW para vendas_aparelhos2.csv
Não faz nenhuma alteração no banco. Apenas analisa e gera preview.
"""
import csv, re, uuid, sys
from collections import Counter
from datetime import datetime

INPUT = 'vendas_aparelhos2.csv'
OUTPUT_PREVIEW = 'scripts/vendas_aparelhos2_normalizado.csv'

VENDEDOR_MAP = {
    'Angel':        '97f12885-87ad-426a-8bbb-656889d82e10',
    'Bianca':       'b4269e60-eea2-4eba-a34d-db9591e0ec83',
    'Camila':       '1d12d555-68e9-45f8-bfc0-a35a1d8d7920',
    'Guilherme':    '25e2da5b-9e76-4388-9890-7e22efd6940d',
    'Higor Guedes': '85e3aa42-b9af-49b8-a72a-64e9c337aa53',
    'Marcela':      'a3626643-4749-4e56-83bc-b4a8ffd53659',
    'Raissa':       '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb',
    'Renan':        'a50f1e24-aabb-41c1-b817-b4a4950bb1e4',
    'Renata':       '9451cd9f-6770-4e32-aae8-c75fa675e818',
    'Ronald':       '97f12885-87ad-426a-8bbb-656889d82e10',
    'Ruyter':       '85743f3e-1b32-49c0-9d9e-c16afd690f7d',
    'Yasmin':       'e07d4d35-1381-4d4d-914d-8382a7456fdd',
    # Ana Beatriz NAO encontrada na importacao anterior - precisa de UUID
}

LOJA_MAP = {
    'CELL':    1,
    'BALCAO':  1,
    '1':       1,
    'ONLINE':  4,
    '4':       4,
    'CASES':   19,
    '19':      19,
    'BLOCO B': 20,
    '20':      20,
}

def parse_brl(v):
    if not v or not v.strip(): return 0.0
    v = re.sub(r'^R?\$\s*', '', v.strip())
    v = v.replace('.', '').replace(',', '.')
    try: return float(v)
    except: return 0.0

def to_date(datestr):
    if not datestr or not datestr.strip(): return None
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr.strip())
    if m: return f'{m.group(3)}-{m.group(2)}-{m.group(1)}'
    return None

def detectar_estado(modelo):
    m = modelo.upper()
    if 'NOVO' in m: return 'novo'
    if 'SEMINOVO' in m: return 'seminovo'
    if 'USADO' in m: return 'usado'
    return 'seminovo'

def extract_brand(modelo):
    m = modelo.upper().strip()
    if m.startswith('IPHONE') or m.startswith('IPAD') or m.startswith('MAC') or m.startswith('APPLE'): return 'Apple'
    if m.startswith('SAMSUNG'): return 'Samsung'
    if m.startswith('REDMI') or m.startswith('MI '): return 'Xiaomi'
    if m.startswith('REALME'): return 'Realme'
    if m.startswith('NOTE'): return 'Redmi'
    return 'Outros'

def normalizar_pagamento(texto):
    """Extrai valores de cada forma de pagamento do texto livre."""
    if not texto or not texto.strip():
        return {'formas': 'nao_informado', 'pix': 0, 'dinheiro': 0,
                'cartao_credito': 0, 'cartao_debito': 0, 'troca': 0,
                'modelo_troca': '', 'precisa_revisao': 'SIM', 'motivo': 'sem forma de pagamento'}

    t = texto.strip()
    t_upper = t.upper()

    # Detectar PAGAMENTO JUNTO (grupo)
    if 'PAGAMENTO JUNTO' in t_upper and re.search(r'APARELHO\s*[234]', t_upper):
        return {'formas': 'pagamento_junto_secundario', 'pix': 0, 'dinheiro': 0,
                'cartao_credito': 0, 'cartao_debito': 0, 'troca': 0,
                'modelo_troca': '', 'precisa_revisao': 'SIM', 'motivo': 'pagamento junto - aparelho 2+'}

    # Detectar GARANTIA
    if re.match(r'^GARANTIA', t_upper):
        return {'formas': 'garantia', 'pix': 0, 'dinheiro': 0,
                'cartao_credito': 0, 'cartao_debito': 0, 'troca': 0,
                'modelo_troca': '', 'precisa_revisao': 'SIM', 'motivo': 'garantia - revisar manualmente'}

    resultado = {'pix': 0.0, 'dinheiro': 0.0, 'cartao_credito': 0.0,
                 'cartao_debito': 0.0, 'troca': 0.0, 'modelo_troca': ''}

    # Extrair troca/entrada
    troca_match = re.search(
        r'(?:entrou?|entrada|entrando|pegando|trocando)[^\d/]*(?:um|uma|iphone|samsung|redmi|realme)?[^R$\d]*'
        r'([A-Za-z0-9 ]+?)(?:\s+(?:por|a|no valor de|seminovo|novo|usado)\s*)?'
        r'(?:R\$\s*)?(\d[\d.,]*)',
        t, re.IGNORECASE
    )
    if troca_match:
        raw_modelo = troca_match.group(1).strip()
        raw_valor = troca_match.group(2).replace('.', '').replace(',', '.')
        try:
            resultado['troca'] = float(raw_valor)
            resultado['modelo_troca'] = raw_modelo[:80]
        except: pass
        # Remove a parte de troca do texto para nao confundir outros valores
        t_sem_troca = t[:troca_match.start()].strip()
    else:
        t_sem_troca = t

    # Detectar apenas credito (sem pix/dinheiro) - parcelas
    so_credito = re.match(r'^R?\$?\s*[\d.,]+\s*(?:em|credito|crédito|CRÉDITO|CREDITO|\d+x)', t_sem_troca, re.IGNORECASE)

    # Extrair valores de PIX
    pix_vals = re.findall(r'(?:pix\s*(?:de\s*)?R?\$?\s*|R?\$\s*[\d.,]+\s*(?:no\s*)?pix)'
                          r'|(?:PIX[:\s]*R?\$?\s*)([\d.,]+)', t_sem_troca, re.IGNORECASE)

    # Abordagem mais simples: extrair todos os numeros e categorizar pelo contexto
    partes = re.split(r'\s*/\s*|\s*\+\s*', t_sem_troca)
    formas_detectadas = set()

    for parte in partes:
        parte = parte.strip()
        if not parte: continue
        p_upper = parte.upper()

        # Extrair valor monetario da parte
        val_match = re.search(r'R?\$?\s*([\d.,]+)', parte)
        val = 0.0
        if val_match:
            raw = val_match.group(1).replace('.', '').replace(',', '.')
            try: val = float(raw)
            except: pass

        if 'PIX' in p_upper or 'PX' in p_upper:
            resultado['pix'] += val
            formas_detectadas.add('pix')
        elif 'DINHEIRO' in p_upper or 'REAIS' in p_upper:
            resultado['dinheiro'] += val
            formas_detectadas.add('dinheiro')
        elif 'DEBITO' in p_upper or 'DÉBITO' in p_upper:
            resultado['cartao_debito'] += val
            formas_detectadas.add('cartao_debito')
        elif re.search(r'CREDITO|CRÉDITO|CARTAO|CARTÃO|\d+[Xx]', p_upper):
            resultado['cartao_credito'] += val
            formas_detectadas.add('cartao_credito')
        elif resultado['troca'] > 0 and 'ENTRADA' in p_upper:
            pass  # ja capturado na troca
        elif val > 0 and not formas_detectadas:
            # Valor sozinho sem forma - assume PIX se nao tem nada
            resultado['pix'] += val
            formas_detectadas.add('pix?')

    if resultado['troca'] > 0:
        formas_detectadas.add('troca_aparelho')

    soma = resultado['pix'] + resultado['dinheiro'] + resultado['cartao_credito'] + resultado['cartao_debito'] + resultado['troca']

    formas_str = ' + '.join(sorted(formas_detectadas)) if formas_detectadas else 'outros'
    precisa_revisao = 'NAO'
    motivo = ''

    if soma == 0:
        precisa_revisao = 'SIM'
        motivo = 'nenhum pagamento extraido'
    elif formas_str in ('outros', 'nao_informado'):
        precisa_revisao = 'SIM'
        motivo = 'forma nao reconhecida'

    resultado['formas'] = formas_str
    resultado['precisa_revisao'] = precisa_revisao
    resultado['motivo'] = motivo
    return resultado


# ── Ler CSV ──────────────────────────────────────────────────────────────────
with open(INPUT, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f'Total de linhas lidas: {len(rows)}')
print()

# ── Análise de problemas ──────────────────────────────────────────────────────
problemas = []
imeis_vistos = {}
vendedores_sem_id = set()
lojas_sem_map = set()
resultados = []

for idx, row in enumerate(rows, start=2):
    linha_num = idx
    data = row.get('DATA', '').strip()
    modelo = row.get('MODELO', '').strip()
    imei_raw = row.get('IMEI', '').strip()
    imei = re.sub(r'\s+', '', imei_raw)
    valor_venda = parse_brl(row.get('VALOR DE VENDA', ''))
    brinde = parse_brl(row.get('BRINDE', ''))
    custo = parse_brl(row.get('CUSTO APARELHO', ''))
    lucro = parse_brl(row.get('LUCRO', ''))
    forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
    vendedor = row.get('VENDEDOR', '').strip()
    loja = row.get('LOJA', '').strip().upper()

    issues = []

    # Data
    data_iso = to_date(data)
    if not data_iso:
        issues.append(f'data inválida: "{data}"')

    # IMEI duplicado no CSV
    imei_dup = False
    if imei:
        if imei in imeis_vistos:
            issues.append(f'IMEI duplicado (linha {imeis_vistos[imei]})')
            imei_dup = True
        else:
            imeis_vistos[imei] = linha_num
    else:
        issues.append('sem IMEI')

    # Vendedor
    vendedor_id = VENDEDOR_MAP.get(vendedor, '')
    if not vendedor_id:
        issues.append(f'vendedor sem ID: "{vendedor}"')
        vendedores_sem_id.add(vendedor)

    # Loja
    loja_id = LOJA_MAP.get(loja, 0)
    if not loja_id:
        issues.append(f'loja sem mapeamento: "{loja}"')
        lojas_sem_map.add(loja)

    # Valor
    if valor_venda <= 0:
        issues.append('valor de venda zero/inválido')

    # Pagamento
    pgto = normalizar_pagamento(forma_orig)

    estado = detectar_estado(modelo)
    marca = extract_brand(modelo)

    registro = {
        'orig_linha': linha_num,
        'data': data,
        'data_iso': data_iso or '',
        'modelo': modelo,
        'marca': marca,
        'imei': imei,
        'imei_dup': 'SIM' if imei_dup else '',
        'valor_venda': valor_venda,
        'brinde': brinde,
        'custo': custo,
        'lucro': lucro,
        'forma_orig': forma_orig,
        'formas_norm': pgto['formas'],
        'pix': pgto['pix'],
        'dinheiro': pgto['dinheiro'],
        'cartao_credito': pgto['cartao_credito'],
        'cartao_debito': pgto['cartao_debito'],
        'troca_aparelho': pgto['troca'],
        'modelo_troca': pgto['modelo_troca'],
        'soma_pgto': round(pgto['pix'] + pgto['dinheiro'] + pgto['cartao_credito'] + pgto['cartao_debito'] + pgto['troca'], 2),
        'precisa_revisao': pgto['precisa_revisao'],
        'motivo_revisao': pgto.get('motivo', ''),
        'estado': estado,
        'vendedor': vendedor,
        'vendedor_id': vendedor_id,
        'loja': loja,
        'loja_id': loja_id,
        'issues': ' | '.join(issues) if issues else '',
    }

    if issues:
        for iss in issues:
            problemas.append({'linha': linha_num, 'modelo': modelo[:40], 'imei': imei, 'vendedor': vendedor, 'problema': iss})

    resultados.append(registro)

# ── Relatório ─────────────────────────────────────────────────────────────────
print('='*70)
print('RESUMO DA NORMALIZAÇÃO')
print('='*70)
print(f'Total de linhas:          {len(resultados)}')
print(f'Com IMEI:                 {sum(1 for r in resultados if r["imei"])}')
print(f'Sem IMEI:                 {sum(1 for r in resultados if not r["imei"])}')
print(f'IMEI duplicado no CSV:    {sum(1 for r in resultados if r["imei_dup"]=="SIM")}')
print(f'Precisa revisão (pgto):   {sum(1 for r in resultados if r["precisa_revisao"]=="SIM")}')
print(f'Prontos para importar:    {sum(1 for r in resultados if r["precisa_revisao"]=="NAO" and r["vendedor_id"] and r["loja_id"] and r["data_iso"])}')
print()

if vendedores_sem_id:
    print(f'⚠️  VENDEDORES SEM UUID (precisam ser cadastrados):')
    for v in sorted(vendedores_sem_id):
        cnt = sum(1 for r in resultados if r['vendedor'] == v)
        print(f'   - "{v}" ({cnt} vendas)')
    print()

if lojas_sem_map:
    print(f'⚠️  LOJAS SEM MAPEAMENTO:')
    for l in sorted(lojas_sem_map):
        cnt = sum(1 for r in resultados if r['loja'] == l)
        print(f'   - "{l}" ({cnt} vendas)')
    print()

print('FORMAS DE PAGAMENTO NORMALIZADAS:')
formas_count = Counter(r['formas_norm'] for r in resultados)
for f, c in sorted(formas_count.items(), key=lambda x: -x[1]):
    marker = ' ⚠️  (precisa revisão)' if 'outro' in f or 'secundario' in f or 'garantia' in f or 'nao_informado' in f else ''
    print(f'  {c:3}x {f}{marker}')
print()

print('LOJAS:')
loja_count = Counter(f'{r["loja"]} (id={r["loja_id"]})' for r in resultados)
for l, c in sorted(loja_count.items(), key=lambda x: -x[1]):
    print(f'  {c:3}x {l}')
print()

print('VENDEDORES:')
vend_count = Counter(f'{r["vendedor"]}' for r in resultados)
for v, c in sorted(vend_count.items(), key=lambda x: -x[1]):
    vid = VENDEDOR_MAP.get(v, '❌ SEM UUID')
    print(f'  {c:3}x {v:<20} {vid}')
print()

print('LINHAS QUE PRECISAM DE REVISÃO MANUAL:')
revisao = [r for r in resultados if r['precisa_revisao'] == 'SIM']
for r in revisao:
    print(f'  Linha {r["orig_linha"]:3}: {r["modelo"][:45]:<45} | {r["motivo_revisao"]}')
print(f'  Total: {len(revisao)}')
print()

if problemas:
    sem_imei = [p for p in problemas if 'sem IMEI' in p['problema']]
    if sem_imei:
        print(f'LINHAS SEM IMEI ({len(sem_imei)}):')
        for p in sem_imei:
            print(f'  Linha {p["linha"]:3}: {p["modelo"][:50]}')
        print()

# ── Gravar CSV normalizado ────────────────────────────────────────────────────
campos = ['orig_linha','data','data_iso','modelo','marca','imei','imei_dup',
          'valor_venda','brinde','custo','lucro',
          'forma_orig','formas_norm','pix','dinheiro','cartao_credito','cartao_debito',
          'troca_aparelho','modelo_troca','soma_pgto',
          'precisa_revisao','motivo_revisao',
          'estado','vendedor','vendedor_id','loja','loja_id','issues']

with open(OUTPUT_PREVIEW, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(resultados)

print(f'CSV normalizado salvo em: {OUTPUT_PREVIEW}')
print()
print('⛔ Nenhum dado foi enviado ao banco.')
print('   Revise o CSV e aprove para gerar o SQL de importação.')
