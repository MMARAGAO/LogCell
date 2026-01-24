-- Migration: suporte a múltiplos aparelhos por OS
-- Cria tabelas separadas para aparelhos e serviços vinculados a uma OS

-- Tabela de aparelhos por OS
create table if not exists ordem_servico_aparelhos (
  id uuid primary key default gen_random_uuid(),
  id_ordem_servico uuid not null references ordem_servico(id) on delete cascade,
  id_loja integer not null references lojas(id) on delete cascade,
  sequencia integer not null,
  equipamento_tipo text not null,
  equipamento_marca text,
  equipamento_modelo text,
  equipamento_numero_serie text,
  equipamento_imei text,
  equipamento_senha text,
  defeito_reclamado text,
  estado_equipamento text,
  acessorios_entregues text,
  diagnostico text,
  servico_realizado text,
  laudo_diagnostico text,
  laudo_causa text,
  laudo_procedimentos text,
  laudo_recomendacoes text,
  laudo_garantia_dias integer,
  laudo_condicao_final text,
  observacoes_tecnicas text,
  valor_orcamento numeric(12,2),
  valor_desconto numeric(12,2),
  valor_total numeric(12,2),
  valor_pago numeric(12,2),
  status text default 'ativo',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  criado_por uuid,
  atualizado_por uuid
);

create index if not exists idx_os_aparelhos_os on ordem_servico_aparelhos (id_ordem_servico);
create index if not exists idx_os_aparelhos_loja on ordem_servico_aparelhos (id_loja);

-- Tabela de serviços por aparelho
create table if not exists ordem_servico_aparelhos_servicos (
  id uuid primary key default gen_random_uuid(),
  id_aparelho uuid not null references ordem_servico_aparelhos(id) on delete cascade,
  descricao text not null,
  valor numeric(12,2) default 0,
  status text default 'ativo',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  criado_por uuid,
  atualizado_por uuid
);

create index if not exists idx_os_aparelhos_servicos_aparelho on ordem_servico_aparelhos_servicos (id_aparelho);

-- Observação: compatível com ordens já existentes; dados antigos permanecem na tabela ordem_servico.
