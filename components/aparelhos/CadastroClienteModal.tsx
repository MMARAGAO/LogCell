"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { Cliente } from "@/types/clientesTecnicos";
import { criarCliente } from "@/services/clienteService";

interface CadastroClienteModalProps {
  isOpen: boolean;
  onClose: (cliente?: Cliente) => void;
}

export function CadastroClienteModal({
  isOpen,
  onClose,
}: CadastroClienteModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuthContext();
  const [formData, setFormData] = useState({
    nome: "",
    doc: "",
    telefone: "",
    email: "",
  });

  async function handleSubmit() {
    if (!formData.nome) {
      showToast("Nome é obrigatório", "warning");

      return;
    }

    try {
      setLoading(true);
      const { data, error } = await criarCliente(
        {
          nome: formData.nome,
          doc: formData.doc || undefined,
          telefone: formData.telefone || undefined,
          email: formData.email || undefined,
        },
        usuario?.id || "",
      );

      if (error || !data) {
        throw new Error(error || "Não foi possível criar o cliente");
      }

      showToast("Cliente criado com sucesso", "success");
      setFormData({ nome: "", doc: "", telefone: "", email: "" });
      onClose(data);
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      showToast(error.message || "Erro ao criar cliente", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
      <ModalContent>
        <ModalHeader>Cadastro Rápido de Cliente</ModalHeader>
        <Divider />
        <ModalBody className="gap-4">
          <Input
            label="Nome *"
            placeholder="Nome do cliente"
            value={formData.nome}
            onValueChange={(value) => setFormData({ ...formData, nome: value })}
          />
          <Input
            label="CPF/CNPJ"
            placeholder="000.000.000-00"
            value={formData.doc}
            onValueChange={(value) => setFormData({ ...formData, doc: value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onValueChange={(value) =>
              setFormData({ ...formData, telefone: value })
            }
          />
          <Input
            label="Email"
            placeholder="email@exemplo.com"
            type="email"
            value={formData.email}
            onValueChange={(value) =>
              setFormData({ ...formData, email: value })
            }
          />
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button color="default" onPress={() => onClose()}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            Criar Cliente
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
