"use client";

import type { Tecnico } from "@/types/clientesTecnicos";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Input,
  useDisclosure,
  Button,
  Spinner,
  Pagination,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
} from "@heroui/react";
import {
  Wrench,
  Search,
  Users,
  UserPlus,
  LayoutGrid,
  List,
  Filter,
  Download,
  SortAsc,
  SortDesc,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { formatarTelefone } from "@/lib/formatters";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  buscarTecnicos,
  deletarTecnico,
  toggleTecnicoAtivo,
} from "@/services/tecnicoService";
import { TecnicoCard, TecnicoComLoginModal } from "@/components/tecnicos";
import { ConfirmModal } from "@/components/ConfirmModal";

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TecnicosPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  const {
    isOpen: isLoginModalOpen,
    onOpen: onLoginModalOpen,
    onClose: onLoginModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | undefined>(
    undefined,
  );
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [tecnicoParaDeletar, setTecnicoParaDeletar] = useState<Tecnico | null>(
    null,
  );

  // UI States
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState<"nome" | "criado_em">("nome");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Debounce na busca
  const buscaDebounced = useDebounce(busca, 500);

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  useEffect(() => {
    carregarTecnicos();
  }, [filtroAtivo, buscaDebounced]);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [filtroAtivo, buscaDebounced]);

  const carregarTecnicos = async () => {
    setLoading(true);
    const { data, error } = await buscarTecnicos({
      ativo: filtroAtivo,
      busca: buscaDebounced || undefined,
      idLoja: undefined,
    });

    if (error) {
      toast.error(error);
    } else {
      setTecnicos(data || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (tecnico: Tecnico) => {
    if (!usuario) return;

    if (!temPermissao("tecnicos.editar")) {
      toast.error("Você não tem permissão para alterar o status de técnicos");

      return;
    }

    const { error } = await toggleTecnicoAtivo(
      tecnico.id,
      !tecnico.ativo,
      usuario.id,
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        `Técnico ${tecnico.ativo ? "desativado" : "ativado"} com sucesso!`,
      );
      carregarTecnicos();
    }
  };

  const handleDeleteConfirm = (tecnico: Tecnico) => {
    setTecnicoParaDeletar(tecnico);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!tecnicoParaDeletar) return;

    if (!temPermissao("tecnicos.deletar")) {
      toast.error("Você não tem permissão para deletar técnicos");
      onDeleteClose();

      return;
    }

    const { error } = await deletarTecnico(tecnicoParaDeletar.id);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Técnico excluído com sucesso!");
      carregarTecnicos();
    }
    onDeleteClose();
  };

  const tecnicosAtivos = tecnicos.filter((t) => t.ativo).length;
  const tecnicosInativos = tecnicos.filter((t) => !t.ativo).length;

  // Ordenar técnicos
  const tecnicosOrdenados = useMemo(() => {
    const sorted = [...tecnicos].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "nome") {
        comparison = a.nome.localeCompare(b.nome);
      } else if (sortBy === "criado_em") {
        const dateA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
        const dateB = b.criado_em ? new Date(b.criado_em).getTime() : 0;

        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tecnicos, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(tecnicosOrdenados.length / itemsPerPage);
  const tecnicosPaginados = tecnicosOrdenados.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const totalTecnicos = tecnicos.length;

  const getMenuItems = (tecnico: Tecnico) => {
    const items: Array<{
      key: string;
      label: string;
      icon: string;
      onClick: () => void;
      show: boolean;
      color?: "danger" | "default";
    }> = [
      {
        key: "os",
        label: "Ver OS",
        icon: "history",
        onClick: () => toast.info("Funcionalidade em desenvolvimento"),
        show: true,
      },
    ];

    if (temPermissao("tecnicos.editar")) {
      items.push({
        key: "toggle",
        label: tecnico.ativo ? "Desativar" : "Ativar",
        icon: "toggle",
        onClick: () => handleToggleStatus(tecnico),
        show: true,
      });
    }

    if (temPermissao("tecnicos.deletar")) {
      items.push({
        key: "delete",
        label: "Excluir",
        icon: "delete",
        onClick: () => handleDeleteConfirm(tecnico),
        show: true,
        color: "danger" as const,
      });
    }

    return items.filter((item) => item.show);
  };

  // Verificar permissão de visualizar
  // Verificar loading primeiro
  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("tecnicos.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar técnicos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Técnicos
          </h1>
          <p className="text-default-500 text-sm">
            Gerencie os técnicos com acesso ao sistema
          </p>
        </div>
        {temPermissao("tecnicos.criar") && (
          <Button
            color="primary"
            size="lg"
            startContent={<UserPlus className="w-5 h-5" />}
            onPress={onLoginModalOpen}
          >
            Novo Técnico
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          isPressable
          className={filtroAtivo === undefined ? "border-2 border-primary" : ""}
          onPress={() => setFiltroAtivo(undefined)}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Total de Técnicos</p>
            <p className="text-3xl font-bold">{totalTecnicos}</p>
          </CardBody>
        </Card>
        <Card
          isPressable
          className={filtroAtivo === true ? "border-2 border-success" : ""}
          onPress={() => setFiltroAtivo(true)}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Ativos</p>
            <p className="text-3xl font-bold text-success">{tecnicosAtivos}</p>
          </CardBody>
        </Card>
        <Card
          isPressable
          className={filtroAtivo === false ? "border-2 border-danger" : ""}
          onPress={() => setFiltroAtivo(false)}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Inativos</p>
            <p className="text-3xl font-bold text-danger">{tecnicosInativos}</p>
          </CardBody>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            {/* Primeira linha: Busca e controles */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-start">
              {/* Campo de busca */}
              <div className="flex-1">
                <Input
                  isClearable
                  classNames={{
                    base: "w-full",
                    mainWrapper: "h-full",
                    input: "text-small",
                    inputWrapper:
                      "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                  }}
                  placeholder="Buscar por nome, telefone ou e-mail..."
                  size="lg"
                  startContent={
                    <Search className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onClear={() => setBusca("")}
                />
                {(busca !== buscaDebounced || totalTecnicos > 0) && (
                  <p className="text-xs text-default-400 mt-1 ml-1">
                    {busca !== buscaDebounced ? (
                      "Aguardando digitação..."
                    ) : totalTecnicos > 0 ? (
                      <>
                        {totalTecnicos} técnico
                        {totalTecnicos !== 1 ? "s" : ""} encontrado
                        {totalTecnicos !== 1 ? "s" : ""}
                      </>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Controles */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  className="min-w-[120px]"
                  color={showFilters ? "primary" : "default"}
                  size="lg"
                  startContent={<Filter className="w-4 h-4" />}
                  variant={showFilters ? "solid" : "flat"}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>
                <ButtonGroup size="lg">
                  <Button
                    isIconOnly
                    color={viewMode === "cards" ? "primary" : "default"}
                    variant={viewMode === "cards" ? "solid" : "flat"}
                    onPress={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    color={viewMode === "table" ? "primary" : "default"}
                    variant={viewMode === "table" ? "solid" : "flat"}
                    onPress={() => setViewMode("table")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
              <div className="pt-4 border-t border-divider">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Select
                    label="Ordenar por"
                    labelPlacement="outside-left"
                    classNames={{
                      base: "items-center",
                      label: "min-w-[100px]",
                    }}
                    selectedKeys={[sortBy]}
                    onChange={(e) =>
                      setSortBy(e.target.value as "nome" | "criado_em")
                    }
                  >
                    <SelectItem key="nome">Nome</SelectItem>
                    <SelectItem key="criado_em">Data de Cadastro</SelectItem>
                  </Select>

                  <Select
                    label="Ordem"
                    labelPlacement="outside-left"
                    classNames={{
                      base: "items-center",
                      label: "min-w-[60px]",
                    }}
                    selectedKeys={[sortOrder]}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                  >
                    <SelectItem
                      key="asc"
                      startContent={<SortAsc className="w-4 h-4" />}
                    >
                      Crescente
                    </SelectItem>
                    <SelectItem
                      key="desc"
                      startContent={<SortDesc className="w-4 h-4" />}
                    >
                      Decrescente
                    </SelectItem>
                  </Select>

                  <div className="md:col-span-2 lg:col-span-2 flex justify-end">
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<Download className="w-4 h-4" />}
                      variant="flat"
                      onPress={() => {
                        toast.success("Funcionalidade em desenvolvimento");
                      }}
                    >
                      Exportar Lista
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Lista de Técnicos */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : tecnicos.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-default-300" />
            <p className="text-default-500 mb-2">Nenhum técnico encontrado</p>
            {temPermissao("tecnicos.criar") && (
              <Button color="primary" variant="flat" onPress={onLoginModalOpen}>
                Cadastrar primeiro técnico
              </Button>
            )}
          </CardBody>
        </Card>
      ) : viewMode === "cards" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tecnicosPaginados.map((tecnico) => (
              <TecnicoCard
                key={tecnico.id}
                menuItems={getMenuItems(tecnico)}
                tecnico={tecnico}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                showControls
                total={totalPages}
                page={page}
                onChange={setPage}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <Table aria-label="Tabela de técnicos">
            <TableHeader>
              <TableColumn>TÉCNICO</TableColumn>
              <TableColumn>CONTATO</TableColumn>
              <TableColumn>ESPECIALIDADE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody>
              {tecnicosPaginados.map((tecnico) => (
                <TableRow key={tecnico.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-semibold">{tecnico.nome}</p>
                      {tecnico.email && (
                        <p className="text-xs text-default-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {tecnico.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {tecnico.telefone && (
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3 text-default-400" />
                          {formatarTelefone(tecnico.telefone)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tecnico.especialidades?.[0] ? (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-default-400" />
                        <span className="text-sm">
                          {tecnico.especialidades[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-default-400">
                        Não informado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={tecnico.ativo ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {tecnico.ativo ? "Ativo" : "Inativo"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Ações do técnico">
                        <DropdownItem
                          key="os"
                          startContent={<Briefcase className="w-4 h-4" />}
                          onPress={() =>
                            toast.info("Funcionalidade em desenvolvimento")
                          }
                        >
                          Ver OS
                        </DropdownItem>
                        {temPermissao("tecnicos.editar") ? (
                          <DropdownItem
                            key="toggle"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleToggleStatus(tecnico)}
                          >
                            {tecnico.ativo ? "Desativar" : "Ativar"}
                          </DropdownItem>
                        ) : null}
                        {temPermissao("tecnicos.deletar") ? (
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => handleDeleteConfirm(tecnico)}
                          >
                            Excluir
                          </DropdownItem>
                        ) : null}
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                showControls
                total={totalPages}
                page={page}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <TecnicoComLoginModal
        isOpen={isLoginModalOpen}
        onClose={onLoginModalClose}
        onSuccess={carregarTecnicos}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        message={`Tem certeza que deseja excluir o técnico ${tecnicoParaDeletar?.nome}?`}
        title="Excluir Técnico"
        onClose={onDeleteClose}
        onConfirm={handleDelete}
      />
    </div>
  );
}
