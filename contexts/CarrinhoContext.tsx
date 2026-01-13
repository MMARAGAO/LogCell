"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ItemCarrinho, Carrinho } from "@/types/catalogo";

interface CarrinhoContextType {
  carrinho: Carrinho;
  adicionarItem: (item: Omit<ItemCarrinho, "id" | "subtotal">) => void;
  removerItem: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  limparCarrinho: () => void;
  aplicarDesconto: (desconto: number) => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(
  undefined
);

const CHAVE_LOCALSTORAGE = "logcell_carrinho";

// Função para gerar UUID simples
function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<Carrinho>({
    itens: [],
    subtotal: 0,
    desconto: 0,
    total: 0,
    total_itens: 0,
  });

  const [montado, setMontado] = useState(false);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    const carregado = localStorage.getItem(CHAVE_LOCALSTORAGE);
    if (carregado) {
      try {
        const dados = JSON.parse(carregado);
        setCarrinho(dados);
      } catch (erro) {
        console.error("Erro ao carregar carrinho do localStorage:", erro);
      }
    }
    setMontado(true);
  }, []);

  // Salvar no localStorage sempre que carrinho mudar
  useEffect(() => {
    if (montado) {
      localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(carrinho));
    }
  }, [carrinho, montado]);

  // Calcular totais
  const calcularTotais = (
    itens: ItemCarrinho[],
    desconto: number
  ): Pick<Carrinho, "subtotal" | "total" | "total_itens"> => {
    const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
    const total_itens = itens.reduce((acc, item) => acc + item.quantidade, 0);
    const total = Math.max(0, subtotal - desconto);

    return { subtotal, total, total_itens };
  };

  const adicionarItem = (item: Omit<ItemCarrinho, "id" | "subtotal">) => {
    setCarrinho((prev) => {
      // Verificar se o produto já existe no carrinho
      const itemExistente = prev.itens.find(
        (i) => i.produto_id === item.produto_id
      );

      let novoItens: ItemCarrinho[];

      if (itemExistente) {
        // Se existe, aumentar a quantidade
        novoItens = prev.itens.map((i) =>
          i.produto_id === item.produto_id
            ? {
                ...i,
                quantidade: i.quantidade + item.quantidade,
                subtotal: (i.quantidade + item.quantidade) * i.preco_unitario,
              }
            : i
        );
      } else {
        // Se não existe, adicionar novo item
        novoItens = [
          ...prev.itens,
          {
            id: gerarId(),
            ...item,
            subtotal: item.quantidade * item.preco_unitario,
          },
        ];
      }

      const totais = calcularTotais(novoItens, prev.desconto);

      return {
        ...prev,
        itens: novoItens,
        ...totais,
      };
    });
  };

  const removerItem = (produtoId: string) => {
    setCarrinho((prev) => {
      const novoItens = prev.itens.filter((i) => i.produto_id !== produtoId);
      const totais = calcularTotais(novoItens, prev.desconto);

      return {
        ...prev,
        itens: novoItens,
        ...totais,
      };
    });
  };

  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }

    setCarrinho((prev) => {
      const novoItens = prev.itens.map((i) =>
        i.produto_id === produtoId
          ? {
              ...i,
              quantidade,
              subtotal: quantidade * i.preco_unitario,
            }
          : i
      );

      const totais = calcularTotais(novoItens, prev.desconto);

      return {
        ...prev,
        itens: novoItens,
        ...totais,
      };
    });
  };

  const limparCarrinho = () => {
    setCarrinho({
      itens: [],
      subtotal: 0,
      desconto: 0,
      total: 0,
      total_itens: 0,
    });
  };

  const aplicarDesconto = (desconto: number) => {
    setCarrinho((prev) => {
      const descontoValido = Math.max(0, Math.min(desconto, prev.subtotal));
      const total = Math.max(0, prev.subtotal - descontoValido);

      return {
        ...prev,
        desconto: descontoValido,
        total,
      };
    });
  };

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        aplicarDesconto,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
  }
  return context;
}
