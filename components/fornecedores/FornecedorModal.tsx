"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";

import { Fornecedor, FornecedorFormData } from "@/types/fornecedor";
import {
  criarFornecedor,
  atualizarFornecedor,
} from "@/services/fornecedorService";
import { useToast } from "@/components/Toast";

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedor?: Fornecedor | null;
  onSave: () => void;
}

export default function FornecedorModal({
  isOpen,
  onClose,
  fornecedor,
  onSave,
}: FornecedorModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FornecedorFormData>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    contato_nome: "",
    contato_telefone: "",
    observacoes: "",
    ativo: true,
  });

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj || "",
        telefone: fornecedor.telefone || "",
        email: fornecedor.email || "",
        endereco: fornecedor.endereco || "",
        cidade: fornecedor.cidade || "",
        estado: fornecedor.estado || "",
        cep: fornecedor.cep || "",
        contato_nome: fornecedor.contato_nome || "",
        contato_telefone: fornecedor.contato_telefone || "",
        observacoes: fornecedor.observacoes || "",
        ativo: fornecedor.ativo,
      });
    } else {
      resetForm();
    }
  }, [fornecedor, isOpen]);

  const resetForm = () => {
    setFormData({
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      contato_nome: "",
      contato_telefone: "",
      observacoes: "",
      ativo: true,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Funções de formatação
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2");
      }

      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }

    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 8) {
      return numbers.replace(/^(\d{5})(\d)/, "$1-$2");
    }

    return value;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);

    setFormData((prev) => ({ ...prev, cnpj: formatted }));
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatTelefone(value);

    setFormData((prev) => ({ ...prev, telefone: formatted }));
  };

  const handleContatoTelefoneChange = (value: string) => {
    const formatted = formatTelefone(value);

    setFormData((prev) => ({ ...prev, contato_telefone: formatted }));
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);

    setFormData((prev) => ({ ...prev, cep: formatted }));
  };

  const handleEstadoChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z]/g, "");

    setFormData((prev) => ({ ...prev, estado: upperValue }));
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      showToast("Nome do fornecedor é obrigatório", "error");

      return;
    }

    setLoading(true);

    const { error } = fornecedor
      ? await atualizarFornecedor(fornecedor.id, formData)
      : await criarFornecedor(formData);

    if (error) {
      showToast(
        `Erro ao ${fornecedor ? "atualizar" : "criar"} fornecedor`,
        "error",
      );
    } else {
      showToast(
        `Fornecedor ${fornecedor ? "atualizado" : "criado"} com sucesso`,
        "success",
      );
      onSave();
      onClose();
      resetForm();
    }

    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-default-600">
                Informações Básicas
              </h3>

              <Input
                isRequired
                label="Nome *"
                name="nome"
                placeholder="Nome do fornecedor"
                value={formData.nome}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="CNPJ"
                  maxLength={18}
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                />

                <Input
                  label="Email"
                  name="email"
                  placeholder="contato@fornecedor.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Telefone"
                maxLength={15}
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
              />
            </div>

            {/* Endereço */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-default-600">
                Endereço
              </h3>

              <Input
                label="Endereço"
                name="endereco"
                placeholder="Rua, número, complemento"
                value={formData.endereco}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Cidade"
                  name="cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />

                <Input
                  label="Estado"
                  maxLength={2}
                  name="estado"
                  placeholder="UF"
                  value={formData.estado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                />

                <Input
                  label="CEP"
                  maxLength={9}
                  name="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleCEPChange(e.target.value)}
                />
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-default-600">
                Contato Principal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Nome do Contato"
                  name="contato_nome"
                  placeholder="Nome do responsável"
                  value={formData.contato_nome}
                  onChange={handleChange}
                />

                <Input
                  label="Telefone do Contato"
                  maxLength={15}
                  name="contato_telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.contato_telefone}
                  onChange={(e) => handleContatoTelefoneChange(e.target.value)}
                />
              </div>
            </div>

            {/* Observações */}
            <Textarea
              label="Observações"
              minRows={3}
              name="observacoes"
              placeholder="Informações adicionais sobre o fornecedor"
              value={formData.observacoes}
              onChange={handleChange}
            />

            {/* Status */}
            <div className="flex items-center gap-2">
              <Switch
                isSelected={formData.ativo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, ativo: value }))
                }
              >
                Fornecedor Ativo
              </Switch>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!formData.nome.trim()}
            isLoading={loading}
            onPress={handleSubmit}
          >
            {fornecedor ? "Atualizar" : "Criar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
