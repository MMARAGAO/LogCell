/**
 * Helper central para aplicar o ESCOPO DE LOJA do usuário em queries do Supabase.
 *
 * Suporta tanto 1 loja (legado) quanto N lojas (multi-loja). É no-op seguro:
 * - escopo `null`/`undefined`/`[]` → não aplica filtro (admin / "todas as lojas");
 * - 1 loja → `.eq(campo, loja)` (idêntico ao comportamento antigo);
 * - N lojas → `.in(campo, lojas)`.
 *
 * Use SOMENTE nos pontos que filtram pelo escopo do usuário (lojaIds das
 * permissões). NÃO use onde o filtro é por uma loja específica de um registro
 * (ex.: `.eq("id_loja", venda.loja_id)`), que deve permanecer `.eq`.
 */
export function aplicarEscopoLoja<T>(
  query: T,
  campo: string,
  escopo: number | number[] | null | undefined,
): T {
  if (escopo == null) return query;

  const lojas = (Array.isArray(escopo) ? escopo : [escopo]).filter(
    (v) => v != null,
  );

  if (lojas.length === 0) return query;

  // @ts-ignore - Supabase query builder
  return lojas.length === 1 ? query.eq(campo, lojas[0]) : query.in(campo, lojas);
}

/** Normaliza um escopo (number | number[] | null) para array de números. */
export function normalizarLojaIds(
  escopo: number | number[] | null | undefined,
): number[] {
  if (escopo == null) return [];

  return (Array.isArray(escopo) ? escopo : [escopo]).filter((v) => v != null);
}
