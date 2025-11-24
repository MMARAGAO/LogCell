import type { Permissao } from "@/types/permissoes";

interface RouteConfig {
  name: string;
  href: string;
  permissao?: Permissao;
}

const routes: RouteConfig[] = [
  {
    name: "Dashboard",
    href: "/sistema/dashboard",
    permissao: "dashboard.visualizar",
  },
  {
    name: "Minhas Ordens",
    href: "/sistema/ordem-servico/tecnico",
    permissao: "os.visualizar",
  },
  {
    name: "Estoque",
    href: "/sistema/estoque",
    permissao: "estoque.visualizar",
  },
  {
    name: "Transferências",
    href: "/sistema/transferencias",
    permissao: "transferencias.visualizar",
  },
  { name: "Vendas", href: "/sistema/vendas", permissao: "vendas.visualizar" },
  {
    name: "Devoluções",
    href: "/sistema/devolucoes",
    permissao: "devolucoes.visualizar",
  },
  { name: "Caixa", href: "/sistema/caixa", permissao: "caixa.visualizar" },
  { name: "RMAs", href: "/sistema/rmas", permissao: "rma.visualizar" },
  { name: "Lojas", href: "/sistema/lojas", permissao: "lojas.visualizar" },
  {
    name: "Fornecedores",
    href: "/sistema/fornecedores",
    permissao: "fornecedores.visualizar",
  },
  {
    name: "Ordem de Serviço",
    href: "/sistema/ordem-servico",
    permissao: "os.visualizar",
  },
  {
    name: "Clientes",
    href: "/sistema/clientes",
    permissao: "clientes.visualizar",
  },
  {
    name: "Técnicos",
    href: "/sistema/tecnicos",
    permissao: "tecnicos.visualizar",
  },
  {
    name: "Usuários",
    href: "/sistema/usuarios",
    permissao: "usuarios.visualizar",
  },
];

/**
 * Obtém a primeira rota que o usuário tem permissão de acessar
 * @param permissoes Array de permissões do usuário
 * @param isAdmin Se o usuário é admin (tem acesso total)
 * @returns Caminho da primeira rota disponível
 */
export function getPrimeiraRotaDisponivel(
  permissoes: Permissao[],
  isAdmin: boolean = false
): string {
  // Admin sempre vai para dashboard
  if (isAdmin) return "/sistema/dashboard";

  // Encontrar primeira rota com permissão
  for (const route of routes) {
    if (!route.permissao || permissoes.includes(route.permissao)) {
      return route.href;
    }
  }

  // Fallback: dashboard (todos devem ter acesso)
  return "/sistema/dashboard";
}
