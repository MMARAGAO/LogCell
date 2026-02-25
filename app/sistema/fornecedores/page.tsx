"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  LayoutGrid,
  List,
  MoreVertical,
} from "lucide-react";

import { Fornecedor } from "@/types/fornecedor";
import {
  buscarFornecedores,
  deletarFornecedor,
  desativarFornecedor,
  ativarFornecedor,
  buscarProdutosPorFornecedor,
} from "@/services/fornecedorService";
import FornecedorModal from "@/components/fornecedores/FornecedorModal";
import AssociarProdutoModal from "@/components/fornecedores/AssociarProdutoModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";

export default function FornecedoresPage() {
  const { showToast } = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<
    Fornecedor[]
  >([]);
  const [produtosPorFornecedor, setProdutosPorFornecedor] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showApenasAtivos, setShowApenasAtivos] = useState(true);
  const [visualizacao, setVisualizacao] = useState<"cards" | "tabela">("cards");

  // Modals
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAssociarAberto, setModalAssociarAberto] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<Fornecedor | null>(null);
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [fornecedorParaDeletar, setFornecedorParaDeletar] =
    useState<Fornecedor | null>(null);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    filtrarFornecedores();
  }, [fornecedores, searchTerm, showApenasAtivos]);

  const carregarFornecedores = async () => {
    setLoading(true);
    const { data, error } = await buscarFornecedores();

    if (error) {
      showToast("Erro ao carregar fornecedores", "error");
    } else if (data) {
      setFornecedores(data);

      // Carregar produtos para cada fornecedor
      const produtosMap: Record<string, any[]> = {};

      for (const fornecedor of data) {
        const { data: produtos } = await buscarProdutosPorFornecedor(
          fornecedor.id,
        );

        if (produtos) {
          produtosMap[fornecedor.id] = produtos;
        }
      }
      setProdutosPorFornecedor(produtosMap);
    }

    setLoading(false);
  };

  const filtrarFornecedores = () => {
    let filtrados = fornecedores;

    // Filtrar por status
    if (showApenasAtivos) {
      filtrados = filtrados.filter((f) => f.ativo);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();

      filtrados = filtrados.filter(
        (f) =>
          f.nome.toLowerCase().includes(termo) ||
          f.cnpj?.toLowerCase().includes(termo) ||
          f.email?.toLowerCase().includes(termo) ||
          f.cidade?.toLowerCase().includes(termo),
      );
    }

    setFornecedoresFiltrados(filtrados);
  };

  const handleNovoFornecedor = () => {
    setFornecedorSelecionado(null);
    setModalAberto(true);
  };

  const getMenuItems = (fornecedor: Fornecedor) => {
    const items: Array<{
      key: string;
      label: string;
      icon: React.ReactElement;
      onClick: () => void;
      show: boolean;
      className?: string;
      color?:
        | "default"
        | "primary"
        | "secondary"
        | "success"
        | "warning"
        | "danger";
    }> = [
      {
        key: "produtos",
        label: "Ver Produtos",
        icon: <Package className="w-4 h-4" />,
        onClick: () => handleAssociarProdutos(fornecedor),
        show: true,
      },
    ];

    if (temPermissao("fornecedores.editar")) {
      items.push({
        key: "editar",
        label: "Editar",
        icon: <Edit className="w-4 h-4" />,
        onClick: () => handleEditarFornecedor(fornecedor),
        show: true,
      });
    }

    if (temPermissao("fornecedores.editar")) {
      items.push({
        key: "toggle",
        label: fornecedor.ativo ? "Desativar" : "Ativar",
        icon: fornecedor.ativo ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        ),
        onClick: () => handleToggleStatus(fornecedor),
        show: true,
      });
    }

    if (temPermissao("fornecedores.deletar")) {
      items.push({
        key: "deletar",
        label: "Deletar",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => handleDeletarFornecedor(fornecedor),
        show: true,
        className: "text-danger",
        color: "danger" as const,
      });
    }

    return items.filter((item) => item.show);
  };

  const handleEditarFornecedor = (fornecedor: Fornecedor) => {
    if (!temPermissao("fornecedores.editar")) {
      showToast("Você não tem permissão para editar fornecedores", "error");

      return;
    }

    setFornecedorSelecionado(fornecedor);
    setModalAberto(true);
  };

  const handleAssociarProdutos = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setModalAssociarAberto(true);
  };

  const handleDeletarFornecedor = (fornecedor: Fornecedor) => {
    if (!temPermissao("fornecedores.deletar")) {
      showToast("Você não tem permissão para deletar fornecedores", "error");

      return;
    }

    setFornecedorParaDeletar(fornecedor);
    setConfirmModalAberto(true);
  };

  const confirmarDelecao = async () => {
    if (!fornecedorParaDeletar) return;

    const { error } = await deletarFornecedor(fornecedorParaDeletar.id);

    if (error) {
      showToast("Erro ao deletar fornecedor", "error");
    } else {
      showToast("Fornecedor deletado com sucesso", "success");
      carregarFornecedores();
    }

    setConfirmModalAberto(false);
    setFornecedorParaDeletar(null);
  };

  const handleToggleStatus = async (fornecedor: Fornecedor) => {
    const { error } = fornecedor.ativo
      ? await desativarFornecedor(fornecedor.id)
      : await ativarFornecedor(fornecedor.id);

    if (error) {
      showToast(
        `Erro ao ${fornecedor.ativo ? "desativar" : "ativar"} fornecedor`,
        "error",
      );
    } else {
      showToast(
        `Fornecedor ${fornecedor.ativo ? "desativado" : "ativado"} com sucesso`,
        "success",
      );
      carregarFornecedores();
    }
  };

  const handleSalvarFornecedor = () => {
    setModalAberto(false);
    carregarFornecedores();
  };

  // Verificar loading primeiro
  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Verificar permissão de visualizar
  if (!temPermissao("fornecedores.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar fornecedores.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          Fornecedores
        </h1>
        <p className="text-default-500">
          Gerencie os fornecedores e suas associações com produtos
        </p>
      </div>

      {/* Filtros e Ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
          <Input
            isClearable
            className="w-full md:w-96"
            placeholder="Buscar por nome, CNPJ, email ou cidade..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            onClear={() => setSearchTerm("")}
          />

          <Button
            color={showApenasAtivos ? "primary" : "default"}
            variant={showApenasAtivos ? "flat" : "bordered"}
            onClick={() => setShowApenasAtivos(!showApenasAtivos)}
          >
            {showApenasAtivos ? "Apenas Ativos" : "Todos"}
          </Button>
        </div>

        <div className="flex gap-2">
          {/* Botões de Visualização */}
          <Button
            isIconOnly
            color={visualizacao === "cards" ? "primary" : "default"}
            variant={visualizacao === "cards" ? "flat" : "light"}
            onClick={() => setVisualizacao("cards")}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            color={visualizacao === "tabela" ? "primary" : "default"}
            variant={visualizacao === "tabela" ? "flat" : "light"}
            onClick={() => setVisualizacao("tabela")}
          >
            <List className="w-5 h-5" />
          </Button>

          {temPermissao("fornecedores.criar") && (
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onClick={handleNovoFornecedor}
            >
              Novo Fornecedor
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : fornecedoresFiltrados.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-default-300" />
            <p className="text-lg text-default-500">
              {searchTerm
                ? "Nenhum fornecedor encontrado com os filtros aplicados"
                : "Nenhum fornecedor cadastrado ainda"}
            </p>
            {!searchTerm && (
              <Button
                className="mt-4"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onClick={handleNovoFornecedor}
              >
                Cadastrar Primeiro Fornecedor
              </Button>
            )}
          </CardBody>
        </Card>
      ) : visualizacao === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {fornecedoresFiltrados.map((fornecedor) => (
            <Card
              key={fornecedor.id}
              className={!fornecedor.ativo ? "opacity-60" : ""}
            >
              <CardBody className="p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">
                        {fornecedor.nome}
                      </h3>
                      <Chip
                        color={fornecedor.ativo ? "success" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Chip>
                    </div>
                    {fornecedor.cnpj && (
                      <p className="text-sm text-default-500">
                        CNPJ: {fornecedor.cnpj}
                      </p>
                    )}
                  </div>
                </div>

                {/* Informações de Contato */}
                <div className="space-y-2 mb-4">
                  {fornecedor.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-default-400" />
                      <span>{fornecedor.telefone}</span>
                    </div>
                  )}

                  {fornecedor.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-default-400" />
                      <span>{fornecedor.email}</span>
                    </div>
                  )}

                  {(fornecedor.cidade || fornecedor.estado) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-default-400" />
                      <span>
                        {fornecedor.cidade}
                        {fornecedor.cidade && fornecedor.estado && " - "}
                        {fornecedor.estado}
                      </span>
                    </div>
                  )}

                  {fornecedor.contato_nome && (
                    <div className="text-sm mt-2 pt-2 border-t border-default-200">
                      <span className="text-default-500">Contato: </span>
                      <span>{fornecedor.contato_nome}</span>
                      {fornecedor.contato_telefone && (
                        <span className="text-default-500">
                          {" "}
                          - {fornecedor.contato_telefone}
                        </span>
                      )}
                    </div>
                  )}

                  {fornecedor.observacoes && (
                    <div className="text-sm mt-2 pt-2 border-t border-default-200">
                      <span className="text-default-500">Obs: </span>
                      <span className="text-default-600">
                        {fornecedor.observacoes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Produtos Associados */}
                {produtosPorFornecedor[fornecedor.id] &&
                  produtosPorFornecedor[fornecedor.id].length > 0 && (
                    <div className="mb-4 pb-3 border-b border-default-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-default-700">
                          Produtos (
                          {produtosPorFornecedor[fornecedor.id].length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {produtosPorFornecedor[fornecedor.id]
                          .slice(0, 5)
                          .filter((item: any) => item.produto)
                          .map((item: any) => (
                            <Chip
                              key={item.produto.id}
                              color="primary"
                              size="sm"
                              variant="flat"
                            >
                              {item.produto.descricao}
                            </Chip>
                          ))}
                        {produtosPorFornecedor[fornecedor.id].length > 5 && (
                          <Chip color="default" size="sm" variant="flat">
                            +{produtosPorFornecedor[fornecedor.id].length - 5}
                          </Chip>
                        )}
                      </div>
                    </div>
                  )}

                {/* Ações */}
                <div className="flex gap-2 pt-3 border-t border-default-200">
                  {getMenuItems(fornecedor).map((item) => (
                    <Button
                      key={item.key}
                      className={item.className}
                      color={
                        item.color ||
                        (item.key === "produtos"
                          ? "primary"
                          : item.key === "toggle"
                            ? fornecedor.ativo
                              ? "warning"
                              : "success"
                            : "default")
                      }
                      size="sm"
                      startContent={item.icon}
                      variant="flat"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        // Visualização em Tabela
        <Table aria-label="Tabela de fornecedores">
          <TableHeader>
            <TableColumn>FORNECEDOR</TableColumn>
            <TableColumn>CNPJ</TableColumn>
            <TableColumn>CONTATO</TableColumn>
            <TableColumn>LOCALIZAÇÃO</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody>
            {fornecedoresFiltrados.map((fornecedor) => (
              <TableRow key={fornecedor.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold">{fornecedor.nome}</p>
                    {fornecedor.contato_nome && (
                      <p className="text-xs text-default-500">
                        Contato: {fornecedor.contato_nome}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{fornecedor.cnpj || "-"}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {fornecedor.telefone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{fornecedor.telefone}</span>
                      </div>
                    )}
                    {fornecedor.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {fornecedor.email}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {fornecedor.cidade || fornecedor.estado ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {fornecedor.cidade}
                        {fornecedor.cidade && fornecedor.estado && " - "}
                        {fornecedor.estado}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    color={fornecedor.ativo ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {fornecedor.ativo ? "Ativo" : "Inativo"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Ações do fornecedor">
                      {getMenuItems(fornecedor).map((item) => (
                        <DropdownItem
                          key={item.key}
                          className={item.className}
                          color={item.color}
                          startContent={item.icon}
                          onClick={item.onClick}
                        >
                          {item.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <FornecedorModal
        fornecedor={fornecedorSelecionado}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarFornecedor}
      />

      <AssociarProdutoModal
        fornecedor={fornecedorSelecionado}
        isOpen={modalAssociarAberto}
        onClose={() => setModalAssociarAberto(false)}
      />

      <ConfirmModal
        cancelText="Cancelar"
        confirmText="Deletar"
        isOpen={confirmModalAberto}
        message={`Tem certeza que deseja deletar o fornecedor "${fornecedorParaDeletar?.nome}"? Esta ação não pode ser desfeita.`}
        title="Confirmar Exclusão"
        onClose={() => setConfirmModalAberto(false)}
        onConfirm={confirmarDelecao}
      />
    </div>
  );
}
