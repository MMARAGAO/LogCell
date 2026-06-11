#!/usr/bin/env python3
"""
Analisa venda_aparelhos.csv e prepara tudo para importacao.
Gera previews, mapeamentos e SQL (sem executar nada no banco).
"""
import csv, re, json, os
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT = os.path.join(ROOT, 'venda_aparelhos.csv')
OUTPUT_DIR = os.path.join(ROOT, 'scripts', 'importacao_preview')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ====================================================================
# MAPEAMENTOS (extraidos de gerar-vendas-lote.ts)
# ====================================================================

LOJA_MAP = {
    'CELL': 1,
    'CELL-FEIRA': 1,
    'CELL - FEIRA': 1,
    'BALCAO': 1,
    'BLOCO B': 20,
    'CASES': 19,
    'ONLINE': 4,
}

VENDEDOR_MAP = {
    'ANGEL': None,
    'BIANCA': 'b4269e60-eea2-4eba-a34d-db9591e0ec83',
    'CAMILA': '1d12d555-68e9-45f8-bfc0-a35a1d8d7920',
    'GUILHERME': '25e2da5b-9e76-4388-9890-7e22efd6940d',
    'HIGOR GUEDES': '85e3aa42-b9af-49b8-a72a-64e9c337aa53',
    'LUIZ HENRIQUE': '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb',
    'MARCELA': 'a3626643-4749-4e56-83bc-b4a8ffd53659',
    'RAISSA': '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb',
    'RENAN': 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4',
    'RENANN': 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4',
    'RENNAN': 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4',
    'RENATA': '9451cd9f-6770-4e32-aae8-c75fa675e818',
    'RONALD': '97f12885-87ad-426a-8bbb-656889d82e10',
    'RUYTER': '85743f3e-1b32-49c0-9d9e-c16afd690f7d',
    'YASMIN': 'e07d4d35-1381-4d4d-914d-8382a7456fdd',
}

# ====================================================================
# FUNCOES
# ====================================================================

def parse_brl(v):
    if not v or not v.strip(): return 0.0
    v = v.strip()
    if v.upper() in ('GARANTIA', 'TROCA', 'DEPOSITO'): return None  # nao e valor monetario
    v = re.sub(r'^R\$\s*', '', v)
    v = v.replace('.', '').replace(',', '.')
    try: return float(v)
    except: return 0.0

def to_date(datestr):
    """Converte '01/05/2026' para '2026-05-01'"""
    if not datestr: return None
    datestr = datestr.strip()
    match = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr)
    if match: return f'{match.group(3)}-{match.group(2)}-{match.group(1)}'
    return None

def limpar_acentos(t):
    subs = {
        'Á':'A','À':'A','Â':'A','Ã':'A','Ä':'A',
        'É':'E','Ê':'E','È':'E','Ë':'E',
        'Í':'I','Î':'I','Ì':'I','Ï':'I',
        'Ó':'O','Ô':'O','Õ':'O','Ò':'O','Ö':'O',
        'Ú':'U','Û':'U','Ù':'U','Ü':'U',
        'Ç':'C','Ñ':'N',
    }
    for a, s in subs.items():
        t = t.replace(a, s)
    return t

def extrair_troca(texto):
    """
    Extrai dados do aparelho de troca do texto, com suporte a múltiplos padrões.
    Retorna lista de dicts: [{'modelo': '...', 'valor': 123.45}, ...]
    """
    if not texto: return []
    
    texto_original = texto
    t = texto.upper()
    t = limpar_acentos(t)
    t = re.sub(r'\s+', ' ', t).strip()
    
    trocas = []
    
    # --- PADRAO 1: "ENTRADA IPH <modelo> R$ <valor>" (mais comum) ---
    # ENTRADA IPH 15 PRO MAX 256GB NATURAL R$ 3.200,00
    # ENTRADA IPH 14 PRO MAX ROXO 256GB R$ 3.000
    # ENTRADA IPH 13 1.550,00
    matches = list(re.finditer(
        r'ENTRADA\s+(.+?)\s+R?\$?\s*([\d]+\s*[.,]\s*[\d]+)',
        t
    ))
    for m in matches:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace(' ', '').replace('.', '').replace(',', '.')
        try:
            valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except:
            continue
        # Limpar palavras residuais do modelo
        for word in ['R$', 'REAL', 'REAIS']:
            modelo = modelo.replace(word, '')
        modelo = re.sub(r'\s+', ' ', modelo).strip()
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
    
    if trocas:
        return trocas
    
    # --- PADRAO 2: "entrou <modelo> na troca por <valor>" ---
    # "entrou 14 128 lilas seminovo na troca por 1800,00"
    m = re.search(r'ENTROU\s+(.+?)\s+(SEMINOVO|NOVO|USADO)?\s*NA\s+TROCA\s+POR\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        if m.group(2): modelo += ' ' + m.group(2)
        valor_str = m.group(3).strip().replace('.', '').replace(',', '.')
        try:
            valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except:
            valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 3: "<modelo> de entrada no valor de R$ <valor>" ---
    m = re.search(r'(.+?)\s+DE\s+ENTRADA\s+NO\s+VALOR\s+DE\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        # Limpar: "iphone 12 Pro Max 128GB"
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 4: "a entrada de um <modelo>" (ex: "1600,00 a entrada de um 13 seminovo") ---
    m = re.search(r'ENTRADA\s+(?:DE\s+)?(?:UM\s+)?(.+?)\s+(?:POR\s+)?R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        for word in ['R$', 'REAL', 'REAIS']:
            modelo = modelo.replace(word, '')
        modelo = re.sub(r'\s+', ' ', modelo).strip()
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 5: "pegando na troca um <modelo> por <valor>" ---
    m = re.search(r'PEGANDO\s+(?:NA\s+TROCA\s+)?(?:UM\s+)?(.+?)\s+POR\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 6: "um aparelho na troca, <modelo> por <valor>" ---
    # "$2300 no pix / e um aparelho na troca, iphone 13 preto, 128g por $1650"
    m = re.search(r'(?:UM\s+)?APARELHO\s+(?:NA\s+)?TROCA[.,;: ]+(.+?)\s+POR\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 7: "Downgrade / <modelo> R$ <valor>" ---
    m = re.search(r'DOWNGRADE\s*[/\-]?\s*(.+?)\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 8: "ENTRADA: <modelo> : <valor>" (ex: "ENTRADA: IPHONE X 256 GB PRETO : 0,00") ---
    m = re.search(r'ENTRADA[:\s]+(.+?)\s*:\s*R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 9: "<valor> (restante|a|de|referente a) entrada (de um|do|de) <modelo>" ---
    # Ex: "5000,00 referente a entrada do 16 pro Max seminovo"
    # Ex: "1600,00 a entrada de um 13 seminovo"
    # Ex: "300,00 restante a entrada de um xs Max seminovo"
    m = re.search(r'([\d.,]+)\s+(?:RESTANTE\s+)?(?:A\s+)?(?:REFERENTE\s+A\s+)?(?:DE\s+)?ENTRADA\s+(?:DE\s+)?(?:UM\s+)?(?:DO\s+)?(.+?)$', t)
    if m:
        valor_str = m.group(1).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        modelo = m.group(2).strip()
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 10: "PEGANDO <modelo> PRO <valor>" (typo: PRO instead of POR) ---
    # "PEGANDO IPHONE 16 PRO 128GB PRO 4.350,00/R$950,00 PIX"
    m = re.search(r'PEGANDO\s+(.+?)\s+PRO\s+R?\$?\s*([\d.,]+)', t)
    if m:
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: valor = 0
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
            return trocas
    
    # --- PADRAO 11: "Entrou <modelo> de volta" (return/exchange) ---
    m = re.search(r'ENTROU\s+(?:O\s+)?(.+?)\s+DE\s+VOLTA', t)
    if m:
        modelo = m.group(1).strip()
        # Buscar valor de diferença pago
        m2 = re.search(r'PAGOU\s+R?\$?\s*([\d.,]+)', t)
        if m2:
            valor_str = m2.group(1).strip().replace('.', '').replace(',', '.')
            try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
            except: valor = 0
        else:
            valor = 0
        if len(modelo) >= 3:
            trocas.append({'modelo': modelo + ' (RETORNO)', 'valor': valor})
            return trocas
    
    return trocas  # vazio = nao detectado


def normalizar_forma(texto):
    if not texto or not texto.strip(): return []
    t = limpar_acentos(texto.upper())
    t = re.sub(r'[^A-Z0-9 /]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    
    f = []
    if 'PIX' in t: f.append('pix')
    if 'DINHEIRO' in t: f.append('dinheiro')
    if 'DEBITO' in t: f.append('cartao_debito')
    if 'CREDITO' in t or 'CARTAO' in t or 'CRED' in t:
        f.append('cartao_credito')
    if 'BOLETO' in t: f.append('boleto')
    if 'ENTRADA' in t or 'TROCA' in t or 'DOWNGRADE' in t or 'PEGANDO' in t:
        f.append('troca_aparelho')
    if 'PAGAMENTO JUNTO' in t: f.append('pagamento_junto')
    if 'GARANTIA' in t: f.append('garantia')
    if not f: f.append('outros')
    return f


def extrair_valor_pagamentos(texto, formas):
    """Tenta extrair valores de cada forma de pagamento do texto."""
    if not texto: return {}
    t = limpar_acentos(texto.upper().replace('$', 'R$'))
    
    valores = {}
    
    # Encontrar to dos valores no texto
    nums = re.findall(r'R?\$?\s*([\d]+\s*[.,]\s*[\d]+)', t)
    valores_parseados = []
    for n in nums:
        v = n.strip().replace(' ', '').replace('.', '').replace(',', '.')
        try:
            valores_parseados.append(float(re.sub(r'[^0-9.]', '', v)))
        except:
            pass
    
    # Se tiver PIX + CREDITO, tentar separar
    if 'pix' in formas and 'cartao_credito' in formas:
        # Procurar valor depois de "PIX" ou "PIX R$"
        pix_vals = []
        for m in re.finditer(r'PIX\s+R?\$?\s*([\d.,]+)', t):
            try:
                v = m.group(1).strip().replace('.', '').replace(',', '.')
                pix_vals.append(float(re.sub(r'[^0-9.]', '', v)))
            except: pass
        if pix_vals:
            valores['pix'] = sum(pix_vals)
        
        cred_vals = []
        for m in re.finditer(r'(?:CREDITO|CARTAO|CRED)\s+(?:EM\s+\d+X\s+)?R?\$?\s*([\d.,]+)', t):
            try:
                v = m.group(1).strip().replace('.', '').replace(',', '.')
                cred_vals.append(float(re.sub(r'[^0-9.]', '', v)))
            except: pass
        # Also look for numbers near "x" (installments)
        if not cred_vals:
            for m in re.finditer(r'R?\$?\s*([\d.,]+)\s+EM\s+\d+X', t):
                try:
                    v = m.group(1).strip().replace('.', '').replace(',', '.')
                    cred_vals.append(float(re.sub(r'[^0-9.]', '', v)))
                except: pass
        if cred_vals:
            valores['cartao_credito'] = sum(cred_vals)
    
    return valores


# ====================================================================
# 1. LER CSV
# ====================================================================
with open(INPUT, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    linhas = list(reader)

print(f'Total de linhas no CSV: {len(linhas)}')
print()

# ====================================================================
# 2. PROCESSAR
# ====================================================================
registros = []
stats_formas = Counter()
stats_trocas = {'detectadas': 0, 'nao_detectadas': 0, 'sem_troca': 0}
trocas_detectadas = []
trocas_nao_detectadas = []
vendedores = set()
vendedores_sem_id = set()
lojas = set()
lojas_sem_id = set()
problemas = []

for row in linhas:
    data = row.get('DATA', '').strip()
    vendedor_nome = row.get('VENDEDOR', '').strip().title()
    loja_nome = row.get('LOJA', '').strip().upper() or 'CELL'
    modelo = row.get('MODELO', '').strip()
    imei = row.get('IMEI', '').strip().replace(' ', '')
    valor_venda = parse_brl(row.get('VALOR DE VENDA', ''))
    brinde = parse_brl(row.get('BRINDE', ''))
    custo = parse_brl(row.get('CUSTO APARELHO', ''))
    lucro = parse_brl(row.get('LUCRO', ''))
    forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
    
    # Normalizar formas
    formas = normalizar_forma(forma_orig)
    for f in formas:
        stats_formas[f] += 1
    
    # Loja mapping
    loja_id = LOJA_MAP.get(loja_nome)
    if loja_id is None:
        lojas_sem_id.add(loja_nome)
    
    # Vendedor mapping
    vendedor_key = vendedor_nome.upper()
    vendedor_id = VENDEDOR_MAP.get(vendedor_key)
    if vendedor_id is None and vendedor_nome:
        vendedores_sem_id.add(vendedor_nome)
    
    vendedores.add(vendedor_nome)
    lojas.add(loja_nome)
    
    # Trocas
    tem_troca = 'troca_aparelho' in formas
    trocas_encontradas = []
    if tem_troca:
        trocas_encontradas = extrair_troca(forma_orig)
        if trocas_encontradas:
            stats_trocas['detectadas'] += 1
            for t in trocas_encontradas:
                trocas_detectadas.append({
                    'modelo_vendido': modelo,
                    'valor_venda': valor_venda,
                    'modelo_troca': t['modelo'],
                    'valor_troca': t['valor'],
                    'vendedor': vendedor_nome,
                    'data': data,
                    'data_iso': to_date(data),
                    'loja': loja_nome,
                    'loja_id': loja_id,
                    'forma_orig': forma_orig[:80],
                })
        else:
            stats_trocas['nao_detectadas'] += 1
            trocas_nao_detectadas.append({
                'modelo_vendido': modelo,
                'valor_venda': valor_venda,
                'vendedor': vendedor_nome,
                'data': data,
                'loja': loja_nome,
                'loja_id': loja_id,
                'forma_orig': forma_orig[:120],
            })
    else:
        stats_trocas['sem_troca'] += 1
    
    # Extrair valores de pagamento
    valores_pagto = extrair_valor_pagamentos(forma_orig, formas)
    
    # Validacoes
    if valor_venda is None:
        problemas.append(f'VENDA NAO MONETARIA (GARANTIA/TROCA): {modelo} ({data}) - sera ignorado')
        continue
    if not modelo:
        problemas.append(f'Linha sem modelo: {data}')
    if not imei:
        problemas.append(f'Sem IMEI: {modelo} ({data})')
    if valor_venda <= 0:
        problemas.append(f'Valor venda zero/invalido: {modelo} ({data})')
    
    # Data invalida
    if not to_date(data):
        problemas.append(f'Data invalida: {data} ({modelo})')
    
    registros.append({
        'data_iso': to_date(data),
        'data': data,
        'modelo': modelo,
        'imei': imei,
        'valor_venda': valor_venda,
        'brinde': brinde,
        'custo': custo,
        'lucro': lucro,
        'formas': formas,
        'valores_pagto': valores_pagto,
        'tem_troca': tem_troca,
        'trocas': trocas_encontradas,
        'vendedor_nome': vendedor_nome,
        'vendedor_id': vendedor_id,
        'loja_nome': loja_nome,
        'loja_id': loja_id,
    })

# ====================================================================
# 3. RELATORIO
# ====================================================================
print('='*60)
print('RELATORIO DE ANALISE DO CSV')
print('='*60)
print()

print(f'Total de registros: {len(registros)}')
print()

print('--- FORMAS DE PAGAMENTO ---')
for f, qtd in sorted(stats_formas.items(), key=lambda x: -x[1]):
    print(f'  {qtd:4}x: {f}')

print()
print('--- TROCAS ---')
print(f'  Detectadas:       {stats_trocas["detectadas"]}')
print(f'  Nao detectadas:   {stats_trocas["nao_detectadas"]}')
print(f'  Sem troca:        {stats_trocas["sem_troca"]}')
total_com_troca = stats_trocas['detectadas'] + stats_trocas['nao_detectadas']
pct = stats_trocas['detectadas'] / max(total_com_troca, 1) * 100
print(f'  Taxa de extracao: {pct:.0f}% ({stats_trocas["detectadas"]}/{total_com_troca})')

print()
print('--- VENDEDORES ---')
for v in sorted(vendedores):
    key = v.upper()
    vid = VENDEDOR_MAP.get(key)
    status = '✓' if vid else '⚠ SEM ID'
    print(f'  {status} {v}')

if vendedores_sem_id:
    print(f'\n⚠ Vendedores sem ID no mapeamento:')
    for v in sorted(vendedores_sem_id):
        print(f'  - {v}')

print()
print('--- LOJAS ---')
for l in sorted(lojas):
    lid = LOJA_MAP.get(l)
    status = f'loja_id={lid}' if lid else '⚠ SEM ID'
    print(f'  {status}: {l}')

print()
print('--- VALORES TOTAIS ---')
total_venda = sum(r['valor_venda'] for r in registros)
total_custo = sum(r['custo'] for r in registros)
total_lucro = sum(r['lucro'] for r in registros)
total_brinde = sum(r['brinde'] for r in registros)
print(f'  Total VENDA:    R$ {total_venda:,.2f}')
print(f'  Total CUSTO:    R$ {total_custo:,.2f}')
print(f'  Total BRINDE:   R$ {total_brinde:,.2f}')
print(f'  Total LUCRO:    R$ {total_lucro:,.2f}')
print(f'  Margem media:   {(total_lucro/total_venda*100):.1f}%')

print()
print('--- PROBLEMAS ENCONTRADOS ---')
if problemas:
    for p in problemas[:20]:
        print(f'  ⚠ {p}')
    if len(problemas) > 20:
        print(f'  ... e mais {len(problemas)-20} problemas')
else:
    print('  Nenhum problema encontrado')

print()
print('--- RESUMO POR LOJA ---')
for loja_nome in sorted(lojas):
    lid = LOJA_MAP.get(loja_nome)
    recs = [r for r in registros if r['loja_nome'] == loja_nome]
    total = sum(r['valor_venda'] for r in recs)
    trocas = sum(1 for r in recs if r['tem_troca'])
    print(f'  loja_id={lid or "?"} {loja_nome:12s}: {len(recs):3d} registros, R$ {total:>8,.2f}, {trocas} trocas')

# ====================================================================
# 4. SALVAR PREVIEWS
# ====================================================================

# Trocas detectadas
def _filtrar(dados, campos):
    return [{k: r[k] for k in campos} for r in dados]

with open(os.path.join(OUTPUT_DIR, 'trocas_detectadas.csv'), 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['modelo_vendido','valor_venda','modelo_troca','valor_troca','vendedor','data','loja','loja_id','forma_orig']
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(_filtrar(trocas_detectadas, fieldnames))

# Trocas nao detectadas
if trocas_nao_detectadas:
    with open(os.path.join(OUTPUT_DIR, 'trocas_revisao_manual.csv'), 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['modelo_vendido','valor_venda','vendedor','data','loja','loja_id','forma_orig']
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(_filtrar(trocas_nao_detectadas, fieldnames))

# Preview SQL-like (apenas para visualizacao, sem executar)
with open(os.path.join(OUTPUT_DIR, 'preview_importacao.csv'), 'w', newline='', encoding='utf-8') as f:
    fieldnames = [
        'data','data_iso','modelo','imei','valor_venda','custo','brinde','lucro',
        'formas','tem_troca','qtd_trocas','modelo_troca','valor_troca',
        'vendedor_nome','vendedor_id','loja_nome','loja_id'
    ]
    w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
    w.writeheader()
    for r in registros:
        row = dict(r)
        row['qtd_trocas'] = len(r.get('trocas', []))
        row['modelo_troca'] = '; '.join(t['modelo'] for t in r.get('trocas', []))
        row['valor_troca'] = sum(t['valor'] for t in r.get('trocas', []))
        row['formas'] = '+'.join(r.get('formas', []))
        w.writerow(row)

# Resumo JSON
resumo = {
    'total_registros': len(registros),
    'total_venda': total_venda,
    'total_custo': total_custo,
    'total_brinde': total_brinde,
    'total_lucro': total_lucro,
    'lojas': {l: {'id': LOJA_MAP.get(l), 'qtd': sum(1 for r in registros if r['loja_nome'] == l), 'total_venda': sum(r['valor_venda'] for r in registros if r['loja_nome'] == l)} for l in sorted(lojas)},
    'vendedores': {v: {'id': VENDEDOR_MAP.get(v.upper()), 'qtd': sum(1 for r in registros if r['vendedor_nome'] == v)} for v in sorted(vendedores)},
    'trocas_detectadas': len(trocas_detectadas),
    'trocas_nao_detectadas': len(trocas_nao_detectadas),
    'taxa_extracao_trocas': round(pct, 0),
    'problemas': len(problemas),
    'vendedores_sem_id': sorted(vendedores_sem_id),
}
with open(os.path.join(OUTPUT_DIR, 'resumo.json'), 'w', encoding='utf-8') as f:
    json.dump(resumo, f, indent=2, ensure_ascii=False)

print()
print(f'Relatorios salvos em: {OUTPUT_DIR}/')
print('  - trocas_detectadas.csv')
print('  - trocas_revisao_manual.csv' if trocas_nao_detectadas else '')
print('  - preview_importacao.csv')
print('  - resumo.json')
