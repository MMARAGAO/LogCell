"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { Usuario } from "@/types";
import {
  cadastrarUsuario,
  atualizarUsuario,
} from "@/app/sistema/usuarios/actions";

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function UsuarioFormModal({
  isOpen,
  onClose,
  usuario,
  onSuccess,
}: UsuarioFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cpf: "",
    ativo: true,
  });

  // Preenche o formulário quando editar
  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: "",
        telefone: usuario.telefone || "",
        cpf: usuario.cpf || "",
        ativo: usuario.ativo,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        cpf: "",
        ativo: true,
      });
    }
    setError(null);
  }, [usuario, isOpen]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatCPF = (value: string) => {
    const cpf = value.replace(/\D/g, "");

    return cpf
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatTelefone = (value: string) => {
    const telefone = value.replace(/\D/g, "");

    if (telefone.length <= 10) {
      return telefone
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return telefone
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.nome || !formData.email) {
      setError("Nome e email são obrigatórios");

      return;
    }

    if (!usuario && !formData.senha) {
      setError("Senha é obrigatória para novo usuário");

      return;
    }

    if (formData.senha && formData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");

      return;
    }

    setLoading(true);

    try {
      let result;

      if (usuario) {
        // Atualizar usuário existente
        result = await atualizarUsuario(usuario.id, {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || undefined,
          cpf: formData.cpf || undefined,
          ativo: formData.ativo,
        });
      } else {
        // Criar novo usuário
        result = await cadastrarUsuario({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone || undefined,
          cpf: formData.cpf || undefined,
        });
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao salvar usuário");
      }
    } catch (err) {
      setError("Erro inesperado ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {usuario ? "Editar Usuário" : "Novo Usuário"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Nome */}
              <Input
                isRequired
                label="Nome Completo"
                placeholder="Digite o nome completo"
                type="text"
                value={formData.nome}
                variant="bordered"
                onChange={(e) => handleChange("nome", e.target.value)}
              />

              {/* Email */}
              <Input
                isRequired
                label="Email"
                placeholder="email@exemplo.com"
                type="email"
                value={formData.email}
                variant="bordered"
                onChange={(e) => handleChange("email", e.target.value)}
              />

              {/* Telefone */}
              <Input
                label="Telefone"
                maxLength={15}
                placeholder="(00) 00000-0000"
                type="text"
                value={formData.telefone}
                variant="bordered"
                onChange={(e) =>
                  handleChange("telefone", formatTelefone(e.target.value))
                }
              />

              {/* CPF */}
              <Input
                label="CPF"
                maxLength={14}
                placeholder="000.000.000-00"
                type="text"
                value={formData.cpf}
                variant="bordered"
                onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
              />

              {/* Senha (apenas para novo usuário) */}
              {!usuario && (
                <>
                  <Input
                    isRequired
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5 text-default-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-default-400" />
                        )}
                      </button>
                    }
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    variant="bordered"
                    onChange={(e) => handleChange("senha", e.target.value)}
                  />
                  <div className="text-sm text-default-500 bg-default-100 p-3 rounded-lg">
                    ℹ️ O usuário será criado como <strong>inativo</strong> e
                    precisará ser ativado por um administrador para acessar o
                    sistema.
                  </div>
                </>
              )}

              {/* Status (apenas para edição) */}
              {usuario && (
                <Switch
                  isSelected={formData.ativo}
                  onValueChange={(value) => handleChange("ativo", value)}
                >
                  Usuário Ativo
                </Switch>
              )}

              {/* Mensagem de Erro */}
              {error && (
                <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" isLoading={loading} type="submit">
              {usuario ? "Salvar" : "Criar"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
