"use client";

import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  Package,
  Users,
  Wrench,
  TrendingUp,
  FileText,
} from "lucide-react";

import { NotificacoesDropdown } from "./NotificacoesDropdown";

import { usePermissoes } from "@/hooks/usePermissoes";
import { useFotoPerfil } from "@/hooks/useFotoPerfil";
import { useAuthContext } from "@/contexts/AuthContext";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: "produto" | "cliente" | "os" | "venda" | "tecnico";
  href: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { usuario, logout } = useAuthContext();
  const { fotoUrl, loading: loadingFoto } = useFotoPerfil();
  const { temPermissao } = usePermissoes();
  const router = useRouter();
  const pathname = usePathname();

  // Estados da busca
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Ícones por categoria
  const getCategoryIcon = (category: SearchResult["category"]) => {
    switch (category) {
      case "produto":
        return <Package className="w-4 h-4" />;
      case "cliente":
        return <Users className="w-4 h-4" />;
      case "os":
        return <Wrench className="w-4 h-4" />;
      case "venda":
        return <TrendingUp className="w-4 h-4" />;
      case "tecnico":
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: SearchResult["category"]) => {
    const labels = {
      produto: "Produto",
      cliente: "Cliente",
      os: "Ordem de Serviço",
      venda: "Venda",
      tecnico: "Técnico",
    };

    return labels[category];
  };

  // Funções de formatação/máscara
  const formatTelefone = (telefone: string) => {
    if (!telefone) return "";
    const numbers = telefone.replace(/\D/g, "");

    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }

    return telefone;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "";
    const numbers = cpf.replace(/\D/g, "");

    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
    }

    return cpf;
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return "";
    const numbers = cnpj.replace(/\D/g, "");

    if (numbers.length === 14) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
    }

    return cnpj;
  };

  const formatMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função de busca
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);

      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/busca?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar");
      }

      const data = await response.json();

      setSearchResults(data.results || []);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Erro na busca:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);

      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Atalho Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        // Focar no input de busca ao invés de abrir modal
        if (inputRef.current) {
          inputRef.current.focus();
        } else {
          // Se o input não estiver visível (mobile), abre o modal
          setIsSearchModalOpen(true);
        }
      }

      if (e.key === "Escape" && showResults) {
        setShowResults(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleResultClick(searchResults[selectedIndex]);
      }
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    // Mapear categoria para a rota correta
    let route = "";
    let searchParam = "";

    switch (result.category) {
      case "produto":
        route = "/sistema/estoque";
        // Extrair o nome do produto do título
        searchParam = result.title;
        break;
      case "cliente":
        route = "/sistema/clientes";
        searchParam = result.title;
        break;
      case "os":
        route = "/sistema/ordem-servico";
        // Extrair o nome do cliente do título (formato: "OS #123 - Nome do Cliente")
        searchParam = result.title.split(" - ")[1] || result.title;
        break;
      case "venda":
        route = "/sistema/vendas";
        // Extrair o número da venda ou nome do cliente
        const vendaParts = result.title.split(" - ");

        searchParam = vendaParts.length > 1 ? vendaParts[1] : vendaParts[0];
        break;
      case "tecnico":
        route = "/sistema/tecnicos";
        searchParam = result.title;
        break;
    }

    // Navegar com o parâmetro de busca na URL
    router.push(`${route}?busca=${encodeURIComponent(searchParam)}`);
    setShowResults(false);
    setSearchQuery("");
    setIsSearchModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Extrai o título da página atual
  const getPageTitle = () => {
    if (pathname?.includes("/dashboard")) return "Dashboard";
    if (pathname?.includes("/estoque")) return "Gestão de Estoque";
    if (pathname?.includes("/lojas")) return "Lojas";
    if (pathname?.includes("/usuarios")) return "Usuários";
    if (pathname?.includes("/perfil")) return "Meu Perfil";
    if (pathname?.includes("/configuracoes")) return "Configurações";
    if (pathname?.includes("/ajuda")) return "Ajuda & Suporte";

    return "Sistema";
  };

  // Gera breadcrumb
  const getBreadcrumb = () => {
    const paths = pathname?.split("/").filter(Boolean) || [];

    return paths.length > 1 ? paths[paths.length - 1] : null;
  };

  const pageTitle = getPageTitle();
  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-10 lg:z-30 bg-background/80 backdrop-blur-md border-b border-divider relative">
      {/* Barra colorida acoplada */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 hidden sm:block" />

      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - Menu + Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            aria-label="Abrir menu"
            className="lg:hidden p-2 hover:bg-default-100 rounded-lg transition-colors"
            onClick={onMenuClick}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold truncate">
                {pageTitle}
              </h1>
              {breadcrumb && (
                <Chip color="primary" size="sm" variant="flat">
                  {breadcrumb}
                </Chip>
              )}
            </div>
            <p className="text-xs text-default-500 hidden sm:block">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        {/* Middle Section - Search (hidden on small screens) */}
        <div
          ref={searchRef}
          className="hidden xl:flex flex-1 max-w-md mx-4 relative"
        >
          <Input
            ref={inputRef}
            classNames={{
              input: "text-sm",
              inputWrapper: "h-9 bg-default-100/50",
            }}
            placeholder="Buscar produtos, clientes, OS... (Ctrl+K)"
            radius="lg"
            size="sm"
            startContent={
              isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-default-400" />
              ) : (
                <Search className="w-4 h-4 text-default-400" />
              )
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            onKeyDown={handleKeyDown}
          />

          {/* Dropdown de resultados */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-content1 rounded-lg shadow-xl border border-divider max-h-[400px] overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-default-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Buscando...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      className={`w-full px-4 py-3 text-left hover:bg-default-100 transition-colors flex items-start gap-3 ${
                        index === selectedIndex ? "bg-default-100" : ""
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="mt-0.5 text-default-500">
                        {getCategoryIcon(result.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-primary">
                            {getCategoryLabel(result.category)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-default-500 truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-default-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum resultado encontrado</p>
                  <p className="text-xs mt-1">
                    Tente usar palavras-chave diferentes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button - Mobile */}
          <button
            aria-label="Buscar"
            className="xl:hidden p-2 hover:bg-default-100 rounded-lg transition-colors"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          {/* Notificações */}
          <NotificacoesDropdown usuarioId={usuario?.id} />

          {/* User Menu */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-default-100 rounded-lg transition-colors">
                <Avatar
                  isBordered
                  showFallback
                  className="w-8 h-8"
                  color="primary"
                  name={usuario?.nome}
                  size="sm"
                  src={fotoUrl || undefined}
                />
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {usuario?.nome}
                  </span>
                  <span className="text-xs text-default-400">
                    {usuario?.ativo ? "Online" : "Offline"}
                  </span>
                </div>
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu do usuário" variant="flat">
              <DropdownItem
                key="perfil-info"
                className="h-14 gap-2"
                textValue="Informações do perfil"
              >
                <p className="text-xs text-default-500">Logado como</p>
                <p className="font-semibold text-sm">{usuario?.nome}</p>
                <p className="text-xs text-default-400">{usuario?.email}</p>
              </DropdownItem>
              <DropdownItem
                key="meu-perfil"
                description="Editar informações pessoais"
                onPress={() => router.push("/sistema/perfil")}
              >
                Meu Perfil
              </DropdownItem>
              <DropdownItem
                key="configuracoes"
                description="Preferências do sistema"
                onPress={() => router.push("/sistema/configuracoes")}
              >
                Configurações
              </DropdownItem>
              <DropdownItem
                key="ajuda"
                description="Central de ajuda"
                onPress={() => router.push("/sistema/ajuda")}
              >
                Ajuda & Suporte
              </DropdownItem>
              <DropdownItem
                key="logout"
                className="text-danger"
                color="danger"
                onPress={handleLogout}
              >
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Modal de busca - Mobile */}
      <Modal
        hideCloseButton
        classNames={{
          base: "m-0 sm:m-0 h-dvh",
          wrapper: "items-start h-dvh",
          backdrop: "backdrop-blur-xl backdrop-saturate-150",
        }}
        isOpen={isSearchModalOpen}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.15,
                ease: "easeIn",
              },
            },
          },
        }}
        placement="top"
        size="full"
        onOpenChange={setIsSearchModalOpen}
      >
        <ModalContent className="bg-content1/10 backdrop-blur-2xl backdrop-saturate-200 shadow-2xl border border-divider/30 h-dvh max-h-dvh">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 px-4 pt-4 pb-2">
                <Input
                  classNames={{
                    base: "w-full",
                    mainWrapper: "w-full",
                    input: "text-base",
                    inputWrapper:
                      "h-12 bg-default-100/50 backdrop-blur-md border-2 border-transparent focus-within:border-primary",
                  }}
                  placeholder="Buscar produtos, clientes, OS..."
                  size="lg"
                  startContent={
                    isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin text-default-400" />
                    ) : (
                      <Search className="w-5 h-5 text-default-400" />
                    )
                  }
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  aria-label="Fechar busca"
                  className="p-2 hover:bg-default-100 rounded-lg transition-colors shrink-0"
                  onClick={onClose}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </ModalHeader>
              <ModalBody className="px-4 pb-4 flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 text-center text-default-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Buscando...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={result.id}
                        className={`w-full px-4 py-3 rounded-lg text-left hover:bg-default-100 transition-colors flex items-start gap-3 ${
                          index === selectedIndex ? "bg-default-100" : ""
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="mt-0.5 text-default-500">
                          {getCategoryIcon(result.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-primary">
                              {getCategoryLabel(result.category)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-default-500 mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-8 text-center text-default-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum resultado encontrado</p>
                    <p className="text-xs mt-1">
                      Tente usar palavras-chave diferentes
                    </p>
                  </div>
                ) : (
                  <div className="p-8 text-center text-default-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Digite para começar a buscar</p>
                    <p className="text-xs mt-1">
                      Produtos, clientes, ordens de serviço e mais
                    </p>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </header>
  );
}
