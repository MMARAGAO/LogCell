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
  Card,
  CardBody,
  Checkbox,
  Divider,
  Spinner,
  Tab,
  Tabs,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Download,
  Trash2,
  Package,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import { OrdemServico } from "@/types/ordemServico";
import { useToast } from "@/components/Toast";
import { formatarMoeda } from "@/lib/formatters";
import {
  gerarOrcamentoOS,
  gerarGarantiaOS,
  gerarPDFOrdemServico,
  gerarCupomTermicoPDFOrcamento,
  gerarCupomTermicoPDFGarantia,
  gerarCupomTermicoPDFOS,
} from "@/lib/impressaoOS";
import { abrirPreviewPDF } from "@/lib/pdfPreview";
import { TipoServicoGarantia, TIPOS_SERVICO_GARANTIA } from "@/types/garantia";

interface PecaOS {
  id?: string;
  descricao_peca: string;
  quantidade: number;
  valor_venda: number;
  utilizada?: boolean; // Flag para marcar se foi utilizada no serviço
}

interface ImpressaoOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  pecas: PecaOS[];
  dadosLoja: any;
  onSalvarGarantia?: (
    tipoGarantia: string,
    diasGarantia: number,
  ) => Promise<void>;
}

export default function ImpressaoOrcamentoModal({
  isOpen,
  onClose,
  os,
  pecas: pecasInicial,
  dadosLoja,
  onSalvarGarantia,
}: ImpressaoOrcamentoModalProps) {
  const [pecas, setPecas] = useState<PecaOS[]>([]);
  const [tipoGarantia, setTipoGarantia] = useState<TipoServicoGarantia>(
    (os?.tipo_garantia as TipoServicoGarantia) || "servico_geral",
  );
  const [diasGarantia, setDiasGarantia] = useState<string>(
    (os?.dias_garantia || 90).toString(),
  );
  const [loading, setLoading] = useState(false);
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [loadingCupomGarantia, setLoadingCupomGarantia] = useState(false);
  const [loadingCupomCompleto, setLoadingCupomCompleto] = useState(false);
  const [tipoImpressao, setTipoImpressao] = useState<
    "orcamento" | "garantia" | "completo"
  >("orcamento");
  const toast = useToast();

  useEffect(() => {
    if (isOpen && pecasInicial) {
      setPecas(
        pecasInicial.map((p) => ({
          ...p,
          utilizada: true, // Por padrão, todas as peças estão marcadas como utilizadas
        })),
      );
    }
  }, [isOpen, pecasInicial]);

  useEffect(() => {
    if (os) {
      setTipoGarantia(
        (os.tipo_garantia as TipoServicoGarantia) || "servico_geral",
      );
      setDiasGarantia((os.dias_garantia || 90).toString());
    }
  }, [os]);

  const handleTogglePeca = (index: number) => {
    const novasPecas = [...pecas];
    novasPecas[index].utilizada = !novasPecas[index].utilizada;
    setPecas(novasPecas);
  };

  const handleRemoverPeca = (index: number) => {
    setPecas(pecas.filter((_, i) => i !== index));
  };

  const pecasFiltradas = pecas.filter((p) => p.utilizada);
  const totalPecas = pecasFiltradas.reduce(
    (sum, p) => sum + p.valor_venda * p.quantidade,
    0,
  );

  const handleGerarOrcamento = async () => {
    if (!os) return;

    setLoading(true);
    try {
      // Salvar garantia se houver função de callback
      if (onSalvarGarantia) {
        await onSalvarGarantia(tipoGarantia, parseInt(diasGarantia) || 90);
      }

      // Usar peças filtradas (apenas as marcadas como utilizadas)
      const pdf = await gerarOrcamentoOS(
        os,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );

      abrirPreviewPDF(pdf, `Orcamento_OS_${os.numero_os || os.id}.pdf`);
      toast.success("Orçamento gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar orçamento:", error);
      toast.error("Erro ao gerar orçamento");
    } finally {
      setLoading(false);
    }
  };

  const handleGerarGarantia = async () => {
    if (!os) return;

    setLoading(true);
    try {
      // Salvar garantia se houver função de callback
      if (onSalvarGarantia) {
        await onSalvarGarantia(tipoGarantia, parseInt(diasGarantia) || 90);
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const pdf = await gerarGarantiaOS(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );

      abrirPreviewPDF(pdf, `Garantia_OS_${os.numero_os || os.id}.pdf`);
      toast.success("Termo de garantia gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar garantia:", error);
      toast.error("Erro ao gerar garantia");
    } finally {
      setLoading(false);
    }
  };

  const handleGerarCompleto = async () => {
    if (!os) return;

    setLoading(true);
    try {
      // Salvar garantia se houver função de callback
      if (onSalvarGarantia) {
        await onSalvarGarantia(tipoGarantia, parseInt(diasGarantia) || 90);
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const pdf = await gerarPDFOrdemServico(
        osAtualizada,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );

      abrirPreviewPDF(pdf, `OS_${os.numero_os || os.id}_Completa.pdf`);
      toast.success("OS completa gerada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar OS completa:", error);
      toast.error("Erro ao gerar OS completa");
    } finally {
      setLoading(false);
    }
  };

  const handleGerarCupomTermico = async () => {
    if (!os) return;

    setLoadingCupom(true);
    try {
      const pdf = await gerarCupomTermicoPDFOrcamento(
        os,
        pecasFiltradas,
        dadosLoja,
      );
      abrirPreviewPDF(pdf, `CupomTermico_OS_${os.numero_os || os.id}.pdf`);
      toast.success("Cupom térmico gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar cupom térmico:", error);
      toast.error("Erro ao gerar cupom térmico");
    } finally {
      setLoadingCupom(false);
    }
  };

  const handleGerarCupomTermicoGarantia = async () => {
    if (!os) return;

    setLoadingCupomGarantia(true);
    try {
      // Salvar garantia se houver função de callback
      if (onSalvarGarantia) {
        await onSalvarGarantia(tipoGarantia, parseInt(diasGarantia) || 90);
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const pdf = await gerarCupomTermicoPDFGarantia(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );
      abrirPreviewPDF(
        pdf,
        `CupomTermico_Garantia_OS_${os.numero_os || os.id}.pdf`,
      );
      toast.success("Cupom térmico de garantia gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar cupom térmico de garantia:", error);
      toast.error("Erro ao gerar cupom térmico de garantia");
    } finally {
      setLoadingCupomGarantia(false);
    }
  };

  const handleGerarCupomTermicoCompleto = async () => {
    if (!os) return;

    setLoadingCupomCompleto(true);
    try {
      // Salvar garantia se houver função de callback
      if (onSalvarGarantia) {
        await onSalvarGarantia(tipoGarantia, parseInt(diasGarantia) || 90);
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const pdf = await gerarCupomTermicoPDFOS(
        osAtualizada,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );
      abrirPreviewPDF(pdf, `CupomTermico_OS_${os.numero_os || os.id}.pdf`);
      toast.success("Cupom térmico da OS gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar cupom térmico da OS:", error);
      toast.error("Erro ao gerar cupom térmico da OS");
    } finally {
      setLoadingCupomCompleto(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerar Documentos da OS
          </div>
          {os && (
            <p className="text-sm text-gray-600">OS #{os.numero_os || os.id}</p>
          )}
        </ModalHeader>

        <ModalBody>
          <Tabs
            aria-label="Tipo de Documento"
            selectedKey={tipoImpressao}
            onSelectionChange={(key) => setTipoImpressao(key as any)}
          >
            {/* TAB 1: ORÇAMENTO */}
            <Tab key="orcamento" title="Orçamento">
              <div className="space-y-4 py-4">
                <Card className="bg-blue-50">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-blue-900">
                      📋 Orçamento de Serviço
                    </p>
                    <p className="text-blue-800">
                      O orçamento mostra apenas informações do equipamento,
                      problema e serviço a ser realizado.
                    </p>
                    <p className="text-blue-800 mt-2">
                      ✓ Peças não aparecem no PDF do orçamento (gerenciamento
                      interno)
                    </p>
                  </CardBody>
                </Card>

                {/* Informações do que será incluído */}
                <Card className="bg-gray-50">
                  <CardBody className="space-y-2 text-sm">
                    <p className="font-semibold">📄 O PDF incluirá:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Dados da loja (endereço e telefone)</li>
                      <li>Dados do cliente</li>
                      <li>Dados do equipamento</li>
                      <li>Problema relatado</li>
                      <li>Serviço que será realizado</li>
                      <li>Valores do orçamento</li>
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* TAB 2: GARANTIA */}
            <Tab key="garantia" title="Garantia">
              <div className="space-y-4 py-4">
                <Card className="bg-purple-50">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-purple-900">
                      ⚙️ Configuração de Garantia
                    </p>
                    <p className="text-purple-800">
                      Customize os dados da garantia antes de imprimir.
                    </p>
                  </CardBody>
                </Card>

                {/* Seletor de Tipo de Garantia */}
                <Select
                  label="Tipo de Garantia"
                  selectedKeys={[tipoGarantia]}
                  onChange={(e) =>
                    setTipoGarantia(e.target.value as TipoServicoGarantia)
                  }
                  size="sm"
                >
                  {Object.entries(TIPOS_SERVICO_GARANTIA).map(
                    ([value, label]) => (
                      <SelectItem key={value}>{label}</SelectItem>
                    ),
                  )}
                </Select>

                {/* Dias de Garantia */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Dias de Garantia
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={diasGarantia}
                    onChange={(e) => setDiasGarantia(e.target.value)}
                    placeholder="Ex: 90"
                    size="sm"
                    endContent={
                      <span className="text-xs text-gray-500">dias</span>
                    }
                  />
                  <p className="text-xs text-gray-600">
                    ℹ️ Use 0 para garantias sem prazo (ex: tampas)
                  </p>
                </div>

                {/* Dados da Loja */}
                {dadosLoja && (
                  <>
                    <Divider />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">
                        Dados da Loja no PDF:
                      </p>
                      <Card className="bg-gray-50">
                        <CardBody className="py-2 text-xs space-y-1">
                          {dadosLoja.nome && (
                            <p>
                              <strong>Loja:</strong> {dadosLoja.nome}
                            </p>
                          )}
                          {dadosLoja.endereco && (
                            <p>
                              <strong>Endereço:</strong> {dadosLoja.endereco}
                            </p>
                          )}
                          {dadosLoja.telefone && (
                            <p>
                              <strong>Telefone:</strong> {dadosLoja.telefone}
                            </p>
                          )}
                          {dadosLoja.cnpj && (
                            <p>
                              <strong>CNPJ:</strong> {dadosLoja.cnpj}
                            </p>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </Tab>

            {/* TAB 3: PREVIEW */}
            <Tab key="completo" title="Tudo Junto">
              <div className="space-y-4 py-4">
                <Card className="bg-green-50">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-green-900">
                      📄 Documento Completo
                    </p>
                    <p className="text-green-800">
                      Gera OS com peças, garantia e dados da loja.
                    </p>
                  </CardBody>
                </Card>

                <Card className="bg-gray-50">
                  <CardBody className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1">
                        Peças ({pecasFiltradas.length}):
                      </p>
                      {pecasFiltradas.length > 0 ? (
                        <p className="text-gray-700">
                          {pecasFiltradas
                            .map((p) => p.descricao_peca)
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="text-gray-500">
                          Nenhuma peça será incluída
                        </p>
                      )}
                    </div>
                    <Divider />
                    <div>
                      <p className="font-semibold mb-1">Garantia:</p>
                      <p className="text-gray-700">
                        {tipoGarantia} ({diasGarantia} dias)
                      </p>
                    </div>
                    <Divider />
                    {dadosLoja && (
                      <div>
                        <p className="font-semibold mb-1">Dados da Loja:</p>
                        <p className="text-gray-700">{dadosLoja.nome}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Fechar
          </Button>

          {tipoImpressao === "orcamento" && (
            <>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarOrcamento}
                isLoading={loading}
              >
                Gerar Orçamento
              </Button>
              <Button
                color="success"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermico}
                isLoading={loadingCupom}
              >
                Cupom Térmico
              </Button>
            </>
          )}

          {tipoImpressao === "garantia" && (
            <>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarGarantia}
                isLoading={loading}
              >
                Gerar Garantia
              </Button>
              <Button
                color="success"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermicoGarantia}
                isLoading={loadingCupomGarantia}
              >
                Cupom Térmico
              </Button>
            </>
          )}

          {tipoImpressao === "completo" && (
            <>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCompleto}
                isLoading={loading}
              >
                Gerar PDF
              </Button>
              <Button
                color="success"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermicoCompleto}
                isLoading={loadingCupomCompleto}
              >
                Cupom Térmico
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
