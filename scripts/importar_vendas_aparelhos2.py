#!/usr/bin/env python3
"""
Gera SQL de importacao para vendas_aparelhos2.csv (ja normalizado).

Regras:
  - Pula vendas do Angel
  - Pula IMEIs que ja existem no banco
  - Sem IMEI: entra com imei = NULL
  - precisa_revisao=SIM com diff != 0: lanca valor_venda inteiro como pix
  - numero_venda inicia em 11496

Nao executa nada no banco. Gera SQL para revisao.

Uso:
  python3 scripts/importar_vendas_aparelhos2.py
"""
import csv, os, uuid, re, sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, 'scripts', 'vendas_aparelhos2_final.csv')
SQL_PATH = os.path.join(ROOT, 'scripts', 'importar_vendas_aparelhos2.sql')

START_NUMERO_VENDA = 11496

# IMEIs que ja existem no banco (consultado em 26/06/2026)
IMEIS_EXISTENTES = {
    '351205581240124', '351205745375915', '351465644827966', '351698471567244',
    '352574675400509', '353687476380990', '353763617375619', '353850628182660',
    '355101477277286', '355101479323146', '357247257710968', '357247257803680',
    '357590879692399', '357679992297861', '357920795494028', '357977669432302',
    '358640380782129', '359178371574212', '359285691157691', '359652120714477',
    '359652120809905', '359973613643894', '65520/W5Z501219', '860534086640486',
    'C4H61040G83Q8YQA3', 'C4H6123284GQ8YQAZ', 'CH07LGKN17', 'V865532083172607',
}

def extract_brand(modelo):
    m = modelo.upper().strip()
    if any(m.startswith(p) for p in ('IPHONE', 'IPAD', 'MAC', 'APPLE', 'FONTE APPLE', 'FONTE ORIGINAL APPLE')):
        return 'Apple'
    if m.startswith('SAMSUNG'): return 'Samsung'
    if m.startswith('REDMI') or m.startswith('MI '): return 'Xiaomi'
    if m.startswith('POCO') or m.startswith('XIAOMI'): return 'Xiaomi'
    if m.startswith('REALME'): return 'Realme'
    if m.startswith('NOTE'): return 'Redmi'
    if m.startswith('MACBOOK'): return 'Apple'
    return 'Outros'

def condicao_from_estado(estado):
    e = estado.lower().strip()
    if e == 'novo': return 'perfeito'
    if e == 'usado': return 'regular'
    return 'bom'

def to_date(datestr):
    if not datestr: return None
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr.strip())
    if m: return f'{m.group(3)}-{m.group(2)}-{m.group(1)}'
    # ja em formato ISO
    m2 = re.match(r'(\d{4})-(\d{2})-(\d{2})', datestr.strip())
    if m2: return datestr.strip()
    return None

def parse_decimal(val):
    if not val: return 0.0
    val = str(val).strip().replace('R$', '').replace(' ', '')
    if not val: return 0.0
    try: return float(val)
    except: return 0.0

def esc(s):
    """Escapa aspas simples para SQL."""
    return str(s).replace("'", "''")

# ── Ler CSV normalizado ───────────────────────────────────────────────────────
with open(CSV_PATH, encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

print(f'Lendo {len(rows)} linhas de {os.path.basename(CSV_PATH)}')

# ── Gerar SQL ─────────────────────────────────────────────────────────────────
sql = []
sql.append('-- ============================================================')
sql.append(f'-- Importacao vendas_aparelhos2.csv')
sql.append(f'-- Gerado em: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
sql.append(f'-- numero_venda inicia em: {START_NUMERO_VENDA}')
sql.append('-- ============================================================')
sql.append('')
sql.append('BEGIN;')
sql.append('')
sql.append("""DO $$
DECLARE v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    IF v_cliente_id IS NULL THEN
        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW())
        RETURNING id INTO v_cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END;
$$;
""")

numero_venda = START_NUMERO_VENDA
stats = {
    'importados': 0, 'pulados_angel': 0, 'pulados_imei_dup': 0,
    'sem_imei': 0, 'pix_forcado': 0, 'brindes': 0, 'trocas': 0,
}

for row in rows:
    linha = row.get('orig_linha', '?')
    vendedor = row.get('vendedor', '').strip()
    vendedor_id = row.get('vendedor_id', '').strip()
    modelo = row.get('modelo', '').strip()
    imei = row.get('imei', '').strip()
    data = row.get('data', '').strip()
    data_iso = to_date(row.get('data_iso') or data)
    valor_venda = parse_decimal(row.get('valor_venda'))
    brinde = parse_decimal(row.get('brinde'))
    custo = parse_decimal(row.get('custo'))
    loja_id = row.get('loja_id', '').strip()
    estado = row.get('estado', 'seminovo').strip()
    precisa_revisao = row.get('precisa_revisao', 'SIM').strip()
    observacao = row.get('observacao', '').strip()

    pix = parse_decimal(row.get('pix'))
    dinheiro = parse_decimal(row.get('dinheiro'))
    cartao_credito = parse_decimal(row.get('cartao_credito'))
    cartao_debito = parse_decimal(row.get('cartao_debito'))
    troca = parse_decimal(row.get('troca_aparelho'))
    modelo_troca = row.get('modelo_troca', '').strip()

    # ── Regra 1: pular Angel ─────────────────────────────────────────────
    if vendedor.strip().upper() == 'ANGEL':
        sql.append(f'-- PULADO (Angel): linha {linha} - {modelo}')
        stats['pulados_angel'] += 1
        continue

    # ── Regra 2: pular IMEI duplicado no banco ────────────────────────────
    if imei and imei in IMEIS_EXISTENTES:
        sql.append(f'-- PULADO (IMEI ja existe): linha {linha} - {modelo} [{imei}]')
        stats['pulados_imei_dup'] += 1
        continue

    # ── Validacoes basicas ────────────────────────────────────────────────
    if not data_iso:
        sql.append(f'-- PULADO (data invalida): linha {linha} - {modelo}')
        continue
    if valor_venda <= 0:
        sql.append(f'-- PULADO (valor zero): linha {linha} - {modelo}')
        continue
    if not vendedor_id:
        sql.append(f'-- PULADO (sem vendedor_id): linha {linha} - {modelo} [{vendedor}]')
        continue
    if not loja_id:
        sql.append(f'-- PULADO (sem loja): linha {linha} - {modelo}')
        continue

    # ── Regra 3: sem IMEI → NULL ──────────────────────────────────────────
    if not imei:
        imei_sql = 'NULL'
        stats['sem_imei'] += 1
    else:
        imei_sql = f"'{esc(imei)}'"

    # ── Regra 4: diff de pagamento → forcar pix = valor_venda ────────────
    soma = pix + dinheiro + cartao_credito + cartao_debito + troca
    diferenca = round(valor_venda - soma, 2)

    if precisa_revisao == 'SIM' and abs(diferenca) > 0.01 and diferenca > 0:
        # Faltou valor: forcamos pix = valor_venda inteiro, zeramos o resto
        pix = valor_venda
        dinheiro = 0
        cartao_credito = 0
        cartao_debito = 0
        troca = 0
        modelo_troca = ''
        soma = valor_venda
        stats['pix_forcado'] += 1
        observacao = (observacao + '; ' if observacao else '') + 'pgto forcado pix (diff nao extraida)'

    elif precisa_revisao == 'SIM' and abs(diferenca) > 0.01 and diferenca < 0:
        # Extraiu mais que a venda (pagamento conjunto de outros itens) → pix = valor_venda
        pix = valor_venda
        dinheiro = 0
        cartao_credito = 0
        cartao_debito = 0
        troca = 0
        modelo_troca = ''
        soma = valor_venda
        stats['pix_forcado'] += 1
        observacao = (observacao + '; ' if observacao else '') + 'pgto forcado pix (extracao excedeu venda)'

    saldo_devedor = 0.0  # todas quitadas
    marca = extract_brand(modelo)
    cond = condicao_from_estado(estado)
    aparelho_id = str(uuid.uuid4())
    venda_id = str(uuid.uuid4())
    numero_venda += 1

    ts = f"'{data_iso}T14:00:00+00'"
    vd_sql = f"'{vendedor_id}'"
    obs_sql = f"'{esc(observacao)}'" if observacao else 'NULL'

    sql.append(f'-- === Linha {linha}: {modelo} ({data}) ===')

    # INSERT aparelho
    sql.append(
        f"INSERT INTO aparelhos "
        f"(id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, "
        f"status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) "
        f"VALUES ("
        f"'{aparelho_id}', '{esc(marca)}', '{esc(modelo)}', {imei_sql}, "
        f"{valor_venda}, {custo}, {loja_id}, '{estado}', '{cond}', "
        f"'vendido', {ts}, {ts}, {vd_sql}, {ts}, {ts}, {obs_sql}"
        f");"
    )

    # INSERT venda
    sql.append(
        f"INSERT INTO vendas "
        f"(id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, "
        f"valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) "
        f"VALUES ("
        f"'{venda_id}', {numero_venda}, current_setting('importacao.cliente_id')::uuid, "
        f"{loja_id}, {vd_sql}, 'concluida', 'normal', "
        f"{valor_venda}, {round(soma, 2)}, {saldo_devedor}, {ts}, {ts}, {vd_sql}"
        f");"
    )

    # Vincular aparelho
    sql.append(f"UPDATE aparelhos SET venda_id = '{venda_id}' WHERE id = '{aparelho_id}';")

    # Pagamentos
    pagamentos = [
        ('pix', round(pix, 2)),
        ('dinheiro', round(dinheiro, 2)),
        ('cartao_credito', round(cartao_credito, 2)),
        ('cartao_debito', round(cartao_debito, 2)),
    ]
    for tipo, valor in pagamentos:
        if valor > 0:
            pid = str(uuid.uuid4())
            sql.append(
                f"INSERT INTO pagamentos_venda "
                f"(id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) "
                f"VALUES ('{pid}', '{venda_id}', '{tipo}', {valor}, '{data_iso}', {vd_sql}, 1, {ts});"
            )

    if troca > 0:
        pid = str(uuid.uuid4())
        obs_troca = esc(f'Troca: {modelo_troca}') if modelo_troca else 'Troca de aparelho'
        sql.append(
            f"INSERT INTO pagamentos_venda "
            f"(id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em) "
            f"VALUES ('{pid}', '{venda_id}', 'troca_aparelho', {round(troca, 2)}, '{data_iso}', {vd_sql}, '{obs_troca}', 1, {ts});"
        )
        stats['trocas'] += 1

    # Brinde
    if brinde > 0:
        bid = str(uuid.uuid4())
        sql.append(
            f"INSERT INTO brindes_aparelhos "
            f"(id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) "
            f"VALUES ('{bid}', {loja_id}, '{venda_id}', 'Brinde', {round(brinde, 2)}, '{data_iso}', {vd_sql}, {ts});"
        )
        stats['brindes'] += 1

    sql.append('')
    stats['importados'] += 1

sql.append('COMMIT;')
sql.append('')
sql.append('-- ============================================================')
sql.append(f'-- RESUMO')
sql.append(f'-- Importados:          {stats["importados"]}')
sql.append(f'-- Pulados Angel:       {stats["pulados_angel"]}')
sql.append(f'-- Pulados IMEI dup:    {stats["pulados_imei_dup"]}')
sql.append(f'-- Sem IMEI (NULL):     {stats["sem_imei"]}')
sql.append(f'-- Pix forcado:         {stats["pix_forcado"]}')
sql.append(f'-- Brindes:             {stats["brindes"]}')
sql.append(f'-- Trocas:              {stats["trocas"]}')
sql.append(f'-- Ultimo numero_venda: {numero_venda}')
sql.append('-- ============================================================')

with open(SQL_PATH, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))

print(f'\nSQL gerado: {SQL_PATH}')
print(f'  Importados:          {stats["importados"]}')
print(f'  Pulados Angel:       {stats["pulados_angel"]}')
print(f'  Pulados IMEI dup:    {stats["pulados_imei_dup"]}')
print(f'  Sem IMEI (NULL):     {stats["sem_imei"]}')
print(f'  Pix forcado:         {stats["pix_forcado"]}')
print(f'  Brindes:             {stats["brindes"]}')
print(f'  Trocas:              {stats["trocas"]}')
print(f'  Ultimo numero_venda: {numero_venda}')
print(f'\n⛔ SQL gerado mas NAO executado. Aprove para subir.')
