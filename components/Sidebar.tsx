"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HomeIcon, CubeIcon, BuildingStorefrontIcon, UsersIcon, UserCircleIcon,
  XMarkIcon, TruckIcon, WrenchScrewdriverIcon, UserGroupIcon, CogIcon,
  ArrowsRightLeftIcon, ShoppingCartIcon, ArrowUturnLeftIcon, CurrencyDollarIcon,
  DevicePhoneMobileIcon, DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid, CubeIcon as CubeIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  UsersIcon as UsersIconSolid, UserCircleIcon as UserCircleIconSolid,
  TruckIcon as TruckIconSolid, WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  UserGroupIcon as UserGroupIconSolid, CogIcon as CogIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ArrowUturnLeftIcon as ArrowUturnLeftIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  DocumentChartBarIcon as DocumentChartBarIconSolid,
} from "@heroicons/react/24/solid";
import { PackageX, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@heroui/avatar";

import { usePermissoes } from "@/hooks/usePermissoes";
import { useFotoPerfil } from "@/hooks/useFotoPerfil";
import { useAuthContext } from "@/contexts/AuthContext";
import { getPrimeiraRotaDisponivel } from "@/lib/routeHelper";
import Logo from "@/components/Logo";

interface SidebarProps {
  isOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const menuSections = [
  {
    label: "Dashboard",
    items: [
      { name: "Dashboard", href: "/sistema/dashboard", permissao: "dashboard.visualizar" as const, icon: HomeIcon, iconSolid: HomeIconSolid },
      { name: "Meu Dashboard", href: "/sistema/dashboard-pessoal", permissao: "dashboard_pessoal.visualizar" as const, icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
    ],
  },
  {
    label: "Operacional",
    items: [
      { name: "Estoque", href: "/sistema/estoque", permissao: "estoque.visualizar" as const, icon: CubeIcon, iconSolid: CubeIconSolid },
      { name: "Aparelhos", href: "/sistema/aparelhos", permissao: "aparelhos.visualizar" as const, icon: DevicePhoneMobileIcon, iconSolid: DevicePhoneMobileIconSolid },
      { name: "Transferências", href: "/sistema/transferencias", permissao: "transferencias.visualizar" as const, icon: ArrowsRightLeftIcon, iconSolid: ArrowsRightLeftIconSolid },
    ],
  },
  {
    label: "Vendas",
    items: [
      { name: "Vendas", href: "/sistema/vendas", permissao: "vendas.visualizar" as const, icon: ShoppingCartIcon, iconSolid: ShoppingCartIconSolid },
      { name: "Devoluções", href: "/sistema/devolucoes", permissao: "devolucoes.visualizar" as const, icon: PackageX, iconSolid: PackageX },
      { name: "Caixa", href: "/sistema/caixa", permissao: "caixa.visualizar" as const, icon: CurrencyDollarIcon, iconSolid: CurrencyDollarIconSolid },
      { name: "Financeiro", href: "/sistema/financeiro", permissao: "financeiro.visualizar" as const, icon: DocumentChartBarIcon, iconSolid: DocumentChartBarIconSolid },
    ],
  },
  {
    label: "Serviços",
    items: [
      { name: "Ordem de Serviço", href: "/sistema/ordem-servico", permissao: "os.visualizar" as const, icon: WrenchScrewdriverIcon, iconSolid: WrenchScrewdriverIconSolid },
      { name: "Minhas Ordens", href: "/sistema/tecnicos", permissao: "os.visualizar" as const, condicao: "isTecnico" as const, icon: WrenchScrewdriverIcon, iconSolid: WrenchScrewdriverIconSolid },
      { name: "RMAs", href: "/sistema/rmas", permissao: "rma.visualizar" as const, icon: ArrowUturnLeftIcon, iconSolid: ArrowUturnLeftIconSolid },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { name: "Clientes", href: "/sistema/clientes", permissao: "clientes.visualizar" as const, icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
      { name: "Lojas", href: "/sistema/lojas", permissao: "lojas.visualizar" as const, icon: BuildingStorefrontIcon, iconSolid: BuildingStorefrontIconSolid },
      { name: "Fornecedores", href: "/sistema/fornecedores", permissao: "fornecedores.visualizar" as const, icon: TruckIcon, iconSolid: TruckIconSolid },
      { name: "Técnicos", href: "/sistema/tecnicos", permissao: "tecnicos.visualizar" as const, icon: UsersIcon, iconSolid: UsersIconSolid },
      { name: "Usuários", href: "/sistema/usuarios", permissao: "usuarios.visualizar" as const, icon: UsersIcon, iconSolid: UsersIconSolid },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Configurações", href: "/sistema/configuracoes", permissao: "configuracoes.gerenciar" as const, icon: CogIcon, iconSolid: CogIconSolid },
    ],
  },
];

function SidebarContent({
  collapsed,
  isDesktop,
  onClose,
  onToggleCollapse,
  hideHeader,
}: {
  collapsed: boolean;
  isDesktop: boolean;
  onClose: () => void;
  onToggleCollapse?: () => void;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuthContext();
  const { fotoUrl } = useFotoPerfil();
  const { temPermissao, isAdmin, permissoes, loading } = usePermissoes();
  const menuLoading = authLoading || loading || !usuario;
  const isTecnico = usuario?.tipo_usuario === "tecnico";

  const handleLogoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (menuLoading) return;
    if (isTecnico) {
      router.push("/sistema/tecnicos");
    }
    const primeiraRota = getPrimeiraRotaDisponivel(permissoes, isAdmin, false);
    router.push(primeiraRota);
    onClose();
  };

  return (
    <>
      {!hideHeader && (
        <div className={`flex items-center h-16 shrink-0 border-b border-zinc-200/80 dark:border-zinc-700/80 ${collapsed ? "justify-center" : "px-5 gap-4"}`}>
          {!collapsed && (
            <button className="flex items-center cursor-pointer flex-1 gap-3" type="button" onClick={handleLogoClick}>
              <div className="w-9 h-9 flex items-center justify-center text-primary shrink-0">
                <Logo className="w-full h-full" />
              </div>
              <div className="min-w-0 text-left">
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white block truncate">LogCell</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">Sistema de Gestão</p>
              </div>
            </button>
          )}
          {isDesktop && onToggleCollapse && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
              aria-label={collapsed ? "Abrir menu lateral" : "Fechar menu lateral"}
              className="
                group relative flex h-8 w-8 shrink-0 items-center justify-center
                overflow-hidden rounded-[8px]
                border border-zinc-300/50 dark:border-zinc-600/60
                bg-transparent
                transition-all duration-300
                hover:border-zinc-400 dark:hover:border-zinc-500
                hover:bg-zinc-100 dark:hover:bg-zinc-800/30
                active:scale-95
              "
            >
              {/* Barra interna: move no eixo X e espelha */}
              <motion.div
                animate={
                  collapsed
                    ? { x: "calc(100% + 14px)", scaleX: -1 }
                    : { x: 0, scaleX: 1 }
                }
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
                className="
                  absolute left-0 top-0 h-full w-[25%]
                  overflow-hidden rounded-l-[9px]
                  border-r border-zinc-300/50 dark:border-zinc-600/60
                  bg-white/20 dark:bg-white/10 backdrop-blur-sm
                "
              >
                {/* Textura de linhas diagonais */}
                <div className="absolute inset-0 opacity-30 dark:opacity-20">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={index}
                      className="absolute h-[100px] w-px rotate-45 bg-zinc-400 dark:bg-zinc-500"
                      style={{ left: `${index * 7 - 12}px`, top: "-20px" }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Seta: move no eixo X e rotaciona 180° */}
              <div className="absolute left-[48%] top-1/2 z-10 flex h-3 w-3 -translate-y-1/2 items-center justify-center">
                <motion.div
                  animate={collapsed ? { x: "-94%", rotate: 180 } : { x: 0, rotate: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full w-full items-center justify-center text-zinc-500 dark:text-zinc-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="block h-[18px] w-[18px]">
                    <path
                      d="M15 6L9 12L15 18"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        <div className="space-y-5">
          {menuSections.map((section) => {
            const visibleItems = menuLoading ? [] : section.items.filter((item) => {
              if ("condicao" in item && item.condicao === "isTecnico") {
                return isTecnico;
              }
              if (!item.permissao) return true;
              if (isAdmin) return true;
              return temPermissao(item.permissao as any);
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                {!collapsed && (
                  <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const IconSolid = item.iconSolid;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href}
                        className={`relative flex items-center rounded-lg text-sm transition-all duration-150 ${collapsed ? "justify-center py-2.5 mx-auto w-full" : "gap-3 px-3 py-2"} ${isActive ? "bg-primary/10 text-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                        href={item.href} onClick={onClose} title={collapsed ? item.name : undefined}>
                        {isActive && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />}
                        <span className="relative">
                          {isActive ? <IconSolid className="w-5 h-5 shrink-0" /> : <Icon className="w-5 h-5 shrink-0" />}
                          {isActive && collapsed && <span className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full" />}
                        </span>
                        {!collapsed && item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Usuário */}
      <div className={`shrink-0 border-t border-zinc-200/80 dark:border-zinc-700/80 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
        <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "gap-2 flex-col"}`}>
          {collapsed ? (
            <Avatar showFallback className="w-9 h-9 shrink-0" color="primary" name={usuario?.nome} size="sm" src={fotoUrl || undefined} />
          ) : (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 w-full">
              <Avatar showFallback className="w-9 h-9 shrink-0" color="primary" name={usuario?.nome} size="sm" src={fotoUrl || undefined} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{usuario?.nome}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{isTecnico ? "Técnico" : "Admin"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar({ isOpen, collapsed, onToggleCollapse, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          type="button"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar (fixed overlay, only visible when open) */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-700/80
          transition-transform duration-300 ease-in-out w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden
        `}
      >
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center text-primary shrink-0">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">LogCell</span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">Menu</p>
            </div>
          </div>
          <button aria-label="Fechar menu" className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
          <SidebarContent collapsed={false} isDesktop={false} onClose={onClose} hideHeader />
        </div>
      </aside>

      {/* Desktop sidebar (in flex flow) */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-700/80
          transition-all duration-300 ease-in-out relative shrink-0
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        <SidebarContent collapsed={collapsed} isDesktop={true} onClose={onClose} onToggleCollapse={onToggleCollapse} />

      </aside>
    </>
  );
}
