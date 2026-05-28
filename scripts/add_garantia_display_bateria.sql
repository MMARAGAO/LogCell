-- Adiciona textos de garantia para display e bateria
-- Display
INSERT INTO textos_garantia (tipo_servico, dias_garantia, titulo, clausulas, ativo)
SELECT 'display', 90, 'Garantia – Display', jsonb_build_array(
  jsonb_build_object('numero', 1, 'texto', 'A garantia cobre exclusivamente defeitos relacionados ao serviço executado e ao funcionamento da peça instalada, incluindo: mau funcionamento do touch; descolamento da peça substituída.'),
  jsonb_build_object('numero', 2, 'texto', 'A garantia não cobre: tela quebrada, trincada ou rachada; linhas, manchas ou danos ocasionados por quedas, impactos ou pressão; marcas de mau uso; contato com líquidos ou sinais de oxidação; qualquer dano físico identificado após a entrega do aparelho.'),
  jsonb_build_object('numero', 3, 'texto', 'A peça passará por análise técnica para verificação da origem do problema e validação da garantia.'),
  jsonb_build_object('numero', 4, 'texto', 'Observação: A garantia é válida somente para defeitos relacionados à instalação e funcionamento da peça substituída.')
)
WHERE NOT EXISTS (SELECT 1 FROM textos_garantia WHERE tipo_servico = 'display');

-- Bateria
INSERT INTO textos_garantia (tipo_servico, dias_garantia, titulo, clausulas, ativo)
SELECT 'bateria', 90, 'Garantia – Bateria', jsonb_build_array(
  jsonb_build_object('numero', 1, 'texto', 'A garantia da bateria cobre exclusivamente defeitos de funcionamento da peça instalada, como: desempenho abaixo do esperado; falha de carregamento; descarga anormal; problemas relacionados à durabilidade e funcionamento da bateria.'),
  jsonb_build_object('numero', 2, 'texto', 'A garantia não cobre danos ocasionados por: contato com líquidos ou oxidação; quedas, impactos ou danos físicos; uso de carregadores inadequados; mau uso do aparelho; problemas originados em outros componentes do aparelho.'),
  jsonb_build_object('numero', 3, 'texto', 'A avaliação técnica será realizada para verificar a origem do problema antes da aplicação da garantia.')
)
WHERE NOT EXISTS (SELECT 1 FROM textos_garantia WHERE tipo_servico = 'bateria');

-- Atualiza texto de troca de vidro (já existe, só atualiza se quiser)
UPDATE textos_garantia SET
  dias_garantia = 0,
  titulo = 'Garantia – Troca de Vidro (Recondicionamento)',
  clausulas = jsonb_build_array(
    jsonb_build_object('numero', 1, 'texto', 'Observação: Este serviço não possui garantia contra quebra.'),
    jsonb_build_object('numero', 2, 'texto', 'A substituição do vidro consiste apenas no recondicionamento da tela original do aparelho, mantendo o display original. Não há cobertura para danos decorrentes de quedas, impactos, pressão excessiva, torções ou qualquer outro tipo de mau uso que resulte em quebra ou danos ao vidro.'),
    jsonb_build_object('numero', 3, 'texto', 'A garantia cobre exclusivamente defeitos relacionados ao serviço executado, tais como: descolamento do vidro; formação anormal de bolhas decorrentes da aplicação do serviço.'),
    jsonb_build_object('numero', 4, 'texto', 'Não estão inclusos danos causados após a retirada do aparelho da assistência.')
  ),
  atualizado_em = now()
WHERE tipo_servico = 'troca_vidro';

-- Atualiza texto de troca de tampa
UPDATE textos_garantia SET
  dias_garantia = 0,
  titulo = 'Garantia – Troca de Tampa Traseira',
  clausulas = jsonb_build_array(
    jsonb_build_object('numero', 1, 'texto', 'Observação: Este serviço não possui garantia contra quebra.'),
    jsonb_build_object('numero', 2, 'texto', 'A tampa traseira é uma peça de vidro e está sujeita a danos por quedas, impactos, pressão excessiva, torções ou outros fatores externos relacionados ao uso do aparelho.'),
    jsonb_build_object('numero', 3, 'texto', 'A garantia cobre exclusivamente defeitos relacionados à instalação realizada pela assistência, como: descolamento da tampa instalada.'),
    jsonb_build_object('numero', 4, 'texto', 'Não cobre quebras, riscos, trincas ou danos ocasionados por uso inadequado após a entrega do aparelho.')
  ),
  atualizado_em = now()
WHERE tipo_servico = 'troca_tampa';
