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
import { MetasService, type MetaUsuario } from "@/services/metasService";

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

// Mapa de labels legíveis para permissões
const PERMISSOES_LABELS: Record<string, string> = {
  "deletar_entregue": "Deletar Entregue",
  "cancelar": "Cancelar",
  "cancelar_entregue": "Cancelar Entregue",
  "gerenciar_permissoes": "Gerenciar Permissões",
  "gerenciar_pecas": "Gerenciar Peças",
  "gerenciar_fotos": "Gerenciar Fotos",
  "gerenciar_pagamentos": "Gerenciar Pagamentos",
  "alterar_status": "Alterar Status",
  "assumir": "Assumir",
  "gerar_pdf": "Gerar PDF",
  "processar_creditos": "Processar Créditos",
  "editar_pagas": "Editar Pagas",
  "aplicar_desconto": "Aplicar Desconto",
  "processar_pagamentos": "Processar Pagamentos",
  "ver_estatisticas_faturamento": "Ver Estatísticas",
  "ver_todas_vendas": "Ver Todas Vendas",
  "ver_resumo_pagamentos": "Ver Resumo",
  "devolver": "Devolver",
  "transferir": "Transferir",
  "ajustar": "Ajustar",
  "ver_estatisticas": "Ver Estatísticas",
  "ver_preco_custo": "Ver Preço Custo",
  "abrir": "Abrir",
  "fechar": "Fechar",
  "sangria": "Sangria",
  "suprimento": "Suprimento",
  "visualizar_movimentacoes": "Ver Movimentações",
  "ver_relatorios": "Ver Relatórios",
  "exportar_dados": "Exportar Dados",
  "definir_metas": "Definir Metas",
  "visualizar_metas_outros": "Ver Metas Outros",
  "filtrar": "Filtrar",
  "ver_detalhes": "Ver Detalhes",
  "exportar": "Exportar",
  "aprovar": "Aprovar",
  "rejeitar": "Rejeitar",
  "deletar_sem_restricao": "Deletar sem Restrição",
  "confirmar": "Confirmar",
  "gerenciar": "Gerenciar",
};

// Lista de todas as permissões disponíveis organizadas por módulo
const PERMISSOES_POR_MODULO: Record<string, Permissao[]> = {
  Clientes: [
    "clientes.visualizar",
    "clientes.criar",
    "clientes.editar",
    "clientes.deletar",
    "clientes.processar_creditos",
  ],
  "Ordem de Serviço": [
    "os.visualizar",
    "os.criar",
    "os.editar",
    "os.deletar",
    "os.deletar_entregue",
    "os.cancelar",
    "os.cancelar_entregue",
    "os.assumir",
    "os.gerenciar_pecas",
    "os.gerenciar_fotos",
    "os.gerenciar_pagamentos",
    "os.alterar_status",
    "os.gerar_pdf",
  ],
  Estoque: [
    "estoque.visualizar",
    "estoque.criar",
    "estoque.editar",
    "estoque.deletar",
    "estoque.transferir",
    "estoque.ajustar",
    "estoque.ver_estatisticas",
    "estoque.ver_preco_custo",
  ],
  Vendas: [
    "vendas.visualizar",
    "vendas.criar",
    "vendas.editar",
    "vendas.editar_pagas",
    "vendas.cancelar",
    "vendas.aplicar_desconto",
    "vendas.processar_pagamentos",
    "vendas.ver_estatisticas_faturamento",
    "vendas.ver_todas_vendas",
    "vendas.devolver",
  ],
  Fornecedores: [
    "fornecedores.visualizar",
    "fornecedores.criar",
    "fornecedores.editar",
    "fornecedores.deletar",
  ],
  Usuários: [
    "usuarios.visualizar",
    "usuarios.criar",
    "usuarios.editar",
    "usuarios.deletar",
    "usuarios.gerenciar_permissoes",
  ],
  Técnicos: [
    "tecnicos.visualizar",
    "tecnicos.criar",
    "tecnicos.editar",
    "tecnicos.deletar",
  ],
  Lojas: ["lojas.visualizar", "lojas.criar", "lojas.editar", "lojas.deletar"],
  Caixa: [
    "caixa.visualizar",
    "caixa.abrir",
    "caixa.fechar",
    "caixa.sangria",
    "caixa.suprimento",
    "caixa.visualizar_movimentacoes",
  ],
  Dashboard: [
    "dashboard.visualizar",
    "dashboard.financeiro",
    "dashboard.ver_relatorios",
    "dashboard.exportar_dados",
  ],
  "Dashboard Pessoal": [
    "dashboard_pessoal.visualizar",
    "dashboard_pessoal.definir_metas",
    "dashboard_pessoal.visualizar_metas_outros",
  ],
  Logs: [
    "logs.visualizar",
    "logs.filtrar",
    "logs.ver_detalhes",
    "logs.exportar",
  ],
  RMA: [
    "rma.visualizar",
    "rma.criar",
    "rma.editar",
    "rma.aprovar",
    "rma.cancelar",
  ],
  "RMA Clientes": [
    "rma_clientes.visualizar",
    "rma_clientes.criar",
    "rma_clientes.editar",
    "rma_clientes.deletar",
  ],
  Quebras: [
    "quebras.visualizar",
    "quebras.registrar",
    "quebras.aprovar",
    "quebras.rejeitar",
  ],
  Devoluções: [
    "devolucoes.visualizar",
    "devolucoes.criar",
    "devolucoes.editar",
    "devolucoes.deletar",
    "devolucoes.deletar_sem_restricao",
    "devolucoes.aprovar",
    "devolucoes.processar_creditos",
  ],
  Aparelhos: [
    "aparelhos.visualizar",
    "aparelhos.criar",
    "aparelhos.editar",
    "aparelhos.deletar",
    "aparelhos.alterar_status",
  ],
  Transferências: [
    "transferencias.visualizar",
    "transferencias.criar",
    "transferencias.editar",
    "transferencias.deletar",
    "transferencias.confirmar",
    "transferencias.aprovar",
    "transferencias.cancelar",
  ],
  Configurações: ["configuracoes.gerenciar"],
};

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

  // Estados para metas do usuário
  const [metaAtual, setMetaAtual] = useState<MetaUsuario | null>(null);
  const [metaMensalVendas, setMetaMensalVendas] = useState("10000");
  const [metaMensalOS, setMetaMensalOS] = useState("0");
  const [diasUteis, setDiasUteis] = useState("26");

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

  const abrirModalEdicao = async (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setPermissoesSelecionadas(usuario.permissoes_customizadas || []);

    // Carregar metas do usuário
    try {
      const meta = await MetasService.buscarMetaUsuario(usuario.id);
      if (meta) {
        setMetaAtual(meta);
        setMetaMensalVendas(meta.meta_mensal_vendas.toString());
        setMetaMensalOS(meta.meta_mensal_os.toString());
        setDiasUteis(meta.dias_uteis_mes.toString());
      } else {
        // Valores padrão
        setMetaAtual(null);
        setMetaMensalVendas("10000");
        setMetaMensalOS("0");
        setDiasUteis("26");
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      // Usar valores padrão em caso de erro
      setMetaAtual(null);
      setMetaMensalVendas("10000");
      setMetaMensalOS("0");
      setDiasUteis("26");
    }

    setModalAberto(true);
  };

  const aplicarTemplatePermissoes = (perfil: PerfilUsuario) => {
    setPermissoesSelecionadas(PERMISSOES_POR_PERFIL[perfil]);
  };

  const salvarPermissoes = async () => {
    if (!usuarioSelecionado) return;

    setSalvando(true);
    try {
      // Salvar permissões
      const { error: errorPermissoes } = await supabase
        .from("permissoes")
        .upsert({
          usuario_id: usuarioSelecionado.id,
          permissoes: permissoesSelecionadas,
          atualizado_em: new Date().toISOString(),
        });

      if (errorPermissoes) throw errorPermissoes;

      // Salvar metas
      try {
        await MetasService.salvarMeta({
          usuario_id: usuarioSelecionado.id,
          meta_mensal_vendas: parseFloat(metaMensalVendas) || 10000,
          meta_mensal_os: parseInt(metaMensalOS) || 0,
          dias_uteis_mes: parseInt(diasUteis) || 26,
        });
      } catch (errorMetas: any) {
        console.error("Erro ao salvar metas:", errorMetas);
        toast.error(
          `Permissões salvas, mas erro nas metas: ${errorMetas.message}`,
          {
            description: "As permissões foram atualizadas com sucesso.",
          }
        );
      }

      toast.success("Permissões e metas atualizadas com sucesso!");
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
                          {permissoes.map((permissao) => {
                            const chave = permissao.split(".").pop() || permissao;
                            const label = PERMISSOES_LABELS[chave] || chave;
                            return (
                              <Checkbox
                                key={permissao}
                                value={permissao}
                                size="sm"
                              >
                                {label}
                              </Checkbox>
                            );
                          })}
                        </div>
                      </CheckboxGroup>
                    </div>
                  )
                )}
              </div>

              <Divider />

              {/* Configuração de Metas */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-md mb-1">
                    Metas de Desempenho
                  </h4>
                  <p className="text-xs text-default-500">
                    Defina as metas mensais para o dashboard pessoal do usuário
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Meta Mensal de Vendas (R$)"
                    placeholder="10000"
                    value={metaMensalVendas}
                    onValueChange={setMetaMensalVendas}
                    type="number"
                    min="0"
                    step="100"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">R$</span>
                      </div>
                    }
                    description="Valor em reais que o usuário deve atingir por mês"
                  />

                  <Input
                    label="Meta Mensal de OS"
                    placeholder="0"
                    value={metaMensalOS}
                    onValueChange={setMetaMensalOS}
                    type="number"
                    min="0"
                    step="1"
                    description="Quantidade de OS a concluir (para técnicos)"
                  />

                  <Input
                    label="Dias Úteis do Mês"
                    placeholder="26"
                    value={diasUteis}
                    onValueChange={setDiasUteis}
                    type="number"
                    min="1"
                    max="31"
                    description="Para cálculo da meta diária"
                  />
                </div>

                <div className="bg-default-100 p-3 rounded-lg">
                  <p className="text-xs text-default-600">
                    <strong>Meta Diária Calculada:</strong> R${" "}
                    {(
                      parseFloat(metaMensalVendas || "0") /
                      parseInt(diasUteis || "1")
                    ).toFixed(2)}
                  </p>
                </div>
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
