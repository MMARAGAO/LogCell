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
import { Switch } from "@heroui/switch";
import { useState, useEffect } from "react";
import { Produto } from "@/types";
import { useToast } from "@/components/Toast";

interface ProdutoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (produto: Partial<Produto>) => Promise<void>;
  produto?: Produto | null;
}

export default function ProdutoFormModal({
  isOpen,
  onClose,
  onSubmit,
  produto,
}: ProdutoFormModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Produto>>({
    descricao: "",
    grupo: "",
    categoria: "",
    codigo_fabricante: "",
    modelos: "",
    marca: "",
    preco_compra: undefined,
    preco_venda: undefined,
    quantidade_minima: 0,
    ativo: true,
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        descricao: produto.descricao || "",
        grupo: produto.grupo || "",
        categoria: produto.categoria || "",
        codigo_fabricante: produto.codigo_fabricante || "",
        modelos: produto.modelos || "",
        marca: produto.marca || "",
        preco_compra: produto.preco_compra,
        preco_venda: produto.preco_venda,
        quantidade_minima: produto.quantidade_minima,
        ativo: produto.ativo,
      });
    } else {
      setFormData({
        descricao: "",
        grupo: "",
        categoria: "",
        codigo_fabricante: "",
        modelos: "",
        marca: "",
        preco_compra: undefined,
        preco_venda: undefined,
        quantidade_minima: 0,
        ativo: true,
      });
    }
  }, [produto, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.descricao &&
    formData.quantidade_minima !== undefined &&
    formData.quantidade_minima >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!loading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {produto ? "Editar Produto" : "Novo Produto"}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrição */}
            <div className="md:col-span-2">
              <Input
                label="Descrição do Produto"
                placeholder="Ex: Notebook Dell Inspiron 15"
                value={formData.descricao}
                onValueChange={(value) =>
                  setFormData({ ...formData, descricao: value })
                }
                variant="bordered"
                isRequired
              />
            </div>

            {/* Grupo */}
            <Input
              label="Grupo"
              placeholder="Ex: Informática, Periféricos"
              value={formData.grupo}
              onValueChange={(value) =>
                setFormData({ ...formData, grupo: value })
              }
              variant="bordered"
            />

            {/* Categoria */}
            <Input
              label="Categoria"
              placeholder="Ex: Notebooks, Monitores"
              value={formData.categoria}
              onValueChange={(value) =>
                setFormData({ ...formData, categoria: value })
              }
              variant="bordered"
            />

            {/* Código do Fabricante */}
            <Input
              label="Código do Fabricante"
              placeholder="Ex: ABC123XYZ"
              value={formData.codigo_fabricante}
              onValueChange={(value) =>
                setFormData({ ...formData, codigo_fabricante: value })
              }
              variant="bordered"
            />

            {/* Marca */}
            <Input
              label="Marca"
              placeholder="Ex: Dell, HP, Lenovo"
              value={formData.marca}
              onValueChange={(value) =>
                setFormData({ ...formData, marca: value })
              }
              variant="bordered"
            />

            {/* Modelos */}
            <div className="md:col-span-2">
              <Input
                label="Modelos"
                placeholder="Ex: i5-10ª geração, 8GB RAM, SSD 256GB"
                value={formData.modelos}
                onValueChange={(value) =>
                  setFormData({ ...formData, modelos: value })
                }
                variant="bordered"
              />
            </div>

            {/* Preço de Compra */}
            <Input
              label="Preço de Compra (R$)"
              type="number"
              step="0.01"
              value={formData.preco_compra?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  preco_compra: value ? parseFloat(value) : undefined,
                })
              }
              variant="bordered"
              startContent={<span className="text-default-400">R$</span>}
            />

            {/* Preço de Venda */}
            <Input
              label="Preço de Venda (R$)"
              type="number"
              step="0.01"
              value={formData.preco_venda?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  preco_venda: value ? parseFloat(value) : undefined,
                })
              }
              variant="bordered"
              startContent={<span className="text-default-400">R$</span>}
            />

            {/* Quantidade Mínima */}
            <Input
              label="Quantidade Mínima"
              type="number"
              value={formData.quantidade_minima?.toString() || "0"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  quantidade_minima: parseInt(value) || 0,
                })
              }
              variant="bordered"
              isRequired
            />

            {/* Status Ativo */}
            <div className="flex items-center">
              <Switch
                isSelected={formData.ativo}
                onValueChange={(value) =>
                  setFormData({ ...formData, ativo: value })
                }
              >
                Produto Ativo
              </Switch>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!isFormValid}
          >
            {produto ? "Salvar Alterações" : "Criar Produto"}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Toast Component */}
      {toast.ToastComponent}
    </Modal>
  );
}
