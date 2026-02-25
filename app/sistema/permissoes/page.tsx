"use client";

import type { Permissao, PerfilUsuario } from "@/types/permissoes";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Spinner,
} from "@heroui/react";
import { Shield, User, Edit, Search } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { PermissoesModal } from "@/components/usuarios/PermissoesModal";
import { PERMISSOES_POR_PERFIL } from "@/types/permissoes";
import { usePermissoes } from "@/hooks/usePermissoes";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: "usuario" | "tecnico";
  permissoes_customizadas?: Permissao[] | null;
}

interface PermissoesUsuario {
  id: number;
  usuario_id: string;
  permissoes: Permissao[];
  criado_em: string;
  atualizado_em: string;
}

export default function GerenciarPermissoesPage() {
  const toast = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null,
  );
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      // Buscar usuários
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, nome, email, tipo_usuario")
        .order("nome");

      if (usuariosError) throw usuariosError;

      // Buscar permissões customizadas
      const { data: permissoesData, error: permissoesError } = await supabase
        .from("permissoes")
        .select("*");

      if (permissoesError) throw permissoesError;

      // Combinar dados
      const usuariosComPermissoes = usuariosData.map((usuario) => {
        const permissoes = permissoesData.find(
          (p) => p.usuario_id === usuario.id,
        );

        return {
          ...usuario,
          permissoes_customizadas: permissoes?.permissoes || null,
        };
      });

      setUsuarios(usuariosComPermissoes);
    } catch (error: any) {
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicao = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioSelecionado(null);
    carregarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()),
  );

  const getPerfilPadrao = (usuario: Usuario): PerfilUsuario => {
    const emailsAdmin = ["admin@logcell.com", "matheusmoxil@gmail.com"];

    if (emailsAdmin.includes(usuario.email)) return "admin";
    if (usuario.tipo_usuario === "tecnico") return "tecnico";

    return "vendedor";
  };

  const getCorPerfil = (perfil: PerfilUsuario) => {
    const cores = {
      admin: "danger",
      gerente: "primary",
      vendedor: "success",
      tecnico: "warning",
    };

    return cores[perfil];
  };

  // Verificar permissão de gerenciar permissões
  if (!loadingPermissoes && !temPermissao("usuarios.gerenciar_permissoes")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para gerenciar permissões de usuários.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Gerenciar Permissões
          </h1>
          <p className="text-default-500 mt-1">
            Configure permissões customizadas para cada usuário
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Input
            isClearable
            placeholder="Buscar usuário..."
            startContent={<Search className="w-4 h-4" />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onClear={() => setBusca("")}
          />
        </CardHeader>
        <CardBody className="p-0">
          <Table aria-label="Tabela de permissões de usuários">
            <TableHeader>
              <TableColumn>USUÁRIO</TableColumn>
              <TableColumn>E-MAIL</TableColumn>
              <TableColumn>PERFIL PADRÃO</TableColumn>
              <TableColumn>PERMISSÕES</TableColumn>
              <TableColumn align="center">AÇÕES</TableColumn>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => {
                const perfil = getPerfilPadrao(usuario);
                const temCustomizadas =
                  usuario.permissoes_customizadas !== null;

                return (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-default-400" />
                        <span className="font-medium">{usuario.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={getCorPerfil(perfil) as any}
                        size="sm"
                        variant="flat"
                      >
                        {perfil.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {temCustomizadas ? (
                        <Chip color="secondary" size="sm" variant="flat">
                          {usuario.permissoes_customizadas?.length} Customizadas
                        </Chip>
                      ) : (
                        <Chip color="default" size="sm" variant="flat">
                          Padrão do Perfil
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={() => abrirModalEdicao(usuario)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal de Permissões */}
      {usuarioSelecionado && (
        <PermissoesModal
          isOpen={modalAberto}
          onClose={fecharModal}
          usuarioId={usuarioSelecionado.id}
          usuarioNome={usuarioSelecionado.nome}
          onSuccess={fecharModal}
        />
      )}
    </div>
  );
}
