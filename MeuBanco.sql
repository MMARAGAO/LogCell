
CREATE TABLE public.alertas_estoque_controle (
    id integer NOT NULL,
    produto_id uuid NOT NULL,
    loja_id integer NOT NULL,
    estado character varying(50) NOT NULL,
    quantidade_atual integer NOT NULL,
    quantidade_minima integer NOT NULL,
    ultimo_alerta_em timestamp with time zone DEFAULT now(),
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT estado_valido CHECK (((estado)::text = ANY ((ARRAY['baixo'::character varying, 'zerado'::character varying, 
'normal'::character varying])::text[])))
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.aparelhos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    imei character varying(50),
    numero_serie character varying(100),
    cor character varying(50),
    estado character varying(20) NOT NULL,
    condicao character varying(20),
    acessorios text,
    observacoes text,
    valor_compra numeric,
    valor_venda numeric,
    loja_id integer NOT NULL,
    status character varying(20) DEFAULT 'disponivel'::character varying NOT NULL,
    data_entrada timestamp with time zone DEFAULT now(),
    data_venda timestamp with time zone,
    venda_id uuid,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    atualizado_por uuid,
    marca character varying(100),
    modelo character varying(200),
    armazenamento character varying(50),
    memoria_ram character varying(50),
    exibir_catalogo boolean DEFAULT false,
    destaque boolean DEFAULT false,
    promocao boolean DEFAULT false,
    novidade boolean DEFAULT false,
    ordem_catalogo integer DEFAULT 0,
    CONSTRAINT aparelhos_condicao_check CHECK (((condicao)::text = ANY ((ARRAY['perfeito'::character varying, 'bom'::character 
varying, 'regular'::character varying, 'ruim'::character varying])::text[]))),
    CONSTRAINT aparelhos_estado_check CHECK (((estado)::text = ANY ((ARRAY['novo'::character varying, 'usado'::character varying, 
'seminovo'::character varying, 'recondicionado'::character varying])::text[]))),
    CONSTRAINT aparelhos_status_check CHECK (((status)::text = ANY ((ARRAY['disponivel'::character varying, 'vendido'::character 
varying, 'reservado'::character varying, 'defeito'::character varying, 'transferido'::character varying])::text[])))
CREATE TABLE public.audit_logs_deletions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tabela_nome character varying NOT NULL,
    registro_id uuid,
    dados_apagados jsonb NOT NULL,
    apagado_por uuid,
    criado_em timestamp with time zone DEFAULT now(),
    motivo text,
    usuario_nome character varying,
    numero_venda integer,
    valor_total numeric,
    cliente_id uuid,
    cliente_nome character varying
CREATE TABLE public.caixas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loja_id integer NOT NULL,
    usuario_abertura uuid NOT NULL,
    usuario_fechamento uuid,
    data_abertura timestamp with time zone DEFAULT now() NOT NULL,
    data_fechamento timestamp with time zone,
    saldo_inicial numeric DEFAULT 0 NOT NULL,
    saldo_final numeric,
    status character varying DEFAULT 'aberto'::character varying NOT NULL,
    observacoes_abertura text,
    observacoes_fechamento text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT caixas_status_check CHECK (((status)::text = ANY ((ARRAY['aberto'::character varying, 'fechado'::character 
varying])::text[])))
CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    doc character varying(14),
    data_nascimento date,
    telefone character varying(20),
    telefone_secundario character varying(20),
    email character varying(255),
    cep character varying(10),
    logradouro character varying(255),
    numero character varying(20),
    complemento character varying(100),
    bairro character varying(100),
    cidade character varying(100),
    estado character varying(2),
    observacoes text,
    ativo boolean DEFAULT true,
    id_loja integer,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid
CREATE TABLE public.configuracoes_usuario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    notificacoes_email boolean DEFAULT true,
    notificacoes_push boolean DEFAULT true,
    notificacoes_estoque boolean DEFAULT true,
    modo_escuro boolean DEFAULT false,
    tema character varying(50) DEFAULT 'default'::character varying,
    idioma character varying(10) DEFAULT 'pt-BR'::character varying,
    formato_data character varying(20) DEFAULT 'DD/MM/YYYY'::character varying,
    sessao_ativa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
CREATE TABLE public.creditos_cliente (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid NOT NULL,
    venda_origem_id uuid,
    devolucao_id uuid,
    valor_total numeric(10,2) NOT NULL,
    valor_utilizado numeric(10,2) DEFAULT 0,
    saldo numeric(10,2) NOT NULL,
    motivo text,
    gerado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    tipo character varying(20) DEFAULT 'adicao'::character varying,
    CONSTRAINT creditos_cliente_saldo_check CHECK ((saldo >= (0)::numeric)),
    CONSTRAINT creditos_cliente_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['adicao'::character varying, 'retirada'::character 
varying])::text[]))),
    CONSTRAINT creditos_cliente_valor_total_check CHECK ((valor_total <> (0)::numeric)),
    CONSTRAINT creditos_cliente_valor_utilizado_check CHECK ((valor_utilizado >= (0)::numeric))
CREATE TABLE public.debug_logs (
    id bigint NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    contexto text,
    mensagem text,
    dados jsonb
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.delete_context (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    criado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.descontos_venda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    tipo character varying(20) NOT NULL,
    valor numeric(10,2) NOT NULL,
    motivo text NOT NULL,
    aplicado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT descontos_venda_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['valor'::character varying, 'percentual'::character 
varying])::text[]))),
    CONSTRAINT descontos_venda_valor_check CHECK ((valor > (0)::numeric))
CREATE TABLE public.devolucoes_venda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    tipo character varying(20) NOT NULL,
    motivo text NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    realizado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    forma_pagamento character varying,
    CONSTRAINT devolucoes_venda_forma_pagamento_check CHECK (((forma_pagamento)::text = ANY ((ARRAY['dinheiro'::character varying, 
'pix'::character varying, 'debito'::character varying, 'credito'::character varying, 'credito_loja'::character varying])::text[]))),
    CONSTRAINT devolucoes_venda_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['com_credito'::character varying, 
'sem_credito'::character varying])::text[])))
CREATE TABLE public.estoque_lojas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_produto uuid NOT NULL,
    id_loja integer NOT NULL,
    quantidade integer DEFAULT 0 NOT NULL,
    atualizado_por uuid,
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT check_estoque_nao_negativo CHECK ((quantidade >= 0)),
    CONSTRAINT estoque_lojas_quantidade_check CHECK ((quantidade >= 0))
CREATE TABLE public.fornecedores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    cnpj character varying(18),
    telefone character varying(20),
    email character varying(255),
    endereco text,
    cidade character varying(100),
    estado character varying(2),
    cep character varying(9),
    contato_nome character varying(255),
    contato_telefone character varying(20),
    observacoes text,
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid
CREATE TABLE public.fotos_aparelhos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aparelho_id uuid NOT NULL,
    url text NOT NULL,
    nome_arquivo character varying NOT NULL,
    tamanho integer,
    ordem integer DEFAULT 0,
    is_principal boolean DEFAULT false,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.fotos_perfil (
    id integer NOT NULL,
    usuario_id uuid,
    url text NOT NULL,
    criado_em timestamp with time zone DEFAULT now()
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.fotos_produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    produto_id uuid,
    url text NOT NULL,
    nome_arquivo character varying(255) NOT NULL,
    tamanho integer,
    ordem integer DEFAULT 0,
    is_principal boolean DEFAULT false,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.fotos_rma (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rma_id uuid NOT NULL,
    url text NOT NULL,
    nome_arquivo character varying(255) NOT NULL,
    tamanho integer NOT NULL,
    criado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.historico_estoque (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_produto uuid NOT NULL,
    id_loja integer,
    usuario_id uuid,
    quantidade_anterior integer,
    quantidade_nova integer,
    quantidade_alterada integer,
    observacao text,
    criado_em timestamp with time zone DEFAULT now(),
    id_ordem_servico uuid,
    tipo_movimentacao character varying(50) DEFAULT 'ajuste'::character varying NOT NULL,
    motivo text,
    observacoes text,
    quantidade integer
CREATE TABLE public.historico_fornecedores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fornecedor_id uuid,
    operacao character varying(10) NOT NULL,
    dados_anteriores jsonb,
    dados_novos jsonb,
    usuario_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT historico_fornecedores_operacao_check CHECK (((operacao)::text = ANY ((ARRAY['INSERT'::character varying, 
'UPDATE'::character varying, 'DELETE'::character varying])::text[])))
CREATE TABLE public.historico_lojas (
    id integer NOT NULL,
    loja_id integer NOT NULL,
    usuario_id uuid,
    operacao character varying(10) NOT NULL,
    dados_antigos jsonb,
    dados_novos jsonb,
    campos_modificados text[],
    criado_em timestamp with time zone DEFAULT now()
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.historico_ordem_servico (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    tipo_evento character varying(50) NOT NULL,
    status_anterior character varying(50),
    status_novo character varying(50),
    descricao text NOT NULL,
    dados_anteriores jsonb,
    dados_novos jsonb,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    criado_por_nome character varying(255),
    CONSTRAINT historico_ordem_servico_tipo_evento_check CHECK (((tipo_evento)::text = ANY ((ARRAY['criacao'::character varying, 
'mudanca_status'::character varying, 'adicao_peca'::character varying, 'remocao_peca'::character varying, 
'atualizacao_valores'::character varying, 'observacao'::character varying, 'conclusao'::character varying, 'devolucao'::character 
varying, 'cancelamento'::character varying, 'lancamento_caixa'::character varying, 'atribuicao_tecnico'::character varying, 
'laudo_atualizado'::character varying, 'peca_adicionada'::character varying, 'peca_atualizada'::character varying])::text[])))
CREATE TABLE public.historico_produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    produto_id uuid NOT NULL,
    campo character varying(50) NOT NULL,
    valor_antigo text,
    valor_novo text,
    usuario_id uuid,
    data_alteracao timestamp with time zone DEFAULT now()
CREATE TABLE public.historico_rma (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rma_id uuid NOT NULL,
    tipo_acao character varying(30) NOT NULL,
    descricao text NOT NULL,
    dados_anteriores jsonb,
    dados_novos jsonb,
    criado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT historico_rma_tipo_acao_check CHECK (((tipo_acao)::text = ANY ((ARRAY['criacao'::character varying, 
'mudanca_status'::character varying, 'atualizacao'::character varying, 'adicao_foto'::character varying, 
'adicao_observacao'::character varying, 'movimentacao_estoque'::character varying])::text[])))
CREATE TABLE public.historico_usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    usuario_alterou_id uuid,
    campo_alterado character varying(100) NOT NULL,
    valor_anterior text,
    valor_novo text,
    tipo_operacao character varying(20) NOT NULL,
    data_alteracao timestamp with time zone DEFAULT now(),
    CONSTRAINT historico_usuarios_tipo_operacao_check CHECK (((tipo_operacao)::text = ANY ((ARRAY['INSERT'::character varying, 
'UPDATE'::character varying, 'DELETE'::character varying])::text[])))
CREATE TABLE public.historico_vendas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    tipo_acao character varying(50) NOT NULL,
    descricao text NOT NULL,
    usuario_id uuid,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT historico_vendas_tipo_acao_check CHECK (((tipo_acao)::text = ANY ((ARRAY['criacao'::character varying, 
'adicao_item'::character varying, 'remocao_item'::character varying, 'pagamento'::character varying, 'edicao_pagamento'::character 
varying, 'desconto'::character varying, 'devolucao'::character varying, 'finalizacao'::character varying, 'cancelamento'::character 
varying, 'edicao'::character varying, 'exclusao'::character varying])::text[])))
CREATE TABLE public.itens_devolucao (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    devolucao_id uuid NOT NULL,
    item_venda_id uuid NOT NULL,
    quantidade integer NOT NULL,
    motivo text,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT itens_devolucao_quantidade_check CHECK ((quantidade > 0))
CREATE TABLE public.itens_venda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    produto_nome character varying(255) NOT NULL,
    produto_codigo character varying(100) NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    devolvido integer DEFAULT 0 NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    desconto_tipo character varying(20),
    desconto_valor numeric(10,2) DEFAULT 0,
    valor_desconto numeric(10,2) DEFAULT 0,
    CONSTRAINT itens_venda_desconto_tipo_check CHECK (((desconto_tipo)::text = ANY ((ARRAY['valor'::character varying, 
'porcentagem'::character varying])::text[]))),
    CONSTRAINT itens_venda_devolvido_check CHECK ((devolvido >= 0)),
    CONSTRAINT itens_venda_quantidade_check CHECK ((quantidade > 0))
CREATE TABLE public.lojas (
    id integer NOT NULL,
    nome text NOT NULL,
    cnpj character varying(18),
    telefone text,
    email text,
    endereco text,
    cidade text,
    estado character varying(2),
    cep character varying(9),
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.lojas_fotos (
    id integer NOT NULL,
    loja_id integer NOT NULL,
    url text NOT NULL,
    legenda text,
    ordem integer DEFAULT 0,
    is_principal boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.metas_usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    loja_id integer,
    meta_mensal_vendas numeric DEFAULT 10000,
    meta_mensal_os integer DEFAULT 0,
    dias_uteis_mes integer DEFAULT 26,
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid
CREATE TABLE public.notificacoes (
    id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    titulo character varying(255) NOT NULL,
    mensagem text NOT NULL,
    produto_id uuid,
    loja_id integer,
    dados_extras jsonb,
    criado_em timestamp with time zone DEFAULT now(),
    expira_em timestamp with time zone,
    CONSTRAINT tipo_valido CHECK (((tipo)::text = ANY ((ARRAY['estoque_baixo'::character varying, 'estoque_zerado'::character varying, 
'estoque_reposto'::character varying, 'sistema'::character varying, 'produto_inativo'::character varying])::text[])))
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.notificacoes_usuarios (
    id integer NOT NULL,
    notificacao_id integer NOT NULL,
    usuario_id uuid NOT NULL,
    lida boolean DEFAULT false,
    lida_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now()
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.ordem_servico (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    numero_os integer NOT NULL,
    cliente_nome character varying(255) NOT NULL,
    cliente_telefone character varying(20),
    cliente_email character varying(255),
    cliente_cpf_cnpj character varying(20),
    cliente_endereco text,
    equipamento_tipo character varying(100) NOT NULL,
    equipamento_marca character varying(100),
    equipamento_modelo character varying(100),
    equipamento_numero_serie character varying(100),
    equipamento_senha character varying(100),
    defeito_reclamado text NOT NULL,
    estado_equipamento text,
    acessorios_entregues text,
    diagnostico text,
    servico_realizado text,
    observacoes_tecnicas text,
    valor_orcamento numeric(10,2),
    valor_desconto numeric(10,2) DEFAULT 0,
    valor_total numeric(10,2),
    valor_pago numeric(10,2) DEFAULT 0,
    data_entrada timestamp with time zone DEFAULT now() NOT NULL,
    previsao_entrega timestamp with time zone,
    data_inicio_servico timestamp with time zone,
    data_conclusao timestamp with time zone,
    data_entrega_cliente timestamp with time zone,
    status character varying(50) DEFAULT 'aguardando'::character varying NOT NULL,
    prioridade character varying(20) DEFAULT 'normal'::character varying,
    id_loja integer NOT NULL,
    tecnico_responsavel uuid,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid,
    laudo_diagnostico text,
    laudo_causa text,
    laudo_procedimentos text,
    laudo_recomendacoes text,
    laudo_garantia_dias integer DEFAULT 90,
    laudo_condicao_final text,
    tipo_cliente character varying(20) DEFAULT 'consumidor_final'::character varying,
    tipo_garantia character varying(50) DEFAULT 'servico_geral'::character varying,
    CONSTRAINT ordem_servico_status_check CHECK (((status)::text = ANY ((ARRAY['aguardando'::character varying, 'aprovado'::character 
varying, 'em_diagnostico'::character varying, 'em_andamento'::character varying, 'aguardando_peca'::character varying, 
'concluido'::character varying, 'entregue'::character varying, 'devolvida'::character varying, 'cancelado'::character varying, 
'garantia'::character varying])::text[])))
CREATE TABLE public.ordem_servico_anexos (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    tipo character varying(50) NOT NULL,
    descricao text,
    url_arquivo text NOT NULL,
    nome_arquivo character varying(255),
    tamanho_arquivo integer,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid
CREATE TABLE public.ordem_servico_caixa (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    id_loja integer NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    valor_pecas numeric(10,2) DEFAULT 0,
    valor_servico numeric(10,2) DEFAULT 0,
    valor_desconto numeric(10,2) DEFAULT 0,
    forma_pagamento character varying(50),
    parcelas integer DEFAULT 1,
    status_caixa character varying(20) DEFAULT 'pendente'::character varying,
    data_confirmacao timestamp with time zone,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    confirmado_por uuid
CREATE TABLE public.ordem_servico_fotos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    url text NOT NULL,
    ordem integer DEFAULT 0,
    is_principal boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.ordem_servico_pagamentos (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    data_pagamento date NOT NULL,
    valor numeric(10,2) NOT NULL,
    forma_pagamento character varying(50) NOT NULL,
    observacao text,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    CONSTRAINT ordem_servico_pagamentos_valor_check CHECK ((valor > (0)::numeric)),
    CONSTRAINT valid_forma_pagamento CHECK (((forma_pagamento)::text = ANY ((ARRAY['dinheiro'::character varying, 
'cartao_credito'::character varying, 'cartao_debito'::character varying, 'pix'::character varying, 'transferencia'::character varying, 
'cheque'::character varying])::text[])))
CREATE TABLE public.ordem_servico_pecas (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    id_ordem_servico uuid NOT NULL,
    id_produto uuid,
    id_loja integer NOT NULL,
    tipo_produto character varying(20) DEFAULT 'estoque'::character varying NOT NULL,
    descricao_peca character varying(255) NOT NULL,
    quantidade integer NOT NULL,
    valor_custo numeric(10,2) NOT NULL,
    valor_venda numeric(10,2) NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    estoque_reservado boolean DEFAULT false,
    estoque_baixado boolean DEFAULT false,
    data_reserva_estoque timestamp with time zone,
    data_baixa_estoque timestamp with time zone,
    observacao text,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    CONSTRAINT ordem_servico_pecas_quantidade_check CHECK ((quantidade > 0))
CREATE TABLE public.pagamentos_venda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    tipo_pagamento character varying(50) NOT NULL,
    valor numeric(10,2) NOT NULL,
    data_pagamento date NOT NULL,
    editado boolean DEFAULT false,
    editado_em timestamp with time zone,
    editado_por uuid,
    criado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    CONSTRAINT pagamentos_venda_tipo_pagamento_check CHECK (((tipo_pagamento)::text = ANY ((ARRAY['dinheiro'::character varying, 
'pix'::character varying, 'cartao_credito'::character varying, 'cartao_debito'::character varying, 'transferencia'::character varying, 
'boleto'::character varying, 'credito_cliente'::character varying])::text[]))),
    CONSTRAINT pagamentos_venda_valor_check CHECK ((valor > (0)::numeric))
CREATE TABLE public.permissoes (
    id integer NOT NULL,
    usuario_id uuid,
    permissoes jsonb DEFAULT '{}'::jsonb NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    loja_id integer,
    todas_lojas boolean DEFAULT false,
    CONSTRAINT check_loja_ou_todas CHECK ((NOT ((loja_id IS NOT NULL) AND (todas_lojas = true))))
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    descricao text NOT NULL,
    modelos character varying(255),
    marca character varying(255),
    preco_compra numeric(10,2),
    preco_venda numeric(10,2),
    quantidade_minima integer DEFAULT 0,
    ativo boolean DEFAULT true,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    atualizado_por uuid,
    grupo character varying(100),
    categoria character varying(100),
    codigo_fabricante character varying(100),
    exibir_catalogo boolean DEFAULT false,
    destaque boolean DEFAULT false,
    promocao boolean DEFAULT false,
    novidade boolean DEFAULT false,
    ordem_catalogo integer DEFAULT 0
CREATE TABLE public.produtos_fornecedores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    produto_id uuid NOT NULL,
    fornecedor_id uuid NOT NULL,
    preco_custo numeric(10,2),
    prazo_entrega_dias integer,
    observacoes text,
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid
CREATE TABLE public.quebra_pecas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_ordem_servico uuid,
    id_produto uuid,
    id_loja integer,
    quantidade integer NOT NULL,
    tipo_ocorrencia character varying(50) DEFAULT 'quebra'::character varying NOT NULL,
    motivo text NOT NULL,
    responsavel character varying(50),
    valor_unitario numeric(10,2),
    valor_total numeric(10,2) GENERATED ALWAYS AS (((quantidade)::numeric * valor_unitario)) STORED,
    descontar_tecnico boolean DEFAULT false,
    valor_descontado numeric(10,2) DEFAULT 0,
    observacao_compensacao text,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    criado_por uuid,
    aprovado boolean DEFAULT false,
    aprovado_em timestamp with time zone,
    aprovado_por uuid,
    observacao_aprovacao text,
    produto_descricao text,
    CONSTRAINT quebra_pecas_quantidade_check CHECK ((quantidade > 0))
CREATE TABLE public.rmas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero_rma character varying(50) NOT NULL,
    tipo_origem character varying(20) NOT NULL,
    tipo_rma character varying(30) NOT NULL,
    status character varying(20) DEFAULT 'pendente'::character varying NOT NULL,
    produto_id uuid NOT NULL,
    loja_id integer NOT NULL,
    cliente_id uuid,
    fornecedor_id uuid,
    criado_por uuid NOT NULL,
    quantidade integer NOT NULL,
    motivo text NOT NULL,
    observacoes_assistencia text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT rmas_quantidade_check CHECK ((quantidade > 0)),
    CONSTRAINT rmas_status_check CHECK (((status)::text = ANY ((ARRAY['pendente'::character varying, 'em_analise'::character varying, 
'aprovado'::character varying, 'reprovado'::character varying, 'em_transito'::character varying, 'recebido'::character varying, 
'concluido'::character varying, 'cancelado'::character varying])::text[]))),
    CONSTRAINT rmas_tipo_origem_check CHECK (((tipo_origem)::text = ANY ((ARRAY['interno_fornecedor'::character varying, 
'cliente'::character varying])::text[]))),
    CONSTRAINT rmas_tipo_rma_check CHECK (((tipo_rma)::text = ANY ((ARRAY['defeito_fabrica'::character varying, 
'dano_transporte'::character varying, 'produto_errado'::character varying, 'nao_funciona'::character varying, 
'arrependimento'::character varying, 'garantia'::character varying, 'outro'::character varying])::text[])))
CREATE TABLE public.sangrias_caixa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    caixa_id uuid NOT NULL,
    valor numeric(10,2) NOT NULL,
    motivo text NOT NULL,
    realizado_por uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    venda_id uuid,
    CONSTRAINT sangrias_caixa_valor_check CHECK ((valor > (0)::numeric))
CREATE TABLE public.tecnicos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    cpf character varying(14),
    rg character varying(20),
    data_nascimento date,
    telefone character varying(20) NOT NULL,
    email character varying(255),
    especialidades text[],
    registro_profissional character varying(50),
    data_admissao date,
    data_demissao date,
    cor_agenda character varying(7) DEFAULT '#3b82f6'::character varying,
    ativo boolean DEFAULT true,
    usuario_id uuid,
    id_loja integer,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_por uuid,
    atualizado_por uuid
CREATE TABLE public.textos_garantia (
    id integer NOT NULL,
    tipo_servico character varying(50) NOT NULL,
    dias_garantia integer DEFAULT 0 NOT NULL,
    titulo text NOT NULL,
    clausulas jsonb NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.transferencias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loja_origem_id integer NOT NULL,
    loja_destino_id integer NOT NULL,
    usuario_id uuid NOT NULL,
    status character varying DEFAULT 'pendente'::character varying NOT NULL,
    observacao text,
    criado_em timestamp with time zone DEFAULT now(),
    confirmado_em timestamp with time zone,
    confirmado_por uuid,
    cancelado_em timestamp with time zone,
    cancelado_por uuid,
    motivo_cancelamento text,
    CONSTRAINT transferencias_lojas_diferentes CHECK ((loja_origem_id <> loja_destino_id)),
    CONSTRAINT transferencias_status_check CHECK (((status)::text = ANY (ARRAY[('pendente'::character varying)::text, 
('confirmada'::character varying)::text, ('cancelada'::character varying)::text])))
CREATE TABLE public.transferencias_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transferencia_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    quantidade integer NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    CONSTRAINT transferencias_itens_quantidade_check CHECK ((quantidade > 0))
CREATE TABLE public.trocas_produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid NOT NULL,
    item_venda_id uuid NOT NULL,
    produto_antigo_id uuid NOT NULL,
    produto_antigo_nome text NOT NULL,
    produto_antigo_preco numeric(10,2) NOT NULL,
    quantidade_trocada integer NOT NULL,
    produto_novo_id uuid NOT NULL,
    produto_novo_nome text NOT NULL,
    produto_novo_preco numeric(10,2) NOT NULL,
    diferenca_valor numeric(10,2) NOT NULL,
    loja_id integer NOT NULL,
    usuario_id uuid,
    observacao text,
    criado_em timestamp with time zone DEFAULT now(),
    tipo_reembolso character varying,
    forma_pagamento_reembolso character varying,
    CONSTRAINT quantidade_trocada_positiva CHECK ((quantidade_trocada > 0)),
    CONSTRAINT trocas_produtos_forma_pagamento_reembolso_check CHECK (((forma_pagamento_reembolso IS NULL) OR 
((forma_pagamento_reembolso)::text = ANY ((ARRAY['dinheiro'::character varying, 'pix'::character varying, 'transferencia'::character 
varying, 'cartao_debito'::character varying, 'cartao_credito'::character varying])::text[])))),
    CONSTRAINT trocas_produtos_tipo_reembolso_check CHECK (((tipo_reembolso IS NULL) OR ((tipo_reembolso)::text = ANY 
((ARRAY['credito'::character varying, 'manual'::character varying])::text[]))))
CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    telefone text,
    cpf character varying(14),
    ativo boolean DEFAULT true,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
CREATE TABLE public.vendas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid NOT NULL,
    loja_id integer NOT NULL,
    vendedor_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    tipo character varying(20) NOT NULL,
    data_prevista_pagamento date,
    valor_total numeric(10,2) DEFAULT 0 NOT NULL,
    valor_pago numeric(10,2) DEFAULT 0 NOT NULL,
    valor_desconto numeric(10,2) DEFAULT 0 NOT NULL,
    saldo_devedor numeric(10,2) DEFAULT 0 NOT NULL,
    criado_em timestamp with time zone DEFAULT now(),
    finalizado_em timestamp with time zone,
    finalizado_por uuid,
    cancelado_em timestamp with time zone,
    cancelado_por uuid,
    motivo_cancelamento text,
    numero_venda integer,
    CONSTRAINT vendas_status_check CHECK (((status)::text = ANY ((ARRAY['em_andamento'::character varying, 'concluida'::character 
varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT vendas_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['normal'::character varying, 'fiada'::character 
varying])::text[])))
    ADD CONSTRAINT alertas_estoque_controle_pkey PRIMARY KEY (id);
    ADD CONSTRAINT alertas_estoque_controle_produto_id_loja_id_key UNIQUE (produto_id, loja_id);
    ADD CONSTRAINT aparelhos_imei_key UNIQUE (imei);
    ADD CONSTRAINT aparelhos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT audit_logs_deletions_pkey PRIMARY KEY (id);
    ADD CONSTRAINT caixas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT clientes_doc_key UNIQUE (doc);
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);
    ADD CONSTRAINT configuracoes_usuario_pkey PRIMARY KEY (id);
    ADD CONSTRAINT configuracoes_usuario_usuario_id_key UNIQUE (usuario_id);
    ADD CONSTRAINT creditos_cliente_pkey PRIMARY KEY (id);
    ADD CONSTRAINT debug_logs_pkey PRIMARY KEY (id);
    ADD CONSTRAINT delete_context_pkey PRIMARY KEY (id);
    ADD CONSTRAINT descontos_venda_pkey PRIMARY KEY (id);
    ADD CONSTRAINT devolucoes_venda_pkey PRIMARY KEY (id);
    ADD CONSTRAINT estoque_lojas_id_produto_id_loja_key UNIQUE (id_produto, id_loja);
    ADD CONSTRAINT estoque_lojas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT fornecedores_cnpj_key UNIQUE (cnpj);
    ADD CONSTRAINT fornecedores_pkey PRIMARY KEY (id);
    ADD CONSTRAINT fotos_aparelhos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT fotos_perfil_pkey PRIMARY KEY (id);
    ADD CONSTRAINT fotos_produtos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT fotos_rma_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_estoque_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_fornecedores_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_lojas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_ordem_servico_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_produtos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_rma_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_usuarios_pkey PRIMARY KEY (id);
    ADD CONSTRAINT historico_vendas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT itens_devolucao_pkey PRIMARY KEY (id);
    ADD CONSTRAINT itens_venda_pkey PRIMARY KEY (id);
    ADD CONSTRAINT lojas_cnpj_unique UNIQUE (cnpj);
    ADD CONSTRAINT lojas_fotos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT lojas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT metas_usuarios_pkey PRIMARY KEY (id);
    ADD CONSTRAINT metas_usuarios_unico UNIQUE (usuario_id, loja_id);
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);
    ADD CONSTRAINT notificacoes_usuarios_notificacao_id_usuario_id_key UNIQUE (notificacao_id, usuario_id);
    ADD CONSTRAINT notificacoes_usuarios_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_anexos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_caixa_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_fotos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_numero_os_key UNIQUE (numero_os);
    ADD CONSTRAINT ordem_servico_pagamentos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_pecas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT ordem_servico_pkey PRIMARY KEY (id);
    ADD CONSTRAINT pagamentos_venda_pkey PRIMARY KEY (id);
    ADD CONSTRAINT permissoes_pkey PRIMARY KEY (id);
    ADD CONSTRAINT permissoes_usuario_id_unique UNIQUE (usuario_id);
    ADD CONSTRAINT produtos_fornecedores_pkey PRIMARY KEY (id);
    ADD CONSTRAINT produtos_fornecedores_produto_id_fornecedor_id_key UNIQUE (produto_id, fornecedor_id);
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT quebra_pecas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT rmas_numero_rma_key UNIQUE (numero_rma);
    ADD CONSTRAINT rmas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT sangrias_caixa_pkey PRIMARY KEY (id);
    ADD CONSTRAINT tecnicos_cpf_key UNIQUE (cpf);
    ADD CONSTRAINT tecnicos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT tecnicos_usuario_id_key UNIQUE (usuario_id);
    ADD CONSTRAINT textos_garantia_pkey PRIMARY KEY (id);
    ADD CONSTRAINT textos_garantia_tipo_servico_key UNIQUE (tipo_servico);
    ADD CONSTRAINT transferencias_itens_pkey PRIMARY KEY (id);
    ADD CONSTRAINT transferencias_pkey PRIMARY KEY (id);
    ADD CONSTRAINT trocas_produtos_pkey PRIMARY KEY (id);
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);
    ADD CONSTRAINT alertas_estoque_controle_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;
    ADD CONSTRAINT alertas_estoque_controle_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT aparelhos_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT aparelhos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT aparelhos_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT aparelhos_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id);
    ADD CONSTRAINT caixas_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT caixas_usuario_abertura_fkey FOREIGN KEY (usuario_abertura) REFERENCES public.usuarios(id);
    ADD CONSTRAINT caixas_usuario_fechamento_fkey FOREIGN KEY (usuario_fechamento) REFERENCES public.usuarios(id);
    ADD CONSTRAINT clientes_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT creditos_cliente_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);
    ADD CONSTRAINT creditos_cliente_devolucao_id_fkey FOREIGN KEY (devolucao_id) REFERENCES public.devolucoes_venda(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT creditos_cliente_gerado_por_fkey FOREIGN KEY (gerado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT creditos_cliente_venda_origem_id_fkey FOREIGN KEY (venda_origem_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT descontos_venda_aplicado_por_fkey FOREIGN KEY (aplicado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT descontos_venda_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT devolucoes_venda_realizado_por_fkey FOREIGN KEY (realizado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT devolucoes_venda_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT estoque_lojas_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT estoque_lojas_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE CASCADE;
    ADD CONSTRAINT estoque_lojas_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT fk_loja FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;
    ADD CONSTRAINT fk_loja FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    ADD CONSTRAINT fornecedores_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT fornecedores_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT fotos_aparelhos_aparelho_id_fkey FOREIGN KEY (aparelho_id) REFERENCES public.aparelhos(id) ON DELETE CASCADE;
    ADD CONSTRAINT fotos_aparelhos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT fotos_produtos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT fotos_produtos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT fotos_rma_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE RESTRICT;
    ADD CONSTRAINT fotos_rma_rma_id_fkey FOREIGN KEY (rma_id) REFERENCES public.rmas(id) ON DELETE CASCADE;
    ADD CONSTRAINT historico_estoque_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE SET NULL;
    ADD CONSTRAINT historico_estoque_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE SET NULL;
    ADD CONSTRAINT historico_estoque_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT historico_estoque_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);
    ADD CONSTRAINT historico_fornecedores_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT historico_fornecedores_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);
    ADD CONSTRAINT historico_ordem_servico_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT historico_ordem_servico_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT historico_produtos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT historico_produtos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);
    ADD CONSTRAINT historico_rma_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE RESTRICT;
    ADD CONSTRAINT historico_rma_rma_id_fkey FOREIGN KEY (rma_id) REFERENCES public.rmas(id) ON DELETE CASCADE;
    ADD CONSTRAINT historico_usuarios_usuario_alterou_id_fkey FOREIGN KEY (usuario_alterou_id) REFERENCES public.usuarios(id) ON 
DELETE SET NULL;
    ADD CONSTRAINT historico_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    ADD CONSTRAINT historico_vendas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);
    ADD CONSTRAINT historico_vendas_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT itens_devolucao_devolucao_id_fkey FOREIGN KEY (devolucao_id) REFERENCES public.devolucoes_venda(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT itens_devolucao_item_venda_id_fkey FOREIGN KEY (item_venda_id) REFERENCES public.itens_venda(id) ON DELETE CASCADE;
    ADD CONSTRAINT itens_venda_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);
    ADD CONSTRAINT itens_venda_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT metas_usuarios_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT metas_usuarios_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT metas_usuarios_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT metas_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    ADD CONSTRAINT notificacoes_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;
    ADD CONSTRAINT notificacoes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT notificacoes_usuarios_notificacao_id_fkey FOREIGN KEY (notificacao_id) REFERENCES public.notificacoes(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT notificacoes_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_anexos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT ordem_servico_anexos_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_caixa_confirmado_por_fkey FOREIGN KEY (confirmado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT ordem_servico_caixa_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT ordem_servico_caixa_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT ordem_servico_caixa_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_fotos_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT ordem_servico_pagamentos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT ordem_servico_pagamentos_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) 
ON DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_pecas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT ordem_servico_pecas_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT ordem_servico_pecas_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT ordem_servico_pecas_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id) ON DELETE RESTRICT;
    ADD CONSTRAINT pagamentos_venda_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT pagamentos_venda_editado_por_fkey FOREIGN KEY (editado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT pagamentos_venda_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT permissoes_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE SET NULL;
    ADD CONSTRAINT permissoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    ADD CONSTRAINT produtos_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT produtos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT produtos_fornecedores_atualizado_por_fkey FOREIGN KEY (atualizado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT produtos_fornecedores_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT produtos_fornecedores_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT produtos_fornecedores_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
    ADD CONSTRAINT quebra_pecas_aprovado_por_fkey FOREIGN KEY (aprovado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT quebra_pecas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id);
    ADD CONSTRAINT quebra_pecas_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT quebra_pecas_id_ordem_servico_fkey FOREIGN KEY (id_ordem_servico) REFERENCES public.ordem_servico(id) ON DELETE 
CASCADE;
    ADD CONSTRAINT quebra_pecas_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id) ON DELETE RESTRICT;
    ADD CONSTRAINT rmas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;
    ADD CONSTRAINT rmas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE RESTRICT;
    ADD CONSTRAINT rmas_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE RESTRICT;
    ADD CONSTRAINT rmas_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT rmas_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE RESTRICT;
    ADD CONSTRAINT sangrias_caixa_caixa_id_fkey FOREIGN KEY (caixa_id) REFERENCES public.caixas(id) ON DELETE CASCADE;
    ADD CONSTRAINT sangrias_caixa_realizado_por_fkey FOREIGN KEY (realizado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT sangrias_caixa_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT tecnicos_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE RESTRICT;
    ADD CONSTRAINT transferencias_cancelado_por_fkey FOREIGN KEY (cancelado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT transferencias_confirmado_por_fkey FOREIGN KEY (confirmado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT transferencias_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);
    ADD CONSTRAINT transferencias_itens_transferencia_id_fkey FOREIGN KEY (transferencia_id) REFERENCES public.transferencias(id) ON 
DELETE CASCADE;
    ADD CONSTRAINT transferencias_loja_destino_id_fkey FOREIGN KEY (loja_destino_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT transferencias_loja_origem_id_fkey FOREIGN KEY (loja_origem_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT transferencias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);
    ADD CONSTRAINT trocas_produtos_item_venda_id_fkey FOREIGN KEY (item_venda_id) REFERENCES public.itens_venda(id) ON DELETE CASCADE;
    ADD CONSTRAINT trocas_produtos_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT trocas_produtos_produto_antigo_id_fkey FOREIGN KEY (produto_antigo_id) REFERENCES public.produtos(id);
    ADD CONSTRAINT trocas_produtos_produto_novo_id_fkey FOREIGN KEY (produto_novo_id) REFERENCES public.produtos(id);
    ADD CONSTRAINT trocas_produtos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);
    ADD CONSTRAINT trocas_produtos_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
    ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    ADD CONSTRAINT vendas_cancelado_por_fkey FOREIGN KEY (cancelado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);
    ADD CONSTRAINT vendas_finalizado_por_fkey FOREIGN KEY (finalizado_por) REFERENCES public.usuarios(id);
    ADD CONSTRAINT vendas_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id);
    ADD CONSTRAINT vendas_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id);


