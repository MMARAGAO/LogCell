"use client";

import React, { useState } from "react";
import { ListaCatalogo } from "@/components/catalogo";
import { Toast } from "@/components/Toast";
import { Button } from "@heroui/react";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCarrinho } from "@/contexts/CarrinhoContext";

export default function CatalogoCatalogo() {
  const router = useRouter();
  const { carrinho } = useCarrinho();
  const [toastAtivo, setToastAtivo] = useState(false);
  const [mensagemToast, setMensagemToast] = useState("");

  const handleItemAdicionado = (nomeItem: string) => {
    setMensagemToast(`"${nomeItem}" adicionado ao carrinho!`);
    setToastAtivo(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header com Carrinho Flutuante */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Catálogo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Navegue por nossos produtos e aparelhos disponíveis
            </p>
          </div>

          {/* Botão Carrinho Flutuante */}
          {carrinho.itens.length > 0 && (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white relative"
              startContent={<FaShoppingCart />}
              onClick={() => router.push("/catalogo/carrinho")}
            >
              Ver Carrinho ({carrinho.itens.length})
              <div className="ml-2 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(carrinho.total)}
              </div>
            </Button>
          )}
        </div>

        {/* Lista de Itens */}
        <ListaCatalogo onItemAdicionado={handleItemAdicionado} />
      </div>

      {/* Toast de Notificação */}
      {toastAtivo && (
        <Toast
          message={mensagemToast}
          type="success"
          onClose={() => setToastAtivo(false)}
        />
      )}
    </div>
  );
}
