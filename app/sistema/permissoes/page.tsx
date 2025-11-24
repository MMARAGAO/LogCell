"use client";

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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  CheckboxGroup,
  Divider,
  Spinner,
} from "@heroui/react";
import { Shield, User, Edit, RotateCcw, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import type { Permissao, PerfilUsuario } from "@/types/permissoes";
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
    null
  );
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<
    Permissao[]
  >([]);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");

  // Lista de todas as permissões disponíveis organizadas por módulo
  const PERMISSOES_POR_MODULO = {
    Clientes: [
      "clientes.criar",
      "clientes.editar",
      "clientes.visualizar",
      "clientes.deletar",
    ],
    "Ordens de Serviço": [
      "os.criar",
      "os.editar",
      "os.visualizar",
      "os.deletar",
      "os.concluir",
      "os.cancelar",
    ],
    "OS - Peças": [
      "os.pecas.adicionar",
      "os.pecas.visualizar",
      "os.pecas.remover",
    ],
    "OS - Fotos": [
      "os.fotos.adicionar",
      "os.fotos.visualizar",
      "os.fotos.deletar",
    ],
    "OS - Outras": [
      "os.historico.visualizar",
      "os.laudo.editar",
      "os.pagamentos.adicionar",
      "os.pagamentos.visualizar",
      "os.pagamentos.editar",
    ],
    Estoque: [
      "estoque.visualizar",
      "estoque.editar",
      "estoque.transferir",
      "estoque.ajustar",
      "estoque.alertas.visualizar",
      "estoque.alertas.editar",
      "estoque.historico.visualizar",
    ],
    Vendas: [
      "vendas.criar",
      "vendas.editar",
      "vendas.visualizar",
      "vendas.deletar",
      "vendas.descontos",
      "vendas.devolucoes",
      "vendas.pagamentos",
    ],
    Produtos: [
      "produtos.criar",
      "produtos.editar",
      "produtos.visualizar",
      "produtos.deletar",
      "produtos.fotos.adicionar",
      "produtos.fotos.deletar",
    ],
    Fornecedores: [
      "fornecedores.criar",
      "fornecedores.editar",
      "fornecedores.visualizar",
      "fornecedores.deletar",
    ],
    Usuários: [
      "usuarios.criar",
      "usuarios.editar",
      "usuarios.visualizar",
      "usuarios.deletar",
    ],
    Técnicos: [
      "tecnicos.criar",
      "tecnicos.editar",
      "tecnicos.visualizar",
      "tecnicos.deletar",
    ],
    Lojas: ["lojas.criar", "lojas.editar", "lojas.visualizar", "lojas.deletar"],
    Caixa: [
      "caixa.visualizar",
      "caixa.abrir",
      "caixa.fechar",
      "caixa.sangrias",
    ],
    Dashboard: [
      "dashboard.vendas",
      "dashboard.os",
      "dashboard.estoque",
      "dashboard.financeiro",
    ],
    RMA: ["rma.criar", "rma.editar", "rma.visualizar", "rma.deletar"],
    Quebras: [
      "quebras.criar",
      "quebras.editar",
      "quebras.visualizar",
      "quebras.aprovar",
    ],
  };

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
          (p) => p.usuario_id === usuario.id
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
    setPermissoesSelecionadas(usuario.permissoes_customizadas || []);
    setModalAberto(true);
  };

  const aplicarTemplatePermissoes = (perfil: PerfilUsuario) => {
    setPermissoesSelecionadas(PERMISSOES_POR_PERFIL[perfil]);
  };

  const salvarPermissoes = async () => {
    if (!usuarioSelecionado) return;

    setSalvando(true);
    try {
      const { error } = await supabase.from("permissoes").upsert({
        usuario_id: usuarioSelecionado.id,
        permissoes: permissoesSelecionadas,
        atualizado_em: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(
        "Permissões atualizadas com sucesso! Aplicadas em tempo real."
      );
      setModalAberto(false);
      await carregarUsuarios();
    } catch (error: any) {
      toast.error(`Erro ao salvar permissões: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const resetarParaPadrao = async () => {
    if (!usuarioSelecionado) return;

    setSalvando(true);
    try {
      const { error } = await supabase
        .from("permissoes")
        .delete()
        .eq("usuario_id", usuarioSelecionado.id);

      if (error) throw error;

      toast.success("Permissões resetadas para o padrão do perfil!");
      setModalAberto(false);
      await carregarUsuarios();
    } catch (error: any) {
      toast.error(`Erro ao resetar permissões: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
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
            placeholder="Buscar usuário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            startContent={<Search className="w-4 h-4" />}
            isClearable
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
                        variant="flat"
                        size="sm"
                      >
                        {perfil.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {temCustomizadas ? (
                        <Chip color="secondary" variant="flat" size="sm">
                          {usuario.permissoes_customizadas?.length} Customizadas
                        </Chip>
                      ) : (
                        <Chip color="default" variant="flat" size="sm">
                          Padrão do Perfil
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
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

      {/* Modal de Edição */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <h3 className="text-xl font-bold">Editar Permissões</h3>
              {usuarioSelecionado && (
                <p className="text-sm text-default-500 font-normal">
                  {usuarioSelecionado.nome} - {usuarioSelecionado.email}
                </p>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Templates Rápidos */}
              <div>
                <p className="text-sm font-medium mb-2">Templates Rápidos:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => aplicarTemplatePermissoes("admin")}
                  >
                    Admin (Todas)
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => aplicarTemplatePermissoes("gerente")}
                  >
                    Gerente
                  </Button>
                  <Button
                    size="sm"
                    color="success"
                    variant="flat"
                    onPress={() => aplicarTemplatePermissoes("vendedor")}
                  >
                    Vendedor
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => aplicarTemplatePermissoes("tecnico")}
                  >
                    Técnico
                  </Button>
                </div>
              </div>

              <Divider />

              {/* Seleção de Permissões por Módulo */}
              <div className="space-y-4">
                {Object.entries(PERMISSOES_POR_MODULO).map(
                  ([modulo, permissoes]) => (
                    <div key={modulo}>
                      <p className="font-semibold text-sm mb-2">{modulo}</p>
                      <CheckboxGroup
                        value={permissoesSelecionadas}
                        onValueChange={(valores) =>
                          setPermissoesSelecionadas(valores as Permissao[])
                        }
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {permissoes.map((permissao) => (
                            <Checkbox
                              key={permissao}
                              value={permissao}
                              size="sm"
                            >
                              {permissao.split(".").pop()}
                            </Checkbox>
                          ))}
                        </div>
                      </CheckboxGroup>
                    </div>
                  )
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setModalAberto(false)}
              isDisabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              color="warning"
              variant="flat"
              startContent={<RotateCcw className="w-4 h-4" />}
              onPress={resetarParaPadrao}
              isLoading={salvando}
            >
              Resetar para Padrão
            </Button>
            <Button
              color="primary"
              onPress={salvarPermissoes}
              isLoading={salvando}
            >
              Salvar ({permissoesSelecionadas.length} permissões)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
