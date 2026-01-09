"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import {
  User,
  Phone,
  Mail,
  Smartphone,
  Tag,
  Wrench,
  FileText,
  DollarSign,
  Calendar,
  Package,
  MapPin,
  Clock,
  AlertCircle,
  ShoppingBag,
  XCircle,
  Camera,
  AlertTriangle,
  CheckCircle,
  FileDown,
  Printer,
} from "lucide-react";
import {
  OrdemServico,
  StatusOS,
  STATUS_OS_LABELS,
  STATUS_OS_COLORS,
  PRIORIDADE_OS_LABELS,
  PRIORIDADE_OS_COLORS,
} from "@/types/ordemServico";
import { useToast } from "@/components/Toast";
import StatusProgressBar from "./StatusProgressBar";
import GerenciarFotosOSModal from "./GerenciarFotosOSModal";
import {
  gerarPDFOrdemServico,
  gerarCupomTermicoOS,
  imprimirCupomTermico,
} from "@/lib/impressaoOS";

interface OrdemServicoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  onOSAtualizada?: () => void;
}

interface PecaOS {
  id: string;
  tipo_produto: "estoque" | "externo";
  descricao_peca: string;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
  produtos?: {
    descricao: string;
    marca?: string;
    categoria?: string;
  };
}

interface QuebraPeca {
  id: string;
  quantidade: number;
  tipo_ocorrencia: string;
  motivo: string;
  responsavel: string;
  valor_unitario: number;
  valor_total: number;
  descontar_tecnico: boolean;
  criado_em: string;
  aprovado: boolean;
  aprovado_em?: string;
  produtos: {
    id: string;
    descricao: string;
  };
  tecnicos?: {
    id: string;
    nome: string;
  };
}

export default function OrdemServicoDetalhesModal({
  isOpen,
  onClose,
  os,
  onOSAtualizada,
}: OrdemServicoDetalhesModalProps) {
  const [osAtual, setOsAtual] = useState<OrdemServico | null>(os);
  const [pecas, setPecas] = useState<PecaOS[]>([]);
  const [quebras, setQuebras] = useState<QuebraPeca[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(false);
  const [loadingQuebras, setLoadingQuebras] = useState(false);
  const [loadingCancelar, setLoadingCancelar] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingAprovarQuebra, setLoadingAprovarQuebra] = useState<
    string | null
  >(null);
  const [modalConfirmCancelar, setModalConfirmCancelar] = useState(false);
  const [modalFotos, setModalFotos] = useState(false);
  const [modalGarantiaOpen, setModalGarantiaOpen] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingCupom, setLoadingCupom] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setOsAtual(os);
  }, [os]);

  useEffect(() => {
    if (isOpen && osAtual) {
      carregarPecas();
      carregarQuebras();
    }
  }, [isOpen, osAtual]);

  const buscarDadosLoja = async () => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("lojas")
        .select("nome, endereco, telefone, cnpj")
        .eq("id", osAtual?.id_loja)
        .single();

      if (error) throw error;
      return data || { nome: "Loja" };
    } catch (error) {
      console.error("Erro ao buscar dados da loja:", error);
      return { nome: "Loja" };
    }
  };

  const handleGerarPDF = async () => {
    if (!osAtual) return;

    // Verificar se tem tipo de garantia definido
    if (!osAtual.tipo_garantia) {
      const confirmar = window.confirm(
        "Esta OS não possui garantia definida. Deseja adicionar uma garantia antes de gerar o PDF?"
      );

      if (confirmar) {
        setModalGarantiaOpen(true);
        return;
      }
    }

    setLoadingPDF(true);
    try {
      const dadosLoja = await buscarDadosLoja();
      const doc = await gerarPDFOrdemServico(osAtual, pecas, dadosLoja);
      doc.save(`OS_${osAtual.numero_os || osAtual.id}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleImprimirCupom = async () => {
    if (!osAtual) return;

    // Verificar se tem tipo de garantia definido
    if (!osAtual.tipo_garantia) {
      const confirmar = window.confirm(
        "Esta OS não possui garantia definida. Deseja adicionar uma garantia antes de imprimir o cupom?"
      );

      if (confirmar) {
        setModalGarantiaOpen(true);
        return;
      }
    }

    setLoadingCupom(true);
    try {
      const dadosLoja = await buscarDadosLoja();
      const cupom = await gerarCupomTermicoOS(osAtual, pecas, dadosLoja);
      imprimirCupomTermico(cupom);
    } catch (error) {
      console.error("Erro ao imprimir cupom:", error);
      toast.error("Erro ao imprimir cupom");
    } finally {
      setLoadingCupom(false);
    }
  };

  const carregarPecas = async () => {
    if (!osAtual) return;

    setLoadingPecas(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_pecas")
        .select(
          `
          id,
          tipo_produto,
          descricao_peca,
          quantidade,
          valor_custo,
          valor_venda,
          produtos:id_produto (
            descricao,
            marca,
            categoria
          )
        `
        )
        .eq("id_ordem_servico", osAtual.id);

      if (error) {
        console.error("Erro ao carregar peças:", error);
        setPecas([]);
        return;
      }

      // Formatar dados
      const pecasFormatadas = (data || []).map((item: any) => ({
        ...item,
        produtos: Array.isArray(item.produtos)
          ? item.produtos[0]
          : item.produtos,
      }));

      setPecas(pecasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
      setPecas([]);
    } finally {
      setLoadingPecas(false);
    }
  };

  const carregarQuebras = async () => {
    if (!osAtual?.id) return;

    setLoadingQuebras(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("quebra_pecas")
        .select(
          `
          id,
          id_produto,
          produto_descricao,
          id_ordem_servico,
          quantidade,
          tipo_ocorrencia,
          motivo,
          responsavel,
          valor_unitario,
          valor_total,
          descontar_tecnico,
          criado_em,
          criado_por,
          aprovado,
          aprovado_em,
          produtos:id_produto (
            id,
            descricao
          )
        `
        )
        .eq("id_ordem_servico", osAtual.id)
        .order("criado_em", { ascending: false });

      if (error) {
        console.error("Erro ao carregar quebras:", error);
        toast.error("Erro ao carregar quebras: " + error.message);
        setQuebras([]);
        return;
      }

      // Buscar nomes dos técnicos e processar nomes dos produtos
      if (data && data.length > 0) {
        const tecnicos = await Promise.all(
          data.map(async (quebra: any) => {
            const { data: userData } = await supabase
              .from("usuarios")
              .select("id, nome")
              .eq("id", quebra.criado_por)
              .maybeSingle();
            return userData;
          })
        );

        const quebrasComTecnicos = data.map((quebra: any, index: number) => {
          let produtoNome = quebra.produto_descricao;

          // Se não tiver produto_descricao, tenta pegar do join
          if (!produtoNome && quebra.produtos?.descricao) {
            produtoNome = quebra.produtos.descricao;
          }

          // Fallback
          if (!produtoNome) {
            produtoNome = "Produto não identificado";
          }

          return {
            ...quebra,
            produtos: { id: quebra.id_produto, descricao: produtoNome },
            tecnicos: tecnicos[index],
          };
        });

        setQuebras(quebrasComTecnicos);
      } else {
        setQuebras([]);
      }
    } catch (error) {
      console.error("Erro ao carregar quebras:", error);
      toast.error("Erro ao carregar quebras");
      setQuebras([]);
    } finally {
      setLoadingQuebras(false);
    }
  };

  const aprovarQuebra = async (idQuebra: string) => {
    setLoadingAprovarQuebra(idQuebra);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from("quebra_pecas")
        .update({
          aprovado: true,
          aprovado_em: new Date().toISOString(),
          aprovado_por: user.id,
        })
        .eq("id", idQuebra);

      if (error) throw error;

      toast.success(
        "Quebra aprovada! O estoque será atualizado automaticamente."
      );
      await carregarQuebras(); // Recarrega lista
    } catch (error) {
      console.error("Erro ao aprovar quebra:", error);
      toast.error("Erro ao aprovar quebra");
    } finally {
      setLoadingAprovarQuebra(null);
    }
  };

  const handleCancelarOS = async () => {
    if (!osAtual) return;

    setLoadingCancelar(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.showToast("Usuário não autenticado", "error");
        return;
      }

      // Atualizar status para cancelado
      const { error } = await supabase
        .from("ordem_servico")
        .update({
          status: "cancelado",
          atualizado_por: user.id,
        })
        .eq("id", osAtual.id);

      if (error) throw error;

      toast.showToast(
        "OS cancelada! Produtos devolvidos ao estoque.",
        "success"
      );
      setModalConfirmCancelar(false);

      // Notificar componente pai para atualizar a lista
      if (onOSAtualizada) {
        onOSAtualizada();
      }

      onClose();
    } catch (error: any) {
      console.error("Erro ao cancelar OS:", error);
      toast.showToast(
        error.message || "Erro ao cancelar ordem de serviço",
        "error"
      );
    } finally {
      setLoadingCancelar(false);
    }
  };

  const handleStatusChange = async (newStatus: StatusOS) => {
    if (!osAtual) return;

    setLoadingStatus(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.showToast("Usuário não autenticado", "error");
        return;
      }

      // Preparar dados de atualização
      const updateData: any = {
        status: newStatus,
        atualizado_por: user.id,
        atualizado_em: new Date().toISOString(),
      };

      // Se mudar para 'entregue', adicionar data_entrega_cliente
      if (newStatus === "entregue") {
        updateData.data_entrega_cliente = new Date().toISOString();
      }

      const { error } = await supabase
        .from("ordem_servico")
        .update(updateData)
        .eq("id", osAtual.id);

      if (error) throw error;

      // Atualizar estado local imediatamente
      const osAtualizada = {
        ...osAtual,
        status: newStatus,
        atualizado_em: new Date().toISOString(),
        ...(newStatus === "entregue"
          ? { data_entrega_cliente: new Date().toISOString() }
          : {}),
      };

      setOsAtual(osAtualizada);

      toast.showToast(
        `Status atualizado para: ${STATUS_OS_LABELS[newStatus]}`,
        "success"
      );

      // Notificar componente pai para atualizar a lista
      if (onOSAtualizada) {
        onOSAtualizada();
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.showToast(
        error.message || "Erro ao atualizar status da OS",
        "error"
      );
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!osAtual) return null;

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarDataHora = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | number | undefined;
  }) => (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className="w-4 h-4 text-default-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-default-500 mb-1">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Ordem de Serviço #{osAtual.numero_os}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Chip
                color={STATUS_OS_COLORS[osAtual.status]}
                size="sm"
                variant="flat"
              >
                {STATUS_OS_LABELS[osAtual.status]}
              </Chip>
              <Chip
                color={PRIORIDADE_OS_COLORS[osAtual.prioridade]}
                size="sm"
                variant="flat"
              >
                {PRIORIDADE_OS_LABELS[osAtual.prioridade]}
              </Chip>
              {osAtual.caixa && osAtual.caixa.some(c => c.status_caixa === "cancelado") && (
                <Chip
                  color="danger"
                  size="sm"
                  variant="flat"
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Caixa cancelado
                </Chip>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* BARRA DE PROGRESSO */}
            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
              <CardBody>
                <h3 className="text-sm font-semibold mb-2 text-center">
                  Status da Ordem de Serviço
                </h3>
                <StatusProgressBar
                  currentStatus={osAtual.status}
                  onStatusChange={handleStatusChange}
                  isUpdating={loadingStatus}
                  disabled={osAtual.status === "cancelado"}
                />
              </CardBody>
            </Card>

            {/* CLIENTE */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Nome"
                    value={osAtual.cliente_nome}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Telefone"
                    value={osAtual.cliente_telefone}
                  />
                  <InfoItem
                    icon={Mail}
                    label="E-mail"
                    value={osAtual.cliente_email}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Loja"
                    value={
                      typeof osAtual.loja === "object" && osAtual.loja !== null
                        ? (osAtual.loja as any).nome
                        : "-"
                    }
                  />
                </div>
                {osAtual.tipo_cliente && (
                  <div className="mt-4">
                    <Chip
                      color={
                        osAtual.tipo_cliente === "lojista"
                          ? "primary"
                          : "secondary"
                      }
                      variant="flat"
                      size="sm"
                    >
                      {osAtual.tipo_cliente === "lojista"
                        ? "Lojista"
                        : "Consumidor Final"}
                    </Chip>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* EQUIPAMENTO */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Equipamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={Smartphone}
                    label="Tipo"
                    value={osAtual.equipamento_tipo}
                  />
                  <InfoItem
                    icon={Tag}
                    label="Marca"
                    value={osAtual.equipamento_marca}
                  />
                  <InfoItem
                    icon={Tag}
                    label="Modelo"
                    value={osAtual.equipamento_modelo}
                  />
                  <InfoItem
                    icon={Tag}
                    label="Número de Série"
                    value={osAtual.equipamento_numero_serie}
                  />
                </div>
                {osAtual.equipamento_senha && (
                  <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                    <p className="text-xs text-warning-600 dark:text-warning-400 mb-1">
                      🔒 Senha do Equipamento
                    </p>
                    <p className="text-sm font-mono font-semibold">
                      {osAtual.equipamento_senha}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* PROBLEMA */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Problema Relatado
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-default-500 mb-1">
                      Defeito Reclamado
                    </p>
                    <p className="text-sm">{osAtual.defeito_reclamado}</p>
                  </div>
                  {osAtual.estado_equipamento && (
                    <div>
                      <p className="text-xs text-default-500 mb-1">
                        Estado do Equipamento
                      </p>
                      <p className="text-sm">{osAtual.estado_equipamento}</p>
                    </div>
                  )}
                  {osAtual.acessorios_entregues && (
                    <div>
                      <p className="text-xs text-default-500 mb-1">
                        Acessórios Entregues
                      </p>
                      <p className="text-sm">{osAtual.acessorios_entregues}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* DIAGNÓSTICO E SERVIÇO */}
            {(osAtual.diagnostico ||
              osAtual.servico_realizado ||
              osAtual.observacoes_tecnicas) && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Diagnóstico e Serviço
                  </h3>
                  <div className="space-y-3">
                    {osAtual.diagnostico && (
                      <div>
                        <p className="text-xs text-default-500 mb-1">
                          Diagnóstico
                        </p>
                        <p className="text-sm">{osAtual.diagnostico}</p>
                      </div>
                    )}
                    {osAtual.servico_realizado && (
                      <div>
                        <p className="text-xs text-default-500 mb-1">
                          Serviço Realizado
                        </p>
                        <p className="text-sm">{osAtual.servico_realizado}</p>
                      </div>
                    )}
                    {osAtual.observacoes_tecnicas && (
                      <div>
                        <p className="text-xs text-default-500 mb-1">
                          Observações Técnicas
                        </p>
                        <p className="text-sm">
                          {osAtual.observacoes_tecnicas}
                        </p>
                      </div>
                    )}
                    {osAtual.tecnico?.nome && (
                      <div>
                        <p className="text-xs text-default-500 mb-1">
                          Técnico Responsável
                        </p>
                        <p className="text-sm">{osAtual.tecnico.nome}</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* PEÇAS E PRODUTOS */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Peças e Produtos Utilizados
                </h3>

                {loadingPecas ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : pecas.length === 0 ? (
                  <div className="text-center py-8 text-default-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma peça utilizada nesta OS</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Table
                      aria-label="Peças utilizadas"
                      removeWrapper
                      classNames={{
                        th: "bg-default-100",
                        td: "py-3",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>DESCRIÇÃO</TableColumn>
                        <TableColumn>TIPO</TableColumn>
                        <TableColumn align="center">QTD</TableColumn>
                        <TableColumn align="end">CUSTO</TableColumn>
                        <TableColumn align="end">VENDA</TableColumn>
                        <TableColumn align="end">TOTAL</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {pecas.map((peca) => (
                          <TableRow key={peca.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {peca.tipo_produto === "estoque" &&
                                  peca.produtos
                                    ? peca.produtos.descricao
                                    : peca.descricao_peca}
                                </span>
                                {peca.tipo_produto === "estoque" &&
                                  peca.produtos &&
                                  peca.produtos.marca && (
                                    <span className="text-xs text-default-400">
                                      {peca.produtos.marca}
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={
                                  peca.tipo_produto === "estoque"
                                    ? "success"
                                    : "warning"
                                }
                                variant="flat"
                                startContent={
                                  peca.tipo_produto === "estoque" ? (
                                    <Package className="w-3 h-3" />
                                  ) : (
                                    <ShoppingBag className="w-3 h-3" />
                                  )
                                }
                              >
                                {peca.tipo_produto === "estoque"
                                  ? "Estoque"
                                  : "Externo"}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="text-center font-medium">
                                {peca.quantidade}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right text-sm">
                                R$ {peca.valor_custo.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right text-sm">
                                R$ {peca.valor_venda.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right font-semibold">
                                R${" "}
                                {(peca.valor_venda * peca.quantidade).toFixed(
                                  2
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Divider />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-semibold">
                        Total em Peças:
                      </span>
                      <span className="text-lg font-bold text-primary">
                        R${" "}
                        {pecas
                          .reduce(
                            (sum, peca) =>
                              sum + peca.valor_venda * peca.quantidade,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* QUEBRAS DE PEÇAS */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Quebras e Perdas de Peças
                </h3>

                {loadingQuebras ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : quebras.length === 0 ? (
                  <div className="text-center py-8 text-default-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Nenhuma quebra registrada nesta OS
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Quebras Pendentes */}
                    {quebras.filter((q) => !q.aprovado).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-warning" />
                          <h4 className="text-sm font-semibold text-warning">
                            Pendentes de Aprovação (
                            {quebras.filter((q) => !q.aprovado).length})
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {quebras
                            .filter((q) => !q.aprovado)
                            .map((quebra) => (
                              <Card
                                key={quebra.id}
                                className="border-2 border-warning/30"
                              >
                                <CardBody className="p-4">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-base">
                                          {quebra.produtos?.descricao ||
                                            "Produto não identificado"}
                                        </span>
                                        <Chip
                                          size="sm"
                                          color="warning"
                                          variant="flat"
                                        >
                                          Pendente
                                        </Chip>
                                      </div>

                                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                          <span className="text-default-500">
                                            Quantidade:{" "}
                                          </span>
                                          <span className="font-medium">
                                            {quebra.quantidade}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-default-500">
                                            Valor Unit.:{" "}
                                          </span>
                                          <span className="font-medium">
                                            R${" "}
                                            {quebra.valor_unitario.toFixed(2)}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-default-500">
                                            Tipo:{" "}
                                          </span>
                                          <Chip size="sm" variant="flat">
                                            {quebra.tipo_ocorrencia}
                                          </Chip>
                                        </div>
                                        <div>
                                          <span className="text-default-500">
                                            Responsável:{" "}
                                          </span>
                                          <Chip size="sm" variant="flat">
                                            {quebra.responsavel}
                                          </Chip>
                                        </div>
                                      </div>

                                      {quebra.motivo && (
                                        <div className="text-sm">
                                          <span className="text-default-500">
                                            Motivo:{" "}
                                          </span>
                                          <span>{quebra.motivo}</span>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-default-400">
                                        <span>
                                          Registrado por:{" "}
                                          {quebra.tecnicos?.nome ||
                                            "Desconhecido"}
                                        </span>
                                        <span>
                                          {new Date(
                                            quebra.criado_em
                                          ).toLocaleDateString("pt-BR")}{" "}
                                          às{" "}
                                          {new Date(
                                            quebra.criado_em
                                          ).toLocaleTimeString("pt-BR")}
                                        </span>
                                      </div>

                                      {quebra.descontar_tecnico && (
                                        <div className="flex items-center gap-2 text-sm text-warning">
                                          <AlertTriangle className="w-4 h-4" />
                                          <span className="font-medium">
                                            Desconto do técnico solicitado
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                      <div className="text-right">
                                        <div className="text-xs text-default-500">
                                          Valor Total
                                        </div>
                                        <div className="text-xl font-bold text-danger">
                                          R$ {quebra.valor_total.toFixed(2)}
                                        </div>
                                      </div>
                                      <Button
                                        color="success"
                                        size="sm"
                                        startContent={
                                          loadingAprovarQuebra === quebra.id ? (
                                            <Spinner size="sm" color="white" />
                                          ) : (
                                            <CheckCircle className="w-4 h-4" />
                                          )
                                        }
                                        isLoading={
                                          loadingAprovarQuebra === quebra.id
                                        }
                                        onPress={() => aprovarQuebra(quebra.id)}
                                      >
                                        Aprovar
                                      </Button>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Quebras Aprovadas */}
                    {quebras.filter((q) => q.aprovado).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <h4 className="text-sm font-semibold text-success">
                            Aprovadas (
                            {quebras.filter((q) => q.aprovado).length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {quebras
                            .filter((q) => q.aprovado)
                            .map((quebra) => (
                              <Card
                                key={quebra.id}
                                className="border border-success/30"
                              >
                                <CardBody className="p-3">
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">
                                          {quebra.produtos?.descricao ||
                                            "Produto não identificado"}
                                        </span>
                                        <Chip
                                          size="sm"
                                          color="success"
                                          variant="flat"
                                        >
                                          Aprovada
                                        </Chip>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-default-500">
                                        <span>Qtd: {quebra.quantidade}</span>
                                        <span>
                                          Tipo: {quebra.tipo_ocorrencia}
                                        </span>
                                        <span>Resp.: {quebra.responsavel}</span>
                                        {quebra.aprovado_em && (
                                          <span>
                                            Aprovada em:{" "}
                                            {new Date(
                                              quebra.aprovado_em
                                            ).toLocaleDateString("pt-BR")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-semibold text-danger">
                                        R$ {quebra.valor_total.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Total de Quebras */}
                    {quebras.length > 0 && (
                      <>
                        <Divider />
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-semibold">
                            Total em Quebras:
                          </span>
                          <span className="text-lg font-bold text-danger">
                            R${" "}
                            {quebras
                              .reduce(
                                (sum, quebra) => sum + quebra.valor_total,
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* VALORES */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-500">Orçamento</span>
                    <span className="text-sm font-medium">
                      R$ {osAtual.valor_orcamento?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  {(osAtual.valor_desconto || 0) > 0 && (
                    <div className="flex justify-between items-center text-danger">
                      <span className="text-sm">Desconto</span>
                      <span className="text-sm font-medium">
                        - R$ {(osAtual.valor_desconto || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Valor Total</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {(osAtual.valor_total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-500">Valor Pago</span>
                    <span className="text-sm font-medium text-success">
                      R$ {(osAtual.valor_pago || 0).toFixed(2)}
                    </span>
                  </div>
                  {(osAtual.valor_total || 0) - (osAtual.valor_pago || 0) >
                    0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-500">
                        Saldo Devedor
                      </span>
                      <span className="text-sm font-medium text-warning">
                        R${" "}
                        {(
                          (osAtual.valor_total || 0) - (osAtual.valor_pago || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* DATAS */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Datas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={Clock}
                    label="Criado em"
                    value={formatarDataHora(osAtual.criado_em)}
                  />
                  {osAtual.previsao_entrega && (
                    <InfoItem
                      icon={Calendar}
                      label="Previsão de Entrega"
                      value={formatarData(osAtual.previsao_entrega)}
                    />
                  )}
                  {osAtual.atualizado_em && (
                    <InfoItem
                      icon={Clock}
                      label="Última Atualização"
                      value={formatarDataHora(osAtual.atualizado_em)}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          {osAtual?.status !== "cancelado" && (
              <Button
                color="danger"
                variant="flat"
                startContent={<XCircle className="w-4 h-4" />}
                onPress={() => setModalConfirmCancelar(true)}
                isDisabled={loadingCancelar}
              >
                Cancelar OS
              </Button>
            )}
          <Button
            color="primary"
            variant="flat"
            startContent={<Camera className="w-4 h-4" />}
            onPress={() => setModalFotos(true)}
          >
            Gerenciar Fotos
          </Button>
          <Button
            color="success"
            variant="flat"
            startContent={<FileDown className="w-4 h-4" />}
            onPress={handleGerarPDF}
            isLoading={loadingPDF}
          >
            Gerar PDF
          </Button>
          <Button
            color="secondary"
            variant="flat"
            startContent={<Printer className="w-4 h-4" />}
            onPress={handleImprimirCupom}
            isLoading={loadingCupom}
          >
            Cupom Térmico
          </Button>
          <Button color="default" variant="flat" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Modal de Confirmação de Cancelamento */}
      <Modal
        isOpen={modalConfirmCancelar}
        onClose={() => setModalConfirmCancelar(false)}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Cancelar Ordem de Serviço</ModalHeader>
          <ModalBody>
            <p className="mb-3">
              Tem certeza que deseja cancelar a OS #{osAtual?.numero_os}?
            </p>
            {pecas.length > 0 && (
              <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                <p className="text-sm font-semibold text-warning mb-1">
                  ⚠️ Atenção:
                </p>
                <p className="text-sm text-warning">
                  As peças do estoque utilizadas nesta OS serão devolvidas
                  automaticamente ao estoque de suas respectivas lojas.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setModalConfirmCancelar(false)}
            >
              Não
            </Button>
            <Button
              color="danger"
              onPress={handleCancelarOS}
              isLoading={loadingCancelar}
            >
              Sim, Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Gerenciamento de Fotos */}
      {osAtual && (
        <GerenciarFotosOSModal
          isOpen={modalFotos}
          onClose={() => setModalFotos(false)}
          ordemServicoId={osAtual.id}
          numeroOS={osAtual.numero_os}
        />
      )}

      {toast.ToastComponent}
    </Modal>
  );
}
