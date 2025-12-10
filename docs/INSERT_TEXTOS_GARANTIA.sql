-- Inserir textos de garantia
INSERT INTO textos_garantia (tipo_servico, dias_garantia, titulo, clausulas) VALUES
(
  'servico_geral',
  90,
  'Garantia de servico: 90 dias',
  '[
    {"numero": 1, "texto": "A garantia so e valida mediante a apresentacao dessa ordem de servico/garantia."},
    {"numero": 2, "texto": "A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabecalho a partir da data da entrega do aparelho ao cliente."},
    {"numero": 3, "texto": "Esta garantia cobre defeitos de pecas e mao de obra decorrentes dos servicos realizados e/ou pecas substituidas pela AUTORIZADA CELL. Nao cobrimos garantia de terceiros."},
    {"numero": 4, "texto": "Defeitos causados por mau uso, quedas, contato com liquidos, umidade, oxidacao, surtos de energia, ou instalacao de software nao autorizado serao excluidos da garantia."},
    {"numero": 5, "texto": "Expirado o prazo da garantia, e apresentando esta ordem/garantia, podera ser aplicado um desconto em caso de reparo no equipamento;"},
    {"numero": 6, "texto": "O aparelho nao procurado em 90 (NOVENTA) dias apos a data de execucao da ordem de servico nao nos responsabilizamos mais pelo aparelho."},
    {"numero": 7, "texto": "Brindes nao estao sujeitos a garantia, e devem ser testados e conferidos no ato da entrega."},
    {"numero": 8, "texto": "Eu cliente, declaro ter ciencia do que foi descrito acima."}
  ]'::jsonb
),
(
  'troca_vidro',
  0,
  'Garantia troca de vidro: sem dias de garantia',
  '[
    {"numero": 1, "texto": "Esta garantia cobre defeitos de instalacao do novo vidro e defeitos de fabricacao do vidro substituido. A garantia se aplica apenas ao vidro frontal substituido e a sua instalacao."},
    {"numero": 2, "texto": "Esta excluido da garantia qualquer defeito relacionado ao funcionamento interno da tela/display, como problemas de touchscreen, comprometimento da imagem, como mancha, linha e facha."},
    {"numero": 3, "texto": "Novos danos ao vidro causados por quedas, impactos, pressao excessiva, ou contato com objetos pontiagudos estao automaticamente excluidos da garantia."},
    {"numero": 4, "texto": "Eu cliente, declaro ter ciencia do que foi descrito acima e que o servico citado se trata de um recondicionamento de tela que se encontrava quebrado por mau uso."}
  ]'::jsonb
),
(
  'troca_tampa',
  0,
  'Garantia de tampa: sem dias de garantia',
  '[
    {"numero": 1, "texto": "Esta garantia cobre defeitos de instalacao da nova tampa e defeitos de fabricacao da tampa substituida. A garantia se aplica apenas a tampa traseira substituida e a sua instalacao."},
    {"numero": 2, "texto": "Esta excluido da garantia qualquer defeito relacionado ao funcionamento interno."},
    {"numero": 3, "texto": "Novos danos na tampa causados por quedas, impactos, pressao excessiva, ou contato com objetos pontiagudos estao automaticamente excluidos da garantia."},
    {"numero": 4, "texto": "Eu cliente, declaro ter ciencia do que foi descrito acima e que o servico citado se trata de um recondicionamento de carcaca mais especifico de tampa traseira, que se encontrava quebrada por mau uso."}
  ]'::jsonb
),
(
  'venda_aparelho',
  180,
  'Garantia de aparelho: 6 meses 180 dias',
  '[
    {"numero": 1, "texto": "A garantia so e valida mediante a apresentacao dessa ordem de servico/garantia."},
    {"numero": 2, "texto": "A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabecalho a partir da data da entrega do aparelho ao cliente."},
    {"numero": 3, "texto": "Defeitos causados por mau uso, quedas, contato com liquidos, umidade, oxidacao, surtos de energia, ou instalacao de software nao autorizado serao excluidos da garantia."},
    {"numero": 4, "texto": "Brindes nao estao sujeitos a garantia, e devem ser testados e conferidos no ato da entrega."},
    {"numero": 5, "texto": "Eu cliente, declaro ter ciencia do que foi descrito acima."}
  ]'::jsonb
);
