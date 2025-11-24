    -- ============================================
    -- SISTEMA DE FOTOS PARA LOJAS
    -- ============================================

    -- 1. Criar tabela de fotos de lojas
    CREATE TABLE IF NOT EXISTS public.lojas_fotos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    legenda TEXT,
    ordem INTEGER DEFAULT 0,
    is_principal BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE
    );

    -- 2. Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_lojas_fotos_loja_id ON lojas_fotos(loja_id);
    CREATE INDEX IF NOT EXISTS idx_lojas_fotos_ordem ON lojas_fotos(ordem);
    CREATE INDEX IF NOT EXISTS idx_lojas_fotos_principal ON lojas_fotos(is_principal);

    -- 3. Habilitar RLS (Row Level Security)
    ALTER TABLE lojas_fotos ENABLE ROW LEVEL SECURITY;

    -- 4. Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Usuários autenticados podem visualizar fotos de lojas" ON lojas_fotos;
    DROP POLICY IF EXISTS "Usuários autenticados podem inserir fotos de lojas" ON lojas_fotos;
    DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos de lojas" ON lojas_fotos;
    DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos de lojas" ON lojas_fotos;

    -- 5. Criar políticas RLS para a tabela

    -- Política para visualizar fotos (todos os usuários autenticados)
    CREATE POLICY "Usuários autenticados podem visualizar fotos de lojas"
    ON lojas_fotos
    FOR SELECT
    TO authenticated
    USING (true);

    -- Política para inserir fotos (todos os usuários autenticados)
    CREATE POLICY "Usuários autenticados podem inserir fotos de lojas"
    ON lojas_fotos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

    -- Política para atualizar fotos (todos os usuários autenticados)
    CREATE POLICY "Usuários autenticados podem atualizar fotos de lojas"
    ON lojas_fotos
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

    -- Política para deletar fotos (todos os usuários autenticados)
    CREATE POLICY "Usuários autenticados podem deletar fotos de lojas"
    ON lojas_fotos
    FOR DELETE
    TO authenticated
    USING (true);

    -- ============================================
    -- FUNÇÃO PARA ATUALIZAR TIMESTAMP
    -- ============================================

    -- 6. Criar função para atualizar atualizado_em automaticamente
    CREATE OR REPLACE FUNCTION atualizar_timestamp_lojas_fotos()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- 7. Criar trigger para atualizar timestamp
    DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_lojas_fotos ON lojas_fotos;

    CREATE TRIGGER trigger_atualizar_timestamp_lojas_fotos
    BEFORE UPDATE ON lojas_fotos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp_lojas_fotos();

    -- ============================================
    -- POLÍTICAS RLS PARA O BUCKET DE STORAGE
    -- ============================================

    /*
    IMPORTANTE: Execute os comandos abaixo no Supabase Storage ou através da API:

    1. Criar o bucket "lojas_fotos" (público)
    - Nome: lojas_fotos
    - Público: SIM
    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
    - Max file size: 5MB

    2. Criar políticas de Storage (execute no SQL Editor):
    */

    -- Política para VISUALIZAR arquivos (público - qualquer um pode ver)
    CREATE POLICY "Fotos de lojas são publicamente acessíveis"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'lojas_fotos');

    -- Política para INSERIR arquivos (apenas autenticados)
    CREATE POLICY "Usuários autenticados podem fazer upload de fotos de lojas"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'lojas_fotos');

    -- Política para ATUALIZAR arquivos (apenas autenticados)
    CREATE POLICY "Usuários autenticados podem atualizar fotos de lojas"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'lojas_fotos')
    WITH CHECK (bucket_id = 'lojas_fotos');

    -- Política para DELETAR arquivos (apenas autenticados)
    CREATE POLICY "Usuários autenticados podem deletar fotos de lojas"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'lojas_fotos');

    -- ============================================
    -- FUNÇÕES ÚTEIS
    -- ============================================

    -- 8. Função para obter fotos de uma loja ordenadas
    CREATE OR REPLACE FUNCTION obter_fotos_loja(p_loja_id INTEGER)
    RETURNS TABLE (
    id INTEGER,
    url TEXT,
    legenda TEXT,
    ordem INTEGER,
    is_principal BOOLEAN,
    criado_em TIMESTAMPTZ
    ) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        lf.id,
        lf.url,
        lf.legenda,
        lf.ordem,
        lf.is_principal,
        lf.criado_em
    FROM lojas_fotos lf
    WHERE lf.loja_id = p_loja_id
    ORDER BY lf.ordem ASC, lf.criado_em ASC;
    END;
    $$ LANGUAGE plpgsql;

    -- 9. Função para definir foto principal (desmarca outras)
    CREATE OR REPLACE FUNCTION definir_foto_principal(p_foto_id INTEGER)
    RETURNS VOID AS $$
    DECLARE
    v_loja_id INTEGER;
    BEGIN
    -- Obter o loja_id da foto
    SELECT loja_id INTO v_loja_id FROM lojas_fotos WHERE id = p_foto_id;
    
    -- Desmarcar todas as fotos principais desta loja
    UPDATE lojas_fotos 
    SET is_principal = FALSE 
    WHERE loja_id = v_loja_id;
    
    -- Marcar a foto selecionada como principal
    UPDATE lojas_fotos 
    SET is_principal = TRUE 
    WHERE id = p_foto_id;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- VERIFICAÇÃO
    -- ============================================

    -- Verificar estrutura da tabela
    SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
    FROM information_schema.columns
    WHERE table_name = 'lojas_fotos'
    ORDER BY ordinal_position;

    -- Verificar políticas RLS da tabela
    SELECT schemaname, tablename, policyname, permissive, roles, cmd
    FROM pg_policies
    WHERE tablename = 'lojas_fotos'
    ORDER BY policyname;

    -- Verificar políticas RLS do Storage
    SELECT *
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%lojas%';

    -- Contar fotos por loja
    SELECT 
    l.id,
    l.nome,
    COUNT(lf.id) as total_fotos
    FROM lojas l
    LEFT JOIN lojas_fotos lf ON lf.loja_id = l.id
    GROUP BY l.id, l.nome
    ORDER BY total_fotos DESC;

    -- ============================================
    -- EXEMPLOS DE USO
    -- ============================================

    /*
    -- 1. Inserir uma foto
    INSERT INTO lojas_fotos (loja_id, url, legenda, ordem, is_principal)
    VALUES (1, 'https://seu-projeto.supabase.co/storage/v1/object/public/lojas_fotos/loja-1-foto-1.jpg', 'Fachada da loja', 1, true);

    -- 2. Buscar todas as fotos de uma loja
    SELECT * FROM obter_fotos_loja(1);

    -- 3. Definir uma foto como principal
    SELECT definir_foto_principal(5);

    -- 4. Atualizar ordem das fotos
    UPDATE lojas_fotos SET ordem = 1 WHERE id = 10;
    UPDATE lojas_fotos SET ordem = 2 WHERE id = 11;

    -- 5. Atualizar legenda
    UPDATE lojas_fotos SET legenda = 'Interior renovado' WHERE id = 12;

    -- 6. Deletar uma foto
    DELETE FROM lojas_fotos WHERE id = 13;

    -- 7. Buscar foto principal de cada loja
    SELECT 
    l.id,
    l.nome,
    lf.url as foto_principal
    FROM lojas l
    LEFT JOIN lojas_fotos lf ON lf.loja_id = l.id AND lf.is_principal = true;

    -- 8. Contar fotos por loja
    SELECT 
    loja_id,
    COUNT(*) as total_fotos
    FROM lojas_fotos
    GROUP BY loja_id;
    */

    -- ============================================
    -- DADOS DE EXEMPLO (OPCIONAL)
    -- ============================================

    /*
    -- Descomente para inserir fotos de exemplo
    INSERT INTO lojas_fotos (loja_id, url, legenda, ordem, is_principal) VALUES
    (1, 'https://placehold.co/800x600/0066cc/white?text=Loja+1+-+Foto+1', 'Fachada principal', 1, true),
    (1, 'https://placehold.co/800x600/0066cc/white?text=Loja+1+-+Foto+2', 'Interior da loja', 2, false),
    (1, 'https://placehold.co/800x600/0066cc/white?text=Loja+1+-+Foto+3', 'Área de atendimento', 3, false);
    */
