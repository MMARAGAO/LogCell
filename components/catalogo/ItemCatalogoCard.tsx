"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Image,
  Badge,
  Tooltip,
  Chip,
} from "@heroui/react";
import { FaShoppingCart, FaHeart, FaCheck } from "react-icons/fa";
import { ItemCatalogo } from "@/types/catalogo";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { useRouter } from "next/navigation";

interface ItemCatalogoCardProps {
  item: ItemCatalogo;
  onAdicionadoAoCarrinho?: (itemNome: string) => void;
}

export function ItemCatalogoCard({
  item,
  onAdicionadoAoCarrinho,
}: ItemCatalogoCardProps) {
  const router = useRouter();
  const { adicionarItem } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Extrair dados dependendo do tipo
  const isProduto = item.tipo === "produto";
  const dados = item.dados;

  const nome = isProduto
    ? (dados as any).descricao
    : `${(dados as any).marca || ""} ${(dados as any).modelo || ""}`.trim();

  const marca = isProduto ? (dados as any).marca : (dados as any).marca;

  const preco = isProduto
    ? (dados as any).preco_venda || 0
    : (dados as any).valor_venda || 0;

  const quantidadeDisponivel = isProduto
    ? (dados as any).quantidade_disponivel
    : 1; // Aparelhos são únicos

  const destaque = dados.destaque || false;
  const promocao = dados.promocao || false;
  const novidade = dados.novidade || false;

  const fotos = dados.fotos || [];
  const fotoDestaque = fotos.find((f) => f.is_principal) || fotos[0];

  // Informações específicas de aparelhos
  const infoAparelho = !isProduto
    ? {
        estado: (dados as any).estado,
        condicao: (dados as any).condicao,
        armazenamento: (dados as any).armazenamento,
        cor: (dados as any).cor,
      }
    : null;

  const handleAdicionarAoCarrinho = async () => {
    if (quantidadeDisponivel <= 0) {
      return;
    }

    setCarregando(true);

    try {
      adicionarItem({
        produto_id: dados.id,
        produto_nome: nome,
        produto_marca: marca || undefined,
        foto_principal: fotoDestaque?.url,
        preco_unitario: preco,
        quantidade: 1,
      });

      setAdicionado(true);
      onAdicionadoAoCarrinho?.(nome);

      setTimeout(() => {
        setAdicionado(false);
      }, 2000);
    } finally {
      setCarregando(false);
    }
  };

  const podeAdicionar = quantidadeDisponivel > 0;

  const handleVerDetalhes = () => {
    router.push(`/catalogo/${dados.id}`);
  };

  return (
    <Card
      className="h-full hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
      isPressable
      onPress={handleVerDetalhes}
    >
      <CardBody className="overflow-visible p-0 relative">
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          {fotoDestaque ? (
            <Image
              alt={nome}
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
            {!isProduto && (
              <Badge color="secondary" content="Aparelho">
                <div />
              </Badge>
            )}
            {destaque && (
              <Badge color="danger" content="Destaque">
                <div />
              </Badge>
            )}
            {promocao && (
              <Badge color="warning" content="Promoção">
                <div />
              </Badge>
            )}
            {novidade && (
              <Badge color="success" content="Novo">
                <div />
              </Badge>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="absolute bottom-2 right-2">
            {podeAdicionar ? (
              isProduto ? (
                <Badge
                  color="success"
                  content={`${quantidadeDisponivel} em estoque`}
                >
                  <div />
                </Badge>
              ) : (
                <Badge color="success" content="Disponível">
                  <div />
                </Badge>
              )
            ) : (
              <Badge color="danger" content="Indisponível">
                <div />
              </Badge>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter className="flex flex-col items-start gap-3 p-4 flex-grow">
        {/* Marca */}
        {marca && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {marca}
          </p>
        )}

        {/* Nome */}
        <Tooltip content={nome} color="default">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white min-h-[2.5rem]">
            {nome}
          </h3>
        </Tooltip>

        {/* Informações de aparelho */}
        {infoAparelho && (
          <div className="flex flex-wrap gap-1">
            {infoAparelho.armazenamento && (
              <Chip size="sm" variant="flat">
                {infoAparelho.armazenamento}
              </Chip>
            )}
            {infoAparelho.cor && (
              <Chip size="sm" variant="flat">
                {infoAparelho.cor}
              </Chip>
            )}
            {infoAparelho.estado && (
              <Chip size="sm" variant="flat" color="primary">
                {infoAparelho.estado}
              </Chip>
            )}
          </div>
        )}

        {/* Categoria (apenas produtos) */}
        {isProduto && (dados as any).categoria && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(dados as any).categoria}
          </p>
        )}

        {/* Preço */}
        <div className="w-full mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(preco)}
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
          onClick={(e) => {
            e.stopPropagation();
            handleAdicionarAoCarrinho();
          }}
        >
          {adicionado ? "Adicionado!" : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
