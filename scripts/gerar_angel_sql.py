#!/usr/bin/env python3
import csv, uuid, re

ANGEL_UUID = '4549c96e-5c53-4cd6-b738-9d798f82a740'

def esc(s): return str(s).replace("'", "''")
def parse_decimal(val):
    if not val: return 0.0
    try: return float(str(val).strip())
    except: return 0.0
def to_date(d):
    d = d.strip()
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', d)
    if m: return f'{m.group(3)}-{m.group(2)}-{m.group(1)}'
    m2 = re.match(r'(\d{4})-(\d{2})-(\d{2})', d)
    if m2: return d
    return None
def extract_brand(modelo):
    m = modelo.upper()
    if any(m.startswith(p) for p in ('IPHONE','IPAD','MAC','APPLE','FONTE')): return 'Apple'
    if m.startswith('SAMSUNG'): return 'Samsung'
    if m.startswith('POCO') or m.startswith('XIAOMI') or m.startswith('REDMI'): return 'Xiaomi'
    return 'Outros'
def condicao(estado):
    e = estado.lower()
    if e == 'novo': return 'perfeito'
    if e == 'usado': return 'regular'
    return 'bom'

with open('scripts/vendas_aparelhos2_final.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

angel_rows = [r for r in rows if r.get('vendedor','').strip().upper() == 'ANGEL']
print(f'Vendas Angel: {len(angel_rows)}')

numero_venda = 11688
lines = []
lines.append('BEGIN;')
# Usar $body$ para evitar conflito com $$ do bash
lines.append('DO $body$')
lines.append('DECLARE v_cliente_id UUID;')
lines.append('BEGIN')
lines.append("    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;")
lines.append('    IF v_cliente_id IS NULL THEN')
lines.append("        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)")
lines.append("        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW())")
lines.append('        RETURNING id INTO v_cliente_id;')
lines.append('    END IF;')
lines.append("    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);")
lines.append('END;')
lines.append('$body$;')
lines.append('')

for row in angel_rows:
    linha = row.get('orig_linha','?')
    modelo = row.get('modelo','').strip()
    imei = row.get('imei','').strip()
    data_iso = to_date(row.get('data_iso') or row.get('data',''))
    valor_venda = parse_decimal(row.get('valor_venda'))
    brinde = parse_decimal(row.get('brinde'))
    custo = parse_decimal(row.get('custo'))
    loja_id = row.get('loja_id','').strip()
    estado = row.get('estado','seminovo').strip()
    observacao = row.get('observacao','').strip()
    pix = parse_decimal(row.get('pix'))
    dinheiro = parse_decimal(row.get('dinheiro'))
    cartao_credito = parse_decimal(row.get('cartao_credito'))
    cartao_debito = parse_decimal(row.get('cartao_debito'))
    troca = parse_decimal(row.get('troca_aparelho'))
    modelo_troca = row.get('modelo_troca','').strip()
    precisa_revisao = row.get('precisa_revisao','SIM').strip()

    imei_sql = f"'{esc(imei)}'" if imei else 'NULL'
    soma = pix + dinheiro + cartao_credito + cartao_debito + troca
    diferenca = round(valor_venda - soma, 2)

    if precisa_revisao == 'SIM' and abs(diferenca) > 0.01:
        pix = valor_venda
        dinheiro = cartao_credito = cartao_debito = troca = 0
        soma = valor_venda
        observacao = (observacao + '; ' if observacao else '') + 'pgto forcado pix'

    aparelho_id = str(uuid.uuid4())
    venda_id = str(uuid.uuid4())
    numero_venda += 1
    marca = extract_brand(modelo)
    cond = condicao(estado)
    ts = f"'{data_iso}T14:00:00+00'"
    vd = f"'{ANGEL_UUID}'"
    obs_sql = f"'{esc(observacao)}'" if observacao else 'NULL'

    lines.append(f'-- Linha {linha}: {modelo}')
    lines.append(f"INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('{aparelho_id}', '{esc(marca)}', '{esc(modelo)}', {imei_sql}, {valor_venda}, {custo}, {loja_id}, '{estado}', '{cond}', 'vendido', {ts}, {ts}, {vd}, {ts}, {ts}, {obs_sql});")
    lines.append(f"INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ('{venda_id}', {numero_venda}, current_setting('importacao.cliente_id')::uuid, {loja_id}, {vd}, 'concluida', 'normal', {valor_venda}, {round(soma,2)}, 0, {ts}, {ts}, {vd});")
    lines.append(f"UPDATE aparelhos SET venda_id = '{venda_id}' WHERE id = '{aparelho_id}';")
    for tipo, valor in [('pix',pix),('dinheiro',dinheiro),('cartao_credito',cartao_credito),('cartao_debito',cartao_debito)]:
        if valor > 0:
            pid = str(uuid.uuid4())
            lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) VALUES ('{pid}', '{venda_id}', '{tipo}', {round(valor,2)}, '{data_iso}', {vd}, 1, {ts});")
    if troca > 0:
        pid = str(uuid.uuid4())
        obs_t = esc(f'Troca: {modelo_troca}') if modelo_troca else 'Troca de aparelho'
        lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em) VALUES ('{pid}', '{venda_id}', 'troca_aparelho', {round(troca,2)}, '{data_iso}', {vd}, '{obs_t}', 1, {ts});")
    if brinde > 0:
        bid = str(uuid.uuid4())
        lines.append(f"INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) VALUES ('{bid}', {loja_id}, '{venda_id}', 'Brinde', {round(brinde,2)}, '{data_iso}', {vd}, {ts});")
    lines.append('')

lines.append('COMMIT;')

with open('scripts/importar_angel.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'SQL gerado: scripts/importar_angel.sql')
print(f'Ultimo numero_venda: {numero_venda}')
