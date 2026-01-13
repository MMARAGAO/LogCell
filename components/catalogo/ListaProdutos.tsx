"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Skeleton,
  Pagination,
} from "@heroui/react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { ProdutoCatalogo } from "@/types/catalogo";
import { ProdutoCard } from "./ProdutoCard";
import {
  buscarProdutosCatalogo,
  buscarCategoriasCatalogo,
  buscarMarcasCatalogo,
} from "@/services/catalogoService";
import { Toast } from "@/components/Toast";

interface ListaProdutosProps {
  onProdutoAdicionado?: (produtoNome: string) => void;
}

export function ListaProdutos({ onProdutoAdicionado }: ListaProdutosProps) {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<
    "nome" | "preco" | "novidade" | "destaque"
  >("nome");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [total, setTotal] = useState(0);
  const itensPorPagina = 12;
  const totalPaginas = Math.ceil(total / itensPorPagina);

  // Dados para filtros
  const [categorias, setCategorias] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);

  // Carregar categorias e marcas
  useEffect(() => {
    const carregarFiltros = async () => {
      try {
        setCarregandoFiltros(true);
        const [cats, mcas] = await Promise.all([
          buscarCategoriasCatalogo(),
          buscarMarcasCatalogo(),
        ]);
        setCategorias(cats);
        setMarcas(mcas);
      } catch (err) {
        console.error("Erro ao carregar filtros:", err);
      } finally {
        setCarregandoFiltros(false);
      }
    };

    carregarFiltros();
  }, []);

  // Carregar produtos
  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const { produtos: prods, total: tot } = await buscarProdutosCatalogo({
        busca,
        categoria: categoria || undefined,
        marca: marca || undefined,
        preco_min: precoMin ? parseFloat(precoMin) : 0,
        preco_max: precoMax ? parseFloat(precoMax) : undefined,
        pagina: paginaAtual,
        limite: itensPorPagina,
        ordenar_por: ordenarPor,
        ordem,
      });

      setProdutos(prods);
      setTotal(tot);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setErro("Erro ao carregar produtos. Tente novamente.");
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }, [
    busca,
    categoria,
    marca,
    precoMin,
    precoMax,
    paginaAtual,
    ordenarPor,
    ordem,
  ]);

  // Carregar produtos quando os filtros mudarem
  useEffect(() => {
    setPaginaAtual(1); // Resetar para primeira página ao filtrar
  }, [busca, categoria, marca, precoMin, precoMax, ordenarPor, ordem]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const handleLimparFiltros = () => {
    setBusca("");
    setCategoria("");
    setMarca("");
    setPrecoMin("");
    setPrecoMax("");
    setOrdenarPor("nome");
    setOrdem("asc");
    setPaginaAtual(1);
  };

  const temFiltrosAtivos = busca || categoria || marca || precoMin || precoMax;

  return (
    <div className="w-full space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros
          </h3>
        </div>

        {/* Primeira linha de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <Input
            isClearable
            placeholder="Buscar produtos..."
            startContent={<FaSearch className="text-gray-400" />}
            value={busca}
            onValueChange={setBusca}
            variant="bordered"
          />

          {/* Categoria */}
          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            selectedKeys={categoria ? new Set([categoria]) : new Set()}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setCategoria(selected ? String(selected) : "");
            }}
            isLoading={carregandoFiltros}
            variant="bordered"
            isClearable
          >
            {categorias.map((cat) => (
              <SelectItem key={cat}>{cat}</SelectItem>
            ))}
          </Select>

          {/* Marca */}
          <Select
            label="Marca"
            placeholder="Selecione uma marca"
            selectedKeys={marca ? new Set([marca]) : new Set()}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setMarca(selected ? String(selected) : "");
            }}
            isLoading={carregandoFiltros}
            variant="bordered"
            isClearable
          >
            {marcas.map((m) => (
              <SelectItem key={m}>{m}</SelectItem>
            ))}
          </Select>

          {/* Ordenação */}
          <Select
            label="Ordenar por"
            selectedKeys={new Set([ordenarPor])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setOrdenarPor(
                selected as "nome" | "preco" | "novidade" | "destaque"
              );
            }}
            variant="bordered"
          >
            <SelectItem key="nome">Nome</SelectItem>
            <SelectItem key="preco">Preço</SelectItem>
            <SelectItem key="novidade">Novidade</SelectItem>
            <SelectItem key="destaque">Destaque</SelectItem>
          </Select>
        </div>

        {/* Segunda linha de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Preço Mínimo */}
          <Input
            label="Preço Mínimo"
            type="number"
            placeholder="0.00"
            value={precoMin}
            onValueChange={setPrecoMin}
            startContent="R$"
            variant="bordered"
          />

          {/* Preço Máximo */}
          <Input
            label="Preço Máximo"
            type="number"
            placeholder="0.00"
            value={precoMax}
            onValueChange={setPrecoMax}
            startContent="R$"
            variant="bordered"
          />

          {/* Ordem */}
          <Select
            label="Ordem"
            selectedKeys={new Set([ordem])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setOrdem(selected as "asc" | "desc");
            }}
            variant="bordered"
          >
            <SelectItem key="asc">Crescente</SelectItem>
            <SelectItem key="desc">Decrescente</SelectItem>
          </Select>

          {/* Botão Limpar Filtros */}
          {temFiltrosAtivos && (
            <div className="flex items-end">
              <Button
                size="sm"
                variant="light"
                onPress={handleLimparFiltros}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Info de filtros */}
        {temFiltrosAtivos && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {produtos.length} de {total} produtos
          </p>
        )}
      </div>

      {/* Mensagens de erro */}
      {erro && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      {/* Grid de Produtos */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itensPorPagina }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-3">
          <div className="text-6xl text-gray-300">📦</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
            Tente ajustar os filtros ou pesquisar por outro termo
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onAdicionadoAoCarrinho={onProdutoAdicionado}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={paginaAtual}
                total={totalPaginas}
                onChange={setPaginaAtual}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
