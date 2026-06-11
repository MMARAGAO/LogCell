#!/usr/bin/env python3
"""
Gera script SQL para importar vendas_final.csv no banco.

Modos:
  padrao:  processa linhas com precisa_revisao = NAO (pagamentos individuais)
  --apenas-sim: processa linhas com precisa_revisao = SIM (1 Pix = valor_venda)
"""
import csv, os, uuid, re, sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, 'scripts', 'vendas_final.csv')

# UUID do Angel (encontrado no banco)
ANGEL_UUID = '4549c96e-5c53-4cd6-b738-9d798f82a740'

LOJA_MAP = {
    '1': 1, 'CELL': 1, 'BALCAO': 1,
    '4': 4, 'ONLINE': 4,
    '19': 19, 'CASES': 19,
    '20': 20, 'BLOCO B': 20,
}

def extract_brand(modelo):
    m = modelo.upper().strip()
    if m.startswith('IPHONE') or m.startswith('IPAD') or m.startswith('MAC') or m.startswith('APPLE'):
        return 'Apple'
    if m.startswith('SAMSUNG'):
        return 'Samsung'
    if m.startswith('REDMI') or m.startswith('MI '):
        return 'Xiaomi'
    if m.startswith('REALME'):
        return 'Realme'
    if m.startswith('NOTE'):
        return 'Redmi'
    if m.startswith('BOMBOX'):
        return 'Bombox'
    return 'Outros'

def condicao_from_estado(estado):
    estado = estado.lower().strip()
    if estado == 'novo':
        return 'perfeito'
    if estado == 'seminovo':
        return 'bom'
    if estado == 'usado':
        return 'regular'
    return 'bom'

def to_date(datestr):
    if not datestr or not datestr.strip():
        return None
    datestr = datestr.strip()
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr)
    if m:
        return f'{m.group(3)}-{m.group(2)}-{m.group(1)}'
    return None

def parse_decimal(val):
    if not val or not val.strip():
        return 0.0
    val = val.strip()
    val = val.replace('R$', '').replace('$', '').replace(' ', '')
    if ',' in val and '.' in val:
        if val.rindex(',') > val.rindex('.'):
            val = val.replace('.', '').replace(',', '.')
        else:
            val = val.replace(',', '')
    elif ',' in val:
        val = val.replace(',', '.')
    try:
        return float(val)
    except:
        return 0.0

def gerar_sql(start_numero_venda, apenas_sim=False):
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if apenas_sim:
        filtered = [r for r in rows if r.get('precisa_revisao', '').strip() == 'SIM']
        tipo = 'SIM'
        sql_path = os.path.join(ROOT, 'scripts', 'importar_vendas_sim.sql')
    else:
        filtered = [r for r in rows if r.get('precisa_revisao', '').strip() == 'NAO']
        tipo = 'NAO'
        sql_path = os.path.join(ROOT, 'scripts', 'importar_vendas.sql')

    total_nao = len([r for r in rows if r.get('precisa_revisao', '').strip() == 'NAO'])
    total_sim = len([r for r in rows if r.get('precisa_revisao', '').strip() == 'SIM'])

    print(f'Total no CSV: {len(rows)} (NAO={total_nao}, SIM={total_sim})')
    print(f'Processando {len(filtered)} linhas {tipo}')

    sql_lines = []
    sql_lines.append('-- ============================================')
    sql_lines.append(f'-- Script de importacao gerado em {datetime.now()}')
    sql_lines.append(f'-- Fonte: vendas_final.csv ({len(filtered)} linhas {tipo})')
    if apenas_sim:
        sql_lines.append('-- Todos os pagamentos como Pix (valor_venda integral)')
    sql_lines.append('-- ============================================')
    sql_lines.append('')
    sql_lines.append('BEGIN;')
    sql_lines.append('')

    sql_lines.append('-- ============================================')
    sql_lines.append('-- 1. CRIAR CLIENTE PADRAO (se nao existir)')
    sql_lines.append('-- ============================================')
    sql_lines.append("""
DO $$
DECLARE
    v_cliente_id UUID;
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
""".strip())
    sql_lines.append('')

    numero_venda = start_numero_venda
    used_imeis = set()
    stats = {
        'aparelhos': 0,
        'vendas': 0,
        'pagamentos': 0,
        'brindes': 0,
        'trocas': 0,
        'sem_imei': 0,
        'imei_duplicado': 0,
        'erros': 0,
    }

    for row in filtered:
        try:
            data = row.get('data', '').strip()
            data_iso = to_date(data)
            if not data_iso:
                print(f'  AVISO: data invalida "{data}", ignorando linha {row.get("orig_linha")}')
                stats['erros'] += 1
                continue

            modelo = row.get('modelo', '').strip()
            imei = row.get('imei', '').strip().replace(' ', '')
            valor_venda = parse_decimal(row.get('valor_venda', ''))
            custo = parse_decimal(row.get('custo', ''))
            brinde_val = parse_decimal(row.get('brinde', ''))
            loja_id_raw = row.get('loja_id', '1').strip()
            loja_id = LOJA_MAP.get(loja_id_raw.upper(), LOJA_MAP.get(loja_id_raw, 1))
            estado = row.get('estado', 'seminovo').strip().lower()
            vendedor_id = row.get('vendedor_id', '').strip()
            observacao = row.get('observacao', '').strip()

            # Pagamentos individuais (usados apenas no modo NAO)
            pix = parse_decimal(row.get('pix', ''))
            dinheiro = parse_decimal(row.get('dinheiro', ''))
            cartao_credito = parse_decimal(row.get('cartao_credito', ''))
            cartao_debito = parse_decimal(row.get('cartao_debito', ''))
            troca_valor = parse_decimal(row.get('troca_aparelho', ''))
            modelo_troca = row.get('modelo_troca', '').strip()
            valor_troca = parse_decimal(row.get('valor_troca', ''))

            if apenas_sim:
                # Modo SIM: 1 Pix = valor_venda integral (quitar)
                soma_pagamentos = valor_venda
                usar_pix = True
                usar_pagamentos_individuais = False
            else:
                soma_pagamentos = pix + dinheiro + cartao_credito + cartao_debito + troca_valor
                usar_pix = False
                usar_pagamentos_individuais = True

            if valor_venda <= 0 or vendedor_id == '':
                stats['erros'] += 1
                continue

            numero_venda += 1
            aparelho_id = str(uuid.uuid4())
            venda_id = str(uuid.uuid4())
            marca = extract_brand(modelo)
            cond = condicao_from_estado(estado)

            if not imei:
                stats['sem_imei'] += 1
                imei_sql = 'NULL'
            elif imei in used_imeis:
                stats['imei_duplicado'] += 1
                imei_sql = 'NULL'
            else:
                used_imeis.add(imei)
                imei_sql = f"'{imei}'"

            criado_em_timestamp = f"'{data_iso}T14:00:00'"
            vendedor_sql = f"'{vendedor_id}'" if vendedor_id else 'NULL'
            observacao_sql = f"'{observacao.replace(chr(39), chr(39) + chr(39))}'" if observacao else 'NULL'

            sql_lines.append(f'-- === VENDA {numero_venda}: {modelo} ({data}) ===')

            # INSERT aparelho
            sql_lines.append(f"INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)")
            sql_lines.append(f"VALUES ('{aparelho_id}', '{marca}', '{modelo.replace(chr(39), chr(39) + chr(39))}', {imei_sql}, {valor_venda}, {custo}, {loja_id}, '{estado}', '{cond}', 'vendido', '{data_iso}', '{data_iso}', {vendedor_sql}, '{data_iso}', '{data_iso}', {observacao_sql});")
            stats['aparelhos'] += 1

            # INSERT venda
            saldo_devedor = round(valor_venda - soma_pagamentos, 2)
            sql_lines.append(f"INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)")
            sql_lines.append(f"VALUES ('{venda_id}', {numero_venda}, current_setting('importacao.cliente_id')::uuid, {loja_id}, {vendedor_sql}, 'concluida', 'normal', {valor_venda}, {soma_pagamentos}, {saldo_devedor}, '{data_iso}', '{data_iso}', {vendedor_sql});")
            stats['vendas'] += 1

            # Vincular aparelho a venda
            sql_lines.append(f"UPDATE aparelhos SET venda_id = '{venda_id}' WHERE id = '{aparelho_id}';")

            # Pagamentos - modo SIM: 1 Pix = valor_venda
            if usar_pix:
                pagto_id = str(uuid.uuid4())
                sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)")
                sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', 'pix', {round(valor_venda, 2)}, '{data_iso}', {vendedor_sql}, 1, {criado_em_timestamp});")
                stats['pagamentos'] += 1
            else:
                # Modo NAO: pagamentos individuais
                pagamentos = [
                    ('pix', pix),
                    ('dinheiro', dinheiro),
                    ('cartao_credito', cartao_credito),
                    ('cartao_debito', cartao_debito),
                ]
                for tipo, valor in pagamentos:
                    if valor and valor > 0:
                        pagto_id = str(uuid.uuid4())
                        sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)")
                        sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', '{tipo}', {round(valor, 2)}, '{data_iso}', {vendedor_sql}, 1, {criado_em_timestamp});")
                        stats['pagamentos'] += 1

                # Pagamento de troca (se houver)
                if troca_valor and troca_valor > 0:
                    pagto_id = str(uuid.uuid4())
                    obs_troca = f"Troca: {modelo_troca}" if modelo_troca else "Troca de aparelho"
                    sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)")
                    sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', 'troca_aparelho', {round(troca_valor, 2)}, '{data_iso}', {vendedor_sql}, '{obs_troca}', 1, {criado_em_timestamp});")
                    stats['pagamentos'] += 1
                    stats['trocas'] += 1

            # Brinde (se houver)
            if brinde_val and brinde_val > 0:
                brinde_id = str(uuid.uuid4())
                sql_lines.append(f"INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)")
                sql_lines.append(f"VALUES ('{brinde_id}', {loja_id}, '{venda_id}', 'Brinde', {round(brinde_val, 2)}, '{data_iso}', {vendedor_sql}, '{data_iso}');")
                stats['brindes'] += 1

            sql_lines.append('')

        except Exception as e:
            print(f'  ERRO na linha {row.get("orig_linha", "?")}: {e}')
            stats['erros'] += 1
            continue

    sql_lines.append('COMMIT;')
    sql_lines.append('')
    sql_lines.append('-- ============================================')
    sql_lines.append('-- RESUMO')
    sql_lines.append(f'-- Aparelhos: {stats["aparelhos"]}')
    sql_lines.append(f'-- Vendas:    {stats["vendas"]}')
    sql_lines.append(f'-- Pagamentos: {stats["pagamentos"]}')
    sql_lines.append(f'-- Brindes:   {stats["brindes"]}')
    sql_lines.append(f'-- Trocas:    {stats["trocas"]}')
    sql_lines.append(f'-- Sem IMEI:  {stats["sem_imei"]}')
    sql_lines.append(f'-- IMEI dup:  {stats["imei_duplicado"]}')
    sql_lines.append(f'-- Erros:     {stats["erros"]}')
    sql_lines.append('-- ============================================')

    return '\n'.join(sql_lines), stats, sql_path


if __name__ == '__main__':
    apenas_sim = '--apenas-sim' in sys.argv

    if apenas_sim:
        # 337 NAO ja foram importados, ultimo numero_venda = 11401
        start_numero_venda = 11401
    else:
        start_numero_venda = 11064

    sql, stats, sql_path = gerar_sql(start_numero_venda, apenas_sim)

    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write(sql)

    print(f'\nSQL gerado: {sql_path}')
    print(f'Tamanho: {len(sql.splitlines())} linhas')
    print(f'  Aparelhos:  {stats["aparelhos"]}')
    print(f'  Vendas:     {stats["vendas"]}')
    print(f'  Pagamentos: {stats["pagamentos"]}')
    print(f'  Brindes:    {stats["brindes"]}')
    print(f'  Trocas:     {stats["trocas"]}')
    print(f'  Sem IMEI:   {stats["sem_imei"]}')
    print(f'  IMEI dup:   {stats["imei_duplicado"]}')
    print(f'  Erros:      {stats["erros"]}')
