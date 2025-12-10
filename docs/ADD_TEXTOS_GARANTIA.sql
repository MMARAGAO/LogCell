-- Tabela para armazenar os textos de garantia das ordens de serviço
CREATE TABLE IF NOT EXISTS textos_garantia (
  id SERIAL PRIMARY KEY,
  tipo_servico VARCHAR(50) NOT NULL UNIQUE,
  dias_garantia INTEGER NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  clausulas JSONB NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE textos_garantia IS 'Armazena os textos de garantia para diferentes tipos de serviços';
COMMENT ON COLUMN textos_garantia.tipo_servico IS 'Tipo do serviço: servico_geral, troca_vidro, troca_tampa, venda_aparelho';
COMMENT ON COLUMN textos_garantia.dias_garantia IS 'Quantidade de dias de garantia';
COMMENT ON COLUMN textos_garantia.titulo IS 'Título que aparece no cabeçalho da garantia';
COMMENT ON COLUMN textos_garantia.clausulas IS 'Array JSON com as cláusulas da garantia';

-- Inserir os textos de garantia
INSERT INTO textos_garantia (tipo_servico, dias_garantia, titulo, clausulas) VALUES
(
  'servico_geral',
  90,
  'Garantia de serviço: 90 dias 👆🏻',
  '[
    {"numero": 1, "texto": "A garantia só é válida mediante a apresentação dessa ordem de serviço/garantia."},
    {"numero": 2, "texto": "A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabeçalho a partir da data da entrega do aparelho ao cliente."},
    {"numero": 3, "texto": "Esta garantia cobre defeitos de peças e mão de obra decorrentes dos serviços realizados e/ou peças substituídas pela AUTORIZADA CELL. Não cobrimos garantia de terceiros."},
    {"numero": 4, "texto": "Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, surtos de energia, ou instalação de software não autorizado serão excluídos da garantia."},
    {"numero": 5, "texto": "Expirado o prazo da garantia, e apresentando esta ordem/garantia, poderá ser aplicado um desconto em caso de reparo no equipamento;"},
    {"numero": 6, "texto": "O aparelho não procurado em 90 (NOVENTA) dias após a data de execução da ordem de serviço não nos responsabilizamos mais pelo aparelho."},
    {"numero": 7, "texto": "Brindes não estão sujeitos à garantia, e devem ser testados e conferidos no ato da entrega."},
    {"numero": 8, "texto": "Eu cliente, declaro ter ciência do que foi descrito acima."}
  ]'::jsonb
),
(
  'troca_vidro',
  0,
  'Garantia troca de vidro: sem dias de garantia',
  '[
    {"numero": 1, "texto": "Esta garantia cobre defeitos de instalação do novo vidro e defeitos de fabricação do vidro substituído. A garantia se aplica apenas ao vidro frontal substituído e à sua instalação."},
    {"numero": 2, "texto": "Está excluído da garantia qualquer defeito relacionado ao funcionamento interno da tela/display, como problemas de touchscreen, comprometimento da imagem, como mancha, linha e facha."},
    {"numero": 3, "texto": "Novos danos ao vidro causados por quedas, impactos, pressão excessiva, ou contato com objetos pontiagudos estão automaticamente excluídos da garantia."},
    {"numero": 4, "texto": "Eu cliente, declaro ter ciência do que foi descrito acima e que o serviço citado se trata de um recondicionamento de tela que se encontrava quebrado por mau uso."}
  ]'::jsonb
),
(
  'troca_tampa',
  0,
  'Garantia de tampa: sem dias de garantia',
  '[
    {"numero": 1, "texto": "Esta garantia cobre defeitos de instalação da nova tampa e defeitos de fabricação da tampa substituída. A garantia se aplica apenas a tampa traseira substituída e a sua instalação."},
    {"numero": 2, "texto": "Está excluído da garantia qualquer defeito relacionado ao funcionamento interno."},
    {"numero": 3, "texto": "Novos danos na tampa causados por quedas, impactos, pressão excessiva, ou contato com objetos pontiagudos estão automaticamente excluídos da garantia."},
    {"numero": 4, "texto": "Eu cliente, declaro ter ciência do que foi descrito acima e que o serviço citado se trata de um recondicionamento de carcaça mais especifico de tampa traseira, que se encontrava quebrada por mau uso."}
  ]'::jsonb
),
(
  'venda_aparelho',
  180,
  'Garantia de aparelho: 6 meses 180 dias',
  '[
    {"numero": 1, "texto": "A garantia só é válida mediante a apresentação dessa ordem de serviço/garantia."},
    {"numero": 2, "texto": "A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabeçalho a partir da data da entrega do aparelho ao cliente."},
    {"numero": 3, "texto": "Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, surtos de energia, ou instalação de software não autorizado serão excluídos da garantia."},
    {"numero": 4, "texto": "Brindes não estão sujeitos à garantia, e devem ser testados e conferidos no ato da entrega."},
    {"numero": 5, "texto": "Eu cliente, declaro ter ciência do que foi descrito acima."}
  ]'::jsonb
);

-- Criar índice para busca rápida por tipo de serviço
CREATE INDEX IF NOT EXISTS idx_textos_garantia_tipo_servico ON textos_garantia(tipo_servico);

-- Criar trigger para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp_textos_garantia()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_textos_garantia
  BEFORE UPDATE ON textos_garantia
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_textos_garantia();

-- RLS Policies
ALTER TABLE textos_garantia ENABLE ROW LEVEL SECURITY;

-- Política de leitura - todos usuários autenticados podem ler
CREATE POLICY "Usuarios autenticados podem ler textos de garantia"
  ON textos_garantia
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de inserção - apenas usuários com permissão
CREATE POLICY "Usuarios com permissao podem inserir textos de garantia"
  ON textos_garantia
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->'sistema'->>'configuracoes')::boolean = true
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
    )
  );

-- Política de atualização - apenas usuários com permissão
CREATE POLICY "Usuarios com permissao podem atualizar textos de garantia"
  ON textos_garantia
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->'sistema'->>'configuracoes')::boolean = true
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->'sistema'->>'configuracoes')::boolean = true
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
    )
  );

-- Política de exclusão - apenas usuários com permissão
CREATE POLICY "Usuarios com permissao podem deletar textos de garantia"
  ON textos_garantia
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permissoes p
      WHERE p.usuario_id = auth.uid()
      AND (p.permissoes->'sistema'->>'configuracoes')::boolean = true
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
    )
  );

-- Função auxiliar para buscar texto de garantia por tipo de serviço
CREATE OR REPLACE FUNCTION buscar_texto_garantia(p_tipo_servico VARCHAR)
RETURNS TABLE (
  id INTEGER,
  tipo_servico VARCHAR,
  dias_garantia INTEGER,
  titulo TEXT,
  clausulas JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tg.id,
    tg.tipo_servico,
    tg.dias_garantia,
    tg.titulo,
    tg.clausulas
  FROM textos_garantia tg
  WHERE tg.tipo_servico = p_tipo_servico
    AND tg.ativo = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION buscar_texto_garantia IS 'Busca o texto de garantia por tipo de serviço';
