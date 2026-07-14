#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera SQL de importacao para vendas_aparelhos3.csv (formato CRU, nao normalizado).

Correcoes em relacao aos lotes anteriores:
  - VENDEDOR_MAP corrigido: Rayssa -> Rayssa Alves (5eb6b371), Angel -> Angel Dourado
    (4549c96e). No lote anterior Raissa caia no Luiz Felipe e Angel no Ronald.
  - LOJA_MAP corrigido: ONLINE -> 21 (antes ia pro 4/ESTOQUE).
  - Dedup por IMEI contra o BANCO AO VIVO (snapshot _snapshot_imeis_vendidos.txt).
  - numero_venda NAO e setado (usa o default nextval do banco -> unico).
  - Sem-IMEI: dedup heuristico por modelo+valor (snapshot). Provavel duplicata =>
    pulada; provavel nova => importada com imei NULL (marcada para revisao).

NAO executa nada. Gera scripts/importar_vendas_aparelhos3.sql para revisao.
  python3 scripts/importar_vendas_aparelhos3.py
"""
import csv, re, uuid, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Aceita CSV de entrada e SQL de saida como argumentos (default: lote 3)
CSV_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'vendas_aparelhos3.csv')
SQL_PATH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'scripts', 'importar_vendas_aparelhos3.sql')
SNAP_IMEIS = os.path.join(ROOT, 'scripts', '_snapshot_imeis_todos.txt')
SNAP_MV = os.path.join(ROOT, 'scripts', '_snapshot_modelo_valor.txt')

# ── Mapas CORRIGIDOS (ids conferidos na tabela usuarios) ──────────────────────
VENDEDOR_MAP = {
    'Marcela':      'a3626643-4749-4e56-83bc-b4a8ffd53659',
    'Higor Guedes': '85e3aa42-b9af-49b8-a72a-64e9c337aa53',
    'Ronald':       '97f12885-87ad-426a-8bbb-656889d82e10',
    'Renan':        'a50f1e24-aabb-41c1-b817-b4a4950bb1e4',  # Rennan Leonardo
    'Guilherme':    '25e2da5b-9e76-4388-9890-7e22efd6940d',
    'Rayssa':       '5eb6b371-bb58-48c5-8334-4de118c1741f',  # CORRIGIDO
    'Angel':        '4549c96e-5c53-4cd6-b738-9d798f82a740',  # CORRIGIDO (Angel Dourado)
    'Renata':       '9451cd9f-6770-4e32-aae8-c75fa675e818',
    'Camila':       '1d12d555-68e9-45f8-bfc0-a35a1d8d7920',
    'Ruyter':       '85743f3e-1b32-49c0-9d9e-c16afd690f7d',
    'Bianca':       'b4269e60-eea2-4eba-a34d-db9591e0ec83',
    'Reiner':       '26619e69-beb9-4843-a287-bfedf2e1aef3',  # Reiner Matias de Souza
    'Yasmin':       'e07d4d35-1381-4d4d-914d-8382a7456fdd',  # Yasmin Monteiro
    'Luiz Henrique':'0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb',  # -> Luiz Felipe (decisao anterior)
}
# Lookup case-insensitive + apelidos (master mistura MARCELA/Marcela, Raissa/Rayssa, etc.)
VENDEDOR_LC = {k.lower(): v for k, v in VENDEDOR_MAP.items()}
VENDEDOR_LC['raissa'] = VENDEDOR_MAP['Rayssa']   # grafia da planilha
LOJA_MAP = {
    'CELL': 1, 'BALCAO': 1, 'CASES': 19, 'BLOCO B': 20,
    'ONLINE': 21,  # CORRIGIDO (antes ia pro 4/ESTOQUE)
    '': 1,         # loja em branco -> CELL (as 4 em branco sao todas da Renata/CELL)
}

# ── Helpers de parsing (copiados de normalizar_vendas2.py) ────────────────────
def parse_brl(v):
    if not v or not v.strip(): return 0.0
    v = re.sub(r'^R?\$\s*', '', v.strip()).replace('.', '').replace(',', '.')
    try: return float(v)
    except: return 0.0

def to_date(datestr):
    if not datestr or not datestr.strip(): return None
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', datestr.strip())
    return f'{m.group(3)}-{m.group(2)}-{m.group(1)}' if m else None

def detectar_estado(modelo):
    m = modelo.upper()
    if 'NOVO' in m: return 'novo'
    if 'SEMINOVO' in m: return 'seminovo'
    if 'USADO' in m: return 'usado'
    return 'seminovo'

def condicao_from_estado(estado):
    e = (estado or '').lower().strip()
    if e == 'novo': return 'perfeito'
    if e == 'usado': return 'regular'
    return 'bom'  # seminovo e demais

def extract_brand(modelo):
    m = modelo.upper().strip()
    if m.startswith(('IPHONE', 'IPAD', 'MAC', 'APPLE', 'WATCH')): return 'Apple'
    if m.startswith('SAMSUNG') or m.startswith('GALAXY'): return 'Samsung'
    if m.startswith('REDMI') or m.startswith('MI '): return 'Xiaomi'
    if m.startswith('REALME'): return 'Realme'
    return 'Outros'

def normalizar_pagamento(texto):
    if not texto or not texto.strip():
        return {'formas': 'nao_informado', 'pix': 0, 'dinheiro': 0, 'cartao_credito': 0,
                'cartao_debito': 0, 'troca': 0, 'modelo_troca': '', 'precisa_revisao': 'SIM',
                'motivo': 'sem forma de pagamento'}
    t = texto.strip(); t_upper = t.upper()
    if 'PAGAMENTO JUNTO' in t_upper and re.search(r'APARELHO\s*[234]', t_upper):
        return {'formas': 'pagamento_junto_secundario', 'pix': 0, 'dinheiro': 0, 'cartao_credito': 0,
                'cartao_debito': 0, 'troca': 0, 'modelo_troca': '', 'precisa_revisao': 'SIM',
                'motivo': 'pagamento junto - aparelho 2+'}
    if re.match(r'^GARANTIA', t_upper):
        return {'formas': 'garantia', 'pix': 0, 'dinheiro': 0, 'cartao_credito': 0,
                'cartao_debito': 0, 'troca': 0, 'modelo_troca': '', 'precisa_revisao': 'SIM',
                'motivo': 'garantia - revisar manualmente'}
    resultado = {'pix': 0.0, 'dinheiro': 0.0, 'cartao_credito': 0.0, 'cartao_debito': 0.0,
                 'troca': 0.0, 'modelo_troca': ''}
    troca_match = re.search(
        r'(?:entrou?|entrada|entrando|pegando|trocando)[^\d/]*(?:um|uma|iphone|samsung|redmi|realme)?[^R$\d]*'
        r'([A-Za-z0-9 ]+?)(?:\s+(?:por|a|no valor de|seminovo|novo|usado)\s*)?(?:R\$\s*)?(\d[\d.,]*)', t, re.IGNORECASE)
    if troca_match:
        raw_valor = troca_match.group(2).replace('.', '').replace(',', '.')
        try:
            resultado['troca'] = float(raw_valor)
            resultado['modelo_troca'] = troca_match.group(1).strip()[:80]
        except: pass
        t_sem_troca = t[:troca_match.start()].strip()
    else:
        t_sem_troca = t
    partes = re.split(r'\s*/\s*|\s*\+\s*', t_sem_troca)
    formas = set()
    for parte in partes:
        parte = parte.strip()
        if not parte: continue
        p = parte.upper()
        vm = re.search(r'R?\$?\s*([\d.,]+)', parte)
        val = 0.0
        if vm:
            raw = vm.group(1).replace('.', '').replace(',', '.')
            try: val = float(raw)
            except: pass
        if 'PIX' in p or 'PX' in p: resultado['pix'] += val; formas.add('pix')
        elif 'DINHEIRO' in p or 'REAIS' in p: resultado['dinheiro'] += val; formas.add('dinheiro')
        elif 'DEBITO' in p or 'DÉBITO' in p: resultado['cartao_debito'] += val; formas.add('cartao_debito')
        elif re.search(r'CREDITO|CRÉDITO|CARTAO|CARTÃO|\d+[Xx]', p): resultado['cartao_credito'] += val; formas.add('cartao_credito')
        elif resultado['troca'] > 0 and 'ENTRADA' in p: pass
        elif val > 0 and not formas: resultado['pix'] += val; formas.add('pix?')
    if resultado['troca'] > 0: formas.add('troca_aparelho')
    soma = sum(resultado[k] for k in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'troca'))
    formas_str = ' + '.join(sorted(formas)) if formas else 'outros'
    precisa = 'NAO'; motivo = ''
    if soma == 0: precisa = 'SIM'; motivo = 'nenhum pagamento extraido'
    elif formas_str in ('outros', 'nao_informado'): precisa = 'SIM'; motivo = 'forma nao reconhecida'
    resultado.update({'formas': formas_str, 'precisa_revisao': precisa, 'motivo': motivo})
    return resultado

def esc(s):
    return (s or '').replace("'", "''")

# ── Snapshots do banco (dedup) ────────────────────────────────────────────────
imeis_vendidos = set(l.strip() for l in open(SNAP_IMEIS) if l.strip())
mv_por_valor = {}   # valor -> list de modelos completos (para dedup sem-imei)
for l in open(SNAP_MV):
    if '|' not in l: continue
    mod, val = l.rsplit('|', 1)
    try: v = round(float(val.strip()), 2)
    except: continue
    mv_por_valor.setdefault(v, []).append(mod.strip().upper())

def existe_por_modelo_valor(modelo_csv, valor):
    """Heuristica p/ sem-IMEI: existe aparelho vendido com esse modelo (contido) e valor?"""
    mc = modelo_csv.strip().upper()
    for m in mv_por_valor.get(round(valor, 2), []):
        if mc and mc in m:
            return True
    return False

# ── Ler CSV cru ───────────────────────────────────────────────────────────────
rows = list(csv.reader(open(CSV_PATH, encoding='utf-8-sig')))[1:]

sql = []
sql.append('-- Importacao vendas_aparelhos3.csv (gerado, NAO executado)')
sql.append('-- numero_venda: usa o default nextval do banco (NAO setado aqui)')
sql.append('BEGIN;')
sql.append("""DO $$
DECLARE v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    IF v_cliente_id IS NULL THEN
        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, now(), now()) RETURNING id INTO v_cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END $$;""")
sql.append('')

st = {'importados': 0, 'imei_dup_banco': 0, 'imei_dup_csv': 0, 'sem_vendedor': 0,
      'sem_loja': 0, 'valor_zero': 0, 'data_inval': 0, 'pix_forcado': 0,
      'brindes': 0, 'trocas': 0, 'sem_imei_novo': 0, 'sem_imei_dup': 0}
sem_vendedor_nomes = set(); revisar_sem_imei = []; imeis_csv = {}

for idx, r in enumerate(rows, start=2):
    def col(i): return r[i].strip() if len(r) > i else ''
    data = col(0); modelo = col(1)
    imei = re.sub(r'\D', '', col(2))          # so digitos (igual ao snapshot/banco)
    if len(imei) < 14: imei = ''              # <14 digitos = lixo -> trata como sem-IMEI
    valor = parse_brl(col(3)); brinde = parse_brl(col(4)); custo = parse_brl(col(5))
    forma = col(6); vendedor = col(11); loja = col(12).upper()
    data_iso = to_date(data)

    # validacoes / dedup / mapeamento
    if data_iso is None:
        sql.append(f'-- PULADO (data invalida) linha {idx}: {modelo}'); st['data_inval'] += 1; continue
    if valor <= 0:
        sql.append(f'-- PULADO (valor zero) linha {idx}: {modelo}'); st['valor_zero'] += 1; continue
    vendedor_id = VENDEDOR_LC.get(vendedor.strip().lower())
    if not vendedor_id:
        sql.append(f'-- PULADO (vendedor sem cadastro "{vendedor}") linha {idx}: {modelo}')
        sem_vendedor_nomes.add(vendedor); st['sem_vendedor'] += 1; continue
    loja_id = LOJA_MAP.get(loja)
    if not loja_id:
        sql.append(f'-- PULADO (loja sem mapeamento "{loja}") linha {idx}: {modelo}'); st['sem_loja'] += 1; continue

    if imei:
        if os.environ.get('SO_SEM_IMEI') == '1':
            continue   # passada exclusiva dos sem-IMEI: pula os com-IMEI (ja importados)
        if imei in imeis_vendidos:
            sql.append(f'-- PULADO (IMEI ja existe no banco) linha {idx}: {modelo} [{imei}]'); st['imei_dup_banco'] += 1; continue
        if imei in imeis_csv:
            sql.append(f'-- PULADO (IMEI repetido no CSV, linha {imeis_csv[imei]}) linha {idx}: {modelo} [{imei}]'); st['imei_dup_csv'] += 1; continue
        imeis_csv[imei] = idx
        imei_sql = f"'{esc(imei)}'"
    else:
        # sem IMEI -> dedup heuristico modelo+valor
        if existe_por_modelo_valor(modelo, valor):
            sql.append(f'-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha {idx}: {modelo} R$ {valor}')
            st['sem_imei_dup'] += 1; continue
        st['sem_imei_novo'] += 1
        revisar_sem_imei.append((idx, modelo, valor, vendedor, loja))
        if os.environ.get('SO_IMEI') == '1':
            sql.append(f'-- SEGURADO p/ revisao (SEM IMEI) linha {idx}: {modelo} R$ {valor} | {vendedor} | {loja}')
            continue
        imei_sql = 'NULL'

    # pagamento
    pg = normalizar_pagamento(forma)
    pix, din, cc, cd, troca = pg['pix'], pg['dinheiro'], pg['cartao_credito'], pg['cartao_debito'], pg['troca']
    modelo_troca = pg['modelo_troca']
    soma = round(pix + din + cc + cd + troca, 2)
    obs = ''
    if pg['precisa_revisao'] == 'SIM' and abs(valor - soma) > 0.01:
        pix, din, cc, cd, troca, modelo_troca = valor, 0, 0, 0, 0, ''
        soma = valor; st['pix_forcado'] += 1
        obs = 'pgto forcado pix (extracao nao confiavel)'

    estado = detectar_estado(modelo); marca = extract_brand(modelo); cond = condicao_from_estado(estado)
    aparelho_id = str(uuid.uuid4()); venda_id = str(uuid.uuid4())
    ts = f"'{data_iso}T14:00:00+00'"; vd = f"'{vendedor_id}'"
    obs_sql = f"'{esc(obs)}'" if obs else 'NULL'

    sql.append(f'-- === Linha {idx}: {modelo} ({data}) | {vendedor} | {loja} ===')
    sql.append(
        "INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, "
        "status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ("
        f"'{aparelho_id}', '{esc(marca)}', '{esc(modelo)}', {imei_sql}, {valor}, {custo}, {loja_id}, "
        f"'{estado}', '{cond}', 'vendido', {ts}, {ts}, {vd}, {ts}, {ts}, {obs_sql});")
    sql.append(
        "INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, "
        "saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ("
        "current_setting('importacao.cliente_id')::uuid, "
        f"{loja_id}, {vd}, 'concluida', 'normal', {valor}, {soma}, 0, {ts}, {ts}, {vd});")
    # vincula o aparelho a ULTIMA venda inserida acima (mesmo vendedor/loja/ts) via id conhecido:
    sql.append(
        "WITH v AS (SELECT id FROM vendas WHERE vendedor_id = " + vd +
        f" AND loja_id = {loja_id} AND criado_em = {ts} AND valor_total = {valor} "
        "ORDER BY numero_venda DESC LIMIT 1) "
        f"UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '{aparelho_id}';")
    # pagamentos (usa o mesmo venda_id via subselect)
    for tipo, vlr in (('pix', round(pix, 2)), ('dinheiro', round(din, 2)),
                      ('cartao_credito', round(cc, 2)), ('cartao_debito', round(cd, 2))):
        if vlr > 0:
            sql.append(
                "INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) "
                f"SELECT gen_random_uuid(), venda_id, '{tipo}', {vlr}, '{data_iso}', {vd}, 1, {ts} "
                f"FROM aparelhos WHERE id = '{aparelho_id}';")
    if troca > 0:
        obs_t = esc(f'Troca: {modelo_troca}') if modelo_troca else 'Troca de aparelho'
        sql.append(
            "INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em) "
            f"SELECT gen_random_uuid(), venda_id, 'troca_aparelho', {round(troca,2)}, '{data_iso}', {vd}, '{obs_t}', 1, {ts} "
            f"FROM aparelhos WHERE id = '{aparelho_id}';")
        st['trocas'] += 1
    if brinde > 0:
        sql.append(
            "INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) "
            f"SELECT gen_random_uuid(), {loja_id}, venda_id, 'Brinde', {round(brinde,2)}, '{data_iso}', {vd}, {ts} "
            f"FROM aparelhos WHERE id = '{aparelho_id}';")
        st['brindes'] += 1
    sql.append('')
    st['importados'] += 1

sql.append('COMMIT;')

# ── Relatorio (comentado no fim do SQL + stdout) ─────────────────────────────
resumo = [
    '-- ================= RESUMO =================',
    f"-- Total linhas CSV:        {len(rows)}",
    f"-- IMPORTADOS:              {st['importados']}  (com IMEI + sem-IMEI provavel-novo)",
    f"--   dos quais sem IMEI:    {st['sem_imei_novo']}  (imei NULL - REVISAR)",
    f"-- Pulados IMEI ja vendido: {st['imei_dup_banco']}",
    f"-- Pulados IMEI dup no CSV: {st['imei_dup_csv']}",
    f"-- Pulados sem-IMEI dup:    {st['sem_imei_dup']}  (heuristica modelo+valor)",
    f"-- Pulados vendedor s/cad:  {st['sem_vendedor']}  {sorted(sem_vendedor_nomes)}",
    f"-- Pulados loja s/mapa:     {st['sem_loja']}",
    f"-- Pulados valor zero:      {st['valor_zero']}",
    f"-- Pulados data invalida:   {st['data_inval']}",
    f"-- Pgto forcado pix:        {st['pix_forcado']}",
    f"-- Brindes / Trocas:        {st['brindes']} / {st['trocas']}",
    '-- =========================================',
]
sql += [''] + resumo
open(SQL_PATH, 'w', encoding='utf-8').write('\n'.join(sql))

print('\n'.join(l[3:] if l.startswith('-- ') else l for l in resumo))
print(f'\nSQL gerado (NAO executado): {SQL_PATH}')
if revisar_sem_imei:
    print(f'\nSEM-IMEI importados (imei NULL) para REVISAR ({len(revisar_sem_imei)}):')
    for idx, mod, val, vend, loja in revisar_sem_imei:
        print(f'  linha {idx}: {mod[:45]:<45} R$ {val:>8} | {vend} | {loja}')
