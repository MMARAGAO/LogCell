-- =====================================================
-- SCRIPT DE MIGRAÇÃO - BANCO ANTIGO PARA BANCO NOVO
-- =====================================================
-- Data: 26/11/2025
-- Descrição: Migra dados do schema antigo para o novo
-- IMPORTANTE: Execute este script conectado ao banco NOVO
-- =====================================================

BEGIN;

-- =====================================================
-- 1. MIGRAÇÃO DE LOJAS
-- =====================================================
-- Banco Antigo: lojas (id integer, nome, endereco, telefone, createdat, updatedat, fotourl, descricao, usuario_id)
-- Banco Novo: lojas (id integer, nome, cnpj, telefone, email, endereco, cidade, estado, cep, ativo, criado_em, atualizado_em)

INSERT INTO public.lojas (
  id,
  nome,
  telefone,
  endereco,
  ativo,
  criado_em,
  atualizado_em
)
SELECT 
  id,
  nome,
  telefone,
  endereco,
  true, -- ativo
  COALESCE(createdat, now()),
  COALESCE(updatedat, now())
FROM public_antigo.lojas
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  telefone = EXCLUDED.telefone,
  endereco = EXCLUDED.endereco,
  atualizado_em = now();

-- Migrar fotos das lojas
INSERT INTO public.lojas_fotos (
  loja_id,
  url,
  ordem,
  is_principal,
  criado_em
)
SELECT 
  l.id,
  unnest(l.fotourl) as url,
  ROW_NUMBER() OVER (PARTITION BY l.id) - 1 as ordem,
  ROW_NUMBER() OVER (PARTITION BY l.id) = 1 as is_principal,
  now()
FROM public_antigo.lojas l
WHERE l.fotourl IS NOT NULL AND array_length(l.fotourl, 1) > 0;

-- =====================================================
-- 2. MIGRAÇÃO DE USUÁRIOS
-- =====================================================
-- Banco Antigo: usuarios (uuid, nome, nickname, email, telefone, cpf, cargo, fotourl, createdat, updatedat, credito)
-- Banco Novo: usuarios (id uuid, nome, email, telefone, cpf, cargo, ativo, criado_em, atualizado_em)

INSERT INTO public.usuarios (
  id,
  nome,
  email,
  telefone,
  cpf,
  cargo,
  ativo,
  criado_em,
  atualizado_em
)
SELECT 
  uuid,
  nome,
  email,
  telefone,
  cpf,
  cargo,
  true, -- ativo
  COALESCE(createdat, now()),
  COALESCE(updatedat, now())
FROM public_antigo.usuarios
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  cpf = EXCLUDED.cpf,
  cargo = EXCLUDED.cargo,
  atualizado_em = now();

-- Migrar fotos de perfil
INSERT INTO public.fotos_perfil (
  usuario_id,
  url,
  criado_em
)
SELECT 
  u.uuid,
  unnest(u.fotourl) as url,
  now()
FROM public_antigo.usuarios u
WHERE u.fotourl IS NOT NULL AND array_length(u.fotourl, 1) > 0;

-- =====================================================
-- 3. MIGRAÇÃO DE CLIENTES
-- =====================================================
-- Banco Antigo: clientes (id integer, nome, email, telefone, doc, endereco, instagram, whatsapp, createdat, updatedat, fotourl, credito, usuario_id)
-- Banco Novo: clientes (id uuid, nome, cpf, rg, data_nascimento, telefone, telefone_secundario, email, cep, logradouro, numero, complemento, bairro, cidade, estado, observacoes, ativo, id_loja, criado_em, atualizado_em, criado_por, atualizado_por)

INSERT INTO public.clientes (
  id,
  nome,
  cpf,
  telefone,
  email,
  observacoes,
  ativo,
  criado_em,
  atualizado_em,
  criado_por
)
SELECT 
  gen_random_uuid(), -- Gera novo UUID
  nome,
  doc, -- CPF
  telefone,
  email,
  CASE 
    WHEN instagram IS NOT NULL THEN 'Instagram: ' || instagram
    ELSE NULL
  END,
  true, -- ativo
  COALESCE(createdat, now()),
  COALESCE(updatedat, now()),
  usuario_id
FROM public_antigo.clientes;

-- Criar tabela temporária de mapeamento de IDs de clientes (antigo -> novo)
CREATE TEMP TABLE temp_clientes_map AS
SELECT 
  c_antigo.id as id_antigo,
  c_novo.id as id_novo
FROM public_antigo.clientes c_antigo
JOIN public.clientes c_novo ON (
  c_novo.nome = c_antigo.nome 
  AND COALESCE(c_novo.cpf, '') = COALESCE(c_antigo.doc, '')
  AND COALESCE(c_novo.telefone, '') = COALESCE(c_antigo.telefone, '')
);

-- Migrar créditos dos clientes
INSERT INTO public.creditos_cliente (
  cliente_id,
  valor_total,
  valor_utilizado,
  saldo,
  motivo,
  gerado_por,
  criado_em,
  tipo
)
SELECT 
  tcm.id_novo, -- Usa o novo UUID do cliente
  COALESCE(c.credito, 0),
  0, -- valor_utilizado
  COALESCE(c.credito, 0), -- saldo
  'Migração de saldo anterior',
  c.usuario_id,
  COALESCE(c.createdat, now()),
  CASE 
    WHEN COALESCE(c.credito, 0) >= 0 THEN 'adicao'
    ELSE 'retirada'
  END
FROM public_antigo.clientes c
JOIN temp_clientes_map tcm ON tcm.id_antigo = c.id
WHERE COALESCE(c.credito, 0) <> 0;

-- =====================================================
-- 4. MIGRAÇÃO DE FORNECEDORES
-- =====================================================
-- Banco Antigo: fornecedores (id integer, nome, doc, email, telefone, cep, endereco, site, produtos, ativo, data_cadastro, observacoes, fotourl, usuario_id)
-- Banco Novo: fornecedores (id uuid, nome, cnpj, telefone, email, endereco, cidade, estado, cep, contato_nome, contato_telefone, observacoes, ativo, criado_em, atualizado_em, criado_por, atualizado_por)

INSERT INTO public.fornecedores (
  id,
  nome,
  cnpj,
  telefone,
  email,
  endereco,
  cep,
  observacoes,
  ativo,
  criado_em,
  atualizado_em,
  criado_por
)
SELECT 
  gen_random_uuid(),
  nome,
  doc, -- CNPJ
  telefone,
  email,
  endereco,
  cep,
  CASE 
    WHEN site IS NOT NULL THEN 'Site: ' || site || COALESCE(E'\n' || observacoes, '')
    ELSE observacoes
  END,
  COALESCE(ativo, true),
  COALESCE(data_cadastro, now()),
  now(),
  usuario_id
FROM public_antigo.fornecedores;

-- =====================================================
-- 5. MIGRAÇÃO DE PRODUTOS (ESTOQUE)
-- =====================================================
-- Banco Antigo: estoque (id integer, descricao, modelo, marca, compativel, minimo, preco_compra, preco_venda, createdat, updatedat, fotourl, observacoes, usuario_id)
-- Banco Novo: produtos (id uuid, descricao, modelos, marca, preco_compra, preco_venda, quantidade_minima, ativo, criado_por, criado_em, atualizado_em, atualizado_por, grupo, categoria, codigo_fabricante)

INSERT INTO public.produtos (
  id,
  descricao,
  modelos,
  marca,
  preco_compra,
  preco_venda,
  quantidade_minima,
  ativo,
  criado_por,
  criado_em,
  atualizado_em
)
SELECT 
  gen_random_uuid(),
  descricao,
  modelo,
  marca,
  preco_compra,
  preco_venda,
  COALESCE(minimo, 0)::integer,
  true, -- ativo
  usuario_id,
  COALESCE(createdat, now()),
  COALESCE(updatedat, now())
FROM public_antigo.estoque;

-- Criar tabela temporária de mapeamento de IDs de produtos (antigo -> novo)
CREATE TEMP TABLE temp_produtos_map AS
SELECT 
  e_antigo.id as id_antigo,
  p_novo.id as id_novo
FROM public_antigo.estoque e_antigo
JOIN public.produtos p_novo ON (
  p_novo.descricao = e_antigo.descricao 
  AND COALESCE(p_novo.marca, '') = COALESCE(e_antigo.marca, '')
  AND COALESCE(p_novo.modelos, '') = COALESCE(e_antigo.modelo, '')
);

-- Migrar fotos dos produtos
INSERT INTO public.fotos_produtos (
  produto_id,
  url,
  nome_arquivo,
  ordem,
  is_principal,
  criado_em
)
SELECT 
  tpm.id_novo,
  unnest(e.fotourl) as url,
  'foto_' || ROW_NUMBER() OVER (PARTITION BY e.id) || '.jpg',
  ROW_NUMBER() OVER (PARTITION BY e.id) - 1 as ordem,
  ROW_NUMBER() OVER (PARTITION BY e.id) = 1 as is_principal,
  now()
FROM public_antigo.estoque e
JOIN temp_produtos_map tpm ON tpm.id_antigo = e.id
WHERE e.fotourl IS NOT NULL AND array_length(e.fotourl, 1) > 0;

-- =====================================================
-- 6. MIGRAÇÃO DE ESTOQUE POR LOJA
-- =====================================================
-- Banco Antigo: estoque_lojas (id integer, produto_id integer, loja_id integer, quantidade numeric, updatedat, usuario_id)
-- Banco Novo: estoque_lojas (id uuid, id_produto uuid, id_loja integer, quantidade integer, atualizado_por, atualizado_em)

INSERT INTO public.estoque_lojas (
  id_produto,
  id_loja,
  quantidade,
  atualizado_por,
  atualizado_em
)
SELECT 
  tpm.id_novo, -- Novo UUID do produto
  el.loja_id,
  COALESCE(el.quantidade, 0)::integer,
  el.usuario_id,
  COALESCE(el.updatedat, now())
FROM public_antigo.estoque_lojas el
JOIN temp_produtos_map tpm ON tpm.id_antigo = el.produto_id;

-- =====================================================
-- 7. MIGRAÇÃO DE CAIXAS
-- =====================================================
-- Banco Antigo: caixa (id integer, loja_id, usuario_id, data_abertura, valor_inicial, status, data_fechamento, valor_final, observacoes_abertura, observacoes_fechamento, created_at, updated_at)
-- Banco Novo: caixas (id uuid, loja_id, usuario_abertura, usuario_fechamento, data_abertura, data_fechamento, saldo_inicial, saldo_final, status, observacoes_abertura, observacoes_fechamento, criado_em, atualizado_em)

INSERT INTO public.caixas (
  id,
  loja_id,
  usuario_abertura,
  usuario_fechamento,
  data_abertura,
  data_fechamento,
  saldo_inicial,
  saldo_final,
  status,
  observacoes_abertura,
  observacoes_fechamento,
  criado_em,
  atualizado_em
)
SELECT 
  gen_random_uuid(),
  loja_id,
  usuario_id, -- usuario_abertura
  CASE WHEN status = 'fechado' THEN usuario_id ELSE NULL END, -- usuario_fechamento
  data_abertura,
  data_fechamento,
  COALESCE(valor_inicial, 0),
  valor_final,
  status,
  observacoes_abertura,
  observacoes_fechamento,
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM public_antigo.caixa;

-- =====================================================
-- 8. MIGRAÇÃO DE VENDAS
-- =====================================================
-- IMPORTANTE: As vendas precisam ser migradas com cuidado devido às diferenças estruturais
-- Banco Antigo: vendas (id bigint, data_venda, id_cliente integer, cliente_nome, usuario_id, itens jsonb, total_bruto, desconto, total_liquido, forma_pagamento, status_pagamento, fiado, data_vencimento, valor_pago, valor_restante, observacoes, created_at, updated_at, loja_id, credito_usado, id_usuario, comprovantes, data_pagamento, credito_gerado_por_devolucao, pagamento_detalhes)
-- Banco Novo: vendas (id uuid, numero_venda integer, cliente_id uuid, loja_id integer, valor_total, desconto_total, valor_final, status, cancelado boolean, motivo_cancelamento, criado_em, atualizado_em, criado_por, atualizado_por, cancelado_em, cancelado_por)

-- Nota: Esta migração é complexa e requer tratamento especial
-- Os itens das vendas e pagamentos precisam ser separados em tabelas diferentes

-- PRIMEIRO: Migrar as vendas
INSERT INTO public.vendas (
  id,
  numero_venda,
  cliente_id,
  loja_id,
  valor_total,
  desconto_total,
  valor_final,
  status,
  cancelado,
  criado_em,
  atualizado_em,
  criado_por
)
SELECT 
  gen_random_uuid(),
  v.id::integer, -- Usar o ID antigo como número da venda
  tcm.id_novo, -- Novo UUID do cliente
  v.loja_id,
  COALESCE(v.total_bruto, 0),
  COALESCE(v.desconto, 0),
  COALESCE(v.total_liquido, 0),
  CASE 
    WHEN v.status_pagamento = 'pago' THEN 'finalizada'
    WHEN v.status_pagamento = 'pendente' AND v.fiado = true THEN 'pendente'
    ELSE 'rascunho'
  END,
  false, -- cancelado
  COALESCE(v.created_at, now()),
  COALESCE(v.updated_at, now()),
  v.usuario_id
FROM public_antigo.vendas v
LEFT JOIN temp_clientes_map tcm ON tcm.id_antigo = v.id_cliente;

-- Criar tabela temporária de mapeamento de IDs de vendas (antigo -> novo)
CREATE TEMP TABLE temp_vendas_map AS
SELECT 
  v_antigo.id as id_antigo,
  v_novo.id as id_novo
FROM public_antigo.vendas v_antigo
JOIN public.vendas v_novo ON v_novo.numero_venda = v_antigo.id::integer;

-- SEGUNDO: Migrar itens das vendas
-- Os itens estão em JSONB no banco antigo, precisam ser extraídos
INSERT INTO public.itens_venda (
  venda_id,
  produto_id,
  produto_nome,
  produto_codigo,
  quantidade,
  preco_unitario,
  subtotal,
  criado_em
)
SELECT 
  tvm.id_novo, -- Novo UUID da venda
  tpm.id_novo, -- Novo UUID do produto
  (item->>'descricao')::text,
  COALESCE((item->>'codigo')::text, 'SEM_CODIGO'),
  (item->>'quantidade')::integer,
  (item->>'preco_unitario')::numeric,
  (item->>'subtotal')::numeric,
  COALESCE(v.created_at, now())
FROM public_antigo.vendas v
JOIN temp_vendas_map tvm ON tvm.id_antigo = v.id
CROSS JOIN jsonb_array_elements(v.itens) as item
LEFT JOIN temp_produtos_map tpm ON tpm.id_antigo = (item->>'produto_id')::integer
WHERE v.itens IS NOT NULL AND jsonb_array_length(v.itens) > 0;

-- TERCEIRO: Migrar pagamentos das vendas
-- No banco antigo, pode estar em forma_pagamento ou pagamento_detalhes
INSERT INTO public.pagamentos_venda (
  venda_id,
  tipo_pagamento,
  valor,
  data_pagamento,
  criado_em,
  criado_por
)
SELECT 
  tvm.id_novo,
  CASE 
    WHEN v.forma_pagamento = 'dinheiro' THEN 'dinheiro'
    WHEN v.forma_pagamento = 'pix' THEN 'pix'
    WHEN v.forma_pagamento = 'credito' THEN 'cartao_credito'
    WHEN v.forma_pagamento = 'debito' THEN 'cartao_debito'
    ELSE 'dinheiro'
  END,
  COALESCE(v.valor_pago, v.total_liquido, 0),
  COALESCE(v.data_pagamento, v.data_venda, now())::date,
  COALESCE(v.created_at, now()),
  v.usuario_id
FROM public_antigo.vendas v
JOIN temp_vendas_map tvm ON tvm.id_antigo = v.id
WHERE v.valor_pago > 0 OR v.status_pagamento = 'pago';

-- =====================================================
-- 9. MIGRAÇÃO DE DEVOLUÇÕES
-- =====================================================
-- Banco Antigo: devolucoes (id bigint, id_venda, data_devolucao, id_cliente, cliente_nome, usuario_id, itens_devolvidos jsonb, valor_total_devolvido, tipo_devolucao, motivo_devolucao, valor_credito_gerado, credito_aplicado, observacoes, created_at, updated_at, id_usuario, status, forma_reembolso)
-- Banco Novo: devolucoes_venda (id uuid, venda_id uuid, tipo varchar, motivo text, valor_total numeric, realizado_por uuid, criado_em)

INSERT INTO public.devolucoes_venda (
  venda_id,
  tipo,
  motivo,
  valor_total,
  realizado_por,
  criado_em
)
SELECT 
  tvm.id_novo, -- Novo UUID da venda
  CASE 
    WHEN d.forma_reembolso = 'credito' OR d.valor_credito_gerado > 0 THEN 'com_credito'
    ELSE 'sem_credito'
  END,
  COALESCE(d.motivo_devolucao, 'Sem motivo informado'),
  COALESCE(d.valor_total_devolvido, 0),
  d.usuario_id,
  COALESCE(d.created_at, now())
FROM public_antigo.devolucoes d
JOIN temp_vendas_map tvm ON tvm.id_antigo = d.id_venda;

-- =====================================================
-- 10. MIGRAÇÃO DE SANGRIAS
-- =====================================================
-- Banco Antigo: sangrias (id integer, caixa_id, valor, motivo, data_sangria, usuario_id, created_at, updated_at, status, motivo_cancelamento, data_cancelamento, usuario_cancelamento_id)
-- Banco Novo: sangrias_caixa (id uuid, caixa_id uuid, valor numeric, motivo text, criado_em, realizado_por uuid)

-- Primeiro, criar mapeamento de caixas (antigo -> novo)
CREATE TEMP TABLE temp_caixas_map AS
SELECT 
  c_antigo.id as id_antigo,
  c_novo.id as id_novo
FROM public_antigo.caixa c_antigo
JOIN public.caixas c_novo ON (
  c_novo.loja_id = c_antigo.loja_id
  AND c_novo.data_abertura = c_antigo.data_abertura
);

INSERT INTO public.sangrias_caixa (
  caixa_id,
  valor,
  motivo,
  criado_em,
  realizado_por
)
SELECT 
  tcxm.id_novo,
  s.valor,
  s.motivo,
  COALESCE(s.created_at, now()),
  s.usuario_id
FROM public_antigo.sangrias s
JOIN temp_caixas_map tcxm ON tcxm.id_antigo = s.caixa_id
WHERE COALESCE(s.status, 'ativa') = 'ativa'; -- Migrar apenas sangrias ativas

-- =====================================================
-- 11. MIGRAÇÃO DE PERMISSÕES
-- =====================================================
-- Banco Antigo: permissoes (id uuid, acessos jsonb, loja_id integer)
-- Banco Novo: permissoes (id integer, usuario_id uuid, permissoes jsonb, criado_em, atualizado_em, loja_id integer, todas_lojas boolean)

INSERT INTO public.permissoes (
  usuario_id,
  permissoes,
  loja_id,
  todas_lojas,
  criado_em,
  atualizado_em
)
SELECT 
  p.id, -- O ID antigo é o usuario_id
  p.acessos,
  p.loja_id,
  p.loja_id IS NULL, -- Se não tem loja específica, tem acesso a todas
  now(),
  now()
FROM public_antigo.permissoes p;

-- =====================================================
-- 12. ATUALIZAR SEQUENCES
-- =====================================================
-- Atualizar as sequences para evitar conflitos de IDs

-- Sequence de lojas
SELECT setval('lojas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM lojas));

-- Sequence de ordem de serviço (se houver)
-- SELECT setval('ordem_servico_numero_os_seq', (SELECT COALESCE(MAX(numero_os), 0) + 1 FROM ordem_servico));

-- =====================================================
-- 13. LIMPEZA DE TABELAS TEMPORÁRIAS
-- =====================================================
DROP TABLE IF EXISTS temp_clientes_map;
DROP TABLE IF EXISTS temp_produtos_map;
DROP TABLE IF EXISTS temp_vendas_map;
DROP TABLE IF EXISTS temp_caixas_map;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

-- Verificar quantidades migradas
SELECT 'Lojas migradas: ' || COUNT(*) FROM public.lojas;
SELECT 'Usuários migrados: ' || COUNT(*) FROM public.usuarios;
SELECT 'Clientes migrados: ' || COUNT(*) FROM public.clientes;
SELECT 'Fornecedores migrados: ' || COUNT(*) FROM public.fornecedores;
SELECT 'Produtos migrados: ' || COUNT(*) FROM public.produtos;
SELECT 'Estoque por loja migrado: ' || COUNT(*) FROM public.estoque_lojas;
SELECT 'Vendas migradas: ' || COUNT(*) FROM public.vendas;
SELECT 'Itens de venda migrados: ' || COUNT(*) FROM public.itens_venda;
SELECT 'Pagamentos migrados: ' || COUNT(*) FROM public.pagamentos_venda;
SELECT 'Devoluções migradas: ' || COUNT(*) FROM public.devolucoes_venda;
SELECT 'Sangrias migradas: ' || COUNT(*) FROM public.sangrias_caixa;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
1. Este script assume que você tem acesso aos dois bancos simultaneamente
2. Substitua "public_antigo" pelo schema correto do banco antigo
3. Alguns dados podem requerer ajustes manuais após a migração
4. Tabelas não migradas (não existem correspondentes diretos):
   - caixa_aparelhos
   - caixa_aparelhos_movimentacoes
   - vendas_aparelhos
   - estoque_aparelhos
   - ordens (OS antigas)
   - rma (antigas)
   - transferencias (antigas)
   - logs (antigos)

5. Recomenda-se fazer backup completo antes de executar
6. Teste em ambiente de desenvolvimento primeiro
7. Após a migração, valide os dados críticos
*/
