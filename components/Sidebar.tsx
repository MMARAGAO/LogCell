"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFotoPerfil } from "@/hooks/useFotoPerfil";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  UserCircleIcon,
  XMarkIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CogIcon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  ArrowUturnLeftIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CubeIcon as CubeIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  UsersIcon as UsersIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  TruckIcon as TruckIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CogIcon as CogIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ArrowUturnLeftIcon as ArrowUturnLeftIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
} from "@heroicons/react/24/solid";
import { PackageX } from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario } = useAuthContext();
  const { fotoUrl, loading: loadingFoto } = useFotoPerfil();
  const { temPermissao, isAdmin } = usePermissoes();

  // Determinar se é técnico
  const isTecnico = usuario?.tipo_usuario === "tecnico";

  // Redirecionar logo baseado em permissões
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (temPermissao("dashboard.visualizar")) {
      router.push("/sistema/dashboard");
    } else {
      router.push("/sistema/dashboard-pessoal");
    }
    onClose();
  };

  // Menu para TÉCNICOS (acesso restrito)
  const menuItemsTecnico = [
    {
      name: "Dashboard",
      href: "/sistema/dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      permissao: "dashboard.visualizar" as const,
    },
    {
      name: "Meu Dashboard",
      href: "/sistema/dashboard-pessoal",
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
    },
    {
      name: "Minhas Ordens",
      href: "/sistema/ordem-servico/tecnico",
      icon: WrenchScrewdriverIcon,
      iconSolid: WrenchScrewdriverIconSolid,
      permissao: "os.visualizar" as const,
    },
    {
      name: "Configurações",
      href: "/sistema/configuracoes",
      icon: CogIcon,
      iconSolid: CogIconSolid,
    },
  ];

  // Menu para ADMIN (acesso completo)
  const menuItemsAdmin = [
    {
      name: "Dashboard",
      href: "/sistema/dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      permissao: "dashboard.visualizar" as const,
    },
    {
      name: "Meu Dashboard",
      href: "/sistema/dashboard-pessoal",
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
    },
    {
      name: "Estoque",
      href: "/sistema/estoque",
      icon: CubeIcon,
      iconSolid: CubeIconSolid,
      permissao: "estoque.visualizar" as const,
    },
    {
      name: "Aparelhos",
      href: "/sistema/aparelhos",
      icon: DevicePhoneMobileIcon,
      iconSolid: DevicePhoneMobileIconSolid,
      permissao: "aparelhos.visualizar" as const,
    },
    {
      name: "Transferências",
      href: "/sistema/transferencias",
      icon: ArrowsRightLeftIcon,
      iconSolid: ArrowsRightLeftIconSolid,
      permissao: "transferencias.visualizar" as const,
    },
    {
      name: "Vendas",
      href: "/sistema/vendas",
      icon: ShoppingCartIcon,
      iconSolid: ShoppingCartIconSolid,
      permissao: "vendas.visualizar" as const,
    },
    {
      name: "Devoluções",
      href: "/sistema/devolucoes",
      icon: PackageX,
      iconSolid: PackageX,
      permissao: "devolucoes.visualizar" as const,
    },
    {
      name: "Caixa",
      href: "/sistema/caixa",
      icon: CurrencyDollarIcon,
      iconSolid: CurrencyDollarIconSolid,
      permissao: "caixa.visualizar" as const,
    },
    {
      name: "RMAs",
      href: "/sistema/rmas",
      icon: ArrowUturnLeftIcon,
      iconSolid: ArrowUturnLeftIconSolid,
      permissao: "rma.visualizar" as const,
    },
    {
      name: "Lojas",
      href: "/sistema/lojas",
      icon: BuildingStorefrontIcon,
      iconSolid: BuildingStorefrontIconSolid,
      permissao: "lojas.visualizar" as const,
    },
    {
      name: "Fornecedores",
      href: "/sistema/fornecedores",
      icon: TruckIcon,
      iconSolid: TruckIconSolid,
      permissao: "fornecedores.visualizar" as const,
    },
    {
      name: "Ordem de Serviço",
      href: "/sistema/ordem-servico",
      icon: WrenchScrewdriverIcon,
      iconSolid: WrenchScrewdriverIconSolid,
      permissao: "os.visualizar" as const,
    },
    {
      name: "Clientes",
      href: "/sistema/clientes",
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      permissao: "clientes.visualizar" as const,
    },
    {
      name: "Técnicos",
      href: "/sistema/tecnicos",
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      permissao: "tecnicos.visualizar" as const,
    },
    {
      name: "Usuários",
      href: "/sistema/usuarios",
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      permissao: "usuarios.visualizar" as const,
    },
  ];

  // Selecionar menu baseado no tipo de usuário e filtrar por permissões
  const menuItemsBase = isTecnico ? menuItemsTecnico : menuItemsAdmin;
  const menuItems = menuItemsBase.filter((item) => {
    // Se não tem permissão definida, mostrar sempre (como Dashboard)
    if (!item.permissao) return true;
    // Admin vê tudo
    if (isAdmin) return true;
    // Verificar permissão específica
    return temPermissao(item.permissao as any);
  });

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-background/95 backdrop-blur-xl border-r border-divider/50 z-30
          transition-transform duration-300 ease-in-out
          w-72 flex flex-col shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-divider/50">
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center p-2">
              <Logo className="w-full h-full text-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">LogCell</span>
              <div className="flex items-center gap-2">
                <p className="text-xs text-default-500">
                  {isTecnico ? "Área do Técnico" : "Admin Panel"}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  <span className="text-[10px] text-success font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </a>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-default-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Fechar menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const IconSolid = item.iconSolid;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-foreground hover:bg-default-100 hover:scale-[1.02] active:scale-[0.98]"
                    }
                  `}
                >
                  {isActive ? (
                    <IconSolid className="w-5 h-5 shrink-0" />
                  ) : (
                    <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <span
                    className={`font-medium ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info - Movido para baixo */}
        <div className="p-4 border-t border-divider/50 bg-default-50/50">
          <div className="flex items-center gap-3">
            <Avatar
              isBordered
              color="primary"
              name={usuario?.nome}
              size="md"
              src={fotoUrl || undefined}
              showFallback
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{usuario?.nome}</p>
              <p className="text-xs text-default-500 truncate mb-1">
                {usuario?.email}
              </p>
              <Chip
                size="sm"
                variant="flat"
                color={isTecnico ? "primary" : "success"}
                className="h-5"
              >
                {isTecnico ? "Técnico" : "Admin"}
              </Chip>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
