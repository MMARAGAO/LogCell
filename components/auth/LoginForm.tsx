"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { useAuthContext } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSwitchToCadastro?: () => void;
}

export function LoginForm({ onSwitchToCadastro }: LoginFormProps) {
  const { login, loading, error } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validações
    if (!formData.email || !formData.senha) {
      setFormError("Preencha todos os campos");

      return;
    }

    const result = await login(formData);

    if (!result.success) {
      setFormError(result.error || "Erro ao fazer login");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

        <Input
          isRequired
          autoComplete="current-password"
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
          placeholder="Digite sua senha"
          type={showPassword ? "text" : "password"}
          value={formData.senha}
          variant="bordered"
          onChange={(e) => handleChange("senha", e.target.value)}
        />

        {(formError || error) && (
          <div className="text-danger text-sm">{formError || error}</div>
        )}

        <Button
          className="w-full"
          color="primary"
          isLoading={loading}
          type="submit"
        >
          Entrar
        </Button>

        {onSwitchToCadastro && (
          <div className="text-center text-sm">
            <span className="text-default-500">Não tem uma conta? </span>
            <button
              className="text-primary hover:underline"
              type="button"
              onClick={onSwitchToCadastro}
            >
              Cadastre-se
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
