#!/usr/bin/env python3
"""
Script completo de importacao de vendas_final.csv.

Gera um unico SQL que:
  1. Remove dados existentes do Cliente Balcao (se houver)
  2. Cria o cliente padrao (se nao existir)
  3. Importa TODAS as 397 linhas (NAO com pagamentos individuais,
     SIM com 1 Pix = valor_venda integral)

Uso:
  python3 scripts/importar_tudo.py                    # gera SQL
  python3 scripts/importar_tudo.py --executar         # gera + executa via SSH
"""
import csv, os, uuid, re, sys, subprocess
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, 'scripts', 'vendas_final.csv')
SQL_PATH = os.path.join(ROOT, 'scripts', 'importacao_completa.sql')

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
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr.strip())
    if m:
        return f'{m.group(3)}-{m.group(2)}-{m.group(1)}'
    return None

def parse_decimal(val):
    if not val or not val.strip():
        return 0.0
    val = val.strip().replace('R$', '').replace('$', '').replace(' ', '')
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

def gerar_sql():
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    nao_rows = [r for r in rows if r.get('precisa_revisao', '').strip() == 'NAO']
    sim_rows = [r for r in rows if r.get('precisa_revisao', '').strip() == 'SIM']

    print(f'Total: {len(rows)} (NAO={len(nao_rows)}, SIM={len(sim_rows)})')

    sql_lines = []
    sql_lines.append('-- ============================================')
    sql_lines.append(f'-- Script completo de importacao - {datetime.now()}')
    sql_lines.append(f'-- Fonte: vendas_final.csv ({len(rows)} linhas)')
    sql_lines.append('-- ============================================')
    sql_lines.append('')
    sql_lines.append('BEGIN;')
    sql_lines.append('')

    # ====================================================
    # 1. LIMPEZA
    # ====================================================
    sql_lines.append('-- ============================================')
    sql_lines.append('-- 1. LIMPAR DADOS EXISTENTES (Cliente Balcao)')
    sql_lines.append('-- ============================================')
    sql_lines.append("""
DO $$
DECLARE
    v_cliente_id UUID;
    v_count INT;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;

    IF v_cliente_id IS NOT NULL THEN
        -- Aparelhos vinculados a vendas do Cliente Balcao
        DELETE FROM aparelhos WHERE venda_id IN (SELECT id FROM vendas WHERE cliente_id = v_cliente_id);
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Aparelhos removidos: %', v_count;

        -- Vendas (CASCADE: pagamentos_venda, brindes_aparelhos, creditos_cliente,
        --   descontos_venda, devolucoes_venda, historico_vendas, itens_venda,
        --   sangrias_caixa, trocas_produtos, itens_devolucao)
        DELETE FROM vendas WHERE cliente_id = v_cliente_id;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Vendas removidas: %', v_count;

        -- Remove o cliente
        DELETE FROM clientes WHERE id = v_cliente_id;
        RAISE NOTICE 'Cliente Balcao removido';
    ELSE
        RAISE NOTICE 'Nenhum cliente Balcao encontrado para limpeza';
    END IF;
END;
$$;
""".strip())
    sql_lines.append('')

    # ====================================================
    # 2. CRIAR CLIENTE PADRAO
    # ====================================================
    sql_lines.append('-- ============================================')
    sql_lines.append('-- 2. CRIAR CLIENTE PADRAO')
    sql_lines.append('-- ============================================')
    sql_lines.append("""
INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
SELECT gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nome = 'Cliente Balcao');
""".strip())
    sql_lines.append('')
    sql_lines.append("""
DO $$
DECLARE
    v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END;
$$;
""".strip())
    sql_lines.append('')

    # ====================================================
    # 3. IMPORTAR
    # ====================================================
    sql_lines.append('-- ============================================')
    sql_lines.append('-- 3. IMPORTAR VENDAS')
    sql_lines.append('-- ============================================')
    sql_lines.append('')

    used_imeis = set()
    # Buscar max numero_venda atual para continuar a sequencia
    sql_lines.append("""
DO $$
DECLARE
    v_max INT;
BEGIN
    SELECT COALESCE(max(numero_venda), 0) INTO v_max FROM vendas;
    PERFORM set_config('importacao.proximo_numero', (v_max + 1)::text, true);
END;
$$;
""".strip())
    sql_lines.append('')

    stats = {
        'aparelhos': 0, 'vendas': 0, 'pagamentos': 0,
        'brindes': 0, 'trocas': 0, 'sem_imei': 0, 'imei_duplicado': 0, 'erros': 0,
    }

    for idx, row in enumerate(rows):
        precisa_revisao = row.get('precisa_revisao', '').strip()
        is_sim = (precisa_revisao == 'SIM')

        try:
            data = row.get('data', '').strip()
            data_iso = to_date(data)
            if not data_iso:
                print(f'  AVISO: data invalida "{data}", linha {row.get("orig_linha")}')
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

            pix = parse_decimal(row.get('pix', ''))
            dinheiro = parse_decimal(row.get('dinheiro', ''))
            cartao_credito = parse_decimal(row.get('cartao_credito', ''))
            cartao_debito = parse_decimal(row.get('cartao_debito', ''))
            troca_valor = parse_decimal(row.get('troca_aparelho', ''))
            modelo_troca = row.get('modelo_troca', '').strip()
            valor_troca = parse_decimal(row.get('valor_troca', ''))

            if is_sim:
                soma_pagamentos = valor_venda
                usar_pix = True
            else:
                soma_pagamentos = pix + dinheiro + cartao_credito + cartao_debito + troca_valor
                usar_pix = False

            if valor_venda <= 0 or vendedor_id == '':
                stats['erros'] += 1
                continue

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

            sql_lines.append(f'-- LINHA {row.get("orig_linha", idx+1)} [{precisa_revisao}]: {modelo} ({data})')

            # Aparelho
            sql_lines.append(f"INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)")
            sql_lines.append(f"VALUES ('{aparelho_id}', '{marca}', '{modelo.replace(chr(39), chr(39) + chr(39))}', {imei_sql}, {valor_venda}, {custo}, {loja_id}, '{estado}', '{cond}', 'vendido', '{data_iso}', '{data_iso}', {vendedor_sql}, '{data_iso}', '{data_iso}', {observacao_sql});")
            stats['aparelhos'] += 1

            # Venda
            saldo_devedor = round(valor_venda - soma_pagamentos, 2)
            sql_lines.append(f"INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)")
            sql_lines.append(f"VALUES ('{venda_id}', current_setting('importacao.proximo_numero')::int + {stats['vendas']}, current_setting('importacao.cliente_id')::uuid, {loja_id}, {vendedor_sql}, 'concluida', 'normal', {valor_venda}, {soma_pagamentos}, {saldo_devedor}, '{data_iso}', '{data_iso}', {vendedor_sql});")
            stats['vendas'] += 1

            # Vincular
            sql_lines.append(f"UPDATE aparelhos SET venda_id = '{venda_id}' WHERE id = '{aparelho_id}';")

            # Pagamentos
            if usar_pix:
                pagto_id = str(uuid.uuid4())
                sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)")
                sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', 'pix', {round(valor_venda, 2)}, '{data_iso}', {vendedor_sql}, 1, {criado_em_timestamp});")
                stats['pagamentos'] += 1
            else:
                for tipo, valor in [('pix', pix), ('dinheiro', dinheiro), ('cartao_credito', cartao_credito), ('cartao_debito', cartao_debito)]:
                    if valor and valor > 0:
                        pagto_id = str(uuid.uuid4())
                        sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)")
                        sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', '{tipo}', {round(valor, 2)}, '{data_iso}', {vendedor_sql}, 1, {criado_em_timestamp});")
                        stats['pagamentos'] += 1

                if troca_valor and troca_valor > 0:
                    pagto_id = str(uuid.uuid4())
                    obs_troca = f"Troca: {modelo_troca}" if modelo_troca else "Troca de aparelho"
                    sql_lines.append(f"INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)")
                    sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', 'troca_aparelho', {round(troca_valor, 2)}, '{data_iso}', {vendedor_sql}, '{obs_troca}', 1, {criado_em_timestamp});")
                    stats['pagamentos'] += 1
                    stats['trocas'] += 1

            # Brinde
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

    # Atualizar sequence
    sql_lines.append("""
-- Atualizar sequence
SELECT setval('vendas_numero_venda_seq', (SELECT max(numero_venda) FROM vendas));
""".strip())
    sql_lines.append('')

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

    return '\n'.join(sql_lines), stats


if __name__ == '__main__':
    sql, stats = gerar_sql()

    with open(SQL_PATH, 'w', encoding='utf-8') as f:
        f.write(sql)

    print(f'\nSQL gerado: {SQL_PATH}')
    print(f'Tamanho: {len(sql.splitlines())} linhas')
    print(f'  Aparelhos:  {stats["aparelhos"]}')
    print(f'  Vendas:     {stats["vendas"]}')
    print(f'  Pagamentos: {stats["pagamentos"]}')
    print(f'  Brindes:    {stats["brindes"]}')
    print(f'  Trocas:     {stats["trocas"]}')
    print(f'  Sem IMEI:   {stats["sem_imei"]}')
    print(f'  IMEI dup:   {stats["imei_duplicado"]}')
    print(f'  Erros:      {stats["erros"]}')

    if '--executar' in sys.argv:
        print('\nTransferindo e executando na VPS...')
        subprocess.run([
            'scp', SQL_PATH, 'vps:/tmp/importacao_completa.sql'
        ], check=True)
        subprocess.run([
            'ssh', 'vps',
            'docker cp /tmp/importacao_completa.sql supabase_db_LogCell:/tmp/importacao_completa.sql && '
            'docker exec supabase_db_LogCell psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/importacao_completa.sql'
        ], check=True)
        print('\nImportacao concluida!')
