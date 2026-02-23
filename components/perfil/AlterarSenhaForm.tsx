"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabaseClient";

export function AlterarSenhaForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.novaSenha || !formData.confirmarSenha) {
      setError("Preencha todos os campos");

      return;
    }

    if (formData.novaSenha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");

      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");

      return;
    }

    setLoading(true);

    try {
      // Alterar senha diretamente pelo cliente Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.novaSenha,
      });

      if (error) {
        console.error("Erro ao alterar senha:", error);
        setError(error.message || "Erro ao alterar senha");
      } else {
        setSuccess(true);
        setFormData({ novaSenha: "", confirmarSenha: "" });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Alterar Senha</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            label="Nova Senha"
            placeholder="Mínimo 6 caracteres"
            type={showPassword ? "text" : "password"}
            value={formData.novaSenha}
            variant="bordered"
            onChange={(e) => handleChange("novaSenha", e.target.value)}
          />

          <Input
            isRequired
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
            label="Confirmar Nova Senha"
            placeholder="Digite a senha novamente"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmarSenha}
            variant="bordered"
            onChange={(e) => handleChange("confirmarSenha", e.target.value)}
          />

          {error && (
            <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-success text-sm bg-success/10 p-3 rounded-lg">
              ✓ Senha alterada com sucesso!
            </div>
          )}

          <Button fullWidth color="primary" isLoading={loading} type="submit">
            Alterar Senha
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
