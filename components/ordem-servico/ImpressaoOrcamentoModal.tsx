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
  Divider,
  Tab,
  Tabs,
  Select,
  SelectItem,
} from "@heroui/react";
import { Download, FileText } from "lucide-react";

import { OrdemServico } from "@/types/ordemServico";
import { useToast } from "@/components/Toast";
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
    (os?.dias_garantia ?? 90).toString(),
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
      setDiasGarantia((os.dias_garantia ?? 90).toString());
    }
  }, [os]);

  const resolveDiasGarantia = () => {
    const trimmed = diasGarantia.trim();
    const valor = trimmed === "" ? 90 : Number(trimmed);

    return Number.isNaN(valor) ? 90 : valor;
  };

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
        await onSalvarGarantia(tipoGarantia, resolveDiasGarantia());
      }

      // Usar peças filtradas (apenas as marcadas como utilizadas)
      const pdf = await gerarOrcamentoOS(
        os,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        resolveDiasGarantia(),
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
        await onSalvarGarantia(tipoGarantia, resolveDiasGarantia());
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: resolveDiasGarantia(),
      };

      const pdf = await gerarGarantiaOS(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        resolveDiasGarantia(),
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
        await onSalvarGarantia(tipoGarantia, resolveDiasGarantia());
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: resolveDiasGarantia(),
      };

      const pdf = await gerarPDFOrdemServico(
        osAtualizada,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        resolveDiasGarantia(),
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
        await onSalvarGarantia(tipoGarantia, resolveDiasGarantia());
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: resolveDiasGarantia(),
      };

      const pdf = await gerarCupomTermicoPDFGarantia(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        resolveDiasGarantia(),
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
        await onSalvarGarantia(tipoGarantia, resolveDiasGarantia());
      }

      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: resolveDiasGarantia(),
      };

      const pdf = await gerarCupomTermicoPDFOS(
        osAtualizada,
        pecasFiltradas,
        dadosLoja,
        tipoGarantia,
        resolveDiasGarantia(),
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
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onClose={onClose}>
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
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                      📋 Orçamento de Serviço
                    </p>
                    <p className="text-blue-800 dark:text-blue-300">
                      O orçamento mostra apenas informações do equipamento,
                      problema e serviço a ser realizado.
                    </p>
                    <p className="text-blue-800 mt-2 dark:text-blue-300">
                      ✓ Peças não aparecem no PDF do orçamento (gerenciamento
                      interno)
                    </p>
                  </CardBody>
                </Card>

                {/* Informações do que será incluído */}
                <Card className="bg-gray-50 dark:bg-default-100/10">
                  <CardBody className="space-y-2 text-sm">
                    <p className="font-semibold">📄 O PDF incluirá:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
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
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-purple-900 dark:text-purple-200">
                      ⚙️ Configuração de Garantia
                    </p>
                    <p className="text-purple-800 dark:text-purple-300">
                      Customize os dados da garantia antes de imprimir.
                    </p>
                  </CardBody>
                </Card>

                {/* Seletor de Tipo de Garantia */}
                <Select
                  label="Tipo de Garantia"
                  selectedKeys={[tipoGarantia]}
                  size="sm"
                  onChange={(e) =>
                    setTipoGarantia(e.target.value as TipoServicoGarantia)
                  }
                >
                  {Object.entries(TIPOS_SERVICO_GARANTIA).map(
                    ([value, label]) => (
                      <SelectItem key={value}>{label}</SelectItem>
                    ),
                  )}
                </Select>

                {/* Dias de Garantia */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="orcamento-dias-garantia"
                  >
                    Dias de Garantia
                  </label>
                  <Input
                    endContent={
                      <span className="text-xs text-gray-500">dias</span>
                    }
                    id="orcamento-dias-garantia"
                    min="0"
                    placeholder="Ex: 90"
                    size="sm"
                    type="number"
                    value={diasGarantia}
                    onChange={(e) => setDiasGarantia(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
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
                      <Card className="bg-gray-50 dark:bg-default-100/10">
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
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardBody className="text-sm">
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      📄 Documento Completo
                    </p>
                    <p className="text-green-800 dark:text-green-300">
                      Gera OS com peças, garantia e dados da loja.
                    </p>
                  </CardBody>
                </Card>

                <Card className="bg-gray-50 dark:bg-default-100/10">
                  <CardBody className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1">
                        Peças ({pecasFiltradas.length}):
                      </p>
                      {pecasFiltradas.length > 0 ? (
                        <p className="text-gray-700 dark:text-gray-300">
                          {pecasFiltradas
                            .map((p) => p.descricao_peca)
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          Nenhuma peça será incluída
                        </p>
                      )}
                    </div>
                    <Divider />
                    <div>
                      <p className="font-semibold mb-1">Garantia:</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {tipoGarantia} ({diasGarantia} dias)
                      </p>
                    </div>
                    <Divider />
                    {dadosLoja && (
                      <div>
                        <p className="font-semibold mb-1">Dados da Loja:</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {dadosLoja.nome}
                        </p>
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
                isLoading={loading}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarOrcamento}
              >
                Gerar Orçamento
              </Button>
              <Button
                color="success"
                isLoading={loadingCupom}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermico}
              >
                Cupom Térmico
              </Button>
            </>
          )}

          {tipoImpressao === "garantia" && (
            <>
              <Button
                color="primary"
                isLoading={loading}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarGarantia}
              >
                Gerar Garantia
              </Button>
              <Button
                color="success"
                isLoading={loadingCupomGarantia}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermicoGarantia}
              >
                Cupom Térmico
              </Button>
            </>
          )}

          {tipoImpressao === "completo" && (
            <>
              <Button
                color="primary"
                isLoading={loading}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCompleto}
              >
                Gerar PDF
              </Button>
              <Button
                color="success"
                isLoading={loadingCupomCompleto}
                startContent={<Download className="w-4 h-4" />}
                onPress={handleGerarCupomTermicoCompleto}
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
