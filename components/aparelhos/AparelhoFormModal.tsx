import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { useState, useEffect } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/Toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Aparelho, AparelhoFormData, FotoAparelho } from "@/types/aparelhos";
import {
  criarAparelho,
  atualizarAparelho,
  getAparelhoPorPrefixoIMEI,
} from "@/services/aparelhosService";
import { getFotosAparelho } from "@/services/fotosAparelhosService";
import { FotosAparelhoUpload } from "./FotosAparelhoUpload";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface AparelhoFormModalProps {
  aparelho?: Aparelho;
  lojaId: number;
  onClose: (sucesso?: boolean) => void;
}

const ESTADOS = [
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado", label: "Usado" },
  { value: "recondicionado", label: "Recondicionado" },
];

const CONDICOES = [
  { value: "perfeito", label: "Perfeito" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
];

export function AparelhoFormModal({
  aparelho,
  lojaId,
  onClose,
}: AparelhoFormModalProps) {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fotos, setFotos] = useState<FotoAparelho[]>([]);
  const [scannerAberto, setScannerAberto] = useState(false);
  const [prefixoIMEIConsultado, setPrefixoIMEIConsultado] = useState("");
  const [formData, setFormData] = useState<AparelhoFormData>({
    marca: "",
    modelo: "",
    armazenamento: "",
    memoria_ram: "",
    imei: "",
    numero_serie: "",
    cor: "",
    estado: "novo",
    condicao: undefined,
    acessorios: "",
    observacoes: "",
    valor_compra: undefined,
    valor_venda: undefined,
    loja_id: lojaId,
    status: "disponivel",
  });

  useEffect(() => {
    if (aparelho) {
      setFormData({
        marca: aparelho.marca || "",
        modelo: aparelho.modelo || "",
        armazenamento: aparelho.armazenamento || "",
        memoria_ram: aparelho.memoria_ram || "",
        imei: aparelho.imei || "",
        numero_serie: aparelho.numero_serie || "",
        cor: aparelho.cor || "",
        estado: aparelho.estado,
        condicao: aparelho.condicao || undefined,
        acessorios: aparelho.acessorios || "",
        observacoes: aparelho.observacoes || "",
        valor_compra: aparelho.valor_compra || undefined,
        valor_venda: aparelho.valor_venda || undefined,
        loja_id: aparelho.loja_id,
        status: aparelho.status,
      });
      // Carregar fotos do aparelho
      carregarFotos(aparelho.id);
    } else {
      setFormData({
        marca: "",
        modelo: "",
        armazenamento: "",
        memoria_ram: "",
        imei: "",
        numero_serie: "",
        cor: "",
        estado: "novo",
        condicao: undefined,
        acessorios: "",
        observacoes: "",
        valor_compra: undefined,
        valor_venda: undefined,
        loja_id: lojaId,
        status: "disponivel",
      });
      setFotos([]);
    }
  }, [aparelho, lojaId]);

  useEffect(() => {
    if (aparelho) return;

    const imeiLimpo = (formData.imei || "").replace(/\D/g, "");
    if (imeiLimpo.length < 8) {
      setPrefixoIMEIConsultado("");
      return;
    }

    const prefixo = imeiLimpo.slice(0, 8);
    if (prefixo === prefixoIMEIConsultado) return;

    const preencherComBaseEmSimilar = async () => {
      try {
        const similar = await getAparelhoPorPrefixoIMEI(prefixo);
        setPrefixoIMEIConsultado(prefixo);
        if (!similar) return;

        setFormData((prev) => ({
          ...prev,
          marca: prev.marca || similar.marca || "",
          modelo: prev.modelo || similar.modelo || "",
          armazenamento: prev.armazenamento || similar.armazenamento || "",
          memoria_ram: prev.memoria_ram || similar.memoria_ram || "",
          cor: prev.cor || similar.cor || "",
          estado: similar.estado || prev.estado,
          condicao: prev.condicao || similar.condicao || undefined,
          acessorios: prev.acessorios || similar.acessorios || "",
          observacoes: prev.observacoes || similar.observacoes || "",
          valor_compra: prev.valor_compra ?? similar.valor_compra ?? undefined,
          valor_venda: prev.valor_venda ?? similar.valor_venda ?? undefined,
        }));

        showToast(
          "Dados preenchidos automaticamente com base em outro aparelho com o mesmo prefixo de IMEI",
          "info"
        );
      } catch (error) {
        console.error("Erro ao buscar aparelho por prefixo de IMEI:", error);
      }
    };

    preencherComBaseEmSimilar();
  }, [aparelho, formData.imei, prefixoIMEIConsultado, showToast]);

  const carregarFotos = async (aparelhoId: string) => {
    try {
      const fotosCarregadas = await getFotosAparelho(aparelhoId);
      setFotos(fotosCarregadas);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const handleSubmit = async () => {
    if (!usuario) return;

    // Validações
    if (!formData.marca) {
      showToast("Informe a marca do aparelho", "error");
      return;
    }

    if (!formData.modelo) {
      showToast("Informe o modelo do aparelho", "error");
      return;
    }

    if (!formData.imei && !formData.numero_serie) {
      showToast("Informe o IMEI ou Número de Série", "error");
      return;
    }

    setLoading(true);
    try {
      if (aparelho) {
        await atualizarAparelho(aparelho.id, formData, usuario.id);
        showToast("Aparelho atualizado com sucesso", "success");
      } else {
        await criarAparelho(formData, usuario.id);
        showToast("Aparelho cadastrado com sucesso", "success");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Erro ao salvar aparelho:", error);
      showToast(error.message || "Erro ao salvar aparelho", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={!loading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {aparelho ? "Editar Aparelho" : "Novo Aparelho"}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marca */}
            <Input
              label="Marca"
              placeholder="Ex: Samsung, Apple, Xiaomi, Motorola"
              value={formData.marca}
              onValueChange={(value) =>
                setFormData({ ...formData, marca: value })
              }
              variant="bordered"
              maxLength={100}
              isRequired
              isDisabled={loading}
            />

            {/* Modelo */}
            <Input
              label="Modelo"
              placeholder="Ex: Galaxy S23, iPhone 15 Pro, Redmi Note 12"
              value={formData.modelo}
              onValueChange={(value) =>
                setFormData({ ...formData, modelo: value })
              }
              variant="bordered"
              maxLength={200}
              isRequired
              isDisabled={loading}
            />

            {/* Armazenamento */}
            <Input
              label="Armazenamento"
              placeholder="Ex: 128GB, 256GB, 512GB, 1TB"
              value={formData.armazenamento}
              onValueChange={(value) =>
                setFormData({ ...formData, armazenamento: value })
              }
              variant="bordered"
              maxLength={50}
              isDisabled={loading}
            />

            {/* Memória RAM */}
            <Input
              label="Memória RAM"
              placeholder="Ex: 4GB, 6GB, 8GB, 12GB"
              value={formData.memoria_ram}
              onValueChange={(value) =>
                setFormData({ ...formData, memoria_ram: value })
              }
              variant="bordered"
              maxLength={50}
              isDisabled={loading}
            />

            {/* IMEI */}
            <Input
              label="IMEI"
              placeholder="Ex: 123456789012345"
              value={formData.imei}
              onValueChange={(value) =>
                setFormData({ ...formData, imei: value })
              }
              variant="bordered"
              maxLength={50}
              isDisabled={loading}
              endContent={
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setScannerAberto(true)}
                  isDisabled={loading}
                  title="Escanear código de barras"
                >
                  <CameraIcon className="w-5 h-5" />
                </Button>
              }
            />

            {/* Número de Série */}
            <Input
              label="Número de Série"
              placeholder="Ex: SN123456789"
              value={formData.numero_serie}
              onValueChange={(value) =>
                setFormData({ ...formData, numero_serie: value })
              }
              variant="bordered"
              maxLength={100}
              isDisabled={loading}
            />

            {/* Cor */}
            <Input
              label="Cor"
              placeholder="Ex: Preto, Branco, Azul"
              value={formData.cor}
              onValueChange={(value) =>
                setFormData({ ...formData, cor: value })
              }
              variant="bordered"
              maxLength={50}
              isDisabled={loading}
            />

            {/* Estado */}
            <Select
              label="Estado"
              placeholder="Selecione o estado"
              selectedKeys={[formData.estado]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as any;
                setFormData({ ...formData, estado: value });
              }}
              variant="bordered"
              isRequired
              isDisabled={loading}
            >
              {ESTADOS.map((estado) => (
                <SelectItem key={estado.value}>{estado.label}</SelectItem>
              ))}
            </Select>

            {/* Condição */}
            <Select
              label="Condição"
              placeholder="Selecione a condição"
              selectedKeys={formData.condicao ? [formData.condicao] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as any;
                setFormData({ ...formData, condicao: value || undefined });
              }}
              variant="bordered"
              isDisabled={loading}
            >
              {CONDICOES.map((condicao) => (
                <SelectItem key={condicao.value}>{condicao.label}</SelectItem>
              ))}
            </Select>

            {/* Valor de Compra */}
            <Input
              label="Valor de Compra"
              placeholder="0.00"
              type="number"
              step="0.01"
              value={formData.valor_compra?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  valor_compra: value ? parseFloat(value) : undefined,
                })
              }
              variant="bordered"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">R$</span>
                </div>
              }
              isDisabled={loading}
            />

            {/* Valor de Venda */}
            <Input
              label="Valor de Venda"
              placeholder="0.00"
              type="number"
              step="0.01"
              value={formData.valor_venda?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  valor_venda: value ? parseFloat(value) : undefined,
                })
              }
              variant="bordered"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">R$</span>
                </div>
              }
              isDisabled={loading}
            />

            {/* Acessórios */}
            <div className="md:col-span-2">
              <Textarea
                label="Acessórios"
                placeholder="Ex: Carregador original, fone de ouvido, capa"
                value={formData.acessorios}
                onValueChange={(value) =>
                  setFormData({ ...formData, acessorios: value })
                }
                variant="bordered"
                minRows={2}
                maxRows={4}
                isDisabled={loading}
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <Textarea
                label="Observações"
                placeholder="Informações adicionais sobre o aparelho"
                value={formData.observacoes}
                onValueChange={(value) =>
                  setFormData({ ...formData, observacoes: value })
                }
                variant="bordered"
                minRows={3}
                maxRows={5}
                isDisabled={loading}
              />
            </div>

            {/* Fotos - apenas se estiver editando */}
            {aparelho && (
              <div className="md:col-span-2">
                <Divider className="my-4" />
                <FotosAparelhoUpload
                  aparelhoId={aparelho.id}
                  usuarioId={usuario?.id || ""}
                  fotos={fotos}
                  onFotosChange={() => carregarFotos(aparelho.id)}
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => onClose(false)}
            isDisabled={loading}
          >
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            {aparelho ? "Atualizar" : "Cadastrar"}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={scannerAberto}
        onClose={() => setScannerAberto(false)}
        onScan={(code) => {
          setFormData({ ...formData, imei: code });
          showToast("IMEI capturado com sucesso!", "success");
        }}
        title="Escanear IMEI"
      />
    </Modal>
  );
}
