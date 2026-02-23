"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
} from "@heroui/react";
import {
  Smartphone,
  Trash2,
  Plus,
  DollarSign,
  AlertCircle,
} from "lucide-react";

import { OrdemServicoAparelho } from "@/types/ordemServico";
import {
  adicionarAparelho,
  atualizarAparelho,
  removerAparelho,
  buscarAparelhosOS,
  calcularTotaisOS,
} from "@/services/ordemServicoAparelhosService";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { formatarMoeda } from "@/lib/formatters";

interface GerenciarMultiplosAparelhosProp {
  isOpen: boolean;
  onClose: () => void;
  idOrdemServico: string;
  idLoja: number;
  onAparelhosAtualizados?: () => void;
}

interface AparelhoForm
  extends Omit<OrdemServicoAparelho, "id" | "criado_em" | "atualizado_em"> {
  isEditing?: boolean;
}

export default function GerenciarMultiplosAparelhos({
  isOpen,
  onClose,
  idOrdemServico,
  idLoja,
  onAparelhosAtualizados,
}: GerenciarMultiplosAparelhosProp) {
  const toast = useToast();
  const { usuario } = useAuth();
  const [aparelhos, setAparelhos] = useState<OrdemServicoAparelho[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostraNovo, setMostraNovo] = useState(false);
  const [aparelhoEmEdicao, setAparelhoEmEdicao] =
    useState<OrdemServicoAparelho | null>(null);
  const [totais, setTotais] = useState<any>(null);

  const [formData, setFormData] = useState<AparelhoForm>({
    id_ordem_servico: idOrdemServico,
    id_loja: idLoja,
    sequencia: 1,
    equipamento_tipo: "",
    equipamento_marca: "",
    equipamento_modelo: "",
    equipamento_numero_serie: "",
    equipamento_imei: "",
    equipamento_senha: "",
    defeito_reclamado: "",
    estado_equipamento: "",
    acessorios_entregues: "",
    diagnostico: "",
    valor_orcamento: 0,
    valor_desconto: 0,
    valor_total: 0,
    valor_pago: 0,
    servico_realizado: "",
    laudo_diagnostico: "",
    laudo_causa: "",
    laudo_procedimentos: "",
    laudo_recomendacoes: "",
    laudo_garantia_dias: 90,
    laudo_condicao_final: "",
    observacoes_tecnicas: "",
    status: "ativo",
  });

  const tiposEquipamento = [
    "Celular",
    "Smartphone",
    "Tablet",
    "Notebook",
    "Computador",
    "Console",
    "Smartwatch",
    "Outros",
  ];

  useEffect(() => {
    if (isOpen) {
      carregarAparelhos();
    }
  }, [isOpen]);

  // Limpar campos sensíveis quando fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setFormData((prev) => ({
        ...prev,
        equipamento_senha: "",
      }));
    }
  }, [isOpen]);

  const carregarAparelhos = async () => {
    setLoading(true);
    try {
      const { data } = await buscarAparelhosOS(idOrdemServico);

      if (data) {
        setAparelhos(data);
      }

      const totaisCalc = await calcularTotaisOS(idOrdemServico);

      setTotais(totaisCalc);
    } catch (error) {
      console.error("Erro ao carregar aparelhos:", error);
      toast.error("Erro ao carregar aparelhos");
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAparelho = () => {
    setAparelhoEmEdicao(null);
    setFormData({
      id_ordem_servico: idOrdemServico,
      id_loja: idLoja,
      sequencia: aparelhos.length + 1,
      equipamento_tipo: "",
      equipamento_marca: "",
      equipamento_modelo: "",
      equipamento_numero_serie: "",
      equipamento_imei: "",
      equipamento_senha: "",
      defeito_reclamado: "",
      estado_equipamento: "",
      acessorios_entregues: "",
      diagnostico: "",
      valor_orcamento: 0,
      valor_desconto: 0,
      valor_total: 0,
      valor_pago: 0,
      servico_realizado: "",
      laudo_diagnostico: "",
      laudo_causa: "",
      laudo_procedimentos: "",
      laudo_recomendacoes: "",
      laudo_garantia_dias: 90,
      laudo_condicao_final: "",
      observacoes_tecnicas: "",
      status: "ativo",
    });
    setMostraNovo(true);
  };

  const handleEditarAparelho = (aparelho: OrdemServicoAparelho) => {
    setAparelhoEmEdicao(aparelho);
    setFormData({
      id_ordem_servico: aparelho.id_ordem_servico,
      id_loja: aparelho.id_loja,
      sequencia: aparelho.sequencia,
      equipamento_tipo: aparelho.equipamento_tipo || "",
      equipamento_marca: aparelho.equipamento_marca || "",
      equipamento_modelo: aparelho.equipamento_modelo || "",
      equipamento_numero_serie: aparelho.equipamento_numero_serie || "",
      equipamento_imei: aparelho.equipamento_imei || "",
      equipamento_senha: "", // Sempre vazio - o usuário digita se quiser alterar
      defeito_reclamado: aparelho.defeito_reclamado || "",
      estado_equipamento: aparelho.estado_equipamento || "",
      acessorios_entregues: aparelho.acessorios_entregues || "",
      diagnostico: aparelho.diagnostico || "",
      valor_orcamento: aparelho.valor_orcamento || 0,
      valor_desconto: aparelho.valor_desconto || 0,
      valor_total: aparelho.valor_total || 0,
      valor_pago: aparelho.valor_pago || 0,
      servico_realizado: aparelho.servico_realizado || "",
      laudo_diagnostico: aparelho.laudo_diagnostico || "",
      laudo_causa: aparelho.laudo_causa || "",
      laudo_procedimentos: aparelho.laudo_procedimentos || "",
      laudo_recomendacoes: aparelho.laudo_recomendacoes || "",
      laudo_garantia_dias: aparelho.laudo_garantia_dias || 90,
      laudo_condicao_final: aparelho.laudo_condicao_final || "",
      observacoes_tecnicas: aparelho.observacoes_tecnicas || "",
      status: aparelho.status || "ativo",
      isEditing: true,
    });
    setMostraNovo(true);
  };

  const handleSalvarAparelho = async () => {
    if (!formData.equipamento_tipo || !formData.defeito_reclamado) {
      toast.error("Preencha os campos obrigatórios (tipo e defeito)");

      return;
    }

    try {
      setLoading(true);

      if (aparelhoEmEdicao) {
        // Editar existente - não sobrescrever senha se estiver vazia
        const dadosAtualizacao = { ...formData };

        if (!dadosAtualizacao.equipamento_senha) {
          // Se a senha está vazia, manter a anterior
          dadosAtualizacao.equipamento_senha =
            aparelhoEmEdicao.equipamento_senha || "";
        }

        const { error } = await atualizarAparelho(
          aparelhoEmEdicao.id,
          dadosAtualizacao,
          usuario?.id || "sistema",
        );

        if (error) throw error;
        toast.success("Aparelho atualizado com sucesso!");
      } else {
        // Adicionar novo
        const { error } = await adicionarAparelho(
          idOrdemServico,
          formData,
          usuario?.id || "sistema",
        );

        if (error) throw error;
        toast.success("Aparelho adicionado com sucesso!");
      }

      await carregarAparelhos();
      setMostraNovo(false);
      onAparelhosAtualizados?.();
    } catch (error) {
      console.error("Erro ao salvar aparelho:", error);
      toast.error("Erro ao salvar aparelho");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAparelho = async (idAparelho: string) => {
    if (!window.confirm("Tem certeza que deseja remover este aparelho?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await removerAparelho(
        idAparelho,
        usuario?.id || "sistema",
      );

      if (error) throw error;
      toast.success("Aparelho removido com sucesso!");
      await carregarAparelhos();
      onAparelhosAtualizados?.();
    } catch (error) {
      console.error("Erro ao remover aparelho:", error);
      toast.error("Erro ao remover aparelho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="outside"
        size="4xl"
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Gerenciar Aparelhos da OS
          </ModalHeader>

          <Divider />

          <ModalBody className="space-y-4">
            {/* Resumo de Totais */}
            {totais && (
              <Card className="bg-primary-50">
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-default-600">Total Geral</p>
                      <p className="text-lg font-bold text-primary">
                        {formatarMoeda(totais.totalGeral)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-600">Total Pago</p>
                      <p className="text-lg font-bold text-success">
                        {formatarMoeda(totais.totalPago)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-600">Saldo Devedor</p>
                      <p className="text-lg font-bold text-danger">
                        {formatarMoeda(totais.saldoDevedor)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-600">Aparelhos</p>
                      <p className="text-lg font-bold">{aparelhos.length}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Lista de Aparelhos */}
            <div className="space-y-3">
              {aparelhos.length === 0 ? (
                <Card className="bg-default-50">
                  <CardBody className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-default-400 mx-auto mb-2" />
                    <p className="text-default-600">
                      Nenhum aparelho adicionado ainda
                    </p>
                  </CardBody>
                </Card>
              ) : (
                [...aparelhos].reverse().map((aparelho, idx) => {
                  const totaisPor = totais?.porAparelho.find(
                    (p: any) => p.sequencia === aparelho.sequencia,
                  );

                  return (
                    <Card key={aparelho.id}>
                      <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Chip color="primary" size="sm" variant="flat">
                            Aparelho {aparelho.sequencia}
                          </Chip>
                          <span className="font-medium">
                            {aparelho.equipamento_tipo}
                            {aparelho.equipamento_marca &&
                              ` - ${aparelho.equipamento_marca}`}
                            {aparelho.equipamento_modelo &&
                              ` ${aparelho.equipamento_modelo}`}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEditarAparelho(aparelho)}
                          >
                            ✏️
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => handleRemoverAparelho(aparelho.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-2 text-sm">
                        {aparelho.equipamento_numero_serie && (
                          <div>
                            <span className="font-semibold">Série:</span>{" "}
                            {aparelho.equipamento_numero_serie}
                          </div>
                        )}
                        {aparelho.equipamento_imei && (
                          <div>
                            <span className="font-semibold">IMEI:</span>{" "}
                            {aparelho.equipamento_imei}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold">Defeito:</span>{" "}
                          {aparelho.defeito_reclamado}
                        </div>
                        {totaisPor && (
                          <div className="flex gap-4 pt-2 border-t">
                            <div>
                              <p className="text-xs text-default-600">Valor</p>
                              <p className="font-semibold">
                                {formatarMoeda(totaisPor.total)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-default-600">Pago</p>
                              <p className="font-semibold text-success">
                                {formatarMoeda(totaisPor.pago)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-default-600">Saldo</p>
                              <p className="font-semibold text-danger">
                                {formatarMoeda(totaisPor.saldo)}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Botão Adicionar Novo */}
            {!mostraNovo && (
              <Button
                fullWidth
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                variant="flat"
                onPress={handleNovoAparelho}
              >
                Adicionar Novo Aparelho
              </Button>
            )}

            {/* Formulário de Novo/Edição */}
            {mostraNovo && (
              <Card className="bg-default-50 border-2 border-primary-100">
                <CardHeader>
                  <h4 className="font-semibold">
                    {aparelhoEmEdicao ? "Editar Aparelho" : "Novo Aparelho"}
                  </h4>
                </CardHeader>
                <CardBody className="space-y-4">
                  <form autoComplete="off" style={{ display: "contents" }}>
                    {/* Informações do Equipamento */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Equipamento</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          label="Tipo *"
                          placeholder="Selecione..."
                          value={formData.equipamento_tipo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipamento_tipo: e.target.value,
                            })
                          }
                        />
                        <Input
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          label="Marca"
                          value={formData.equipamento_marca || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipamento_marca: e.target.value,
                            })
                          }
                        />
                        <Input
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          label="Modelo"
                          value={formData.equipamento_modelo || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipamento_modelo: e.target.value,
                            })
                          }
                        />
                        <Input
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          label="Série / IMEI"
                          value={formData.equipamento_numero_serie || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipamento_numero_serie: e.target.value,
                            })
                          }
                        />
                        <Input
                          autoComplete="new-password"
                          data-form-type="other"
                          data-lpignore="true"
                          label="Senha/PIN (opcional)"
                          type="password"
                          value={formData.equipamento_senha || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipamento_senha: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Problema */}
                    <Textarea
                      autoComplete="off"
                      data-lpignore="true"
                      label="Problema Relatado *"
                      minRows={2}
                      placeholder="Descreva o problema"
                      value={formData.defeito_reclamado}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defeito_reclamado: e.target.value,
                        })
                      }
                    />

                    {/* Valores */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Valores</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          autoComplete="off"
                          label="Orçamento"
                          startContent={<DollarSign className="w-4 h-4" />}
                          step="0.01"
                          type="number"
                          value={(formData.valor_orcamento || 0).toString()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valor_orcamento: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          autoComplete="off"
                          label="Desconto"
                          startContent={<DollarSign className="w-4 h-4" />}
                          step="0.01"
                          type="number"
                          value={(formData.valor_desconto || 0).toString()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valor_desconto: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          autoComplete="off"
                          label="Total"
                          startContent={<DollarSign className="w-4 h-4" />}
                          step="0.01"
                          type="number"
                          value={(formData.valor_total || 0).toString()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valor_total: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          label="Pago"
                          startContent={<DollarSign className="w-4 h-4" />}
                          step="0.01"
                          type="number"
                          value={(formData.valor_pago || 0).toString()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valor_pago: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Botões do Formulário */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="light"
                        onPress={() => setMostraNovo(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        color="primary"
                        isLoading={loading}
                        onPress={handleSalvarAparelho}
                      >
                        {aparelhoEmEdicao ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}
          </ModalBody>

          <Divider />

          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
