-- Permitir que usuarios autenticados vejam fotos de perfil de outros usuarios

ALTER TABLE public.fotos_perfil ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fotos_perfil_select_v2 ON public.fotos_perfil;

CREATE POLICY fotos_perfil_select_v2
  ON public.fotos_perfil
  FOR SELECT
  TO authenticated
  USING (true);
