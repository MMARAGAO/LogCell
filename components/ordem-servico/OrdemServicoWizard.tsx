"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  Chip,
  Progress,
  Divider,
} from "@heroui/react";
import {
  User,
  Smartphone,
  Wrench,
  FileText,
  DollarSign,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  OrdemServicoFormData,
  StatusOS,
  PrioridadeOS,
  OrdemServico,
} from "@/types/ordemServico";
import type { Cliente, Tecnico } from "@/types/clientesTecnicos";
import { buscarTodosClientesAtivos } from "@/lib/clienteHelpers";
import { buscarTecnicosAtivos } from "@/services/tecnicoService";
import { useToast } from "@/components/Toast";

interface OrdemServicoWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: OrdemServicoFormData) => Promise<void>;
  lojas: Array<{ id: number; nome: string }>;
  ordem?: OrdemServico | null;
}

const PASSOS = [
  { id: 1, titulo: "Dados do Cliente", icone: User },
  { id: 2, titulo: "Aparelhos", icone: Smartphone },
  { id: 3, titulo: "Atribuições", icone: Wrench },
  { id: 4, titulo: "Valores", icone: DollarSign },
  { id: 5, titulo: "Revisão", icone: CheckCircle },
];

export default function OrdemServicoWizard({
  isOpen,
  onClose,
  onSubmit,
  lojas,
  ordem,
}: OrdemServicoWizardProps) {
  const [passoAtual, setPassoAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Listas
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);

  // Passo 1: Cliente
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [tipoCliente, setTipoCliente] = useState<
    "lojista" | "consumidor_final"
  >("consumidor_final");

  // Aparelhos e serviços
  const criarAparelhoVazio = () => ({
    equipamento_tipo: "",
    equipamento_marca: "",
    equipamento_modelo: "",
    equipamento_cor: "",
    equipamento_numero_serie: "",
    equipamento_imei: "",
    equipamento_senha: "",
    defeito_reclamado: "",
    estado_equipamento: "",
    acessorios_entregues: "",
    diagnostico: "",
    servico_realizado: "",
    observacoes_tecnicas: "",
    valor_desconto: 0,
    valor_orcamento: 0,
    valor_total: 0,
    servicos: [] as Array<{ id?: string; descricao: string; valor: number }>,
  });

  const [aparelhos, setAparelhos] = useState<
    Array<
      ReturnType<typeof criarAparelhoVazio> & {
        id?: string;
        sequencia?: number;
        id_loja?: number;
      }
    >
  >([criarAparelhoVazio()]);

  // Passo 2: Equipamento
  const [equipamentoTipo, setEquipamentoTipo] = useState("");
  const [equipamentoMarca, setEquipamentoMarca] = useState("");
  const [equipamentoModelo, setEquipamentoModelo] = useState("");
  const [equipamentoNumeroSerie, setEquipamentoNumeroSerie] = useState("");
  const [equipamentoSenha, setEquipamentoSenha] = useState("");

  // Passo 3: Defeito
  const [defeitoReclamado, setDefeitoReclamado] = useState("");
  const [estadoEquipamento, setEstadoEquipamento] = useState("");
  const [acessoriosEntregues, setAcessoriosEntregues] = useState("");

  // Passo 4: Atribuições
  const [lojaId, setLojaId] = useState<number>(0);
  const [tecnicoId, setTecnicoId] = useState<string>("");
  const [prioridade, setPrioridade] = useState<PrioridadeOS>("normal");
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");

  // Passo 5: Valores
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [valorDesconto, setValorDesconto] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const adicionarAparelho = () => {
    const sequencia = aparelhos.length + 1;
    const idLojaAparelho = lojaId || lojas[0]?.id;
    setAparelhos([
      ...aparelhos,
      { ...criarAparelhoVazio(), sequencia, id_loja: idLojaAparelho },
    ]);
  };

  const removerAparelho = (index: number) => {
    const restantes = aparelhos.filter((_, idx) => idx !== index);
    const reordenados = restantes.map((ap, idx) => ({
      ...ap,
      sequencia: idx + 1,
    }));
    setAparelhos(reordenados.length > 0 ? reordenados : [criarAparelhoVazio()]);
  };

  const atualizarAparelhoCampo = (
    index: number,
    campo: string,
    valor: string,
  ) => {
    setAparelhos((prev) =>
      prev.map((ap, idx) => (idx === index ? { ...ap, [campo]: valor } : ap)),
    );
  };

  const adicionarServicoAparelho = (index: number) => {
    setAparelhos((prev) =>
      prev.map((ap, idx) =>
        idx === index
          ? {
              ...ap,
              servicos: [...(ap.servicos || []), { descricao: "", valor: 0 }],
            }
          : ap,
      ),
    );
  };

  const atualizarServicoAparelho = (
    indexAparelho: number,
    indexServico: number,
    campo: "descricao" | "valor",
    valor: string,
  ) => {
    setAparelhos((prev) =>
      prev.map((ap, idx) => {
        if (idx !== indexAparelho) return ap;
        const servicos = (ap.servicos || []).map((svc, svcIdx) =>
          svcIdx === indexServico
            ? {
                ...svc,
                [campo]: campo === "valor" ? Number(valor) || 0 : valor,
              }
            : svc,
        );
        return { ...ap, servicos };
      }),
    );
  };

  const removerServicoAparelho = (
    indexAparelho: number,
    indexServico: number,
  ) => {
    setAparelhos((prev) =>
      prev.map((ap, idx) => {
        if (idx !== indexAparelho) return ap;
        const servicos = (ap.servicos || []).filter(
          (_, sIdx) => sIdx !== indexServico,
        );
        return { ...ap, servicos };
      }),
    );
  };

  const calcularTotalAparelho = (
    aparelho: ReturnType<typeof criarAparelhoVazio>,
  ) => {
    return (aparelho.servicos || []).reduce(
      (sum, svc) => sum + (Number(svc.valor) || 0),
      0,
    );
  };

  useEffect(() => {
    if (isOpen) {
      carregarClientes();
      carregarTecnicos();

      // Carregar dados da OS se estiver editando
      if (ordem) {
        carregarDadosOS();
      }
    }
  }, [isOpen, ordem]);

  const carregarDadosOS = () => {
    if (!ordem) return;

    // Cliente
    setClienteNome(ordem.cliente_nome);
    setClienteTelefone(ordem.cliente_telefone || "");
    setClienteEmail(ordem.cliente_email || "");
    setClienteCpfCnpj(ordem.cliente_cpf_cnpj || "");
    setClienteEndereco(ordem.cliente_endereco || "");
    setTipoCliente(ordem.tipo_cliente || "consumidor_final");

    // Aparelhos (multi)
    if (ordem.aparelhos && ordem.aparelhos.length > 0) {
      setAparelhos(
        ordem.aparelhos.map((ap) => ({
          id: ap.id,
          sequencia: ap.sequencia,
          id_loja: ap.id_loja,
          equipamento_tipo: ap.equipamento_tipo || "",
          equipamento_marca: ap.equipamento_marca || "",
          equipamento_modelo: ap.equipamento_modelo || "",
          equipamento_cor: ap.equipamento_cor || "",
          equipamento_numero_serie: ap.equipamento_numero_serie || "",
          equipamento_imei: ap.equipamento_imei || "",
          equipamento_senha: ap.equipamento_senha || "",
          defeito_reclamado: ap.defeito_reclamado || "",
          estado_equipamento: ap.estado_equipamento || "",
          acessorios_entregues: ap.acessorios_entregues || "",
          diagnostico: ap.diagnostico || "",
          servico_realizado: ap.servico_realizado || "",
          observacoes_tecnicas: ap.observacoes_tecnicas || "",
          valor_orcamento: ap.valor_orcamento || 0,
          valor_desconto: ap.valor_desconto || 0,
          valor_total: ap.valor_total || 0,
          servicos: (ap.servicos || []).map((svc) => ({
            id: svc.id,
            descricao: svc.descricao,
            valor: Number(svc.valor) || 0,
          })),
        })),
      );
    } else {
      setAparelhos([
        {
          ...criarAparelhoVazio(),
          equipamento_tipo: ordem.equipamento_tipo,
          equipamento_marca: ordem.equipamento_marca || "",
          equipamento_modelo: ordem.equipamento_modelo || "",
          equipamento_cor: ordem.equipamento_cor || "",
          equipamento_numero_serie: ordem.equipamento_numero_serie || "",
          equipamento_imei: ordem.equipamento_numero_serie || "",
          equipamento_senha: ordem.equipamento_senha || "",
          defeito_reclamado: ordem.defeito_reclamado || "",
          estado_equipamento: ordem.estado_equipamento || "",
          acessorios_entregues: ordem.acessorios_entregues || "",
          diagnostico: ordem.diagnostico || "",
          servico_realizado: ordem.servico_realizado || "",
          observacoes_tecnicas: ordem.observacoes_tecnicas || "",
        },
      ]);
    }

    // Atribuições
    setLojaId(ordem.id_loja);
    setTecnicoId(ordem.tecnico_responsavel || "");
    setPrioridade(ordem.prioridade || "normal");
    setPrevisaoEntrega(
      ordem.previsao_entrega
        ? new Date(ordem.previsao_entrega).toISOString().split("T")[0]
        : "",
    );

    // Valores
    setValorOrcamento(ordem.valor_orcamento?.toString() || "");
    setValorDesconto(ordem.valor_desconto?.toString() || "");
    setObservacoes(ordem.observacoes_tecnicas || "");
  };

  const carregarClientes = async () => {
    try {
      const clientes = await buscarTodosClientesAtivos();
      setClientes(clientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    }
  };

  const carregarTecnicos = async () => {
    const { data } = await buscarTecnicosAtivos();
    if (data) setTecnicos(data);
  };

  const handleClienteSelecionado = (key: any) => {
    const id = key as string | null;
    setClienteId(id);
    if (id) {
      const cliente = clientes.find((c) => c.id === id);
      if (cliente) {
        setClienteSelecionado(cliente);
        setClienteNome(cliente.nome);
        setClienteTelefone(cliente.telefone || "");
        setClienteEmail(cliente.email || "");
        setClienteCpfCnpj(cliente.doc || "");
        setClienteEndereco(
          `${cliente.logradouro || ""} ${cliente.numero || ""} ${cliente.bairro || ""} ${cliente.cidade || ""}`.trim(),
        );
      }
    } else {
      setClienteSelecionado(null);
      setClienteNome("");
      setClienteTelefone("");
      setClienteEmail("");
      setClienteCpfCnpj("");
      setClienteEndereco("");
    }
  };

  const validarPasso = (passo: number): boolean => {
    switch (passo) {
      case 1:
        if (!clienteNome.trim() || !clienteTelefone.trim()) {
          toast.error("Preencha nome e telefone do cliente");
          return false;
        }
        return true;
      case 2:
        if (aparelhos.length === 0) {
          toast.error("Adicione pelo menos um aparelho");
          return false;
        }
        for (let idx = 0; idx < aparelhos.length; idx++) {
          const ap = aparelhos[idx];
          if (!ap.equipamento_tipo.trim()) {
            toast.error(`Informe o tipo do aparelho #${idx + 1}`);
            return false;
          }
          if (!ap.equipamento_cor?.trim()) {
            toast.error(`Informe a cor do aparelho #${idx + 1}`);
            return false;
          }
          if (!ap.defeito_reclamado.trim()) {
            toast.error(`Informe o defeito do aparelho #${idx + 1}`);
            return false;
          }
        }
        return true;
      case 3:
        if (!lojaId) {
          toast.error("Selecione a loja");
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const totalAparelhos = aparelhos.reduce(
    (sum, ap) => sum + calcularTotalAparelho(ap),
    0,
  );
  const totalAparelhosComDesconto =
    totalAparelhos - (parseFloat(valorDesconto || "0") || 0);

  const proximoPasso = () => {
    if (validarPasso(passoAtual)) {
      setPassoAtual((prev) => Math.min(prev + 1, PASSOS.length));
    }
  };

  const passoAnterior = () => {
    setPassoAtual((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validarPasso(passoAtual)) return;

    setLoading(true);
    try {
      const desconto = valorDesconto ? parseFloat(valorDesconto) : 0;
      const totalAparelhos = aparelhos.reduce(
        (sum, ap) => sum + calcularTotalAparelho(ap),
        0,
      );
      const totalComDesconto = totalAparelhos - desconto;

      const aparelhoPrincipal = aparelhos[0];
      const idLojaDestino = lojaId || aparelhos[0].id_loja || lojas[0]?.id;

      const dados: OrdemServicoFormData = {
        // Cliente
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail || undefined,
        cliente_cpf_cnpj: clienteCpfCnpj || undefined,
        cliente_endereco: clienteEndereco || undefined,
        tipo_cliente: tipoCliente,

        // Campos legados (preenchidos a partir do primeiro aparelho)
        equipamento_tipo: aparelhoPrincipal.equipamento_tipo,
        equipamento_marca: aparelhoPrincipal.equipamento_marca || undefined,
        equipamento_modelo: aparelhoPrincipal.equipamento_modelo || undefined,
        equipamento_cor: aparelhoPrincipal.equipamento_cor || undefined,
        equipamento_numero_serie:
          aparelhoPrincipal.equipamento_numero_serie ||
          aparelhoPrincipal.equipamento_imei ||
          undefined,
        equipamento_senha: aparelhoPrincipal.equipamento_senha || undefined,

        defeito_reclamado: aparelhoPrincipal.defeito_reclamado,
        estado_equipamento: aparelhoPrincipal.estado_equipamento || undefined,
        acessorios_entregues:
          aparelhoPrincipal.acessorios_entregues || undefined,

        diagnostico: aparelhoPrincipal.diagnostico || undefined,
        servico_realizado: aparelhoPrincipal.servico_realizado || undefined,
        observacoes_tecnicas: observacoes || undefined,

        // Atribuições
        id_loja: idLojaDestino,
        tecnico_responsavel: tecnicoId || undefined,
        prioridade,
        previsao_entrega: previsaoEntrega || undefined,

        // Valores
        valor_orcamento: totalAparelhos,
        valor_desconto: desconto,
        valor_total: totalComDesconto,

        // Status
        status: (ordem?.status as StatusOS) || ("aguardando" as StatusOS),

        aparelhos: aparelhos.map((ap, idx) => {
          const subtotal = calcularTotalAparelho(ap);
          return {
            ...ap,
            id_loja: ap.id_loja || idLojaDestino,
            sequencia: ap.sequencia || idx + 1,
            valor_orcamento: subtotal,
            valor_desconto: ap.valor_desconto || 0,
            valor_total: subtotal - (ap.valor_desconto || 0),
            servicos: (ap.servicos || []).map((svc) => ({
              ...svc,
              valor: Number(svc.valor) || 0,
            })),
          };
        }),
      };

      await onSubmit(dados);
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setPassoAtual(1);
    setClienteId(null);
    setClienteSelecionado(null);
    setClienteNome("");
    setClienteTelefone("");
    setClienteEmail("");
    setClienteCpfCnpj("");
    setClienteEndereco("");
    setEquipamentoTipo("");
    setEquipamentoMarca("");
    setEquipamentoModelo("");
    setEquipamentoNumeroSerie("");
    setEquipamentoSenha("");
    setDefeitoReclamado("");
    setEstadoEquipamento("");
    setAcessoriosEntregues("");
    setAparelhos([criarAparelhoVazio()]);
    setLojaId(0);
    setTecnicoId("");
    setPrioridade("normal");
    setPrevisaoEntrega("");
    setValorOrcamento("");
    setValorDesconto("");
    setObservacoes("");
    onClose();
  };

  const progresso = (passoAtual / PASSOS.length) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {ordem ? "Editar" : "Nova"} Ordem de Serviço
              {ordem && (
                <span className="text-primary ml-2">#{ordem.numero_os}</span>
              )}
            </h2>
            <Chip color="primary" variant="flat">
              Passo {passoAtual} de {PASSOS.length}
            </Chip>
          </div>

          {/* Indicador de Progresso */}
          <div className="mt-4">
            <Progress
              value={progresso}
              color="primary"
              className="mb-4"
              size="sm"
            />
            <div className="flex justify-between">
              {PASSOS.map((passo) => {
                const Icon = passo.icone;
                const isAtual = passo.id === passoAtual;
                const isConcluido = passo.id < passoAtual;

                return (
                  <div
                    key={passo.id}
                    className={`flex flex-col items-center gap-2 ${
                      isAtual
                        ? "text-primary"
                        : isConcluido
                          ? "text-success"
                          : "text-default-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isAtual
                          ? "bg-primary text-white"
                          : isConcluido
                            ? "bg-success text-white"
                            : "bg-default-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-center hidden md:block">
                      {passo.titulo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Passo 1: Cliente */}
          {passoAtual === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Cliente
              </h3>

              <Autocomplete
                label="Buscar Cliente Cadastrado (opcional)"
                placeholder="Digite o nome do cliente"
                selectedKey={clienteId}
                onSelectionChange={handleClienteSelecionado}
                defaultItems={clientes}
                className="mb-4"
                description={`${clientes.length} clientes disponíveis para seleção`}
              >
                {(cliente) => (
                  <AutocompleteItem key={cliente.id} textValue={cliente.nome}>
                    {cliente.nome} - {cliente.telefone}
                  </AutocompleteItem>
                )}
              </Autocomplete>

              <Input
                label="Nome do Cliente *"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                isRequired
              />

              <Input
                label="Telefone *"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                isRequired
              />

              <Input
                label="E-mail"
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
              />

              <Input
                label="CPF/CNPJ"
                value={clienteCpfCnpj}
                onChange={(e) => setClienteCpfCnpj(e.target.value)}
              />

              <Textarea
                label="Endereço"
                value={clienteEndereco}
                onChange={(e) => setClienteEndereco(e.target.value)}
                minRows={2}
              />

              <Select
                label="Tipo de Cliente *"
                placeholder="Selecione o tipo"
                selectedKeys={[tipoCliente]}
                onSelectionChange={(keys) =>
                  setTipoCliente(
                    Array.from(keys)[0] as "lojista" | "consumidor_final",
                  )
                }
                isRequired
                description="Informe se o cliente é lojista ou consumidor final"
              >
                <SelectItem key="consumidor_final">Consumidor Final</SelectItem>
                <SelectItem key="lojista">Lojista</SelectItem>
              </Select>
            </div>
          )}

          {/* Passo 2: Aparelhos */}
          {passoAtual === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Aparelhos e Serviços
                </h3>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={adicionarAparelho}
                >
                  Adicionar aparelho
                </Button>
              </div>

              <div className="space-y-4">
                {[...aparelhos].reverse().map((ap, reversedIndex) => {
                  const index = aparelhos.length - 1 - reversedIndex;
                  return (
                    <Card key={index} className="border border-default-200">
                      <CardBody className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Chip color="primary" variant="flat" size="sm">
                              Aparelho #{index + 1}
                            </Chip>
                            {ap.sequencia && (
                              <Chip size="sm" variant="flat">
                                Sequência {ap.sequencia}
                              </Chip>
                            )}
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            size="sm"
                            onPress={() => removerAparelho(index)}
                            isDisabled={aparelhos.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Tipo do Aparelho *"
                            placeholder="Ex: Smartphone, Notebook"
                            value={ap.equipamento_tipo}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_tipo",
                                e.target.value,
                              )
                            }
                            isRequired
                          />
                          <Input
                            label="Marca"
                            value={ap.equipamento_marca}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_marca",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            label="Modelo"
                            value={ap.equipamento_modelo}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_modelo",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            label="Cor do Aparelho"
                            value={ap.equipamento_cor}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_cor",
                                e.target.value,
                              )
                            }
                            isRequired
                          />
                          <Input
                            label="IMEI ou Nº de Série"
                            value={
                              ap.equipamento_imei || ap.equipamento_numero_serie
                            }
                            onChange={(e) => {
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_imei",
                                e.target.value,
                              );
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_numero_serie",
                                e.target.value,
                              );
                            }}
                          />
                          <Input
                            label="Senha/PIN (opcional)"
                            type="password"
                            value={ap.equipamento_senha}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "equipamento_senha",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            label="Acessórios Entregues"
                            value={ap.acessorios_entregues}
                            onChange={(e) =>
                              atualizarAparelhoCampo(
                                index,
                                "acessorios_entregues",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <Textarea
                          label="Defeito Reclamado *"
                          placeholder="Descreva o problema relatado pelo cliente"
                          value={ap.defeito_reclamado}
                          onChange={(e) =>
                            atualizarAparelhoCampo(
                              index,
                              "defeito_reclamado",
                              e.target.value,
                            )
                          }
                          minRows={3}
                          isRequired
                        />

                        <Textarea
                          label="Estado do Equipamento"
                          placeholder="Ex: Tela trincada, riscos na lateral, etc"
                          value={ap.estado_equipamento}
                          onChange={(e) =>
                            atualizarAparelhoCampo(
                              index,
                              "estado_equipamento",
                              e.target.value,
                            )
                          }
                          minRows={2}
                        />

                        <Divider />

                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Serviços do aparelho
                          </h4>
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Plus className="w-4 h-4" />}
                            onPress={() => adicionarServicoAparelho(index)}
                          >
                            Adicionar serviço
                          </Button>
                        </div>

                        {ap.servicos && ap.servicos.length > 0 ? (
                          <div className="space-y-3">
                            {ap.servicos.map((svc, svcIdx) => (
                              <div
                                key={svcIdx}
                                className="grid grid-cols-1 md:grid-cols-8 gap-2 md:items-center"
                              >
                                <div className="md:col-span-5">
                                  <Input
                                    label={`Serviço ${svcIdx + 1}`}
                                    value={svc.descricao}
                                    onChange={(e) =>
                                      atualizarServicoAparelho(
                                        index,
                                        svcIdx,
                                        "descricao",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Input
                                    label="Valor"
                                    type="number"
                                    startContent={
                                      <span className="text-default-400">
                                        R$
                                      </span>
                                    }
                                    value={
                                      svc.valor !== undefined
                                        ? svc.valor.toString()
                                        : ""
                                    }
                                    onChange={(e) =>
                                      atualizarServicoAparelho(
                                        index,
                                        svcIdx,
                                        "valor",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    isIconOnly
                                    variant="light"
                                    color="danger"
                                    onPress={() =>
                                      removerServicoAparelho(index, svcIdx)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-default-500">
                            Nenhum serviço adicionado para este aparelho.
                          </p>
                        )}

                        <div className="flex justify-between items-center bg-default-50 p-3 rounded-lg">
                          <span className="text-sm font-semibold">
                            Total do aparelho
                          </span>
                          <span className="text-lg font-bold text-primary">
                            R$ {calcularTotalAparelho(ap).toFixed(2)}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passo 3: Atribuições */}
          {passoAtual === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Atribuições e Prioridade
              </h3>

              <Select
                label="Loja *"
                placeholder="Selecione a loja"
                selectedKeys={lojaId ? [lojaId.toString()] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  setLojaId(key ? parseInt(key.toString()) : 0);
                }}
                isRequired
              >
                {lojas.map((loja) => (
                  <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
                ))}
              </Select>

              <Select
                label="Técnico Responsável"
                placeholder="Atribuir técnico (opcional)"
                selectedKeys={tecnicoId ? [tecnicoId] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  setTecnicoId(key?.toString() || "");
                }}
              >
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.usuario_id || tecnico.id}>
                    {tecnico.nome}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Prioridade"
                selectedKeys={[prioridade]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  setPrioridade(key as PrioridadeOS);
                }}
              >
                <SelectItem key="baixa">Baixa</SelectItem>
                <SelectItem key="normal">Normal</SelectItem>
                <SelectItem key="alta">Alta</SelectItem>
                <SelectItem key="urgente">Urgente</SelectItem>
              </Select>

              <Input
                label="Previsão de Entrega"
                type="date"
                value={previsaoEntrega}
                onChange={(e) => setPrevisaoEntrega(e.target.value)}
              />
            </div>
          )}

          {/* Passo 4: Valores */}
          {passoAtual === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Valores e Observações
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardBody className="space-y-1">
                    <p className="text-sm text-default-500">
                      Total dos aparelhos
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {totalAparelhos.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="space-y-2">
                    <Input
                      label="Desconto"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={valorDesconto}
                      onChange={(e) => setValorDesconto(e.target.value)}
                      startContent={
                        <span className="text-default-400">R$</span>
                      }
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-500">
                        Total com desconto
                      </span>
                      <span className="text-lg font-bold text-primary">
                        R$ {totalAparelhosComDesconto.toFixed(2)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Textarea
                label="Observações Iniciais"
                placeholder="Observações técnicas ou administrativas"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                minRows={3}
              />
            </div>
          )}

          {/* Passo 5: Revisão */}
          {passoAtual === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Revisão dos Dados
              </h3>

              <Card>
                <CardBody className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Cliente</h4>
                    <p>
                      <strong>Nome:</strong> {clienteNome}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {clienteTelefone}
                    </p>
                    {clienteEmail && (
                      <p>
                        <strong>E-mail:</strong> {clienteEmail}
                      </p>
                    )}
                  </div>

                  {aparelhos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary mb-2">
                        Aparelhos
                      </h4>
                      {aparelhos.map((ap, idx) => (
                        <Card key={idx} className="bg-default-50">
                          <CardBody className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="font-semibold">
                                #{idx + 1} - {ap.equipamento_tipo}
                              </span>
                              <span className="text-default-500">
                                R$ {calcularTotalAparelho(ap).toFixed(2)}
                              </span>
                            </div>
                            {ap.equipamento_marca && (
                              <p>Marca: {ap.equipamento_marca}</p>
                            )}
                            {ap.equipamento_modelo && (
                              <p>Modelo: {ap.equipamento_modelo}</p>
                            )}
                            {ap.equipamento_cor && (
                              <p>Cor: {ap.equipamento_cor}</p>
                            )}
                            <p className="text-default-600">
                              Problema: {ap.defeito_reclamado}
                            </p>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-primary mb-2">
                      Atribuições
                    </h4>
                    <p>
                      <strong>Loja:</strong>{" "}
                      {lojas.find((l) => l.id === lojaId)?.nome}
                    </p>
                    {tecnicoId && (
                      <p>
                        <strong>Técnico:</strong>{" "}
                        {
                          tecnicos.find(
                            (t) => (t.usuario_id || t.id) === tecnicoId,
                          )?.nome
                        }
                      </p>
                    )}
                    <p>
                      <strong>Prioridade:</strong> {prioridade}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">Valores</h4>
                    <p>
                      <strong>Total dos aparelhos:</strong> R${" "}
                      {totalAparelhos.toFixed(2)}
                    </p>
                    {valorDesconto && (
                      <p>
                        <strong>Desconto:</strong> R${" "}
                        {(parseFloat(valorDesconto) || 0).toFixed(2)}
                      </p>
                    )}
                    <p className="text-lg font-bold mt-2">
                      <strong>Total:</strong> R${" "}
                      {totalAparelhosComDesconto.toFixed(2)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="flat"
              onPress={passoAnterior}
              isDisabled={passoAtual === 1}
              startContent={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button variant="light" onPress={handleClose}>
                Cancelar
              </Button>

              {passoAtual < PASSOS.length ? (
                <Button
                  color="primary"
                  onPress={proximoPasso}
                  endContent={<ChevronRight className="w-4 h-4" />}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  color="success"
                  onPress={handleSubmit}
                  isLoading={loading}
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  {ordem ? "Salvar Alterações" : "Criar Ordem de Serviço"}
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
