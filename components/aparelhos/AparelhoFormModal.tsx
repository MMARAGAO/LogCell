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
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";

import { FotosAparelhoUpload } from "./FotosAparelhoUpload";

import { useToast } from "@/components/Toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Aparelho, AparelhoFormData, FotoAparelho } from "@/types/aparelhos";
import {
  criarAparelho,
  atualizarAparelho,
  getAparelhoPorPrefixoIMEI,
} from "@/services/aparelhosService";
import { getFotosAparelho } from "@/services/fotosAparelhosService";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface AparelhoFormModalProps {
  aparelho?: Aparelho;
  lojaId: number;
  lojaNome?: string;
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
  lojaNome,
  onClose,
}: AparelhoFormModalProps) {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fotos, setFotos] = useState<FotoAparelho[]>([]);
  const [scannerAberto, setScannerAberto] = useState(false);
  const [prefixoIMEIConsultado, setPrefixoIMEIConsultado] = useState("");
  const [aparelhoRecemCriado, setAparelhoRecemCriado] =
    useState<Aparelho | null>(null);
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
    saude_bateria: undefined,
    exibir_catalogo: false,
    destaque: false,
    promocao: false,
    novidade: false,
    ordem_catalogo: 0,
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
        saude_bateria: aparelho.saude_bateria || undefined,
        exibir_catalogo: aparelho.exibir_catalogo || false,
        destaque: aparelho.destaque || false,
        promocao: aparelho.promocao || false,
        novidade: aparelho.novidade || false,
        ordem_catalogo: aparelho.ordem_catalogo || 0,
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
        saude_bateria: undefined,
        exibir_catalogo: false,
        destaque: false,
        promocao: false,
        novidade: false,
        ordem_catalogo: 0,
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

        // Preenche apenas campos que são identificáveis pelo TAC (8 primeiros dígitos do IMEI)
        // Marca e Modelo são determinados pelo TAC e podem ser preenchidos com segurança
        setFormData((prev) => ({
          ...prev,
          marca: prev.marca || similar.marca || "",
          modelo: prev.modelo || similar.modelo || "",
          // Outros campos (armazenamento, cor, valores, etc) variam mesmo com TAC igual
          // e devem ser preenchidos manualmente para evitar erros
        }));

        showToast(
          `Marca e Modelo identificados pelo IMEI: ${similar.marca} ${similar.modelo}`,
          "info",
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

    if (
      !formData.saude_bateria ||
      formData.saude_bateria < 0 ||
      formData.saude_bateria > 100
    ) {
      showToast("Informe a saúde da bateria (0-100%)", "error");

      return;
    }

    setLoading(true);
    try {
      if (aparelho) {
        await atualizarAparelho(aparelho.id, formData, usuario.id);
        showToast("Aparelho atualizado com sucesso", "success");
        onClose(true);
      } else {
        const novoAparelho = await criarAparelho(formData, usuario.id);

        setAparelhoRecemCriado(novoAparelho);
        showToast(
          "Aparelho cadastrado! Agora você pode adicionar fotos.",
          "success",
        );
      }
    } catch (error: any) {
      console.error("Erro ao salvar aparelho:", error);
      showToast(error.message || "Erro ao salvar aparelho", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isDismissable={!loading}
      isOpen={true}
      scrollBehavior="inside"
      size="3xl"
      onClose={() => onClose(false)}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {aparelho ? "Editar Aparelho" : "Novo Aparelho"}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isDisabled
              isReadOnly
              className="md:col-span-2"
              label="Loja"
              value={lojaNome || `Loja ${lojaId}`}
              variant="bordered"
            />
            {/* Marca */}
            <Input
              isRequired
              isDisabled={loading}
              label="Marca"
              maxLength={100}
              placeholder="Ex: Samsung, Apple, Xiaomi, Motorola"
              value={formData.marca}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, marca: value })
              }
            />

            {/* Modelo */}
            <Input
              isRequired
              isDisabled={loading}
              label="Modelo"
              maxLength={200}
              placeholder="Ex: Galaxy S23, iPhone 15 Pro, Redmi Note 12"
              value={formData.modelo}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, modelo: value })
              }
            />

            {/* Armazenamento */}
            <Input
              isDisabled={loading}
              label="Armazenamento"
              maxLength={50}
              placeholder="Ex: 128GB, 256GB, 512GB, 1TB"
              value={formData.armazenamento}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, armazenamento: value })
              }
            />

            {/* Memória RAM */}
            <Input
              isDisabled={loading}
              label="Memória RAM"
              maxLength={50}
              placeholder="Ex: 4GB, 6GB, 8GB, 12GB"
              value={formData.memoria_ram}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, memoria_ram: value })
              }
            />

            {/* IMEI */}
            <Input
              endContent={
                <Button
                  isIconOnly
                  isDisabled={loading}
                  size="sm"
                  title="Escanear código de barras"
                  variant="light"
                  onPress={() => setScannerAberto(true)}
                >
                  <CameraIcon className="w-5 h-5" />
                </Button>
              }
              isDisabled={loading}
              label="IMEI"
              maxLength={50}
              placeholder="Ex: 123456789012345"
              value={formData.imei}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, imei: value })
              }
            />

            {/* Número de Série */}
            <Input
              isDisabled={loading}
              label="Número de Série"
              maxLength={100}
              placeholder="Ex: SN123456789"
              value={formData.numero_serie}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, numero_serie: value })
              }
            />

            {/* Cor */}
            <Input
              isDisabled={loading}
              label="Cor"
              maxLength={50}
              placeholder="Ex: Preto, Branco, Azul"
              value={formData.cor}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({ ...formData, cor: value })
              }
            />

            {/* Estado */}
            <Select
              isRequired
              isDisabled={loading}
              label="Estado"
              placeholder="Selecione o estado"
              selectedKeys={[formData.estado]}
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as any;

                setFormData({ ...formData, estado: value });
              }}
            >
              {ESTADOS.map((estado) => (
                <SelectItem key={estado.value}>{estado.label}</SelectItem>
              ))}
            </Select>

            {/* Condição */}
            <Select
              isDisabled={loading}
              label="Condição"
              placeholder="Selecione a condição"
              selectedKeys={formData.condicao ? [formData.condicao] : []}
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as any;

                setFormData({ ...formData, condicao: value || undefined });
              }}
            >
              {CONDICOES.map((condicao) => (
                <SelectItem key={condicao.value}>{condicao.label}</SelectItem>
              ))}
            </Select>

            {/* Valor de Compra */}
            <Input
              isDisabled={loading}
              label="Valor de Compra"
              placeholder="0.00"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">R$</span>
                </div>
              }
              step="0.01"
              type="number"
              value={formData.valor_compra?.toString() || ""}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  valor_compra: value ? parseFloat(value) : undefined,
                })
              }
            />

            {/* Valor de Venda */}
            <Input
              isDisabled={loading}
              label="Valor de Venda"
              placeholder="0.00"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">R$</span>
                </div>
              }
              step="0.01"
              type="number"
              value={formData.valor_venda?.toString() || ""}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  valor_venda: value ? parseFloat(value) : undefined,
                })
              }
            />

            {/* Saúde da Bateria */}
            <Input
              isRequired
              description="Informe a saúde da bateria de 0 a 100%"
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">%</span>
                </div>
              }
              isDisabled={loading}
              label="Saúde da Bateria"
              max="100"
              min="0"
              placeholder="Ex: 100, 95, 85"
              type="number"
              value={formData.saude_bateria?.toString() || ""}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  saude_bateria: value ? parseInt(value) : undefined,
                })
              }
            />

            {/* Ordem no Catálogo */}
            <Input
              description="Ordem de exibição no catálogo (menor número aparece primeiro)"
              isDisabled={loading}
              label="Ordem no Catálogo"
              min="0"
              placeholder="0"
              type="number"
              value={formData.ordem_catalogo?.toString() || "0"}
              variant="bordered"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  ordem_catalogo: value ? parseInt(value) : 0,
                })
              }
            />

            {/* Acessórios */}
            <div className="md:col-span-2">
              <Textarea
                isDisabled={loading}
                label="Acessórios"
                maxRows={4}
                minRows={2}
                placeholder="Ex: Carregador original, fone de ouvido, capa"
                value={formData.acessorios}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, acessorios: value })
                }
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <Textarea
                isDisabled={loading}
                label="Observações"
                maxRows={5}
                minRows={3}
                placeholder="Informações adicionais sobre o aparelho"
                value={formData.observacoes}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, observacoes: value })
                }
              />
            </div>

            {/* Configurações de Catálogo */}
            <div className="md:col-span-2">
              <Divider className="my-2" />
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Chip color="primary" size="sm" variant="flat">
                  Catálogo
                </Chip>
                Configurações de Exibição no Catálogo
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox
                  isDisabled={loading}
                  isSelected={formData.exibir_catalogo}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, exibir_catalogo: checked })
                  }
                >
                  Exibir no Catálogo
                </Checkbox>
                <Checkbox
                  color="warning"
                  isDisabled={loading}
                  isSelected={formData.destaque}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, destaque: checked })
                  }
                >
                  Produto em Destaque
                </Checkbox>
                <Checkbox
                  color="danger"
                  isDisabled={loading}
                  isSelected={formData.promocao}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, promocao: checked })
                  }
                >
                  Em Promoção
                </Checkbox>
                <Checkbox
                  color="success"
                  isDisabled={loading}
                  isSelected={formData.novidade}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, novidade: checked })
                  }
                >
                  Novidade
                </Checkbox>
              </div>
            </div>

            {/* Fotos - mostrar se estiver editando ou acabou de criar */}
            {(aparelho || aparelhoRecemCriado) && (
              <div className="md:col-span-2">
                <Divider className="my-4" />
                <FotosAparelhoUpload
                  aparelhoId={(aparelho || aparelhoRecemCriado)!.id}
                  fotos={fotos}
                  usuarioId={usuario?.id || ""}
                  onFotosChange={() =>
                    carregarFotos((aparelho || aparelhoRecemCriado)!.id)
                  }
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            isDisabled={loading}
            variant="light"
            onPress={() => onClose(aparelhoRecemCriado ? true : false)}
          >
            {aparelhoRecemCriado ? "Concluir" : "Cancelar"}
          </Button>
          {!aparelhoRecemCriado && (
            <Button color="primary" isLoading={loading} onPress={handleSubmit}>
              {aparelho ? "Atualizar" : "Cadastrar"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={scannerAberto}
        title="Escanear IMEI"
        onClose={() => setScannerAberto(false)}
        onScan={(code) => {
          setFormData({ ...formData, imei: code });
          showToast("IMEI capturado com sucesso!", "success");
        }}
      />
    </Modal>
  );
}
