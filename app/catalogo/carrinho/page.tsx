"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Breadcrumbs,
  BreadcrumbItem,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaShoppingCart,
} from "react-icons/fa";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import Image from "next/image";

export default function CarrinhoPage() {
  const router = useRouter();
  const {
    carrinho,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    aplicarDesconto,
  } = useCarrinho();

  const [cupomDesconto, setCupomDesconto] = useState("");
  const [erroDesconto, setErroDesconto] = useState("");

  const handleAplicarDesconto = () => {
    // Simular validação de cupom
    if (cupomDesconto.toUpperCase() === "DESCONTO10") {
      aplicarDesconto(carrinho.subtotal * 0.1);
      setErroDesconto("");
    } else if (cupomDesconto.toUpperCase() === "FRETE50") {
      aplicarDesconto(50);
      setErroDesconto("");
    } else {
      setErroDesconto("Cupom inválido");
    }
  };

  const handleFinalizar = () => {
    // Aqui você pode redirecionar para checkout ou processar o pedido
    alert("Funcionalidade de checkout em desenvolvimento!");
  };

  if (carrinho.itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <FaShoppingCart className="text-gray-300 dark:text-gray-700 text-8xl mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Explore nosso catálogo e adicione produtos ao carrinho!
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/catalogo")}
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem onClick={() => router.push("/catalogo")}>
            Catálogo
          </BreadcrumbItem>
          <BreadcrumbItem>Carrinho</BreadcrumbItem>
        </Breadcrumbs>

        {/* Botão Voltar */}
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onClick={() => router.push("/catalogo")}
          className="mb-6"
        >
          Continuar Comprando
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">
                Meu Carrinho ({carrinho.itens.length}{" "}
                {carrinho.itens.length === 1 ? "item" : "itens"})
              </h1>
              <Button
                variant="light"
                color="danger"
                size="sm"
                startContent={<FaTrash />}
                onClick={limparCarrinho}
              >
                Limpar Carrinho
              </Button>
            </div>

            {carrinho.itens.map((item) => (
              <Card key={item.id} className="p-4">
                <CardBody>
                  <div className="flex gap-4">
                    {/* Imagem */}
                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.foto_principal ? (
                        <Image
                          src={item.foto_principal}
                          alt={item.produto_nome}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {item.produto_nome}
                      </h3>
                      {item.produto_marca && (
                        <p className="text-sm text-gray-500 mb-2">
                          {item.produto_marca}
                        </p>
                      )}
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.preco_unitario)}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => removerItem(item.id)}
                      >
                        <FaTrash />
                      </Button>

                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() =>
                            atualizarQuantidade(item.id, item.quantidade - 1)
                          }
                          isDisabled={item.quantidade <= 1}
                        >
                          <FaMinus />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantidade}
                        </span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() =>
                            atualizarQuantidade(item.id, item.quantidade + 1)
                          }
                        >
                          <FaPlus />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold mt-2">
                        Subtotal:{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardBody className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

                {/* Cupom de Desconto */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Cupom de Desconto
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o cupom"
                      value={cupomDesconto}
                      onChange={(e) => {
                        setCupomDesconto(e.target.value);
                        setErroDesconto("");
                      }}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAplicarDesconto}
                      className="bg-gray-200 dark:bg-gray-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {erroDesconto && (
                    <p className="text-xs text-red-500">{erroDesconto}</p>
                  )}
                  {carrinho.desconto && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Desconto aplicado!
                    </p>
                  )}
                </div>

                <Divider />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(carrinho.subtotal)}
                    </span>
                  </div>

                  {carrinho.desconto && carrinho.desconto > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Desconto</span>
                      <span className="font-semibold">
                        -
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(carrinho.desconto)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      GRÁTIS
                    </span>
                  </div>
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(carrinho.total)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  ou até 12x de{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(carrinho.total / 12)}
                </p>

                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={handleFinalizar}
                >
                  Finalizar Compra
                </Button>

                <Button
                  size="lg"
                  variant="bordered"
                  className="w-full"
                  onClick={() => router.push("/catalogo")}
                >
                  Continuar Comprando
                </Button>

                {/* Selos de Segurança */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2 text-center">
                    🔒 Compra 100% Segura
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs font-semibold">
                      PIX
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs font-semibold">
                      Cartão
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs font-semibold">
                      Boleto
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
