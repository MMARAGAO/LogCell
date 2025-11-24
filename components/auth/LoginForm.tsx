"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useAuthContext } from "@/contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        onKeyDown={handleKeyDown}
      >
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

        <Input
          type={showPassword ? "text" : "password"}
          label="Senha"
          placeholder="Digite sua senha"
          value={formData.senha}
          onChange={(e) => handleChange("senha", e.target.value)}
          isRequired
          autoComplete="current-password"
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

        {(formError || error) && (
          <div className="text-danger text-sm">{formError || error}</div>
        )}

        <Button
          type="submit"
          color="primary"
          isLoading={loading}
          className="w-full"
        >
          Entrar
        </Button>

        {onSwitchToCadastro && (
          <div className="text-center text-sm">
            <span className="text-default-500">Não tem uma conta? </span>
            <button
              type="button"
              onClick={onSwitchToCadastro}
              className="text-primary hover:underline"
            >
              Cadastre-se
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
