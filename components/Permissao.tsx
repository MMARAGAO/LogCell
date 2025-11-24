"use client";

import { ReactNode } from "react";
import { usePermissoes } from "@/hooks/usePermissoes";
import type { Permissao } from "@/types/permissoes";

interface PermissaoProps {
  children: ReactNode;
  permissao?: Permissao;
  permissoes?: Permissao[];
  requireAll?: boolean; // Se true, requer todas as permissões. Se false, requer apenas uma
  fallback?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a(s) permissão(ões) necessária(s)
 *
 * @example
 * // Exibe botão apenas se usuário pode criar clientes
 * <Permissao permissao="clientes.criar">
 *   <Button>Novo Cliente</Button>
 * </Permissao>
 *
 * @example
 * // Exibe se tiver QUALQUER uma das permissões
 * <Permissao permissoes={["os.editar", "os.excluir"]} requireAll={false}>
 *   <Button>Gerenciar OS</Button>
 * </Permissao>
 *
 * @example
 * // Exibe se tiver TODAS as permissões
 * <Permissao permissoes={["vendas.criar", "caixa.visualizar"]} requireAll={true}>
 *   <Button>Nova Venda</Button>
 * </Permissao>
 */
export function Permissao({
  children,
  permissao,
  permissoes,
  requireAll = false,
  fallback = null,
}: PermissaoProps) {
  const { temPermissao, temTodasPermissoes, temAlgumaPermissao, loading } =
    usePermissoes();

  // Enquanto carrega permissões, não mostrar nada (ou mostrar fallback)
  if (loading) {
    return <>{fallback}</>;
  }

  // Verificar permissão única
  if (permissao && !temPermissao(permissao)) {
    return <>{fallback}</>;
  }

  // Verificar múltiplas permissões
  if (permissoes) {
    const temPermissaoNecessaria = requireAll
      ? temTodasPermissoes(permissoes)
      : temAlgumaPermissao(permissoes);

    if (!temPermissaoNecessaria) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

interface PodeFazerProps {
  acao: Permissao;
}

/**
 * Hook-like que retorna se pode fazer uma ação
 * Útil para lógica condicional em vez de renderização
 *
 * @example
 * const podeCriar = PodeFazer({ acao: "clientes.criar" });
 * if (podeCriar) {
 *   // fazer algo
 * }
 */
export function PodeFazer({ acao }: PodeFazerProps): boolean {
  const { temPermissao } = usePermissoes();
  return temPermissao(acao);
}
