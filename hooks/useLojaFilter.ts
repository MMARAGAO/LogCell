"use client";

import { useMemo } from "react";

import { aplicarEscopoLoja } from "@/lib/lojaScope";

import { usePermissoes } from "./usePermissoes";

/**
 * Hook para filtrar dados baseado na loja do usuário
 *
 * Retorna informações sobre qual loja o usuário tem acesso e
 * funções auxiliares para filtrar queries do Supabase
 */
export function useLojaFilter() {
  const { lojaId, lojaIds, todasLojas, isAdmin } = usePermissoes();

  /**
   * Verifica se o usuário tem acesso a uma loja específica
   */
  const temAcessoLoja = useMemo(() => {
    return (lojaIdVerificar: number | null | undefined): boolean => {
      // Admin sempre tem acesso
      if (isAdmin) return true;

      // Se não informou loja, não tem acesso
      if (!lojaIdVerificar) return false;

      // Se tem acesso a todas as lojas
      if (todasLojas) return true;

      // Verificar se a loja está entre as do usuário
      return lojaIds.includes(lojaIdVerificar);
    };
  }, [isAdmin, todasLojas, lojaIds]);

  /**
   * Retorna o filtro de loja para queries do Supabase
   *
   * Uso:
   * ```ts
   * const { getLojaFilter } = useLojaFilter();
   * const filter = getLojaFilter();
   *
   * let query = supabase.from('vendas').select('*');
   * if (filter) {
   *   query = query.eq('loja_id', filter);
   * }
   * ```
   */
  const getLojaFilter = useMemo(() => {
    return (): number[] | null => {
      // Admin ou todas as lojas = sem filtro
      if (isAdmin || todasLojas) return null;

      // Retorna as lojas do usuário (vazio também significa "sem filtro útil")
      return lojaIds.length > 0 ? lojaIds : null;
    };
  }, [isAdmin, todasLojas, lojaIds]);

  /**
   * Aplica filtro de loja em uma query do Supabase
   *
   * Uso:
   * ```ts
   * const { aplicarFiltroLoja } = useLojaFilter();
   * let query = supabase.from('vendas').select('*');
   * query = aplicarFiltroLoja(query, 'loja_id');
   * ```
   */
  const aplicarFiltroLoja = <T extends any>(
    query: T,
    campo: string = "loja_id",
  ): T => {
    // Aplica .eq (1 loja) ou .in (N lojas) automaticamente. No-op se sem filtro.
    return aplicarEscopoLoja(query, campo, getLojaFilter());
  };

  /**
   * Filtra um array de objetos baseado na loja
   *
   * Uso:
   * ```ts
   * const { filtrarPorLoja } = useLojaFilter();
   * const vendasFiltradas = filtrarPorLoja(todasVendas, 'loja_id');
   * ```
   */
  const filtrarPorLoja = <T extends Record<string, any>>(
    items: T[],
    campo: string = "loja_id",
  ): T[] => {
    const filtro = getLojaFilter();

    if (filtro === null) {
      // Sem filtro, retorna tudo
      return items;
    }

    // Filtrar apenas items das lojas do usuário
    return items.filter((item) => filtro.includes(item[campo]));
  };

  /**
   * Mensagem explicativa sobre o acesso do usuário
   */
  const mensagemAcesso = useMemo(() => {
    if (isAdmin) {
      return "Você tem acesso a todas as lojas (Admin)";
    }

    if (todasLojas) {
      return "Você tem acesso a todas as lojas";
    }

    if (lojaIds.length === 1) {
      return `Você tem acesso apenas à loja ID: ${lojaIds[0]}`;
    }

    if (lojaIds.length > 1) {
      return `Você tem acesso às lojas: ${lojaIds.join(", ")}`;
    }

    return "Nenhuma loja configurada. Entre em contato com o administrador.";
  }, [isAdmin, todasLojas, lojaIds]);

  /**
   * Indica se o usuário tem permissão de visualizar dados de múltiplas lojas
   */
  const podeVerTodasLojas = useMemo(() => {
    return isAdmin || todasLojas;
  }, [isAdmin, todasLojas]);

  /**
   * Indica se o usuário precisa de filtro de loja
   */
  const precisaFiltro = useMemo(() => {
    return !isAdmin && !todasLojas && lojaIds.length > 0;
  }, [isAdmin, todasLojas, lojaIds]);

  return {
    // Dados
    lojaId,
    lojaIds,
    todasLojas,
    podeVerTodasLojas,
    precisaFiltro,
    mensagemAcesso,

    // Funções
    temAcessoLoja,
    getLojaFilter,
    aplicarFiltroLoja,
    filtrarPorLoja,
  };
}
