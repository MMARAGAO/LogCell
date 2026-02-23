"use client";

import type {
  TaxaCartao,
  TaxaCartaoFormData,
  TipoProdutoTaxa,
  FormaPagamentoTaxa,
} from "@/types/taxasCartao";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  Switch,
} from "@heroui/react";
import { CreditCard, Plus, Edit, Trash2, Save } from "lucide-react";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useToast } from "@/components/Toast";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import {
  getTaxasCartao,
  criarTaxaCartao,
  atualizarTaxaCartao,
  deletarTaxaCartao,
  toggleAtivoTaxaCartao,
} from "@/services/taxasCartaoService";

const TIPOS_PRODUTO = [
  { value: "aparelho", label: "Aparelho" },
  { value: "acessorio", label: "Acessório" },
  { value: "servico", label: "Serviço" },
  { value: "todos", label: "Todos os Produtos" },
];

const FORMAS_PAGAMENTO = [
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
];

export default function TaxasCartaoPage() {
  const { usuario } = useAuthContext();
  const { temPermissao } = usePermissoes();
  const { showToast } = useToast();
  const { lojaId } = useLojaFilter();

  const [taxas, setTaxas] = useState<TaxaCartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [taxaEditando, setTaxaEditando] = useState<TaxaCartao | null>(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [taxaParaDeletar, setTaxaParaDeletar] = useState<TaxaCartao | null>(
    null,
  );

  const [formData, setFormData] = useState<TaxaCartaoFormData>({
    loja_id: null,
    tipo_produto: "todos",
    forma_pagamento: "cartao_credito",
    parcelas_min: 1,
    parcelas_max: 1,
    taxa_percentual: 0,
    ativo: true,
  });

  const podeVisualizar = temPermissao("configuracoes.gerenciar");
  const podeEditar = temPermissao("configuracoes.gerenciar");

  useEffect(() => {
    if (podeVisualizar) {
      carregarTaxas();
    }
  }, [podeVisualizar, lojaId]);

  const carregarTaxas = async () => {
    try {
      setLoading(true);
      const dados = await getTaxasCartao({
        loja_id: lojaId || undefined,
        ativo: undefined, // Buscar todas (ativas e inativas)
      });

      setTaxas(dados);
    } catch (error) {
      console.error("Erro ao carregar taxas:", error);
      showToast("Erro ao carregar taxas de cartão", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (taxa?: TaxaCartao) => {
    if (taxa) {
      setTaxaEditando(taxa);
      setFormData({
        loja_id: taxa.loja_id,
        tipo_produto: taxa.tipo_produto,
        forma_pagamento: taxa.forma_pagamento,
        parcelas_min: taxa.parcelas_min,
        parcelas_max: taxa.parcelas_max,
        taxa_percentual: taxa.taxa_percentual,
        ativo: taxa.ativo,
      });
    } else {
      setTaxaEditando(null);
      setFormData({
        loja_id: lojaId || null,
        tipo_produto: "todos",
        forma_pagamento: "cartao_credito",
        parcelas_min: 1,
        parcelas_max: 1,
        taxa_percentual: 0,
        ativo: true,
      });
    }
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    // Validações
    if (formData.taxa_percentual <= 0) {
      showToast("Informe uma taxa válida", "error");

      return;
    }

    if (formData.parcelas_min <= 0 || formData.parcelas_max <= 0) {
      showToast("Informe um número de parcelas válido", "error");

      return;
    }

    if (formData.parcelas_min > formData.parcelas_max) {
      showToast(
        "O número mínimo de parcelas não pode ser maior que o máximo",
        "error",
      );

      return;
    }

    try {
      if (taxaEditando) {
        await atualizarTaxaCartao(taxaEditando.id, formData, usuario.id);
        showToast("Taxa atualizada com sucesso", "success");
      } else {
        await criarTaxaCartao(formData, usuario.id);
        showToast("Taxa criada com sucesso", "success");
      }

      setModalAberto(false);
      carregarTaxas();
    } catch (error: any) {
      console.error("Erro ao salvar taxa:", error);
      showToast(error.message || "Erro ao salvar taxa", "error");
    }
  };

  const handleDeletar = async () => {
    if (!taxaParaDeletar) return;

    try {
      await deletarTaxaCartao(taxaParaDeletar.id);
      showToast("Taxa deletada com sucesso", "success");
      setModalDeleteAberto(false);
      setTaxaParaDeletar(null);
      carregarTaxas();
    } catch (error: any) {
      console.error("Erro ao deletar taxa:", error);
      showToast(error.message || "Erro ao deletar taxa", "error");
    }
  };

  const handleToggleAtivo = async (taxa: TaxaCartao) => {
    if (!usuario) return;

    try {
      await toggleAtivoTaxaCartao(taxa.id, !taxa.ativo, usuario.id);
      showToast(taxa.ativo ? "Taxa desativada" : "Taxa ativada", "success");
      carregarTaxas();
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      showToast(error.message || "Erro ao alterar status", "error");
    }
  };

  const getTipoProdutoLabel = (tipo: TipoProdutoTaxa) => {
    return TIPOS_PRODUTO.find((t) => t.value === tipo)?.label || tipo;
  };

  const getFormaPagamentoLabel = (forma: FormaPagamentoTaxa) => {
    return FORMAS_PAGAMENTO.find((f) => f.value === forma)?.label || forma;
  };

  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardBody>
            <p className="text-danger">
              Você não tem permissão para visualizar as configurações de taxas.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Taxas de Cartão</h1>
            <p className="text-sm text-default-500">
              Configure as taxas aplicadas em vendas com cartão
            </p>
          </div>
        </div>
        {podeEditar && (
          <Button
            color="primary"
            startContent={<Plus className="w-5 h-5" />}
            onPress={() => handleAbrirModal()}
          >
            Nova Taxa
          </Button>
        )}
      </div>

      {/* Tabela de Taxas */}
      <Card>
        <CardBody>
          <Table isStriped aria-label="Tabela de taxas de cartão">
            <TableHeader>
              <TableColumn>TIPO DE PRODUTO</TableColumn>
              <TableColumn>FORMA PAGAMENTO</TableColumn>
              <TableColumn>PARCELAS</TableColumn>
              <TableColumn>TAXA (%)</TableColumn>
              <TableColumn>LOJA</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="Nenhuma taxa cadastrada"
              isLoading={loading}
            >
              {taxas.map((taxa) => (
                <TableRow key={taxa.id}>
                  <TableCell>
                    <Chip color="primary" size="sm" variant="flat">
                      {getTipoProdutoLabel(taxa.tipo_produto)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {getFormaPagamentoLabel(taxa.forma_pagamento)}
                  </TableCell>
                  <TableCell>
                    {taxa.parcelas_min === taxa.parcelas_max
                      ? `${taxa.parcelas_min}x`
                      : `${taxa.parcelas_min}x a ${taxa.parcelas_max}x`}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-danger">
                      {taxa.taxa_percentual.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {taxa.loja_id ? `Loja ${taxa.loja_id}` : "Todas"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      color="success"
                      isDisabled={!podeEditar}
                      isSelected={taxa.ativo}
                      size="sm"
                      onValueChange={() => handleToggleAtivo(taxa)}
                    >
                      {taxa.ativo ? "Ativa" : "Inativa"}
                    </Switch>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {podeEditar && (
                        <>
                          <Button
                            isIconOnly
                            color="primary"
                            size="sm"
                            variant="light"
                            onPress={() => handleAbrirModal(taxa)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => {
                              setTaxaParaDeletar(taxa);
                              setModalDeleteAberto(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalAberto}
        size="2xl"
        onClose={() => setModalAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            {taxaEditando ? "Editar Taxa" : "Nova Taxa"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Produto"
                selectedKeys={[formData.tipo_produto]}
                variant="bordered"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo_produto: e.target.value as TipoProdutoTaxa,
                  })
                }
              >
                {TIPOS_PRODUTO.map((tipo) => (
                  <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Forma de Pagamento"
                selectedKeys={[formData.forma_pagamento]}
                variant="bordered"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    forma_pagamento: e.target.value as FormaPagamentoTaxa,
                  })
                }
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma.value}>{forma.label}</SelectItem>
                ))}
              </Select>

              <Input
                label="Parcelas Mínimas"
                min="1"
                type="number"
                value={formData.parcelas_min.toString()}
                variant="bordered"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parcelas_min: parseInt(e.target.value) || 1,
                  })
                }
              />

              <Input
                label="Parcelas Máximas"
                min="1"
                type="number"
                value={formData.parcelas_max.toString()}
                variant="bordered"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parcelas_max: parseInt(e.target.value) || 1,
                  })
                }
              />

              <Input
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">%</span>
                  </div>
                }
                label="Taxa (%)"
                step="0.01"
                type="number"
                value={formData.taxa_percentual.toString()}
                variant="bordered"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxa_percentual: parseFloat(e.target.value) || 0,
                  })
                }
              />

              <div className="flex items-center">
                <Switch
                  color="success"
                  isSelected={formData.ativo}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, ativo: checked })
                  }
                >
                  Taxa Ativa
                </Switch>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-default-600">
                <strong>Exemplo:</strong> Se você configurar parcelas de 2 a 3
                com taxa de 4.5%, todas as vendas parceladas em 2x ou 3x terão
                essa taxa aplicada.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              startContent={<Save className="w-4 h-4" />}
              onPress={handleSalvar}
            >
              {taxaEditando ? "Atualizar" : "Criar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalDeleteAberto}
        size="md"
        onClose={() => {
          setModalDeleteAberto(false);
          setTaxaParaDeletar(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader>
          <ModalBody>
            <p>Tem certeza que deseja deletar esta taxa?</p>
            {taxaParaDeletar && (
              <div className="mt-4 p-3 bg-danger/10 rounded-lg">
                <p className="text-sm">
                  <strong>Tipo:</strong>{" "}
                  {getTipoProdutoLabel(taxaParaDeletar.tipo_produto)}
                </p>
                <p className="text-sm">
                  <strong>Forma:</strong>{" "}
                  {getFormaPagamentoLabel(taxaParaDeletar.forma_pagamento)}
                </p>
                <p className="text-sm">
                  <strong>Taxa:</strong> {taxaParaDeletar.taxa_percentual}%
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setModalDeleteAberto(false);
                setTaxaParaDeletar(null);
              }}
            >
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDeletar}>
              Deletar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
