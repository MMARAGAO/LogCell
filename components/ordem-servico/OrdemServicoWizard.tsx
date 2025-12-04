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
} from "lucide-react";
import type {
  OrdemServicoFormData,
  StatusOS,
  PrioridadeOS,
  OrdemServico,
} from "@/types/ordemServico";
import type { Cliente, Tecnico } from "@/types/clientesTecnicos";
import { buscarClientes } from "@/services/clienteService";
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
  { id: 2, titulo: "Equipamento", icone: Smartphone },
  { id: 3, titulo: "Defeito/Problema", icone: FileText },
  { id: 4, titulo: "Atribuições", icone: Wrench },
  { id: 5, titulo: "Valores", icone: DollarSign },
  { id: 6, titulo: "Revisão", icone: CheckCircle },
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
    null
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

    // Equipamento
    setEquipamentoTipo(ordem.equipamento_tipo);
    setEquipamentoMarca(ordem.equipamento_marca || "");
    setEquipamentoModelo(ordem.equipamento_modelo || "");
    setEquipamentoNumeroSerie(ordem.equipamento_numero_serie || "");
    setEquipamentoSenha(ordem.equipamento_senha || "");

    // Defeito
    setDefeitoReclamado(ordem.defeito_reclamado);
    setEstadoEquipamento(ordem.estado_equipamento || "");
    setAcessoriosEntregues(ordem.acessorios_entregues || "");

    // Atribuições
    setLojaId(ordem.id_loja);
    setTecnicoId(ordem.tecnico_responsavel || "");
    setPrioridade(ordem.prioridade || "normal");
    setPrevisaoEntrega(
      ordem.previsao_entrega
        ? new Date(ordem.previsao_entrega).toISOString().split("T")[0]
        : ""
    );

    // Valores
    setValorOrcamento(ordem.valor_orcamento?.toString() || "");
    setValorDesconto(ordem.valor_desconto?.toString() || "");
    setObservacoes(ordem.observacoes_tecnicas || "");
  };

  const carregarClientes = async () => {
    const { data } = await buscarClientes();
    if (data) setClientes(data);
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
        setClienteCpfCnpj(cliente.cpf || "");
        setClienteEndereco(
          `${cliente.logradouro || ""} ${cliente.numero || ""} ${cliente.bairro || ""} ${cliente.cidade || ""}`.trim()
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
        if (!equipamentoTipo.trim()) {
          toast.error("Informe o tipo do equipamento");
          return false;
        }
        return true;
      case 3:
        if (!defeitoReclamado.trim()) {
          toast.error("Descreva o defeito reclamado");
          return false;
        }
        return true;
      case 4:
        if (!lojaId) {
          toast.error("Selecione a loja");
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

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
      const dados: OrdemServicoFormData = {
        // Cliente
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail || undefined,
        cliente_cpf_cnpj: clienteCpfCnpj || undefined,
        cliente_endereco: clienteEndereco || undefined,
        tipo_cliente: tipoCliente,

        // Equipamento
        equipamento_tipo: equipamentoTipo,
        equipamento_marca: equipamentoMarca || undefined,
        equipamento_modelo: equipamentoModelo || undefined,
        equipamento_numero_serie: equipamentoNumeroSerie || undefined,
        equipamento_senha: equipamentoSenha || undefined,

        // Defeito
        defeito_reclamado: defeitoReclamado,
        estado_equipamento: estadoEquipamento || undefined,
        acessorios_entregues: acessoriosEntregues || undefined,

        // Atribuições
        id_loja: lojaId,
        tecnico_responsavel: tecnicoId || undefined,
        prioridade,
        previsao_entrega: previsaoEntrega || undefined,

        // Valores
        valor_orcamento: valorOrcamento
          ? parseFloat(valorOrcamento)
          : undefined,
        valor_desconto: valorDesconto ? parseFloat(valorDesconto) : undefined,
        observacoes_tecnicas: observacoes || undefined,

        // Status padrão
        status: "aguardando" as StatusOS,
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
                    Array.from(keys)[0] as "lojista" | "consumidor_final"
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

          {/* Passo 2: Equipamento */}
          {passoAtual === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Informações do Equipamento
              </h3>

              <Input
                label="Tipo de Equipamento *"
                placeholder="Ex: Smartphone, Notebook, TV"
                value={equipamentoTipo}
                onChange={(e) => setEquipamentoTipo(e.target.value)}
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Marca"
                  placeholder="Ex: Samsung, Apple"
                  value={equipamentoMarca}
                  onChange={(e) => setEquipamentoMarca(e.target.value)}
                />

                <Input
                  label="Modelo"
                  placeholder="Ex: Galaxy S23"
                  value={equipamentoModelo}
                  onChange={(e) => setEquipamentoModelo(e.target.value)}
                />
              </div>

              <Input
                label="Número de Série / IMEI"
                value={equipamentoNumeroSerie}
                onChange={(e) => setEquipamentoNumeroSerie(e.target.value)}
              />

              <Input
                label="Senha/PIN (se informado pelo cliente)"
                type="password"
                value={equipamentoSenha}
                onChange={(e) => setEquipamentoSenha(e.target.value)}
              />
            </div>
          )}

          {/* Passo 3: Defeito */}
          {passoAtual === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Defeito e Estado do Equipamento
              </h3>

              <Textarea
                label="Defeito Reclamado *"
                placeholder="Descreva o problema relatado pelo cliente"
                value={defeitoReclamado}
                onChange={(e) => setDefeitoReclamado(e.target.value)}
                minRows={3}
                isRequired
              />

              <Textarea
                label="Estado do Equipamento"
                placeholder="Ex: Tela trincada, riscos na lateral, etc"
                value={estadoEquipamento}
                onChange={(e) => setEstadoEquipamento(e.target.value)}
                minRows={2}
              />

              <Textarea
                label="Acessórios Entregues"
                placeholder="Ex: Carregador, capa, fones"
                value={acessoriosEntregues}
                onChange={(e) => setAcessoriosEntregues(e.target.value)}
                minRows={2}
              />
            </div>
          )}

          {/* Passo 4: Atribuições */}
          {passoAtual === 4 && (
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

          {/* Passo 5: Valores */}
          {passoAtual === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Valores e Observações
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor do Orçamento"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valorOrcamento}
                  onChange={(e) => setValorOrcamento(e.target.value)}
                  startContent={<span className="text-default-400">R$</span>}
                />

                <Input
                  label="Desconto"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valorDesconto}
                  onChange={(e) => setValorDesconto(e.target.value)}
                  startContent={<span className="text-default-400">R$</span>}
                />
              </div>

              {valorOrcamento && (
                <Card>
                  <CardBody>
                    <div className="flex justify-between items-center">
                      <span className="text-default-600">Valor Total:</span>
                      <span className="text-xl font-bold text-primary">
                        R${" "}
                        {(
                          parseFloat(valorOrcamento || "0") -
                          parseFloat(valorDesconto || "0")
                        ).toFixed(2)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              )}

              <Textarea
                label="Observações Iniciais"
                placeholder="Observações técnicas ou administrativas"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                minRows={3}
              />
            </div>
          )}

          {/* Passo 6: Revisão */}
          {passoAtual === 6 && (
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

                  <div>
                    <h4 className="font-semibold text-primary mb-2">
                      Equipamento
                    </h4>
                    <p>
                      <strong>Tipo:</strong> {equipamentoTipo}
                    </p>
                    {equipamentoMarca && (
                      <p>
                        <strong>Marca:</strong> {equipamentoMarca}
                      </p>
                    )}
                    {equipamentoModelo && (
                      <p>
                        <strong>Modelo:</strong> {equipamentoModelo}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">Defeito</h4>
                    <p>{defeitoReclamado}</p>
                  </div>

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
                            (t) => (t.usuario_id || t.id) === tecnicoId
                          )?.nome
                        }
                      </p>
                    )}
                    <p>
                      <strong>Prioridade:</strong> {prioridade}
                    </p>
                  </div>

                  {valorOrcamento && (
                    <div>
                      <h4 className="font-semibold text-primary mb-2">
                        Valores
                      </h4>
                      <p>
                        <strong>Orçamento:</strong> R${" "}
                        {parseFloat(valorOrcamento).toFixed(2)}
                      </p>
                      {valorDesconto && (
                        <p>
                          <strong>Desconto:</strong> R${" "}
                          {parseFloat(valorDesconto).toFixed(2)}
                        </p>
                      )}
                      <p className="text-lg font-bold mt-2">
                        <strong>Total:</strong> R${" "}
                        {(
                          parseFloat(valorOrcamento) -
                          parseFloat(valorDesconto || "0")
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
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
