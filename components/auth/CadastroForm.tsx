"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { cadastrarUsuario } from "@/app/sistema/usuarios/actions";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface CadastroFormProps {
  onSwitchToLogin?: () => void;
}

export function CadastroForm({ onSwitchToLogin }: CadastroFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cpf: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.nome || !formData.email || !formData.senha) {
      setError("Nome, email e senha são obrigatórios");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido");
      return;
    }

    // Validação de CPF (se fornecido)
    if (formData.cpf) {
      const cpfLimpo = formData.cpf.replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        setError("CPF inválido");
        return;
      }
    }

    setLoading(true);

    try {
      const result = await cadastrarUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone || undefined,
        cpf: formData.cpf || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
          telefone: "",
          cpf: "",
        });

        // Aguarda 2 segundos e redireciona para login
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            router.push("/auth");
          }
        }, 2000);
      } else {
        setError(result.error || "Erro ao criar conta");
      }
    } catch (err) {
      setError("Erro inesperado ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (success) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-success/20 p-3">
            <svg
              className="w-12 h-12 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Conta criada!</h2>
            <p className="text-default-500">
              Sua conta foi criada com sucesso. Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        onKeyDown={handleKeyDown}
      >
        <Input
          type="text"
          label="Nome completo"
          placeholder="Seu nome"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          isRequired
          variant="bordered"
        />

        <Input
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          isRequired
          autoComplete="email"
          variant="bordered"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type={showPassword ? "text" : "password"}
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={formData.senha}
            onChange={(e) => handleChange("senha", e.target.value)}
            isRequired
            autoComplete="new-password"
            variant="bordered"
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
          />

          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="Confirmar senha"
            placeholder="Digite novamente"
            value={formData.confirmarSenha}
            onChange={(e) => handleChange("confirmarSenha", e.target.value)}
            isRequired
            autoComplete="new-password"
            variant="bordered"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-default-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-default-400" />
                )}
              </button>
            }
          />
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <Button
          type="submit"
          color="primary"
          isLoading={loading}
          className="w-full"
        >
          Criar conta
        </Button>

        {onSwitchToLogin && (
          <div className="text-center text-sm">
            <span className="text-default-500">Já tem uma conta? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline"
            >
              Entrar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
