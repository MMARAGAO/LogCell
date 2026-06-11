#!/usr/bin/env python3
"""
Gera CSV final com todos os dados normalizados e corrigidos:
- Pagamento junto: valores agrupados corretamente
- Angel: vendedor ID definido
- IMEI vazio: mantido como vazio
- Troca R$ 0: registrada
"""
import csv, re, os, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))

# Inline necessarias para evitar importar o modulo analisar_importacao
# (que executa o codigo principal ao ser importado)

ACENTOS_MAP = {
    'Á':'A','À':'A','Â':'A','Ã':'A','Ä':'A',
    'É':'E','Ê':'E','È':'E','Ë':'E',
    'Í':'I','Î':'I','Ì':'I','Ï':'I',
    'Ó':'O','Ô':'O','Õ':'O','Ò':'O','Ö':'O',
    'Ú':'U','Û':'U','Ù':'U','Ü':'U',
    'Ç':'C','Ñ':'N',
}

def limpar_acentos(t):
    for a, s in ACENTOS_MAP.items():
        t = t.replace(a, s)
    return t

# Tabela de taxas de cartao (coeficiente = 1 - taxa_percentual/100)
# Visa/Mastercard
TAXAS_VISA = {
    1: 0.9615, 2: 0.95, 3: 0.9405, 4: 0.9331, 5: 0.9265,
    6: 0.92, 7: 0.9131, 8: 0.9072, 9: 0.9011, 10: 0.891,
    11: 0.887, 12: 0.879, 13: 0.867, 14: 0.859, 15: 0.8481,
    16: 0.84, 17: 0.8341, 18: 0.829,
}
# Elo
TAXAS_ELO = {
    1: 0.9515, 2: 0.94, 3: 0.9305, 4: 0.9231, 5: 0.9165,
    6: 0.91, 7: 0.9031, 8: 0.8972, 9: 0.8911, 10: 0.881,
    11: 0.877, 12: 0.869, 13: 0.857, 14: 0.849, 15: 0.8381,
    16: 0.83, 17: 0.8241, 18: 0.819,
}

def extrair_parcelas(texto):
    """Extrai numero de parcelas do texto (1 se nao encontrar)."""
    if not texto: return 1
    m = re.search(r'(\d+)\s*[Xx]', texto)
    return int(m.group(1)) if m else 1

def aplicar_taxa_credito(valor_bruto, texto, venda, outros_pagtos):
    """
    Tenta aplicar taxa de cartao ao valor bruto do credito.
    Retorna (valor_liquido, parcelas, bandeira, taxa_pct, arredondamento) 
    ou None se nao fechar com nenhuma taxa.
    """
    parcelas = extrair_parcelas(texto)
    parcelas = min(max(parcelas, 1), 18)
    
    for bandeira, tabela in [('visa', TAXAS_VISA), ('elo', TAXAS_ELO)]:
        coef = tabela.get(parcelas, tabela[1])
        liquido = round(valor_bruto * coef, 2)
        total = round(liquido + outros_pagtos, 2)
        arred = round(venda - total, 2)
        if abs(arred) < 5:
            taxa_pct = round((1 - coef) * 100, 2)
            return (liquido, parcelas, bandeira, taxa_pct, arred)
    
    return None

def to_date(datestr):
    if not datestr: return None
    datestr = datestr.strip()
    match = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr)
    if match: return f'{match.group(3)}-{match.group(2)}-{match.group(1)}'
    return None

def extrair_troca(texto):
    """Extrai dados do aparelho de troca do texto."""
    if not texto: return []
    t = texto.upper()
    t = limpar_acentos(t)
    t = re.sub(r'\s+', ' ', t).strip()
    trocas = []
    
    # PADRAO 1: ENTRADA <modelo> R$ <valor> (exclui "DE ENTRADA" e "ENTRADA NO VALOR DE")
    for m in re.finditer(r'ENTRADA\s+(?!DE\s|NO\s+VALOR)([\w\s]+?)\s+R?[$]?\s*([\d]+\s*[.,]\s*[\d]+)', t):
        modelo = m.group(1).strip()
        valor_str = m.group(2).strip().replace(' ', '').replace('.', '').replace(',', '.')
        try: valor = float(re.sub(r'[^0-9.]', '', valor_str))
        except: continue
        for word in ['R$', 'REAL', 'REAIS']: modelo = modelo.replace(word, '')
        modelo = re.sub(r'\s+', ' ', modelo).strip()
        if len(modelo) >= 3 and valor > 0:
            trocas.append({'modelo': modelo, 'valor': valor})
    
    # PADRAO 2: entrou <modelo> na troca por <valor>
    for m in re.finditer(r'ENTROU\s+(.+?)\s+(SEMINOVO|NOVO|USADO)?\s*NA\s+TROCA\s+POR\s+R?[$]?\s*([\d.,]+)', t):
        modelo = m.group(1).strip()
        if m.group(2): modelo += ' ' + m.group(2)
        valor = parse_real(m.group(3)) or 0
        if len(modelo) >= 3 and valor > 0: trocas.append({'modelo': modelo, 'valor': valor})
    
    # PADRAO 3: <modelo> de entrada no valor de R$ <valor>
    for m in re.finditer(r'([\w\s]+?)\s+DE\s+ENTRADA\s+NO\s+VALOR\s+DE\s+R?[$]?\s*([\d.,]+)', t):
        modelo = m.group(1).strip(); valor = parse_real(m.group(2)) or 0
        if len(modelo) >= 3 and valor > 0: trocas.append({'modelo': modelo, 'valor': valor})
    
    # PADRAO 4: <valor> (restante|a|referente a|de) entrada (de um|do) <modelo>
    for m in re.finditer(r'([\d.,]+)\s+(?:RESTANTE\s+)?(?:A\s+)?(?:REFERENTE\s+A\s+)?(?:DE\s+)?ENTRADA\s+(?:DE\s+)?(?:UM\s+)?(?:DO\s+)?(.+?)$', t):
        valor = parse_real(m.group(1)) or 0; modelo = m.group(2).strip()
        if len(modelo) >= 3 and valor > 0: trocas.append({'modelo': modelo, 'valor': valor})
    
    # PADRAO 5: removido (PRO e ambíguo - confunde com modelo "14 PRO")
    
    # PADRAO 6: PEGANDO <modelo> POR <valor>
    for m in re.finditer(r'PEGANDO\s+(?:NA\s+TROCA\s+)?(?:UM\s+)?([\w\s]+?)\s+POR\s+R?[$]?\s*([\d.,]+)', t):
        modelo = m.group(1).strip(); valor = parse_real(m.group(2)) or 0
        if len(modelo) >= 3 and valor > 0: trocas.append({'modelo': modelo, 'valor': valor})
    
    # PADRAO 7: "/ <modelo> R$ <valor>" (ex: "/ iPhone 16 PRO R$ 4.450,00")
    # Exige separador decimal/milhar no valor para evitar "256GB"
    for m in re.finditer(r'/\s*([A-Z][\w\s]+?)\s+R?[$]?\s*(\d+(?:[.,]\d+)+)', t):
        modelo = m.group(1).strip().upper()
        modelo = re.sub(r'\s+', ' ', modelo).strip()
        valor = parse_real(m.group(2)) or 0
        palavras_chave = ['PIX', 'CREDITO', 'CARTAO', 'DEBITO', 'DINHEIRO', 'TROCA', 'ENTRADA', 'BOLETO', 'PEGANDO', 'DOWNGRADE']
        if (len(modelo) >= 5 and valor > 0 and 
            not any(k in modelo for k in palavras_chave)):
            trocas.append({'modelo': modelo, 'valor': valor})
    
    return trocas

# ====================================================================
# MAPEAMENTOS
# ====================================================================
LOJA_MAP = {
    'CELL': 1, 'CELL-FEIRA': 1, 'CELL - FEIRA': 1, 'BALCAO': 1,
    'BLOCO B': 20, 'CASES': 19, 'ONLINE': 4,
}

VENDEDOR_MAP = {
    'ANGEL': '97f12885-87ad-426a-8bbb-656889d82e10',  # fallback: Ronald
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

def parse_real(v):
    if not v: return None
    v = v.strip()
    if v.upper() in ('GARANTIA', 'TROCA', 'DEPOSITO'): return None
    v = re.sub(r'^R[$]\s*', '', v)
    v = v.strip()
    if not v: return None
    
    commas = v.count(',')
    dots = v.count('.')
    
    # Se tem virgula: formato brasileiro, ultimo separador e decimal
    if commas > 0:
        last_sep = max(v.rfind('.'), v.rfind(','))
        before = v[:last_sep].replace('.', '').replace(',', '')
        after = v[last_sep+1:]
        try: return float(before + '.' + after)
        except: return None
    
    # So tem ponto: ambiguo (milhar ou decimal?)
    if dots == 0:
        try: return float(v)
        except: return None
    
    if dots == 1:
        parts = v.split('.')
        # Se parte decimal tem 3+ digitos, e milhar (ex: "5.150" = 5150)
        # Se tem 2 digitos, e decimal (ex: "5.15" = 5.15)
        # Se tem 1 digito, e decimal (ex: "5.1" = 5.1)
        if len(parts[1]) >= 3:
            v = v.replace('.', '')
            try: return float(v)
            except: return None
        else:
            try: return float(v)
            except: return None
    
    # Multiplos pontos: ultimo e decimal
    parts = v.split('.')
    v = ''.join(parts[:-1]) + '.' + parts[-1]
    try: return float(v)
    except: return None
    before = v[:last_sep].replace('.', '').replace(',', '')
    after = v[last_sep+1:]
    try: return float(before + '.' + after)
    except: return None

def extrair_forma_pgto(texto):
    """Retorna lista de formas normalizadas"""
    if not texto: return []
    t = limpar_acentos(texto.upper())
    t = re.sub(r'[^A-Z0-9 /]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    f = []
    if 'PIX' in t: f.append('pix')
    if 'DINHEIRO' in t: f.append('dinheiro')
    if 'DEBITO' in t: f.append('cartao_debito')
    if 'CREDITO' in t or 'CARTAO' in t or 'CRED' in t: f.append('cartao_credito')
    if 'BOLETO' in t: f.append('boleto')
    if 'ENTRADA' in t or 'TROCA' in t or 'DOWNGRADE' in t or 'PEGANDO' in t: f.append('troca_aparelho')
    if 'PAGAMENTO JUNTO' in t or 'JUNTO' in t: f.append('pagamento_junto')
    if 'GARANTIA' in t: f.append('garantia')
    if not f: f.append('outros')
    return f

def extrair_valor_entrada(texto):
    """Extrai apenas o valor da ENTRADA/troca, sem outros pagamentos.
    Retorna o valor da troca OU None se nao houver."""
    trocas = extrair_troca(texto)
    if trocas:
        return trocas[0]['modelo'], trocas[0]['valor']
    return None, 0

def extrair_pagamentos_simples(texto):
    """
    Extrai pagamentos de um texto SEM pagamento junto.
    Retorna dict com pix, dinheiro, cartao_credito, cartao_debito, troca_aparelho.
    """
    if not texto: return {}
    
    t = texto.upper()
    t = limpar_acentos(t)
    t = re.sub(r'\s+', ' ', t).strip()
    
    vals = defaultdict(float)
    
    # Troca/entrada
    trocas = extrair_troca(texto)
    for troca in trocas:
        vals['troca_aparelho'] += troca['valor']
    
    # Remove trechos de troca - versao simplificada sem lacos complexos
    t_clean = t
    # ENTRADA <texto> VALOR
    t_clean = re.sub(r'ENTRADA\s+[\w\s]+R?[$]?[\d]+\s*[.,]\s*[\d]+', ' ', t_clean)
    # ENTRADA: <texto> : VALOR
    t_clean = re.sub(r'ENTRADA[:\s]+[\w\s]+:?\s*R?[$]?[\d.,]+', ' ', t_clean)
    # entrou <texto> na troca por VALOR
    t_clean = re.sub(r'ENTROU\s+[\w\s]+NA\s+TROCA\s+POR\s+R?[$]?[\d.,]+', ' ', t_clean)
    # PEGANDO <texto> (POR|PRO) VALOR
    t_clean = re.sub(r'PEGANDO\s+[\w\s]+\s+(?:POR|PRO)\s+R?[$]?[\d.,]+', ' ', t_clean)
    # VALOR restante/a/referente a entrada de <texto>
    t_clean = re.sub(r'[\d.,]+\s+(?:RESTANTE\s+)?(?:A\s+)?(?:REFERENTE\s+A\s+)?(?:DE\s+)?ENTRADA\s+[\w\s]+', ' ', t_clean)
    # um aparelho na troca <texto> por VALOR
    t_clean = re.sub(r'(?:UM\s+)?APARELHO\s+(?:NA\s+)?TROCA[.,;: ]+[\w\s]+POR\s+R?[$]?[\d.,]+', ' ', t_clean)
    # Downgrade / <texto> VALOR
    t_clean = re.sub(r'DOWNGRADE\s*[/\-]?\s*[\w\s]+\s+R?[$]?[\d.,]+', ' ', t_clean)
    t_clean = re.sub(r'/\s*[A-Z][\w\s]+\s+R?[$]?[\d.,]+', ' ', t_clean)  # remove "/ Modelo R$ valor"
    
    t_clean = re.sub(r'\s+', ' ', t_clean).strip()
    
    # PIX (com suporte a "PIX DE", "PIX NO", "R4" como R$)
    t_clean = t_clean.replace('R4', 'R$')  # typo comum
    for m in re.finditer(r'(?:PIX\s*(?::)?\s*(?:DE\s+)?R?[$]?\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*(?:DE\s+)?PIX|R?[$]?\s*(\d+(?:[.,]\d+)*)\s+(?:DE|NO)?\s*PIX)', t_clean):
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            if v: vals['pix'] += v
    
    # DINHEIRO
    for m in re.finditer(r'(?:DINHEIRO\s*(?::)?\s*R?[$]?\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*(?:DE\s+)?DINHEIRO)', t_clean):
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            if v: vals['dinheiro'] += v
    
    # CREDITO: valor antes ou depois do tipo, com \b para evitar "1X" como valor
    for m in re.finditer(r'(?:CREDITO|CRED|CARTAO)\s*(?::)?\s*(?:EM\s+\d+X\s+)?R?[$]?\s*(\d+(?:[.,]\d+)*)(?!\S?X)|(\d+(?:[.,]\d+)*)\b\s*(?:EM\s+\d+X\s+)?(?:NO\s+)?(?:CREDITO|CARTAO)', t_clean):
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            if v: vals['cartao_credito'] += v
    
    # DEBITO
    for m in re.finditer(r'(?:DEBITO\s*(?::)?\s*R?[$]?\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*(?:DE\s+)?DEBITO)', t_clean):
        val_str = next((g for g in m.groups() if g), None)
        if val_str:
            v = parse_real(val_str)
            if v: vals['cartao_debito'] += v
    
    # PARCELAS sem credito explicito: "<valor> em <N>x" = cartao_credito
    # (evita dupla contagem: NAO aplica se ja extraiu algo no credito)
    if vals.get('cartao_credito', 0) == 0:
        for m in re.finditer(r'(\d+(?:[.,]\d+)*)\s+EM\s+\d+X', t_clean):
            v = parse_real(m.group(1))
            if v and v > 0:
                vals['cartao_credito'] += v
    
    return dict(vals)


# ====================================================================
# IDENTIFICAR GRUPOS DE PAGAMENTO JUNTO
# ====================================================================

def detectar_grupos_junto(rows):
    """
    Identifica grupos de pagamento junto.
    Retorna dict: grupo_id -> { indices, data, loja, vendedor, total, devices: [{idx, modelo, valor, entrada_modelo, entrada_valor}] }
    """
    grupos = []
    grupo_atual = None
    grupo_id = 0
    
    for i, row in enumerate(rows):
        texto = row.get('FORMA DE PAGAMENTO', '').upper()
        data = row.get('DATA', '').strip()
        loja = row.get('LOJA', '').strip().upper() or 'CELL'
        vendedor = row.get('VENDEDOR', '').strip().title()
        valor = parse_real(row.get('VALOR DE VENDA', ''))
        modelo = row.get('MODELO', '').strip()
        
        # Detectar se faz parte de grupo
        m_dev = re.search(r'APARELHO\s+(\d+)', texto)
        is_junto = 'PAGAMENTO JUNTO' in texto or 'PIX JUNTO' in texto or bool(m_dev)
        
        if is_junto and m_dev:
            dev_num = int(m_dev.group(1))
            
            if dev_num == 1:
                # Novo grupo
                grupo_id += 1
                grupo_atual = {
                    'grupo_id': grupo_id,
                    'data': data,
                    'loja': loja,
                    'vendedor': vendedor,
                    'devices': [],
                    'total': 0,
                }
                grupos.append(grupo_atual)
            
            if grupo_atual is not None:
                grupo_atual['devices'].append({
                    'csv_idx': i, 'dev_num': dev_num, 'modelo': modelo, 'valor': valor or 0
                })
                grupo_atual['total'] += valor or 0
        else:
            grupo_atual = None
    
    return grupos


# ====================================================================
# MAIN
# ====================================================================
INPUT = os.path.join(ROOT, 'venda_aparelhos.csv')
OUTPUT = os.path.join(ROOT, 'scripts', 'vendas_final.csv')

with open(INPUT, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f'Lendo {len(rows)} linhas...')

grupos = detectar_grupos_junto(rows)
print(f'Grupos de pagamento junto detectados: {len(grupos)}')

# Indexar grupos por csv_idx
grupo_por_idx = {}
for g in grupos:
    for d in g['devices']:
        grupo_por_idx[d['csv_idx']] = g

fieldnames = [
    'orig_linha', 'data', 'modelo', 'imei',
    'valor_venda', 'brinde', 'custo', 'lucro',
    'pix', 'dinheiro', 'cartao_credito', 'cartao_debito',
    'troca_aparelho', 'soma_pagamentos', 'diferenca',
    'formas_pgto', 'tem_troca', 'modelo_troca', 'valor_troca',
    'pagto_junto', 'pagto_junto_grupo', 'pagto_junto_total', 'pagto_junto_restante',
    'vendedor', 'vendedor_id', 'loja', 'loja_id', 'estado', 'observacao',
    'precisa_revisao', 'motivo_revisao', 'entendimento',
]

estatisticas = {
    'total': 0, 'trocas': 0, 'junto': 0,
    'sem_imei': 0, 'sem_vendedor': 0,
    'diferenca_total': 0, 'diferenca_count': 0,
}

results = []

for i, row in enumerate(rows):
    data = row.get('DATA', '').strip()
    modelo = row.get('MODELO', '').strip()
    imei = row.get('IMEI', '').strip().replace(' ', '')
    valor_venda = parse_real(row.get('VALOR DE VENDA', ''))
    brinde = parse_real(row.get('BRINDE', '')) or 0
    custo = parse_real(row.get('CUSTO APARELHO', '')) or 0
    lucro = parse_real(row.get('LUCRO', '')) or 0
    vendedor = row.get('VENDEDOR', '').strip().title()
    loja = row.get('LOJA', '').strip().upper() or 'CELL'
    forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
    
    # Skip non-monetary
    if valor_venda is None:
        continue
    
    estatisticas['total'] += 1
    if not imei: estatisticas['sem_imei'] += 1
    
    loja_id = LOJA_MAP.get(loja)
    vendedor_id = VENDEDOR_MAP.get(vendedor.upper(), '')
    if not vendedor_id:
        vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10'  # Ronald fallback
        estatisticas['sem_vendedor'] += 1
    
    # Estado
    m_upper = modelo.upper()
    if 'NOVO' in m_upper and 'SEMINOVO' not in m_upper and 'LACRADO' not in m_upper: estado = 'novo'
    elif 'LACRADO' in m_upper: estado = 'novo'
    elif 'USADO' in m_upper: estado = 'usado'
    else: estado = 'seminovo'
    
    # Formas
    formas = extrair_forma_pgto(forma_orig)
    tem_troca = 'troca_aparelho' in formas
    is_junto = 'pagamento_junto' in formas
    
    # Trocas (sempre extrair, mesmo se R$ 0)
    trocas = extrair_troca(forma_orig)
    # Detectar troca R$ 0 separadamente (valor 0 nao retorna de extrair_troca)
    tem_entrada_zero = bool(re.search(r'ENTRADA[:\s]+.+?:\s*0[.,]00', limpar_acentos(forma_orig.upper())))
    if tem_entrada_zero:
        m = re.search(r'ENTRADA[:\s]+(.+?)\s*:\s*0[.,]00', limpar_acentos(forma_orig.upper()))
        modelo_troca_zero = m.group(1).strip() if m else '(sem modelo)'
        trocas.append({'modelo': modelo_troca_zero + ' (R$ 0)', 'valor': 0})
    
    modelo_troca = '; '.join(t['modelo'] for t in trocas)
    valor_troca = sum(t['valor'] for t in trocas)
    if trocas: estatisticas['trocas'] += 1
    
    # ================================================================
    # EXTRACAO DE PAGAMENTOS
    # ================================================================
    r = {
        'orig_linha': i + 2, 'data': data, 'modelo': modelo, 'imei': imei or '',
        'valor_venda': valor_venda, 'brinde': brinde, 'custo': custo, 'lucro': lucro,
        'pix': 0, 'dinheiro': 0, 'cartao_credito': 0, 'cartao_debito': 0,
        'troca_aparelho': valor_troca,
        'soma_pagamentos': 0, 'diferenca': 0,
        'formas_pgto': '+'.join(formas),
        'tem_troca': 'SIM' if trocas else 'NAO',
        'modelo_troca': modelo_troca,
        'valor_troca': valor_troca,
        'pagto_junto': 'SIM' if is_junto else 'NAO',
        'pagto_junto_grupo': '',
        'pagto_junto_total': '',
        'pagto_junto_restante': '',
        'vendedor': vendedor, 'vendedor_id': vendedor_id,
        'loja': loja, 'loja_id': loja_id or '',
        'estado': estado,
        'observacao': '',
        'precisa_revisao': '',
        'motivo_revisao': '',
        'entendimento': '',
    }
    
    if is_junto and i in grupo_por_idx:
        # PAGAMENTO JUNTO: ratear o compartilhado pelo que falta em cada device
        estatisticas['junto'] += 1
        g = grupo_por_idx[i]
        dev = next((d for d in g['devices'] if d['csv_idx'] == i), None)
        dev_num = dev['dev_num'] if dev else 0
        
        r['pagto_junto_grupo'] = g['grupo_id']
        r['pagto_junto_total'] = g['total']
        r['pagto_junto_restante'] = 0
        
        r['observacao'] = f'Pagto junto (Aparelho {dev_num}/{len(g["devices"])}, total grupo R$ {g["total"]:,.0f})'
        
        # Determinar tipo de pagamento compartilhado
        tipo_shared = 'pix'
        for d in g['devices']:
            texto = rows[d['csv_idx']].get('FORMA DE PAGAMENTO', '').upper()
            texto = limpar_acentos(texto)
            if 'CREDITO' in texto or 'CARTAO' in texto:
                tipo_shared = 'cartao_credito'
                break
            elif 'DINHEIRO' in texto:
                tipo_shared = 'dinheiro'
            elif 'DEBITO' in texto:
                tipo_shared = 'cartao_debito'
        
        # Alocar ao device o que falta: venda - entrada
        falta = max(0, valor_venda - valor_troca)
        if falta > 0:
            r[tipo_shared] = falta
        
        soma = r['pix'] + r['dinheiro'] + r['cartao_credito'] + r['cartao_debito'] + r['troca_aparelho']
        r['soma_pagamentos'] = round(soma, 2)
        r['diferenca'] = round(valor_venda - soma, 2)
        
    else:
        # VENDA NORMAL
        pagtos = extrair_pagamentos_simples(forma_orig)
        r['pix'] = pagtos.get('pix', 0)
        r['dinheiro'] = pagtos.get('dinheiro', 0)
        r['cartao_credito'] = pagtos.get('cartao_credito', 0)
        r['cartao_debito'] = pagtos.get('cartao_debito', 0)
        
        soma = r['pix'] + r['dinheiro'] + r['cartao_credito'] + r['cartao_debito'] + r['troca_aparelho']
        
        # Fallback: quando uma unica forma de pagamento e mencionada sem valor,
        # usar o valor total da venda
        if soma == 0 and formas:
            # Apenas formas que implicam pagamento (excluir troca que ja foi extraida)
            formas_pagto = [f for f in formas if f not in ('troca_aparelho', 'pagamento_junto', 'garantia', 'outros')]
            if len(formas_pagto) == 1:
                f = formas_pagto[0]
                if f == 'pix':
                    r['pix'] = valor_venda
                elif f == 'dinheiro':
                    r['dinheiro'] = valor_venda
                elif f in ('cartao_credito',):
                    r['cartao_credito'] = valor_venda
                elif f in ('cartao_debito',):
                    r['cartao_debito'] = valor_venda
                soma = valor_venda
            elif not formas_pagto and len(formas) == 1 and formas[0] == 'outros':
                # "outros" sem valor: assumir PIX
                r['pix'] = valor_venda
                soma = valor_venda
        
        # Aplicar taxa de cartao quando credito > venda
        cred = float(r['cartao_credito'])
        if cred > 0 and abs(valor_venda - soma) > 0.01:
            outros = soma - cred
            taxa_result = aplicar_taxa_credito(cred, forma_orig, valor_venda, outros)
            if taxa_result:
                liquido, parcelas, bandeira, taxa_pct, arred = taxa_result
                # Ajustar o liquido para absorver arredondamento < R$ 1
                total_com_liquido = round(liquido + outros, 2)
                diff_apos_taxa = round(valor_venda - total_com_liquido, 2)
                if abs(diff_apos_taxa) < 1:
                    liquido = round(liquido + diff_apos_taxa, 2)
                    arred = 0
                r['cartao_credito'] = liquido
                r['_taxa_aplicada'] = f'{bandeira} {parcelas}x (taxa {taxa_pct:.1f}%)'
                if abs(arred) > 0:
                    r['_arredondamento'] = arred
                soma = round(liquido + outros, 2)
        
        # Arredondamento geral: se diff < R$ 2, ajustar no maior pagamento
        diff_atual = round(valor_venda - soma, 2)
        if 0.01 < abs(diff_atual) < 2:
            maiores = [
                ('cartao_credito', float(r['cartao_credito'])),
                ('pix', float(r['pix'])),
                ('dinheiro', float(r['dinheiro'])),
                ('cartao_debito', float(r['cartao_debito'])),
                ('troca_aparelho', float(r['troca_aparelho'])),
            ]
            maior_campo, maior_valor = max(maiores, key=lambda x: x[1])
            if maior_valor > 0:
                r[maior_campo] = round(maior_valor + diff_atual, 2)
                r['_arredondamento'] = diff_atual
                soma = round(soma + diff_atual, 2)
        
        r['soma_pagamentos'] = round(soma, 2)
        r['diferenca'] = round(valor_venda - soma, 2)
    
    estatisticas['diferenca_total'] += abs(r['diferenca'])
    if abs(r['diferenca']) > 0.01: estatisticas['diferenca_count'] += 1
    
    # Observacao para angel
    if vendedor.upper() == 'ANGEL':
        r['observacao'] = (r['observacao'] + '; ' if r['observacao'] else '') + 'Vendedor Angel - pendente ID real'
    if not imei:
        r['observacao'] = (r['observacao'] + '; ' if r['observacao'] else '') + 'Sem IMEI'
    if trocas and valor_troca == 0:
        r['observacao'] = (r['observacao'] + '; ' if r['observacao'] else '') + 'Troca R$ 0'
    
    # Determinar se precisa revisao
    motivos = []
    diff = float(r['diferenca'])
    if abs(diff) > 0.01:
        # Montar descricao do que foi extraido
        def fmt(v):
            f = float(v)
            return f'{f:.0f}' if f == int(f) else f'{f:.2f}'
        partes_extraidas = []
        if float(r['pix']) > 0: partes_extraidas.append(f'{fmt(r["pix"])} pix')
        if float(r['dinheiro']) > 0: partes_extraidas.append(f'{fmt(r["dinheiro"])} dinheiro')
        if float(r['cartao_credito']) > 0: partes_extraidas.append(f'{fmt(r["cartao_credito"])} credito')
        if float(r['cartao_debito']) > 0: partes_extraidas.append(f'{fmt(r["cartao_debito"])} debito')
        if float(r['troca_aparelho']) > 0: partes_extraidas.append(f'{fmt(r["troca_aparelho"])} troca')
        
        venda_val = float(r['valor_venda'])
        soma_val = float(r['soma_pagamentos'])
        
        if r['pagto_junto'] == 'SIM':
            gid = r['pagto_junto_grupo']
            total_grupo = float(r['pagto_junto_total'] or 0)
            restante = float(r['pagto_junto_restante'] or 0)
            extraido = ' + '.join(partes_extraidas) if partes_extraidas else 'nada'
            motivos.append(
                f'Pagto grupo {gid} (total R$ {total_grupo:.0f}): '
                f'extraiu {extraido} deste device, '
                f'restante R$ {restante:.0f} compartilhado no grupo'
            )
        elif diff < 0:
            # Extraiu MAIS que a venda
            extraido = ' + '.join(partes_extraidas) if partes_extraidas else 'nada'
            excesso = abs(diff)
            motivos.append(
                f'Extracao excede venda em R$ {excesso:.0f}: '
                f'extraiu {extraido} = {soma_val:.0f} > venda {venda_val:.0f}'
                f' → texto descreve pagamento de outros itens'
            )
        else:
            # Extraiu MENOS que a venda
            falta = diff
            if partes_extraidas:
                extraido = ' + '.join(partes_extraidas)
                motivos.append(
                    f'So extraiu: {extraido} de {venda_val:.0f} '
                    f'→ falta R$ {falta:.0f} sem valor explicito no texto'
                )
            else:
                formas = r['formas_pgto'].replace('+', ' + ')
                motivos.append(
                    f'Nada extraiu de {venda_val:.0f} '
                    f'→ formas "{formas}" sem valores no texto'
                )
    
    if r.get('observacao'):
        for obs_item in r['observacao'].split('; '):
            obs_item = obs_item.strip()
            # Observacao de junto com diff=0 nao precisa revisao
            if obs_item and obs_item not in motivos and 'Pagto junto' not in obs_item:
                motivos.append(obs_item)
    
    r['precisa_revisao'] = 'SIM' if motivos else 'NAO'
    r['motivo_revisao'] = '; '.join(motivos)
    
    # Gerar entendimento
    def fmt(v):
        f = float(v)
        return f'{f:.0f}' if f == int(f) else f'{f:.2f}'
    
    partes = []
    if float(r['pix']) > 0: partes.append(f'{fmt(r["pix"])} pix')
    if float(r['dinheiro']) > 0: partes.append(f'{fmt(r["dinheiro"])} dinheiro')
    if float(r['cartao_credito']) > 0:
        cred_part = f'{fmt(r["cartao_credito"])} credito'
        if r.get('_taxa_aplicada'):
            cred_part += f' ({r["_taxa_aplicada"]})'
        partes.append(cred_part)
    if float(r['cartao_debito']) > 0: partes.append(f'{fmt(r["cartao_debito"])} debito')
    if float(r['troca_aparelho']) > 0: partes.append(f'{fmt(r["troca_aparelho"])} troca')
    
    if r['pagto_junto'] == 'SIM' and i in grupo_por_idx:
        g = grupo_por_idx[i]
        linhas_grupo = sorted([d['csv_idx'] + 2 for d in g['devices']])
        linhas_str = ' e '.join(str(l) for l in linhas_grupo)
        total_grupo = float(g['total'])
        if partes:
            entendimento = (
                f'grupo {g["grupo_id"]} ({linhas_str}): valor da venda = {float(r["valor_venda"]):.0f}'
                f' | {" + ".join(partes)}'
                f' = {float(r["soma_pagamentos"]):.0f}'
                f' | grupo R$ {total_grupo:.0f}'
            )
        else:
            entrada = float(r['troca_aparelho'])
            restante = float(r['pagto_junto_restante'] or 0)
            entendimento = (
                f'grupo {g["grupo_id"]}: linhas {linhas_str}'
                f' | total R$ {total_grupo:.0f}'
                f' | entrada R$ {fmt(entrada)}'
                f' | compartilhado R$ {fmt(restante)}'
            )
    elif abs(float(r['diferenca'])) <= 0.01 and partes:
        entendimento = f"valor da venda = {float(r['valor_venda']):.0f} | {' + '.join(partes)}"
        if float(r['brinde']) > 0:
            entendimento += f" | brinde {fmt(r['brinde'])}"
        if r.get('_arredondamento'):
            entendimento += f" | arredondamento R$ {fmt(r['_arredondamento'])}"
    else:
        entendimento = ''
    
    r['entendimento'] = entendimento
    
    results.append(r)

# ====================================================================
# SALVAR CSV
# ====================================================================
with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
    w.writeheader()
    w.writerows(results)

print(f'\nCSV salvo: {OUTPUT}')
print(f'  Registros: {estatisticas["total"]}')
print(f'  Com troca: {estatisticas["trocas"]}')
print(f'  Pagto junto: {estatisticas["junto"]}')
print(f'  Sem IMEI: {estatisticas["sem_imei"]}')
print(f'  Angel (fallback): {estatisticas["sem_vendedor"]}')
print(f'  Com diferenca > R$ 0,01: {estatisticas["diferenca_count"]}/{estatisticas["total"]}')
print(f'  Diferenca total acumulada: R$ {estatisticas["diferenca_total"]:,.2f}')
print()

# Resumo de pagamentos
totals = defaultdict(float)
for r in results:
    for k in ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'troca_aparelho']:
        totals[k] += r[k]
print('--- SOMATORIO DOS PAGAMENTOS ---')
for k, v in sorted(totals.items(), key=lambda x: -x[1]):
    print(f'  {k:20s}: R$ {v:>10,.2f}')
total_pagtos = sum(totals.values())
total_vendas = sum(r['valor_venda'] for r in results)
print(f'  {"TOTAL PAGAMENTOS":20s}: R$ {total_pagtos:>10,.2f}')
print(f'  {"TOTAL VENDAS":20s}: R$ {total_vendas:>10,.2f}')
print(f'  {"DIFERENCA":20s}: R$ {total_vendas - total_pagtos:>10,.2f} ({((total_vendas-total_pagtos)/total_vendas*100):.1f}%)')

# ====================================================================
# ATUALIZAR CSV ORIGINAL COM COLUNA DE REVISAO
# ====================================================================
ORIG_OUTPUT = os.path.join(ROOT, 'venda_aparelhos_com_revisao.csv')
with open(INPUT, 'r', encoding='utf-8') as f:
    orig_rows = list(csv.DictReader(f))

# Build index by orig_linha
rev_by_linha = {}
for r in results:
    rev_by_linha[int(r['orig_linha'])] = r

orig_fieldnames = list(orig_rows[0].keys()) + ['PRECISA_REVISAO', 'MOTIVO_REVISAO', 'ENTENDIMENTO']

with open(ORIG_OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=orig_fieldnames, extrasaction='ignore')
    w.writeheader()
    for i, row in enumerate(orig_rows):
        linha = i + 2
        if linha in rev_by_linha:
            nr = rev_by_linha[linha]
            row['PRECISA_REVISAO'] = nr['precisa_revisao']
            row['MOTIVO_REVISAO'] = nr['motivo_revisao']
            row['ENTENDIMENTO'] = nr['entendimento']
        else:
            row['PRECISA_REVISAO'] = 'SIM'
            row['MOTIVO_REVISAO'] = 'Linha ignorada (GARANTIA/TROCA)'
            row['ENTENDIMENTO'] = 'Valor GARANTIA - ignorado'
        w.writerow(row)

print(f'Original c/ revisao: {ORIG_OUTPUT}')

# Contagem
revisao_count = sum(1 for r in results if r['precisa_revisao'] == 'SIM')
print(f'  Precisa revisao: {revisao_count}/{len(results)}')
