"use client";

import React from "react";
import { Badge, Button, Tooltip } from "@heroui/react";
import { FaShoppingCart } from "react-icons/fa";
import Link from "next/link";
import { useCarrinho } from "@/contexts/CarrinhoContext";

export function CarrinhoIcon() {
  const { carrinho } = useCarrinho();

  if (carrinho.total_itens === 0) {
    return (
      <Tooltip content="Catálogo">
        <Button
          as={Link}
          href="/catalogo"
          isIconOnly
          variant="light"
          className="hover:bg-default-100 transition-colors"
        >
          <FaShoppingCart className="w-5 h-5" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Badge
      color="danger"
      content={carrinho.total_itens}
      size="lg"
      placement="top-right"
    >
      <Tooltip
        content={`${carrinho.total_itens} item${carrinho.total_itens !== 1 ? "ns" : ""} no carrinho - R$ ${carrinho.total.toFixed(2)}`}
      >
        <Button
          as={Link}
          href="/catalogo/carrinho"
          isIconOnly
          variant="light"
          className="hover:bg-default-100 transition-colors"
        >
          <FaShoppingCart className="w-5 h-5" />
        </Button>
      </Tooltip>
    </Badge>
  );
}
