-- Contas recorrentes para lojas

CREATE TABLE IF NOT EXISTS public.contas_lojas_recorrentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id integer NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  tipo text NOT NULL,
  valor numeric(10,2) NOT NULL,
  desconto numeric(10,2),
  periodicidade text NOT NULL DEFAULT 'mensal',
  dia_vencimento integer NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE public.contas_lojas
  ADD COLUMN IF NOT EXISTS recorrente_id uuid REFERENCES public.contas_lojas_recorrentes(id);

CREATE INDEX IF NOT EXISTS idx_contas_lojas_recorrentes_loja
  ON public.contas_lojas_recorrentes(loja_id);

CREATE INDEX IF NOT EXISTS idx_contas_lojas_recorrentes_ativo
  ON public.contas_lojas_recorrentes(ativo);

ALTER TABLE public.contas_lojas_recorrentes ENABLE ROW LEVEL SECURITY;

-- Public
DROP POLICY IF EXISTS "contas_lojas_recorrentes_public_select" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_public_insert" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_public_update" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_public_delete" ON public.contas_lojas_recorrentes;

CREATE POLICY "contas_lojas_recorrentes_public_select"
  ON public.contas_lojas_recorrentes FOR SELECT TO public USING (true);
CREATE POLICY "contas_lojas_recorrentes_public_insert"
  ON public.contas_lojas_recorrentes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "contas_lojas_recorrentes_public_update"
  ON public.contas_lojas_recorrentes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "contas_lojas_recorrentes_public_delete"
  ON public.contas_lojas_recorrentes FOR DELETE TO public USING (true);

-- Authenticated
DROP POLICY IF EXISTS "contas_lojas_recorrentes_auth_select" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_auth_insert" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_auth_update" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_auth_delete" ON public.contas_lojas_recorrentes;

CREATE POLICY "contas_lojas_recorrentes_auth_select"
  ON public.contas_lojas_recorrentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "contas_lojas_recorrentes_auth_insert"
  ON public.contas_lojas_recorrentes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contas_lojas_recorrentes_auth_update"
  ON public.contas_lojas_recorrentes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contas_lojas_recorrentes_auth_delete"
  ON public.contas_lojas_recorrentes FOR DELETE TO authenticated USING (true);

-- Anon
DROP POLICY IF EXISTS "contas_lojas_recorrentes_anon_select" ON public.contas_lojas_recorrentes;
DROP POLICY IF EXISTS "contas_lojas_recorrentes_anon_all" ON public.contas_lojas_recorrentes;

CREATE POLICY "contas_lojas_recorrentes_anon_select"
  ON public.contas_lojas_recorrentes FOR SELECT TO anon USING (true);
CREATE POLICY "contas_lojas_recorrentes_anon_all"
  ON public.contas_lojas_recorrentes FOR ALL TO anon USING (true) WITH CHECK (true);
