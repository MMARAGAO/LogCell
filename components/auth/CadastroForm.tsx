"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { cadastrarUsuario } from "@/app/sistema/usuarios/actions";

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
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          isRequired
          label="Nome completo"
          placeholder="Seu nome"
          type="text"
          value={formData.nome}
          variant="bordered"
          onChange={(e) => handleChange("nome", e.target.value)}
        />

        <Input
          isRequired
          autoComplete="email"
          label="Email"
          placeholder="seu@email.com"
          type="email"
          value={formData.email}
          variant="bordered"
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Input
            label="CPF"
            maxLength={14}
            placeholder="000.000.000-00"
            type="text"
            value={formData.cpf}
            variant="bordered"
            onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            isRequired
            autoComplete="new-password"
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

          <Input
            isRequired
            autoComplete="new-password"
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
            label="Confirmar senha"
            placeholder="Digite novamente"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmarSenha}
            variant="bordered"
            onChange={(e) => handleChange("confirmarSenha", e.target.value)}
          />
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <Button
          className="w-full"
          color="primary"
          isLoading={loading}
          type="submit"
        >
          Criar conta
        </Button>

        {onSwitchToLogin && (
          <div className="text-center text-sm">
            <span className="text-default-500">Já tem uma conta? </span>
            <button
              className="text-primary hover:underline"
              type="button"
              onClick={onSwitchToLogin}
            >
              Entrar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
