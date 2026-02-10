"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
  Card,
  CardBody,
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
  FileCheck,
  Printer,
} from "lucide-react";
import { abrirPreviewPDF } from "@/lib/pdfPreview";
import { supabase } from "@/lib/supabaseClient";
import {
  TipoServicoGarantia,
  TIPOS_SERVICO_GARANTIA,
  TextoGarantiaResponse,
} from "@/types/garantia";
import { OrdemServico } from "@/types/ordemServico";
import { useToast } from "@/components/Toast";
import {
  gerarGarantiaOS,
  gerarCupomTermicoGarantia,
  imprimirCupomTermico,
} from "@/lib/impressaoOS";

interface GarantiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  pecas: any[];
  dadosLoja: any;
}

interface PecaOS {
  descricao_peca: string;
  quantidade: number;
  valor_venda: number;
}

export default function GarantiaModal({
  isOpen,
  onClose,
  os,
  pecas,
  dadosLoja,
}: GarantiaModalProps) {
  const [tipoGarantia, setTipoGarantia] = useState<TipoServicoGarantia>(
    (os?.tipo_garantia as TipoServicoGarantia) || "servico_geral",
  );
  const [diasGarantia, setDiasGarantia] = useState<string>(
    (os?.dias_garantia || 90).toString(),
  );
  const [textoGarantia, setTextoGarantia] =
    useState<TextoGarantiaResponse | null>(null);
  const [loadingTexto, setLoadingTexto] = useState(false);
  const [loadingGerar, setLoadingGerar] = useState(false);
  const [loadingCupom, setLoadingCupom] = useState(false);
  const toast = useToast();

  // Atualizar tipo de garantia quando a OS mudar
  useEffect(() => {
    if (os) {
      setTipoGarantia(
        (os.tipo_garantia as TipoServicoGarantia) || "servico_geral",
      );
      setDiasGarantia((os.dias_garantia || 90).toString());
    }
  }, [os]);

  // Carregar texto de garantia quando o tipo mudar
  useEffect(() => {
    if (isOpen) {
      carregarTextoGarantia();
    }
  }, [tipoGarantia, isOpen]);

  const carregarTextoGarantia = async () => {
    if (!tipoGarantia) return;

    setLoadingTexto(true);
    try {
      const { data, error } = await supabase
        .from("textos_garantia")
        .select("id, tipo_servico, dias_garantia, titulo, clausulas")
        .eq("tipo_servico", tipoGarantia)
        .eq("ativo", true)
        .single();

      if (error) {
        console.error("Erro ao buscar texto de garantia:", error);
        setTextoGarantia(null);
        return;
      }

      if (data) {
        setTextoGarantia(data as TextoGarantiaResponse);
        // Se o texto tiver dias de garantia padrão, usar como sugestão
        if (data.dias_garantia && !os?.dias_garantia) {
          setDiasGarantia(data.dias_garantia.toString());
        }
      }
    } catch (error) {
      console.error("Erro ao buscar texto de garantia:", error);
      setTextoGarantia(null);
    } finally {
      setLoadingTexto(false);
    }
  };

  const handleGerarGarantia = async () => {
    if (!os) return;

    setLoadingGerar(true);
    try {
      // Criar objeto OS atualizado com tipo e dias de garantia
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const doc = await gerarGarantiaOS(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );
      abrirPreviewPDF(doc, `Garantia_OS_${os.numero_os || os.id}.pdf`);
      toast.success("Termo de garantia gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar garantia:", error);
      toast.error("Erro ao gerar garantia");
    } finally {
      setLoadingGerar(false);
    }
  };

  const handleImprimirCupom = async () => {
    if (!os) return;

    setLoadingCupom(true);
    try {
      const osAtualizada = {
        ...os,
        tipo_garantia: tipoGarantia,
        dias_garantia: parseInt(diasGarantia) || 90,
      };

      const cupom = await gerarCupomTermicoGarantia(
        osAtualizada,
        dadosLoja,
        tipoGarantia,
        parseInt(diasGarantia) || 90,
      );
      imprimirCupomTermico(cupom);
      toast.success("Cupom térmico de garantia gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar cupom de garantia:", error);
      toast.error("Erro ao gerar cupom de garantia");
    } finally {
      setLoadingCupom(false);
    }
  };

  if (!os) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-success" />
            <span>Configurar Termo de Garantia</span>
          </div>
          <p className="text-sm text-default-500 font-normal">
            OS #{os.numero_os} - {os.cliente_nome}
          </p>
        </ModalHeader>
        <ModalBody className="gap-4">
          \n {/* Info Card */}
          <Card className="bg-primary-50 border-primary-200 border">
            <CardBody className="flex flex-row items-start gap-3 p-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-primary-800 font-medium">
                  Personalize a garantia antes de imprimir
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  Escolha o tipo de serviço e ajuste os dias de garantia
                  conforme necessário. As observações técnicas da OS serão
                  incluídas automaticamente.
                </p>
              </div>
            </CardBody>
          </Card>
          {/* Tipo de Garantia */}
          <div>
            <Select
              label="Tipo de Garantia"
              selectedKeys={[tipoGarantia]}
              onChange={(e) => {
                setTipoGarantia(e.target.value as TipoServicoGarantia);
              }}
              description="Selecione o tipo de serviço realizado"
              className="max-w-full"
            >
              {(
                Object.entries(TIPOS_SERVICO_GARANTIA) as [
                  TipoServicoGarantia,
                  string,
                ][]
              ).map(([tipo, label]) => (
                <SelectItem key={tipo}>{label}</SelectItem>
              ))}
            </Select>
          </div>
          {/* Dias de Garantia */}
          <div>
            <Input
              type="number"
              label="Dias de Garantia"
              placeholder="90"
              value={diasGarantia}
              onValueChange={setDiasGarantia}
              min="1"
              max="999"
              description="Quantidade de dias que o cliente tem de garantia"
              startContent={<span className="text-small">📅</span>}
            />
          </div>
          {/* Preview do Texto de Garantia */}
          {loadingTexto ? (
            <div className="flex justify-center items-center py-4">
              <Spinner size="sm" />
            </div>
          ) : textoGarantia ? (
            <Card className="bg-default-50">
              <CardBody className="gap-3">
                <div>
                  <p className="font-bold text-small">Título da Garantia:</p>
                  <p className="text-small">{textoGarantia.titulo}</p>
                </div>
                <Divider />
                <div>
                  <p className="font-bold text-small">
                    Dias de Garantia (Padrão):
                  </p>
                  <p className="text-small">
                    {textoGarantia.dias_garantia} dias
                  </p>
                </div>
                <Divider />
                <div>
                  <p className="font-bold text-small mb-2">Cláusulas:</p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {textoGarantia.clausulas?.map((clausula, idx) => (
                      <p key={idx} className="text-tiny">
                        <span className="font-semibold">
                          ({clausula.numero})
                        </span>{" "}
                        {clausula.texto}
                      </p>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="bg-warning-50 border border-warning">
              <CardBody className="gap-2">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-small">
                      Texto de garantia não encontrado
                    </p>
                    <p className="text-tiny">
                      Nenhum texto de garantia cadastrado para este tipo de
                      serviço. O sistema usará termos padrão.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            variant="flat"
            onPress={handleImprimirCupom}
            isLoading={loadingCupom}
            startContent={!loadingCupom && <Printer className="w-4 h-4" />}
          >
            Imprimir cupom térmico
          </Button>
          <Button
            color="success"
            onPress={handleGerarGarantia}
            isLoading={loadingGerar}
            startContent={!loadingGerar && <Printer className="w-4 h-4" />}
          >
            Gerar e Imprimir Garantia
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
