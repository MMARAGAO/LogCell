"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Skeleton,
  Chip,
  Tabs,
  Tab,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { FaShoppingCart, FaArrowLeft, FaCheck, FaHeart } from "react-icons/fa";
import { ItemCatalogo } from "@/types/catalogo";
import {
  buscarProdutoPorId,
  buscarAparelhoPorId,
} from "@/services/catalogoService";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { Toast } from "@/components/Toast";
import Image from "next/image";

export default function DetalhesItemPage() {
  const params = useParams();
  const router = useRouter();
  const { adicionarItem } = useCarrinho();

  const [item, setItem] = useState<ItemCatalogo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [adicionado, setAdicionado] = useState(false);
  const [toastAtivo, setToastAtivo] = useState(false);
  const [mensagemToast, setMensagemToast] = useState("");
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const carregarItem = async () => {
      try {
        setCarregando(true);
        const id = params.id as string;

        // Tentar buscar como produto primeiro
        const produto = await buscarProdutoPorId(id);

        if (produto) {
          setItem({ tipo: "produto", dados: produto });
        } else {
          // Tentar buscar como aparelho
          const aparelho = await buscarAparelhoPorId(id);

          if (aparelho) {
            setItem({ tipo: "aparelho", dados: aparelho });
          }
        }
      } catch (erro) {
        console.error("Erro ao carregar item:", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarItem();
  }, [params.id]);

  const handleAdicionarAoCarrinho = () => {
    if (!item) return;

    const isProduto = item.tipo === "produto";
    const dados = item.dados;

    const nome = isProduto
      ? (dados as any).descricao
      : `${(dados as any).marca || ""} ${(dados as any).modelo || ""}`.trim();

    const marca = (dados as any).marca;
    const preco = isProduto
      ? (dados as any).preco_venda || 0
      : (dados as any).valor_venda || 0;
    const fotoDestaque = dados.fotos?.[0];

    adicionarItem({
      produto_id: dados.id,
      produto_nome: nome,
      produto_marca: marca || undefined,
      foto_principal: fotoDestaque?.url,
      preco_unitario: preco,
      quantidade: 1,
    });

    setAdicionado(true);
    setMensagemToast(`"${nome}" adicionado ao carrinho!`);
    setToastAtivo(true);

    setTimeout(() => setAdicionado(false), 2000);
  };

  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-96 rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Item não encontrado</h2>
        <Button onClick={() => router.push("/catalogo")}>
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }

  const isProduto = item.tipo === "produto";
  const dados = item.dados;
  const nome = isProduto
    ? (dados as any).descricao
    : `${(dados as any).marca || ""} ${(dados as any).modelo || ""}`.trim();
  const marca = (dados as any).marca;
  const preco = isProduto
    ? (dados as any).preco_venda || 0
    : (dados as any).valor_venda || 0;
  const fotos = dados.fotos || [];
  const quantidadeDisponivel = isProduto
    ? (dados as any).quantidade_disponivel
    : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem onClick={() => router.push("/catalogo")}>
            Catálogo
          </BreadcrumbItem>
          <BreadcrumbItem>
            {isProduto ? "Produtos" : "Aparelhos"}
          </BreadcrumbItem>
          <BreadcrumbItem>{nome}</BreadcrumbItem>
        </Breadcrumbs>

        {/* Botão Voltar */}
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onClick={() => router.back()}
          className="mb-6"
        >
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              {fotos.length > 0 ? (
                <Image
                  src={fotos[imagemAtual]?.url || fotos[0].url}
                  alt={nome}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sem imagem
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {fotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {fotos.map((foto, idx) => (
                  <button
                    key={foto.id}
                    onClick={() => setImagemAtual(idx)}
                    className={`relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                      imagemAtual === idx
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={foto.url}
                      alt={`${nome} - ${idx + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {!isProduto && <Chip color="secondary">Aparelho</Chip>}
              {dados.destaque && <Chip color="danger">Destaque</Chip>}
              {dados.promocao && <Chip color="warning">Promoção</Chip>}
              {dados.novidade && <Chip color="success">Novo</Chip>}
            </div>

            {/* Marca */}
            {marca && (
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {marca}
              </p>
            )}

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {nome}
            </h1>

            {/* Informações de Aparelho */}
            {!isProduto && (
              <div className="flex flex-wrap gap-2">
                {(dados as any).armazenamento && (
                  <Chip variant="flat">{(dados as any).armazenamento}</Chip>
                )}
                {(dados as any).memoria_ram && (
                  <Chip variant="flat">{(dados as any).memoria_ram} RAM</Chip>
                )}
                {(dados as any).cor && (
                  <Chip variant="flat">{(dados as any).cor}</Chip>
                )}
                {(dados as any).estado && (
                  <Chip variant="flat" color="primary">
                    {(dados as any).estado}
                  </Chip>
                )}
                {(dados as any).condicao && (
                  <Chip variant="flat">{(dados as any).condicao}</Chip>
                )}
              </div>
            )}

            {/* Preço */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(preco)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ou até 12x de{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(preco / 12)}
              </p>
            </div>

            {/* Disponibilidade */}
            <div className="flex items-center gap-2">
              {quantidadeDisponivel > 0 ? (
                <>
                  <FaCheck className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {isProduto
                      ? `${quantidadeDisponivel} em estoque`
                      : "Disponível"}
                  </span>
                </>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  Indisponível
                </span>
              )}
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <Button
                size="lg"
                className={`w-full font-semibold text-lg ${
                  adicionado ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
                startContent={adicionado ? <FaCheck /> : <FaShoppingCart />}
                onClick={handleAdicionarAoCarrinho}
                isDisabled={quantidadeDisponivel <= 0}
              >
                {adicionado
                  ? "Adicionado ao Carrinho!"
                  : "Adicionar ao Carrinho"}
              </Button>

              <Button
                size="lg"
                variant="bordered"
                className="w-full"
                startContent={<FaHeart />}
              >
                Adicionar aos Favoritos
              </Button>
            </div>

            {/* Informações Adicionais com Tabs */}
            <Tabs aria-label="Informações do produto">
              <Tab key="descricao" title="Descrição">
                <Card>
                  <CardBody>
                    <p className="text-gray-700 dark:text-gray-300">
                      {(dados as any).observacoes ||
                        "Sem descrição disponível."}
                    </p>
                    {!isProduto && (dados as any).acessorios && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">
                          Acessórios inclusos:
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {(dados as any).acessorios}
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>

              <Tab key="especificacoes" title="Especificações">
                <Card>
                  <CardBody>
                    <dl className="space-y-2">
                      {isProduto ? (
                        <>
                          {(dados as any).categoria && (
                            <div>
                              <dt className="font-semibold">Categoria:</dt>
                              <dd className="text-gray-700 dark:text-gray-300">
                                {(dados as any).categoria}
                              </dd>
                            </div>
                          )}
                          {(dados as any).grupo && (
                            <div>
                              <dt className="font-semibold">Grupo:</dt>
                              <dd className="text-gray-700 dark:text-gray-300">
                                {(dados as any).grupo}
                              </dd>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {(dados as any).imei && (
                            <div>
                              <dt className="font-semibold">IMEI:</dt>
                              <dd className="text-gray-700 dark:text-gray-300">
                                {(dados as any).imei}
                              </dd>
                            </div>
                          )}
                          {(dados as any).numero_serie && (
                            <div>
                              <dt className="font-semibold">
                                Número de Série:
                              </dt>
                              <dd className="text-gray-700 dark:text-gray-300">
                                {(dados as any).numero_serie}
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                    </dl>
                  </CardBody>
                </Card>
              </Tab>

              <Tab key="entrega" title="Entrega">
                <Card>
                  <CardBody>
                    <p className="text-gray-700 dark:text-gray-300">
                      Retire na loja ou receba em casa.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Retirada em loja: Grátis</li>
                      <li>✓ Entrega expressa: 1-2 dias úteis</li>
                      <li>✓ Entrega padrão: 3-5 dias úteis</li>
                    </ul>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>

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
