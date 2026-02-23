import React, { useState } from "react";
import { Button } from "@heroui/button";

import { TextoGarantiaView } from "./TextoGarantiaView";

import { useTextosGarantia } from "@/hooks/useTextosGarantia";
import { TextoGarantia, TIPOS_SERVICO_GARANTIA } from "@/types/garantia";

export const GerenciarTextosGarantia: React.FC = () => {
  const { textosGarantia, loading, error, refetch } = useTextosGarantia();
  const [textoSelecionado, setTextoSelecionado] =
    useState<TextoGarantia | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">
          Erro ao carregar textos de garantia: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Textos de Garantia</h2>
        <Button color="primary" onPress={refetch}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Textos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tipos de Garantia</h3>

          {textosGarantia.map((texto) => (
            <button
              key={texto.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all text-left w-full
                ${
                  textoSelecionado?.id === texto.id
                    ? "border-primary bg-primary-50"
                    : "border-gray-200 hover:border-primary-300"
                }
              `}
              type="button"
              onClick={() => setTextoSelecionado(texto)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">
                    {TIPOS_SERVICO_GARANTIA[texto.tipo_servico]}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {texto.dias_garantia > 0
                      ? `${texto.dias_garantia} dias de garantia`
                      : "Sem dias de garantia"}
                  </p>
                </div>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    texto.ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                `}
                >
                  {texto.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">
                {texto.titulo}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {texto.clausulas.length} cláusula
                {texto.clausulas.length !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>

        {/* Preview do Texto Selecionado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>

          {textoSelecionado ? (
            <div className="border border-gray-200 rounded-lg p-6">
              <TextoGarantiaView textoGarantia={textoSelecionado} />

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Criado em:{" "}
                  {new Date(textoSelecionado.criado_em).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-gray-500">
                  Atualizado em:{" "}
                  {new Date(textoSelecionado.atualizado_em).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-500">
                Selecione um tipo de garantia para visualizar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
