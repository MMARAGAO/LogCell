"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Button,
  Chip,
  Pagination,
} from "@heroui/react";
import { Search, Plus, Package } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  codigo: string;
  preco_venda: number;
  estoque_disponivel: number;
  categoria?: string;
  imagem_url?: string;
}

interface ProdutoSearchGridProps {
  produtos: Produto[];
  onAdicionarProduto: (produto: Produto) => void;
  loading?: boolean;
}

export function ProdutoSearchGrid({
  produtos,
  onAdicionarProduto,
  loading = false,
}: ProdutoSearchGridProps) {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    string | null
  >(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const PRODUTOS_POR_PAGINA = 20;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const produtosFiltrados = useMemo(() => {
    let resultado = produtos;

    // Filtro por categoria
    if (categoriaSelecionada) {
      resultado = resultado.filter((p) => p.categoria === categoriaSelecionada);
    }

    // Filtro por busca dinâmica
    if (busca) {
      const termoBusca = busca.toLowerCase();

      // Divide a busca em palavras individuais
      const palavras = termoBusca.split(/\s+/).filter((p) => p.length > 0);

      resultado = resultado.filter((produto) => {
        const textoCompleto = [
          produto.nome,
          produto.codigo,
          produto.categoria || "",
        ]
          .join(" ")
          .toLowerCase();

        // Todas as palavras devem estar presentes no texto
        return palavras.every((palavra) => textoCompleto.includes(palavra));
      });
    }

    return resultado;
  }, [produtos, busca, categoriaSelecionada]);

  // Produtos da página atual
  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;
    const fim = inicio + PRODUTOS_POR_PAGINA;
    return produtosFiltrados.slice(inicio, fim);
  }, [produtosFiltrados, paginaAtual]);

  const totalPaginas = Math.ceil(
    produtosFiltrados.length / PRODUTOS_POR_PAGINA
  );

  // Resetar página ao filtrar
  useMemo(() => {
    setPaginaAtual(1);
  }, [busca, categoriaSelecionada]);

  const categorias = useMemo(() => {
    const cats = new Set(produtos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats) as string[];
  }, [produtos]);

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar produto... (ex: bat i 11)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          className="flex-1"
        />
      </div>

      {/* Filtro por categoria */}
      {categorias.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Chip
            variant={categoriaSelecionada === null ? "solid" : "bordered"}
            onClick={() => setCategoriaSelecionada(null)}
            className="cursor-pointer"
          >
            Todas
          </Chip>
          {categorias.map((cat) => (
            <Chip
              key={cat}
              variant={categoriaSelecionada === cat ? "solid" : "bordered"}
              onClick={() => setCategoriaSelecionada(cat)}
              className="cursor-pointer"
            >
              {cat}
            </Chip>
          ))}
        </div>
      )}

      {/* Grid de produtos */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="text-sm text-gray-600 mb-2">
            Mostrando {(paginaAtual - 1) * PRODUTOS_POR_PAGINA + 1} a{" "}
            {Math.min(
              paginaAtual * PRODUTOS_POR_PAGINA,
              produtosFiltrados.length
            )}{" "}
            de {produtosFiltrados.length} produtos
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {produtosPaginados.map((produto) => (
              <Card
                key={produto.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-4">
                  {/* Imagem do produto */}
                  {produto.imagem_url ? (
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-default-100">
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square mb-3 rounded-lg bg-default-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-default-400" />
                    </div>
                  )}

                  {/* Info do produto */}
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-sm line-clamp-2">
                        {produto.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cód: {produto.codigo}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-primary">
                        {formatarMoeda(produto.preco_venda)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Chip
                        size="sm"
                        color={
                          produto.estoque_disponivel > 0 ? "success" : "danger"
                        }
                        variant="flat"
                      >
                        Estoque: {produto.estoque_disponivel}
                      </Chip>
                      {produto.categoria && (
                        <Chip size="sm" variant="flat">
                          {produto.categoria}
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="p-4 pt-0">
                  <Button
                    color="primary"
                    className="w-full"
                    startContent={<Plus className="w-4 h-4" />}
                    onClick={() => onAdicionarProduto(produto)}
                    isDisabled={produto.estoque_disponivel <= 0}
                  >
                    Adicionar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPaginas}
                page={paginaAtual}
                onChange={setPaginaAtual}
                showControls
                color="primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
