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
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Search, TruckIcon, Package, X } from "lucide-react";
import { Produto } from "@/types/index";
import { Fornecedor } from "@/types/fornecedor";
import { buscarFornecedores } from "@/services/fornecedorService";
import {
  buscarFornecedoresPorProduto,
  associarFornecedorProduto,
  removerAssociacaoFornecedor,
} from "@/services/fornecedorService";
import { useToast } from "@/components/Toast";

interface GerenciarFornecedoresProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
}

export default function GerenciarFornecedoresProdutoModal({
  isOpen,
  onClose,
  produto,
}: GerenciarFornecedoresProdutoModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<
    Set<string>
  >(new Set());
  const [fornecedoresIniciais, setFornecedoresIniciais] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && produto) {
      carregarDados();
    }
  }, [isOpen, produto]);

  const carregarDados = async () => {
    if (!produto) return;

    setLoading(true);

    // Carregar todos os fornecedores
    const { data: fornecedoresData } = await buscarFornecedores(true); // apenas ativos
    if (fornecedoresData) {
      setFornecedores(fornecedoresData);
    }

    // Carregar fornecedores já associados
    const { data: associacoesData } = await buscarFornecedoresPorProduto(
      produto.id
    );
    if (associacoesData) {
      const ids = new Set(associacoesData.map((a) => a.fornecedor_id));
      setFornecedoresSelecionados(ids);
      setFornecedoresIniciais(ids);
    }

    setLoading(false);
  };

  const handleToggleFornecedor = (fornecedorId: string) => {
    setFornecedoresSelecionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fornecedorId)) {
        newSet.delete(fornecedorId);
      } else {
        newSet.add(fornecedorId);
      }
      return newSet;
    });
  };

  const handleSalvar = async () => {
    if (!produto) return;

    setSalvando(true);

    // Determinar quais fornecedores adicionar e remover
    const paraAdicionar = Array.from(fornecedoresSelecionados).filter(
      (id) => !fornecedoresIniciais.has(id)
    );
    const paraRemover = Array.from(fornecedoresIniciais).filter(
      (id) => !fornecedoresSelecionados.has(id)
    );

    let erros = 0;

    // Adicionar novos fornecedores
    for (const fornecedorId of paraAdicionar) {
      const { error } = await associarFornecedorProduto({
        produto_id: produto.id,
        fornecedor_id: fornecedorId,
        ativo: true,
      });
      if (error) erros++;
    }

    // Remover fornecedores desmarcados
    // Buscar IDs das associações para remover
    const { data: associacoesData } = await buscarFornecedoresPorProduto(
      produto.id
    );
    if (associacoesData) {
      for (const fornecedorId of paraRemover) {
        const associacao = associacoesData.find(
          (a) => a.fornecedor_id === fornecedorId
        );
        if (associacao) {
          const { error } = await removerAssociacaoFornecedor(associacao.id);
          if (error) erros++;
        }
      }
    }

    if (erros > 0) {
      showToast(`Concluído com ${erros} erro(s)`, "warning");
    } else {
      showToast("Fornecedores atualizados com sucesso", "success");
    }

    setSalvando(false);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  const fornecedoresFiltrados = fornecedores.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelecionados = fornecedoresSelecionados.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-5 h-5" />
            Gerenciar Fornecedores
          </div>
          {produto && (
            <div className="flex items-center gap-2 text-sm font-normal text-default-500">
              <Package className="w-4 h-4" />
              <span>{produto.descricao}</span>
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
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                startContent={<Search className="w-4 h-4 text-default-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                isClearable
                onClear={() => setSearchTerm("")}
              />

              {/* Contador */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-default-500">
                  {fornecedoresFiltrados.length} fornecedor(es) encontrado(s)
                </p>
                {totalSelecionados > 0 && (
                  <Chip color="primary" size="sm">
                    {totalSelecionados} selecionado(s)
                  </Chip>
                )}
              </div>

              {/* Lista de Fornecedores */}
              {fornecedoresFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <TruckIcon className="w-12 h-12 mx-auto mb-3 text-default-300" />
                  <p className="text-default-500">
                    {searchTerm
                      ? "Nenhum fornecedor encontrado"
                      : "Nenhum fornecedor cadastrado"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fornecedoresFiltrados.map((fornecedor) => (
                    <div
                      key={fornecedor.id}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-all
                        ${
                          fornecedoresSelecionados.has(fornecedor.id)
                            ? "border-primary bg-primary/5"
                            : "border-default-200 hover:border-default-300"
                        }
                      `}
                      onClick={() => handleToggleFornecedor(fornecedor.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          isSelected={fornecedoresSelecionados.has(
                            fornecedor.id
                          )}
                          onValueChange={() =>
                            handleToggleFornecedor(fornecedor.id)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {fornecedor.nome}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {fornecedor.cnpj && (
                              <span className="text-xs text-default-500">
                                CNPJ: {fornecedor.cnpj}
                              </span>
                            )}
                            {fornecedor.telefone && (
                              <span className="text-xs text-default-500">
                                Tel: {fornecedor.telefone}
                              </span>
                            )}
                            {fornecedor.cidade && fornecedor.estado && (
                              <span className="text-xs text-default-500">
                                {fornecedor.cidade}/{fornecedor.estado}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSalvar}
            isLoading={salvando}
            isDisabled={loading}
          >
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
