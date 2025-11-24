"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Usuario } from "@/types";
import { atualizarMeuPerfil } from "@/app/sistema/perfil/actions";

interface EditarPerfilFormProps {
  usuario: Usuario;
  onSuccess: () => void;
}

export function EditarPerfilForm({
  usuario,
  onSuccess,
}: EditarPerfilFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: usuario.nome,
    telefone: usuario.telefone || "",
    cpf: usuario.cpf || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
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
    setSuccess(false);

    if (!formData.nome) {
      setError("Nome é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const result = await atualizarMeuPerfil(usuario.id, {
        nome: formData.nome,
        telefone: formData.telefone || undefined,
        cpf: formData.cpf || undefined,
      });

      if (result.success) {
        setSuccess(true);
        onSuccess();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Erro ao atualizar perfil");
      }
    } catch (err) {
      setError("Erro inesperado ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Informações Pessoais</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            isRequired
            variant="bordered"
          />

          <Input
            type="email"
            label="Email"
            value={usuario.email}
            isReadOnly
            variant="bordered"
            description="O email não pode ser alterado"
          />

          <Input
            type="text"
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) =>
              handleChange("telefone", formatTelefone(e.target.value))
            }
            maxLength={15}
            variant="bordered"
          />

          <Input
            type="text"
            label="CPF"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
            maxLength={14}
            variant="bordered"
          />

          {error && (
            <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-success text-sm bg-success/10 p-3 rounded-lg">
              ✓ Perfil atualizado com sucesso!
            </div>
          )}

          <Button type="submit" color="primary" isLoading={loading} fullWidth>
            Salvar Alterações
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
