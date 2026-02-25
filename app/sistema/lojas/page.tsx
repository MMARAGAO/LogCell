"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { deletarLoja, alternarStatusLoja } from "./actions";

import { Loja } from "@/types";
import { LojasService } from "@/services/lojasService";
import {
  LojaFormModal,
  LojasStats,
  HistoricoLojaModal,
  GerenciarFotosLojaModal,
} from "@/components/lojas";
import { ConfirmModal } from "@/components/ConfirmModal";
import { supabase } from "@/lib/supabaseClient";
import { useFotosLoja } from "@/hooks/useFotosLoja";
import MiniCarrossel from "@/components/MiniCarrossel";
import { usePermissoes } from "@/hooks/usePermissoes";

// Componente LojaCard com carrossel de fotos
function LojaCard({
  loja,
  actionButtons,
  menuItems,
}: {
  loja: Loja;
  actionButtons: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "flat" | "solid";
    color?: "primary" | "default";
  }>;
  menuItems: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
    color?: "danger" | "default";
  }>;
}) {
  const { fotos, loading: loadingFotos } = useFotosLoja(loja.id);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow">
      {/* Carrossel de Fotos */}
      <div className="relative">
        {loadingFotos ? (
          <div className="bg-default-100 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-default-400">Carregando fotos...</p>
            </div>
          </div>
        ) : (
          <MiniCarrossel
            alt={loja.nome}
            aspectRatio="video"
            images={fotos}
            showControls={fotos.length > 1}
          />
        )}

        {/* Badge de Status - Sobreposto no carrossel */}
        <div className="absolute top-3 right-3 z-20">
          <Chip
            className="font-semibold"
            color={loja.ativo ? "success" : "danger"}
            size="sm"
            variant="shadow"
          >
            {loja.ativo ? "Ativa" : "Inativa"}
          </Chip>
        </div>
      </div>

      <CardBody className="p-6">
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-primary-50 rounded-xl">
              <BuildingStorefrontIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg line-clamp-1">{loja.nome}</h3>
              <p className="text-xs text-default-400 font-mono">#{loja.id}</p>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-3">
          {loja.cnpj && (
            <div>
              <p className="text-xs text-default-500 mb-1">CNPJ</p>
              <p className="text-sm font-medium">{loja.cnpj}</p>
            </div>
          )}

          {loja.email && (
            <div>
              <p className="text-xs text-default-500 mb-1">E-mail</p>
              <p className="text-sm">{loja.email}</p>
            </div>
          )}

          {loja.telefone && (
            <div>
              <p className="text-xs text-default-500 mb-1">Telefone</p>
              <p className="text-sm">{loja.telefone}</p>
            </div>
          )}

          {(loja.endereco || (loja.cidade && loja.estado)) && (
            <div>
              <p className="text-xs text-default-500 mb-1">Localização</p>
              {loja.endereco && <p className="text-sm">{loja.endereco}</p>}
              {loja.cidade && loja.estado && (
                <p className="text-sm font-medium">
                  {loja.cidade} - {loja.estado}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs text-default-500 mb-1">Cadastrado em</p>
            <p className="text-sm">
              {new Date(loja.criado_em).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </CardBody>

      <CardFooter className="gap-2 border-t border-default-200 px-6 py-3">
        {actionButtons.map((btn) => (
          <Button
            key={btn.key}
            color={btn.color}
            size="sm"
            startContent={btn.icon}
            variant={btn.variant || "flat"}
            onPress={btn.onClick}
          >
            {btn.label}
          </Button>
        ))}
        {menuItems.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações da loja">
              {menuItems.map((item) => (
                <DropdownItem
                  key={item.key}
                  className={item.className}
                  color={item.color}
                  startContent={item.icon}
                  onPress={item.onClick}
                >
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </CardFooter>
    </Card>
  );
}

export default function LojasPage() {
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoja, setSelectedLoja] = useState<Loja | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historicoLojaId, setHistoricoLojaId] = useState<number | null>(null);
  const [historicoLojaNome, setHistoricoLojaNome] = useState("");
  const [fotosLojaId, setFotosLojaId] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [fotosLojaNome, setFotosLojaNome] = useState("");
  const [visualizacao, setVisualizacao] = useState<"tabela" | "cards">("cards");

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isHistoricoOpen,
    onOpen: onHistoricoOpen,
    onClose: onHistoricoClose,
  } = useDisclosure();

  const {
    isOpen: isFotosOpen,
    onOpen: onFotosOpen,
    onClose: onFotosClose,
  } = useDisclosure();

  // Carrega usuário logado e lojas
  useEffect(() => {
    const carregarDados = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Erro ao obter usuário:", error);
        setLoading(false);

        return;
      }

      if (user) {
        setUsuarioId(user.id);
        await carregarLojas();
      } else {
        console.warn("Nenhum usuário autenticado!");
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const carregarLojas = async () => {
    setLoading(true);

    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.warn("Timeout ao carregar lojas - forçando fim do loading");
      setLoading(false);
    }, 10000); // 10 segundos

    try {
      const data = await LojasService.getTodasLojas();

      clearTimeout(timeoutId);
      setLojas(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Erro ao carregar lojas:", error);
      setLojas([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcula estatísticas
  const stats = {
    total: lojas.length,
    ativas: lojas.filter((l) => l.ativo).length,
    inativas: lojas.filter((l) => !l.ativo).length,
    novasEsteMes: lojas.filter((l) => {
      const criadoEm = new Date(l.criado_em);
      const hoje = new Date();

      return (
        criadoEm.getMonth() === hoje.getMonth() &&
        criadoEm.getFullYear() === hoje.getFullYear()
      );
    }).length,
  };

  // Filtra lojas
  const lojasFiltradas = lojas.filter((loja) => {
    const termo = searchTerm.toLowerCase();

    return (
      loja.nome.toLowerCase().includes(termo) ||
      loja.cnpj?.toLowerCase().includes(termo) ||
      loja.cidade?.toLowerCase().includes(termo) ||
      loja.estado?.toLowerCase().includes(termo)
    );
  });

  const handleNovo = () => {
    setSelectedLoja(null);
    onFormOpen();
  };

  const handleEditar = (loja: Loja) => {
    if (!temPermissao("lojas.editar")) {
      setErrorMessage("Você não tem permissão para editar lojas");

      return;
    }
    setSelectedLoja(loja);
    onFormOpen();
  };

  const handleExcluir = (loja: Loja) => {
    if (!temPermissao("lojas.deletar")) {
      setErrorMessage("Você não tem permissão para deletar lojas");

      return;
    }
    setSelectedLoja(loja);
    onDeleteOpen();
  };

  const handleAlternarStatus = async (loja: Loja) => {
    if (!temPermissao("lojas.editar")) {
      setErrorMessage("Você não tem permissão para alterar o status de lojas");

      return;
    }
    setErrorMessage(null);
    try {
      const result = await alternarStatusLoja(loja.id, !loja.ativo, usuarioId);

      if (result.success) {
        await carregarLojas();
      } else {
        setErrorMessage(result.error || "Erro ao alterar status da loja");
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setErrorMessage("Erro inesperado ao alterar status da loja");
    }
  };

  const confirmarExclusao = async () => {
    if (!selectedLoja) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const result = await deletarLoja(selectedLoja.id, usuarioId);

      if (result.success) {
        await carregarLojas();
        onDeleteClose();
      } else {
        setErrorMessage(result.error || "Erro ao excluir loja");
        onDeleteClose();
      }
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      setErrorMessage("Erro inesperado ao excluir loja");
      onDeleteClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    await carregarLojas();
    onFormClose();
  };

  const handleFotos = (loja: Loja) => {
    setFotosLojaId(loja.id);
    setFotosLojaNome(loja.nome);
    onFotosOpen();
  };

  const handleHistorico = (loja: Loja) => {
    setHistoricoLojaId(loja.id);
    setHistoricoLojaNome(loja.nome);
    onHistoricoOpen();
  };

  const getActionButtons = (loja: Loja) => {
    const buttons: Array<{
      key: string;
      label: string;
      icon: React.ReactElement;
      onClick: () => void;
      show: boolean;
      variant?: "flat" | "solid";
      color?: "primary" | "default";
    }> = [
      {
        key: "fotos",
        label: "Fotos",
        icon: <PhotoIcon className="w-4 h-4" />,
        onClick: () => handleFotos(loja),
        show: true,
        variant: "flat" as const,
      },
    ];

    if (temPermissao("lojas.editar")) {
      buttons.unshift({
        key: "editar",
        label: "Editar",
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: () => handleEditar(loja),
        show: true,
        variant: "flat" as const,
        color: "primary" as const,
      });
    }

    return buttons.filter((btn) => btn.show);
  };

  const getMenuItems = (loja: Loja) => {
    const items = [];

    if (temPermissao("lojas.editar")) {
      items.push({
        key: "editar",
        label: "Editar",
        icon: <PencilIcon className="w-4 h-4" />,
        onClick: () => handleEditar(loja),
        show: true,
      });
    }

    items.push({
      key: "fotos",
      label: "Gerenciar Fotos",
      icon: <PhotoIcon className="w-4 h-4" />,
      onClick: () => handleFotos(loja),
      show: true,
    });

    items.push({
      key: "historico",
      label: "Ver Histórico",
      icon: <ClockIcon className="w-4 h-4" />,
      onClick: () => handleHistorico(loja),
      show: true,
    });

    if (temPermissao("lojas.editar")) {
      items.push({
        key: "toggle",
        label: loja.ativo ? "Desativar" : "Ativar",
        icon: loja.ativo ? (
          <XCircleIcon className="w-4 h-4" />
        ) : (
          <CheckCircleIcon className="w-4 h-4" />
        ),
        onClick: () => handleAlternarStatus(loja),
        show: true,
      });
    }

    if (temPermissao("lojas.deletar")) {
      items.push({
        key: "deletar",
        label: "Excluir",
        icon: <TrashIcon className="w-4 h-4" />,
        onClick: () => handleExcluir(loja),
        show: true,
        className: "text-danger",
        color: "danger" as const,
      });
    }

    return items.filter((item) => item.show);
  };

  // Verificar loading primeiro
  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("lojas.visualizar")) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-danger mb-2">Acesso Negado</h2>
          <p className="text-default-500">
            Você não tem permissão para visualizar as lojas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lojas / Filiais</h1>
          <p className="text-default-500 mt-1">
            Gerencie as lojas e filiais do sistema
          </p>
        </div>
        {temPermissao("lojas.criar") && (
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={handleNovo}
          >
            Nova Loja
          </Button>
        )}
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Estatísticas */}
      <LojasStats
        ativas={stats.ativas}
        inativas={stats.inativas}
        novasEsteMes={stats.novasEsteMes}
        total={stats.total}
      />

      {/* Barra de Busca */}
      <div className="mb-6">
        <Input
          isClearable
          placeholder="Buscar por nome, CNPJ, cidade ou estado..."
          startContent={<MagnifyingGlassIcon className="w-5 h-5" />}
          value={searchTerm}
          onClear={() => setSearchTerm("")}
          onValueChange={setSearchTerm}
        />
      </div>

      {/* Tabs de Visualização */}
      <div className="mb-6">
        <Tabs
          color="primary"
          selectedKey={visualizacao}
          onSelectionChange={(key) =>
            setVisualizacao(key as "tabela" | "cards")
          }
        >
          <Tab key="cards" title="Cards" />
          <Tab key="tabela" title="Tabela" />
        </Tabs>
      </div>

      {/* Loading e Empty State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner label="Carregando lojas..." size="lg" />
        </div>
      ) : lojasFiltradas.length === 0 ? (
        <div className="text-center py-20">
          <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-default-300 mb-4" />
          <p className="text-default-500">
            {searchTerm
              ? "Nenhuma loja encontrada com esse filtro"
              : "Nenhuma loja cadastrada ainda"}
          </p>
          {!searchTerm && (
            <Button
              className="mt-4"
              color="primary"
              startContent={<PlusIcon className="w-5 h-5" />}
              onPress={handleNovo}
            >
              Cadastrar Primeira Loja
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Visualização em Cards */}
          {visualizacao === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lojasFiltradas.map((loja) => (
                <LojaCard
                  key={loja.id}
                  actionButtons={getActionButtons(loja)}
                  loja={loja}
                  menuItems={getMenuItems(loja)}
                />
              ))}
            </div>
          )}

          {/* Visualização em Tabela */}
          {visualizacao === "tabela" && (
            <Table aria-label="Tabela de lojas">
              <TableHeader>
                <TableColumn>LOJA</TableColumn>
                <TableColumn>CNPJ</TableColumn>
                <TableColumn>TELEFONE</TableColumn>
                <TableColumn>LOCALIZAÇÃO</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CADASTRO</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody>
                {lojasFiltradas.map((loja) => (
                  <TableRow key={loja.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <BuildingStorefrontIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{loja.nome}</p>
                          <p className="text-xs text-default-400 font-mono">
                            #{loja.id}
                          </p>
                          {loja.email && (
                            <p className="text-sm text-default-500">
                              {loja.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{loja.cnpj || "Não informado"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {loja.telefone || "Não informado"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div>
                        {loja.cidade && loja.estado ? (
                          <>
                            <p className="text-sm font-medium">
                              {loja.cidade} - {loja.estado}
                            </p>
                            {loja.endereco && (
                              <p className="text-xs text-default-500">
                                {loja.endereco}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-default-500">
                            Não informado
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={loja.ativo ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                      >
                        {loja.ativo ? "Ativa" : "Inativa"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(loja.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Ações da loja">
                          {getMenuItems(loja).map((item) => (
                            <DropdownItem
                              key={item.key}
                              className={item.className}
                              color={item.color}
                              startContent={item.icon}
                              onPress={item.onClick}
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
        </>
      )}

      {/* Modal de Formulário */}
      <LojaFormModal
        isOpen={isFormOpen}
        loja={selectedLoja}
        usuarioId={usuarioId}
        onClose={onFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de Histórico */}
      {historicoLojaId && (
        <HistoricoLojaModal
          isOpen={isHistoricoOpen}
          lojaId={historicoLojaId}
          lojaNome={historicoLojaNome}
          onClose={onHistoricoClose}
        />
      )}

      {/* Modal de Gerenciar Fotos */}
      {fotosLojaId && (
        <GerenciarFotosLojaModal
          isOpen={isFotosOpen}
          lojaId={fotosLojaId}
          lojaNome={fotosLojaNome}
          onClose={onFotosClose}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="danger"
        confirmText="Excluir"
        isLoading={isDeleting}
        isOpen={isDeleteOpen}
        message={`Tem certeza que deseja excluir a loja ${selectedLoja?.nome}? Esta ação desativará a loja no sistema.`}
        title="Confirmar Exclusão"
        onClose={onDeleteClose}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
