"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Image,
  Badge,
  Tooltip,
} from "@heroui/react";
import { FaShoppingCart, FaHeart, FaCheck } from "react-icons/fa";
import { ProdutoCatalogo } from "@/types/catalogo";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { useState } from "react";

interface ProdutoCardProps {
  produto: ProdutoCatalogo;
  onAdicionadoAoCarrinho?: (produtoNome: string) => void;
}

export function ProdutoCard({
  produto,
  onAdicionadoAoCarrinho,
}: ProdutoCardProps) {
  const { adicionarItem } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [itemEmFavorito, setItemEmFavorito] = useState(false);

  const fotoDestaque =
    produto.fotos?.find((f) => f.is_principal) || produto.fotos?.[0];

  const handleAdicionarAoCarrinho = async () => {
    if (produto.quantidade_disponivel <= 0) {
      return;
    }

    setCarregando(true);

    try {
      adicionarItem({
        produto_id: produto.id,
        produto_nome: produto.descricao,
        produto_marca: produto.marca,
        foto_principal: fotoDestaque?.url,
        preco_unitario: produto.preco_venda || 0,
        quantidade: 1,
      });

      setAdicionado(true);
      onAdicionadoAoCarrinho?.(produto.descricao);

      // Resetar o estado após 2 segundos
      setTimeout(() => {
        setAdicionado(false);
      }, 2000);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarFavorito = () => {
    setItemEmFavorito(!itemEmFavorito);
    // TODO: Implementar lógica de favoritos (salvar no localStorage ou BD)
  };

  const podeAdicionar = produto.quantidade_disponivel > 0;

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col"
      isPressable={false}
    >
      {/* Imagem do Produto */}
      <CardBody className="overflow-visible p-0 relative">
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          {fotoDestaque ? (
            <Image
              alt={produto.descricao}
              className="w-full h-full object-cover"
              src={fotoDestaque.url}
              width={300}
              height={300}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}

          {/* Badges de destaque */}
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
            {produto.destaque && (
              <Badge color="danger" content="Destaque">
                <div />
              </Badge>
            )}
            {produto.promocao && (
              <Badge color="warning" content="Promoção">
                <div />
              </Badge>
            )}
            {produto.novidade && (
              <Badge color="success" content="Novo">
                <div />
              </Badge>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="absolute bottom-2 right-2">
            {podeAdicionar ? (
              <Badge
                color="success"
                content={`${produto.quantidade_disponivel} em estoque`}
              >
                <div />
              </Badge>
            ) : (
              <Badge color="danger" content="Fora de estoque">
                <div />
              </Badge>
            )}
          </div>

          {/* Botão Favorito */}
          <button
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            onClick={handleAdicionarFavorito}
          >
            <FaHeart
              className={itemEmFavorito ? "text-red-500" : "text-gray-400"}
              size={16}
            />
          </button>
        </div>
      </CardBody>

      {/* Informações do Produto */}
      <CardFooter className="flex flex-col items-start gap-3 p-4 flex-grow">
        {/* Marca */}
        {produto.marca && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {produto.marca}
          </p>
        )}

        {/* Descrição */}
        <Tooltip content={produto.descricao} color="default">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white min-h-[2.5rem]">
            {produto.descricao}
          </h3>
        </Tooltip>

        {/* Categoria */}
        {produto.categoria && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {produto.categoria}
          </p>
        )}

        {/* Preço */}
        <div className="w-full mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(produto.preco_venda || 0)}
          </p>
        </div>

        {/* Botão Adicionar ao Carrinho */}
        <Button
          isDisabled={!podeAdicionar || carregando}
          isLoading={carregando}
          className={`w-full font-semibold transition-all duration-200 ${
            adicionado
              ? "bg-green-500 text-white"
              : podeAdicionar
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500"
          }`}
          startContent={adicionado ? <FaCheck /> : <FaShoppingCart />}
          onClick={handleAdicionarAoCarrinho}
        >
          {adicionado ? "Adicionado!" : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
