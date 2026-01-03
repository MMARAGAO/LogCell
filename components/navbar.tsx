"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useFotoPerfil } from "@/hooks/useFotoPerfil";
import { Button } from "@heroui/button";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Loader2,
  Package,
  Users,
  FileText,
  Wrench,
  TrendingUp,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: "produto" | "cliente" | "os" | "venda" | "tecnico";
  href: string;
}

export default function Navbar() {
  const { usuario, isAuthenticated, logout } = useAuthContext();
  const { temPermissao } = usePermissoes();
  const { fotoUrl, loading: loadingFoto } = useFotoPerfil();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Categorias de busca com ícones
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

  // Função de busca
  const performSearch = async (query: string) => {
    console.log("performSearch chamado com query:", query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      console.log("Fazendo fetch para /api/busca");
      const response = await fetch(`/api/busca?q=${encodeURIComponent(query)}`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error("Erro ao buscar");
      }

      const data = await response.json();
      console.log("Dados recebidos:", data);
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
  }, [searchQuery]); // Removido performSearch das dependências

  // Atalho de teclado Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }

      if (e.key === "Escape" && showResults) {
        setShowResults(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults]);

  // Navegação por teclado nos resultados
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        router.push(searchResults[selectedIndex].href);
        setShowResults(false);
        setSearchQuery("");
        setIsSearchModalOpen(false);
      }
    }
  };

  // Fechar dropdown ao clicar fora
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
    router.push(result.href);
    setShowResults(false);
    setSearchQuery("");
    setIsSearchModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const menuItems = [
    { name: "Estoque", href: "/estoque" },
    { name: "Lojas", href: "/lojas" },
    { name: "Usuários", href: "/usuarios" },
  ];

  return (
    <HeroNavbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-background/70 backdrop-blur-md"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-xl">LogCell</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <p className="font-bold text-xl">LogCell</p>
        </NavbarBrand>
      </NavbarContent>

      {isAuthenticated && (
        <>
          {/* Barra de pesquisa - Desktop */}
          <NavbarContent
            className="hidden md:flex flex-1 max-w-2xl"
            justify="center"
          >
            <div ref={searchRef} className="relative w-full">
              <Input
                ref={inputRef}
                classNames={{
                  base: "w-full",
                  mainWrapper: "w-full",
                  input: "text-small",
                  inputWrapper:
                    "h-10 bg-default-100/50 hover:bg-default-200/50 focus-within:!bg-default-200/50 backdrop-blur-md border-2 border-transparent focus-within:border-primary",
                }}
                placeholder="Buscar produtos, clientes, OS... (Ctrl+K)"
                size="sm"
                startContent={
                  isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-default-400" />
                  ) : (
                    <Search className="w-4 h-4 text-default-400" />
                  )
                }
                endContent={
                  <div className="flex items-center gap-1 text-tiny text-default-400">
                    <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-default-200/50 font-mono text-[10px]">
                      <Command className="w-3 h-3" />K
                    </kbd>
                  </div>
                }
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowResults(true)}
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
          </NavbarContent>

          {/* Botão de busca - Mobile */}
          <NavbarContent className="md:hidden" justify="center">
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsSearchModalOpen(true)}
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </Button>
            </NavbarItem>
          </NavbarContent>
        </>
      )}

      {isAuthenticated && (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/estoque" color="foreground">
              Estoque
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/lojas" color="foreground">
              Lojas
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/usuarios" color="foreground">
              Usuários
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        {isAuthenticated && usuario ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={usuario.nome}
                size="sm"
                src={fotoUrl || undefined}
                showFallback
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu do usuário" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Logado como</p>
                <p className="font-semibold">{usuario.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">Meu perfil</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Ajuda & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button as={Link} color="primary" href="/auth" variant="flat">
              Entrar
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full"
              color="foreground"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {isAuthenticated && (
          <NavbarMenuItem>
            <Link
              className="w-full"
              color="danger"
              size="lg"
              onPress={handleLogout}
            >
              Sair
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>

      {/* Modal de busca - Mobile */}
      <Modal
        isOpen={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        placement="top"
        size="full"
        hideCloseButton
        classNames={{
          base: "m-0 sm:m-0",
          wrapper: "items-start",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-4 pt-4 pb-2">
                <Input
                  autoFocus
                  classNames={{
                    base: "w-full",
                    mainWrapper: "w-full",
                    input: "text-base",
                    inputWrapper:
                      "h-12 bg-default-100 border-2 border-transparent focus-within:border-primary",
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
              </ModalHeader>
              <ModalBody className="px-4 pb-4">
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
    </HeroNavbar>
  );
}
