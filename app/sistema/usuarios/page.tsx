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
import { Avatar } from "@heroui/avatar";
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
  ShieldCheckIcon,
  ClockIcon,
  TableCellsIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { Usuario } from "@/types";
import { AuthService } from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";
import { usePermissoes } from "@/hooks/usePermissoes";
import { Permissao } from "@/components/Permissao";
import {
  cadastrarUsuario,
  atualizarUsuario,
  deletarUsuario,
  alternarStatusUsuario,
} from "./actions";
import { UsuarioFormModal } from "@/components/usuarios/UsuarioFormModal";
import { UsuariosStats } from "@/components/usuarios/UsuariosStats";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PermissoesModal } from "@/components/usuarios/PermissoesModal";
import { HistoricoUsuarioModal } from "@/components/usuarios/HistoricoUsuarioModal";
import { UsuarioCard } from "@/components/usuarios/UsuarioCard";
import { useFotoPerfilUsuario } from "@/hooks/useFotoPerfilUsuario";
import { useToast } from "@/components/Toast";

export default function UsuariosPage() {
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [fotosUsuarios, setFotosUsuarios] = useState<Record<string, string>>(
    {}
  );

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
    isOpen: isPermissoesOpen,
    onOpen: onPermissoesOpen,
    onClose: onPermissoesClose,
  } = useDisclosure();

  const {
    isOpen: isHistoricoOpen,
    onOpen: onHistoricoOpen,
    onClose: onHistoricoClose,
  } = useDisclosure();

  // Carrega usuários e suas fotos
  useEffect(() => {
    let mounted = true;

    const carregarUsuariosInterno = async () => {
      if (!mounted) return;

      try {
        const data = await AuthService.getTodosUsuarios();
        if (mounted) {
          setUsuarios(data);

          // Buscar fotos de todos os usuários
          await carregarFotosUsuarios(data.map((u) => u.id));
        }
      } catch (error) {
        if (mounted) {
          console.error("Erro ao carregar usuários:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    carregarUsuariosInterno();

    return () => {
      mounted = false;
    };
  }, []); // Executa apenas uma vez

  const carregarFotosUsuarios = async (usuarioIds: string[]) => {
    try {
      const { data } = await supabase
        .from("fotos_perfil")
        .select("usuario_id, url, criado_em")
        .in("usuario_id", usuarioIds)
        .order("criado_em", { ascending: false });

      if (data) {
        // Cria um mapa com a foto mais recente de cada usuário
        const fotosMap: Record<string, string> = {};
        const usuariosProcessados = new Set<string>();

        for (const foto of data) {
          if (!usuariosProcessados.has(foto.usuario_id)) {
            fotosMap[foto.usuario_id] = foto.url;
            usuariosProcessados.add(foto.usuario_id);
          }
        }

        setFotosUsuarios(fotosMap);
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const carregarUsuarios = async () => {
    setLoading(true);

    try {
      const data = await AuthService.getTodosUsuarios();
      setUsuarios(data);
      await carregarFotosUsuarios(data.map((u) => u.id));
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcula estatísticas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo).length,
    novosEsteMes: usuarios.filter((u) => {
      const criadoEm = new Date(u.criado_em);
      const hoje = new Date();
      return (
        criadoEm.getMonth() === hoje.getMonth() &&
        criadoEm.getFullYear() === hoje.getFullYear()
      );
    }).length,
  };

  // Filtra usuários
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = searchTerm.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.cpf?.toLowerCase().includes(termo) ||
      usuario.telefone?.toLowerCase().includes(termo)
    );
  });

  const handleNovo = () => {
    if (!temPermissao("usuarios.criar")) {
      toast.error("Você não tem permissão para criar usuários");
      return;
    }
    setSelectedUsuario(null);
    onFormOpen();
  };

  const handleEditar = (usuario: Usuario) => {
    if (!temPermissao("usuarios.editar")) {
      toast.error("Você não tem permissão para editar usuários");
      return;
    }
    setSelectedUsuario(usuario);
    onFormOpen();
  };

  const handleExcluir = (usuario: Usuario) => {
    if (!temPermissao("usuarios.deletar")) {
      toast.error("Você não tem permissão para excluir usuários");
      return;
    }
    setSelectedUsuario(usuario);
    onDeleteOpen();
  };

  const handlePermissoes = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    onPermissoesOpen();
  };

  const handleAlternarStatus = async (usuario: Usuario) => {
    setErrorMessage(null);
    try {
      const result = await alternarStatusUsuario(usuario.id, !usuario.ativo);
      if (result.success) {
        await carregarUsuarios();
      } else {
        setErrorMessage(result.error || "Erro ao alterar status do usuário");
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setErrorMessage("Erro inesperado ao alterar status do usuário");
    }
  };

  const confirmarExclusao = async () => {
    if (!selectedUsuario) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const result = await deletarUsuario(selectedUsuario.id);
      if (result.success) {
        await carregarUsuarios();
        onDeleteClose();
      } else {
        setErrorMessage(result.error || "Erro ao excluir usuário");
        onDeleteClose();
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setErrorMessage("Erro inesperado ao excluir usuário");
      onDeleteClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    await carregarUsuarios();
    onFormClose();
  };

  // Gerar itens do menu baseado em permissões
  const getMenuItems = (usuario: Usuario) => {
    const items = [];

    if (temPermissao("usuarios.editar")) {
      items.push(
        <DropdownItem
          key="edit"
          startContent={<PencilIcon className="w-4 h-4" />}
          onPress={() => handleEditar(usuario)}
        >
          Editar
        </DropdownItem>
      );
    }

    if (temPermissao("usuarios.editar")) {
      items.push(
        <DropdownItem
          key="permissions"
          startContent={<ShieldCheckIcon className="w-4 h-4" />}
          onPress={() => handlePermissoes(usuario)}
        >
          Gerenciar Permissões
        </DropdownItem>
      );
    }

    if (temPermissao("usuarios.visualizar")) {
      items.push(
        <DropdownItem
          key="historico"
          startContent={<ClockIcon className="w-4 h-4" />}
          onPress={() => {
            setSelectedUsuario(usuario);
            onHistoricoOpen();
          }}
        >
          Ver Histórico
        </DropdownItem>
      );
    }

    if (temPermissao("usuarios.editar")) {
      items.push(
        <DropdownItem
          key="toggle-status"
          startContent={
            usuario.ativo ? (
              <XCircleIcon className="w-4 h-4" />
            ) : (
              <CheckCircleIcon className="w-4 h-4" />
            )
          }
          onPress={() => handleAlternarStatus(usuario)}
        >
          {usuario.ativo ? "Desativar" : "Ativar"}
        </DropdownItem>
      );
    }

    if (temPermissao("usuarios.deletar")) {
      items.push(
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<TrashIcon className="w-4 h-4" />}
          onPress={() => handleExcluir(usuario)}
        >
          Excluir
        </DropdownItem>
      );
    }

    return items;
  };

  // Verificar loading de permissões
  if (loadingPermissoes) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Carregando permissões..." />
      </div>
    );
  }

  // Verificar permissão de acesso
  if (!temPermissao("usuarios.visualizar")) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-danger" />
          <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
          <p className="text-default-500">
            Você não tem permissão para visualizar usuários
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-default-500 mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Permissao permissao="usuarios.criar">
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={handleNovo}
          >
            Novo Usuário
          </Button>
        </Permissao>
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Estatísticas */}
      <UsuariosStats
        total={stats.total}
        ativos={stats.ativos}
        inativos={stats.inativos}
        novosEsteMes={stats.novosEsteMes}
      />

      {/* Barra de Pesquisa */}
      <div className="mb-6 flex gap-4 items-center">
        <Input
          placeholder="Buscar por nome, email, CPF ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={
            <MagnifyingGlassIcon className="w-5 h-5 text-default-400" />
          }
          variant="bordered"
          className="max-w-md"
        />
        <div className="flex gap-2">
          <Button
            isIconOnly
            variant={viewMode === "table" ? "flat" : "light"}
            color={viewMode === "table" ? "primary" : "default"}
            onPress={() => setViewMode("table")}
            aria-label="Visualização em tabela"
          >
            <TableCellsIcon className="w-5 h-5" />
          </Button>
          <Button
            isIconOnly
            variant={viewMode === "cards" ? "flat" : "light"}
            color={viewMode === "cards" ? "primary" : "default"}
            onPress={() => setViewMode("cards")}
            aria-label="Visualização em cards"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" label="Carregando usuários..." />
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-background rounded-lg border border-divider">
          <Table aria-label="Tabela de usuários">
            <TableHeader>
              <TableColumn>USUÁRIO</TableColumn>
              <TableColumn>CONTATO</TableColumn>
              <TableColumn>CPF</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CRIADO EM</TableColumn>
              <TableColumn width={50}>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nenhum usuário encontrado">
              {usuariosFiltrados.map((usuario) => {
                const fotoUrl = fotosUsuarios[usuario.id];

                return (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={usuario.nome}
                          src={fotoUrl || undefined}
                          size="sm"
                          showFallback
                          color="primary"
                        />
                        <div>
                          <p className="font-semibold">{usuario.nome}</p>
                          <p className="text-sm text-default-500">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {usuario.telefone || "Não informado"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {usuario.cpf || "Não informado"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={usuario.ativo ? "success" : "danger"}
                        variant="flat"
                        size="sm"
                      >
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(usuario.criado_em).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getMenuItems(usuario).length > 0 ? (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Ações do usuário">
                            {getMenuItems(usuario)}
                          </DropdownMenu>
                        </Dropdown>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {usuariosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-20 text-default-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            usuariosFiltrados.map((usuario) => (
              <UsuarioCard
                key={usuario.id}
                usuario={usuario}
                onEditar={handleEditar}
                onPermissoes={handlePermissoes}
                onHistorico={(u) => {
                  setSelectedUsuario(u);
                  onHistoricoOpen();
                }}
                onAlternarStatus={handleAlternarStatus}
                onExcluir={handleExcluir}
              />
            ))
          )}
        </div>
      )}

      {/* Modal de Formulário */}
      <UsuarioFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        usuario={selectedUsuario}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de Permissões */}
      {selectedUsuario && (
        <PermissoesModal
          isOpen={isPermissoesOpen}
          onClose={onPermissoesClose}
          usuarioId={selectedUsuario.id}
          usuarioNome={selectedUsuario.nome}
          onSuccess={() => {
            // Opcional: recarregar dados se necessário
          }}
        />
      )}

      {/* Modal de Histórico */}
      {selectedUsuario && (
        <HistoricoUsuarioModal
          isOpen={isHistoricoOpen}
          onClose={onHistoricoClose}
          usuario={selectedUsuario}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário ${selectedUsuario?.nome}? Esta ação desativará o usuário no sistema.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
