"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Search, Trash2, Package, TruckIcon } from "lucide-react";

import { Fornecedor } from "@/types/fornecedor";
import { Produto } from "@/types/index";
import {
  buscarProdutosPorFornecedor,
  removerAssociacaoFornecedor,
} from "@/services/fornecedorService";
import { getProdutos } from "@/services/produtosService";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";

interface AssociarProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedor: Fornecedor | null;
}

export default function AssociarProdutoModal({
  isOpen,
  onClose,
  fornecedor,
}: AssociarProdutoModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [associacoes, setAssociacoes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [associacaoParaRemover, setAssociacaoParaRemover] = useState<
    any | null
  >(null);

  useEffect(() => {
    if (isOpen && fornecedor) {
      carregarDados();
    }
  }, [isOpen, fornecedor]);

  const carregarDados = async () => {
    if (!fornecedor) return;

    setLoading(true);

    // Carregar produtos
    const produtosData = await getProdutos();

    if (produtosData) {
      setProdutos(produtosData);
    }

    // Carregar associações existentes (produtos deste fornecedor)
    const { data: associacoesData } = await buscarProdutosPorFornecedor(
      fornecedor.id,
      true, // apenas ativos
    );

    if (associacoesData) {
      setAssociacoes(associacoesData);
    }

    setLoading(false);
  };

  const handleRemover = (associacao: any) => {
    setAssociacaoParaRemover(associacao);
    setConfirmModalAberto(true);
  };

  const confirmarRemocao = async () => {
    if (!associacaoParaRemover) return;

    const { error } = await removerAssociacaoFornecedor(
      associacaoParaRemover.id,
    );

    if (error) {
      showToast("Erro ao remover associação", "error");
    } else {
      showToast("Produto removido com sucesso", "success");
      carregarDados();
    }

    setConfirmModalAberto(false);
    setAssociacaoParaRemover(null);
  };

  const getProdutoInfo = (produtoId: string) => {
    const produto = produtos.find((p) => p.id === produtoId);

    return produto;
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  const associacoesFiltradas = associacoes.filter((a) => {
    const produto = getProdutoInfo(a.produto_id);

    if (!produto) return false;

    const termo = searchTerm.toLowerCase();

    return (
      produto.descricao.toLowerCase().includes(termo) ||
      produto.marca?.toLowerCase().includes(termo) ||
      produto.categoria?.toLowerCase().includes(termo)
    );
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={handleClose}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos Associados
            </div>
            {fornecedor && (
              <div className="flex items-center gap-2 text-sm font-normal text-default-500">
                <TruckIcon className="w-4 h-4" />
                <span>{fornecedor.nome}</span>
              </div>
            )}
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Barra de Pesquisa */}
                {associacoes.length > 0 && (
                  <Input
                    isClearable
                    placeholder="Buscar produto..."
                    startContent={
                      <Search className="w-4 h-4 text-default-400" />
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                  />
                )}

                {/* Contador */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-default-500">
                    {associacoesFiltradas.length} produto(s) associado(s)
                  </p>
                </div>

                {/* Lista de Produtos */}
                {associacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-3 text-default-300" />
                    <p className="text-default-500 mb-2">
                      Nenhum produto associado ainda
                    </p>
                    <p className="text-sm text-default-400">
                      Vá para a tela de Estoque e use a opção &quot;Gerenciar
                      Fornecedores&quot; para associar produtos a este
                      fornecedor
                    </p>
                  </div>
                ) : associacoesFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto mb-3 text-default-300" />
                    <p className="text-default-500">
                      Nenhum produto encontrado com &quot;{searchTerm}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {associacoesFiltradas.map((associacao) => {
                      const produto = getProdutoInfo(associacao.produto_id);

                      if (!produto) return null;

                      return (
                        <div
                          key={associacao.id}
                          className="p-3 border border-default-200 rounded-lg hover:border-default-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {produto.descricao}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {produto.marca && (
                                  <Chip
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                  >
                                    {produto.marca}
                                  </Chip>
                                )}
                                {produto.categoria && (
                                  <Chip
                                    color="secondary"
                                    size="sm"
                                    variant="flat"
                                  >
                                    {produto.categoria}
                                  </Chip>
                                )}
                                {produto.codigo_fabricante && (
                                  <span className="text-xs text-default-500">
                                    Cód: {produto.codigo_fabricante}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              isIconOnly
                              color="danger"
                              size="sm"
                              variant="light"
                              onClick={() => handleRemover(associacao)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        cancelText="Cancelar"
        confirmText="Remover"
        isOpen={confirmModalAberto}
        message="Tem certeza que deseja remover esta associação? O produto não será mais vinculado a este fornecedor."
        title="Confirmar Remoção"
        onClose={() => setConfirmModalAberto(false)}
        onConfirm={confirmarRemocao}
      />
    </>
  );
}
