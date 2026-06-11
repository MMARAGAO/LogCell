#!/usr/bin/env python3
"""
Gera script SQL para importar venda_aparelhos.csv no banco.
Nao executa nada — apenas gera o arquivo SQL para revisao.
"""
import csv, re, json, os, uuid
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT = os.path.join(ROOT, 'venda_aparelhos.csv')
PREVIEW_DIR = os.path.join(ROOT, 'scripts', 'importacao_preview')
SQL_OUTPUT = os.path.join(ROOT, 'scripts', 'importacao.sql')

# Importar funcoes do script de analise
sys_path = os.path.dirname(os.path.abspath(__file__))
import sys
if sys_path not in sys.path:
    sys.path.insert(0, sys_path)

from analisar_importacao import (
    parse_brl, to_date, extrair_troca, normalizar_forma,
    LOJA_MAP, VENDEDOR_MAP
)

# ====================================================================
# CLIENTE PADRAO
# ====================================================================
# Precisa existir no banco — criar manualmente se necessario
CLIENTE_PADRAO_ID = None  # Será definido após criacao
CLIENTE_PADRAO_NOME = 'CLIENTE BALCAO'

# ====================================================================
# GERAR SQL
# ====================================================================

def gerar_uuid():
    return str(uuid.uuid4())

def extrair_estado(modelo):
    """Extrai estado do aparelho do nome do modelo."""
    m = modelo.upper()
    if 'NOVO' in m and 'SEMINOVO' not in m and 'LACRADO' not in m:
        return 'novo'
    if 'LACRADO' in m:
        return 'novo'
    if 'SEMINOVO' in m:
        return 'seminovo'
    if 'USADO' in m:
        return 'usado'
    return 'seminovo'

def limpar_modelo(modelo):
    """Remove sufixos de estado do nome do modelo para deixar apenas o modelo."""
    for s in [' NOVO', ' SEMINOVO', ' USADO', ' LACRADO', ' - GARANTIA']:
        if modelo.upper().endswith(s):
            modelo = modelo[:-len(s)]
    return modelo.strip()

def gerar_sql():
    with open(INPUT, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        linhas = list(reader)
    
    sql_lines = []
    sql_lines.append('-- ============================================')
    sql_lines.append(f'-- Script de importacao gerado em {datetime.now()}')
    sql_lines.append(f'-- Fonte: venda_aparelhos.csv ({len(linhas)} linhas)')
    sql_lines.append('-- ============================================')
    sql_lines.append('')
    sql_lines.append('BEGIN;')
    sql_lines.append('')
    
    # --- CLIENTE PADRAO ---
    sql_lines.append('-- ============================================')
    sql_lines.append('-- 1. CRIAR CLIENTE PADRAO (se nao existir)')
    sql_lines.append('-- ============================================')
    sql_lines.append("""
DO $$
DECLARE
    cliente_id UUID;
BEGIN
    SELECT id INTO cliente_id FROM clientes WHERE nome = 'CLIENTE BALCAO' LIMIT 1;
    IF cliente_id IS NULL THEN
        INSERT INTO clientes (nome, tipo_pessoa, criado_em, atualizado_em)
        VALUES ('CLIENTE BALCAO', 'fisica', NOW(), NOW())
        RETURNING id INTO cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', cliente_id::text, true);
END;
$$;
""".strip())
    sql_lines.append('')
    
    # --- INSTRUCOES PREVIAS ---
    sql_lines.append('-- ============================================')
    sql_lines.append('-- 2. IMPORTAR CADA VENDA')
    sql_lines.append('-- ============================================')
    sql_lines.append('')
    
    estatisticas = {
        'vendas': 0,
        'trocas': 0,
        'sem_vendedor': 0,
        'sem_imei': 0,
    }
    
    for idx, row in enumerate(linhas):
        # Parse
        data = row.get('DATA', '').strip()
        data_iso = to_date(data)
        modelo_orig = row.get('MODELO', '').strip()
        imei = row.get('IMEI', '').strip().replace(' ', '')
        valor_venda = parse_brl(row.get('VALOR DE VENDA', ''))
        brinde = parse_brl(row.get('BRINDE', ''))
        custo = parse_brl(row.get('CUSTO APARELHO', ''))
        forma_orig = row.get('FORMA DE PAGAMENTO', '').strip()
        vendedor_nome = row.get('VENDEDOR', '').strip().title()
        loja_nome = row.get('LOJA', '').strip().upper() or 'CELL'
        
        # Skip non-monetary
        if valor_venda is None:
            sql_lines.append(f'-- IGNORADO (valor nao monetario): {modelo_orig}')
            sql_lines.append('')
            continue
        
        # IDs
        loja_id = LOJA_MAP.get(loja_nome, 1)
        vendedor_key = vendedor_nome.upper()
        vendedor_id = VENDEDOR_MAP.get(vendedor_key)
        if not vendedor_id:
            # Fallback: usar Ronald como vendedor padrao (ajustar manualmente depois)
            vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10'
            estatisticas['sem_vendedor'] += 1
        vendedor_id = f"'{vendedor_id}'"
        
        if not imei:
            estatisticas['sem_imei'] += 1
        
        if not data_iso:
            data_iso = '2026-05-01'  # fallback
        
        # Estado e modelo limpo
        estado = extrair_estado(modelo_orig)
        modelo_limpo = limpar_modelo(modelo_orig)
        
        # UUIDs
        aparelho_id = gerar_uuid()
        venda_id = gerar_uuid()
        
        # Trocas
        formas = normalizar_forma(forma_orig)
        tem_troca = 'troca_aparelho' in formas
        trocas = extrair_troca(forma_orig) if tem_troca else []
        
        # Pagamentos simplificado: usar valor total como PIX
        # (melhorias futuras: extrair valores individuais do texto)
        tipo_pagto = 'pix'
        if 'cartao_credito' in formas or 'credito' in forma_orig.lower():
            tipo_pagto = 'cartao_credito'
        elif 'dinheiro' in formas:
            tipo_pagto = 'dinheiro'
        elif 'cartao_debito' in formas or 'debito' in forma_orig.lower():
            tipo_pagto = 'cartao_debito'
        elif 'outros' in formas:
            tipo_pagto = 'pix'
        
        # === APARELHO VENDIDO ===
        sql_lines.append(f'-- VENDA {idx+1}: {modelo_orig} ({data})')
        sql_lines.append(f'INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)')
        
        imei_val = f"'{imei}'" if imei else 'NULL'
        valor_brinde = valor_venda - brinde if brinde else valor_venda
        
        sql_lines.append(f"VALUES ('{aparelho_id}', '{modelo_limpo}', {imei_val}, {valor_venda}, {custo}, {loja_id}, 'vendido', '{estado}', '{data_iso}', '{data_iso}', '{data_iso}', '{data_iso}');")
        
        # === VENDA ===
        sql_lines.append(f'INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)')
        sql_lines.append(f"VALUES ('{venda_id}', {loja_id}, {vendedor_id}, 'concluida', 'normal', {valor_venda}, {valor_venda}, 0, 0, '{data_iso}');")
        
        # === VINCULAR APARELHO À VENDA ===
        sql_lines.append(f'UPDATE aparelhos SET venda_id = \'{venda_id}\' WHERE id = \'{aparelho_id}\';')
        
        # === PAGAMENTO ===
        pagto_id = gerar_uuid()
        sql_lines.append(f'INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)')
        sql_lines.append(f"VALUES ('{pagto_id}', '{venda_id}', '{tipo_pagto}', {valor_venda}, '{data_iso}', '{data_iso}');")
        
        # === TROCA (se houver) ===
        for troca in trocas:
            troca_id = gerar_uuid()
            modelo_troca = troca['modelo']
            valor_troca = troca['valor']
            estado_troca = 'usado'
            if 'NOVO' in modelo_troca.upper():
                estado_troca = 'novo'
            
            sql_lines.append(f'')
            sql_lines.append(f'-- Troca: {modelo_troca} (R$ {valor_troca:.2f})')
            sql_lines.append(f'INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)')
            sql_lines.append(f"VALUES ('{troca_id}', '{modelo_troca}', {valor_troca}, {loja_id}, 'disponivel', '{estado_troca}', 'Entrada por troca - venda {venda_id}', '{data_iso}', '{data_iso}', '{data_iso}');")
            estatisticas['trocas'] += 1
        
        sql_lines.append('')
        estatisticas['vendas'] += 1
    
    # Final
    sql_lines.append('COMMIT;')
    sql_lines.append('')
    sql_lines.append('-- ============================================')
    sql_lines.append('-- RESUMO')
    sql_lines.append(f'-- Vendas criadas: {estatisticas["vendas"]}')
    sql_lines.append(f'-- Trocas registradas: {estatisticas["trocas"]}')
    sql_lines.append(f'-- Vendedores sem ID: {estatisticas["sem_vendedor"]}')
    sql_lines.append(f'-- Aparelhos sem IMEI: {estatisticas["sem_imei"]}')
    sql_lines.append('-- ============================================')
    
    return '\n'.join(sql_lines), estatisticas


if __name__ == '__main__':
    sql, stats = gerar_sql()
    
    with open(SQL_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f'SQL gerado: {SQL_OUTPUT}')
    print(f'  Vendas:     {stats["vendas"]}')
    print(f'  Trocas:     {stats["trocas"]}')
    print(f'  Sem vend:   {stats["sem_vendedor"]}')
    print(f'  Sem IMEI:   {stats["sem_imei"]}')
    print(f'Tamanho: {len(sql.splitlines())} linhas, {os.path.getsize(SQL_OUTPUT):,} bytes')
