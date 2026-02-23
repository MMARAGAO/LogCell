"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { buscarFornecedores } from "@/services/fornecedorService";
import type { Fornecedor } from "@/types/fornecedor";

interface FornecedorSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  isDisabled?: boolean;
}

export function FornecedorSelect({
  label = "Fornecedor",
  placeholder = "Selecione um fornecedor",
  value,
  onChange,
  required = false,
  isDisabled = false,
}: FornecedorSelectProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      setIsLoading(true);
      const { data } = await buscarFornecedores(true); // apenas ativos

      setFornecedores(data || []);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Autocomplete
      allowsCustomValue={false}
      defaultItems={fornecedores}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isRequired={required}
      label={label}
      placeholder={placeholder}
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as string)}
    >
      {(fornecedor) => (
        <AutocompleteItem key={fornecedor.id} textValue={fornecedor.nome}>
          {fornecedor.nome}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
