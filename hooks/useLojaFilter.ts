"use client";

import { usePermissoes } from "./usePermissoes";
import { useMemo } from "react";

/**
 * Hook para filtrar dados baseado na loja do usuário
 * 
 * Retorna informações sobre qual loja o usuário tem acesso e
 * funções auxiliares para filtrar queries do Supabase
 */
export function useLojaFilter() {
  const { lojaId, todasLojas, isAdmin } = usePermissoes();

  console.log("🏪 [useLojaFilter] Valores recebidos:", { lojaId, todasLojas, isAdmin });

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
      
      // Verificar se é a loja específica do usuário
      return lojaId === lojaIdVerificar;
    };
  }, [isAdmin, todasLojas, lojaId]);

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
    return (): number | null => {
      // Admin ou todas as lojas = sem filtro
      if (isAdmin || todasLojas) return null;
      
      // Retorna a loja específica do usuário
      return lojaId;
    };
  }, [isAdmin, todasLojas, lojaId]);

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
    campo: string = 'loja_id'
  ): T => {
    const filtro = getLojaFilter();
    
    if (filtro !== null) {
      // @ts-ignore - Supabase query builder
      return query.eq(campo, filtro);
    }
    
    return query;
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
    campo: string = 'loja_id'
  ): T[] => {
    const filtro = getLojaFilter();
    
    if (filtro === null) {
      // Sem filtro, retorna tudo
      return items;
    }
    
    // Filtrar apenas items da loja específica
    return items.filter(item => item[campo] === filtro);
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
    
    if (lojaId) {
      return `Você tem acesso apenas à loja ID: ${lojaId}`;
    }
    
    return "Nenhuma loja configurada. Entre em contato com o administrador.";
  }, [isAdmin, todasLojas, lojaId]);

  /**
   * Indica se o usuário tem permissão de visualizar dados de múltiplas lojas
   */
  const podeVerTodasLojas = useMemo(() => {
    const resultado = isAdmin || todasLojas;
    console.log("🔍 [podeVerTodasLojas] Recalculado:", resultado, { isAdmin, todasLojas });
    return resultado;
  }, [isAdmin, todasLojas]);

  /**
   * Indica se o usuário precisa de filtro de loja
   */
  const precisaFiltro = useMemo(() => {
    return !isAdmin && !todasLojas && lojaId !== null;
  }, [isAdmin, todasLojas, lojaId]);

  return {
    // Dados
    lojaId,
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
