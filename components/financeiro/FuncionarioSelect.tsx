"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/authService";
import type { Usuario } from "@/types";

interface FuncionarioSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  isDisabled?: boolean;
}

export function FuncionarioSelect({
  label = "Funcionário",
  placeholder = "Selecione um funcionário",
  value,
  onChange,
  required = false,
  isDisabled = false,
}: FuncionarioSelectProps) {
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      setIsLoading(true);
      const data = await AuthService.getUsuariosAtivos();

      setFuncionarios(data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Autocomplete
      allowsCustomValue={false}
      defaultItems={funcionarios}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isRequired={required}
      label={label}
      placeholder={placeholder}
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as string)}
    >
      {(funcionario) => (
        <AutocompleteItem key={funcionario.id} textValue={funcionario.nome}>
          {funcionario.nome}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
