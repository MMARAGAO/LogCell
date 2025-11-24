"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Checkbox,
  Divider,
  Chip,
} from "@heroui/react";
import { PackageX, AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VendasService } from "@/services/vendasService";
import { VendaCompleta, ItemVenda } from "@/types/vendas";
import { usePermissoes } from "@/hooks/usePermissoes";
import { toast } from "sonner";

interface ModalDevolucaoProps {
  isOpen: boolean;
  onClose: () => void;
  venda: VendaCompleta;
  onSuccess: () => void;
}

interface ItemDevolucao {
  item_venda_id: string;
  produto_id: string;
  produto_nome: string;
  quantidade_original: number;
  quantidade_devolvida: number;
  quantidade_devolver: number;
  preco_unitario: number;
  subtotal: number;
}

export function ModalDevolucao({
  isOpen,
  onClose,
  venda,
  onSuccess,
}: ModalDevolucaoProps) {
  const { usuario } = useAuth();
  const { temPermissao } = usePermissoes();
  const [itensDevolucao, setItensDevolucao] = useState<ItemDevolucao[]>([]);
  const [gerarCredito, setGerarCredito] = useState(true);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen && venda.itens) {
      // Inicializar itens disponíveis para devolução
      const itens = venda.itens
        .filter((item) => item.quantidade > (item.devolvido || 0))
        .map((item) => {
          // Debug: verificar se o id está presente
          if (!item.id) {
            console.error("❌ Item sem ID:", item);
          }
          return {
            item_venda_id: item.id!,
            produto_id: item.produto_id,
            produto_nome: item.produto?.nome || item.produto_nome || "Produto",
            quantidade_original: item.quantidade,
            quantidade_devolvida: item.devolvido || 0,
            quantidade_devolver: 0,
            preco_unitario: item.preco_unitario,
            subtotal: 0,
          };
        });

      console.log("🔍 Itens para devolução:", itens);
      setItensDevolucao(itens);
      setGerarCredito(true);
      setMotivo("");
      setErro("");
    }
  }, [isOpen, venda]);

  const handleQuantidadeChange = (index: number, valor: string) => {
    const novaQuantidade = parseInt(valor) || 0;
    const item = itensDevolucao[index];
    const maxQuantidade = item.quantidade_original - item.quantidade_devolvida;

    if (novaQuantidade < 0) return;
    if (novaQuantidade > maxQuantidade) return;

    const novosItens = [...itensDevolucao];
    novosItens[index].quantidade_devolver = novaQuantidade;
    novosItens[index].subtotal = novaQuantidade * item.preco_unitario;
    setItensDevolucao(novosItens);
  };

  const calcularTotal = () => {
    return itensDevolucao.reduce((total, item) => total + item.subtotal, 0);
  };

  const validarDevolucao = (): boolean => {
    const itensParaDevolver = itensDevolucao.filter(
      (item) => item.quantidade_devolver > 0
    );

    if (itensParaDevolver.length === 0) {
      setErro("Selecione ao menos um item para devolver");
      return false;
    }

    if (!motivo.trim()) {
      setErro("Informe o motivo da devolução");
      return false;
    }

    setErro("");
    return true;
  };

  const handleProcessar = async () => {
    if (!validarDevolucao() || !usuario) return;

    setLoading(true);
    try {
      const itensParaDevolver = itensDevolucao
        .filter((item) => item.quantidade_devolver > 0)
        .map((item) => ({
          item_venda_id: item.item_venda_id,
          produto_id: item.produto_id,
          quantidade: item.quantidade_devolver,
          preco_unitario: item.preco_unitario,
        }));

      console.log("📦 Itens para devolver:", itensParaDevolver);
      console.log(
        "📦 Primeiro item - item_venda_id:",
        itensParaDevolver[0]?.item_venda_id,
        "tipo:",
        typeof itensParaDevolver[0]?.item_venda_id
      );

      const resultado = await VendasService.processarDevolucao({
        venda_id: venda.id,
        itens: itensParaDevolver,
        gerar_credito: gerarCredito,
        motivo: motivo.trim(),
        usuario_id: usuario.id,
      });

      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Erro ao processar devolução:", error);
      setErro(error.message || "Erro ao processar devolução");
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PackageX className="w-5 h-5 text-danger" />
            <span>Processar Devolução</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            Venda #{venda.numero_venda} - {venda.cliente?.nome}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Informações da Venda */}
            <Card>
              <CardBody className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-500">Cliente</p>
                    <p className="font-semibold">{venda.cliente?.nome}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Valor Total</p>
                    <p className="font-semibold">
                      {formatarMoeda(venda.valor_total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Data da Venda</p>
                    <p className="font-semibold">
                      {new Date(venda.criado_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Loja</p>
                    <p className="font-semibold">{venda.loja?.nome}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Divider />

            {/* Itens para Devolução */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Selecione os itens para devolver
              </h3>

              <div className="space-y-3">
                {itensDevolucao.map((item, index) => {
                  const maxQuantidade =
                    item.quantidade_original - item.quantidade_devolvida;

                  return (
                    <Card key={item.item_venda_id}>
                      <CardBody className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{item.produto_nome}</p>
                            <div className="flex gap-4 text-sm text-default-500 mt-1">
                              <span>
                                Qtd. Original: {item.quantidade_original}
                              </span>
                              {item.quantidade_devolvida > 0 && (
                                <Chip color="warning" size="sm" variant="flat">
                                  Já devolvido: {item.quantidade_devolvida}
                                </Chip>
                              )}
                              <span>Disponível: {maxQuantidade}</span>
                              <span>
                                Preço: {formatarMoeda(item.preco_unitario)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              label="Qtd. Devolver"
                              value={item.quantidade_devolver.toString()}
                              onChange={(e) =>
                                handleQuantidadeChange(index, e.target.value)
                              }
                              min={0}
                              max={maxQuantidade}
                              className="w-32"
                              size="sm"
                            />

                            {item.quantidade_devolver > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-default-500">
                                  Subtotal
                                </p>
                                <p className="font-semibold text-danger">
                                  {formatarMoeda(item.subtotal)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Divider />

            {/* Valor Total da Devolução */}
            <Card className="bg-danger-50">
              <CardBody className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Valor Total da Devolução
                  </span>
                  <span className="text-2xl font-bold text-danger">
                    {formatarMoeda(calcularTotal())}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Opções */}
            <div className="space-y-6">
              <div className="">
                <Checkbox
                  isSelected={gerarCredito}
                  onValueChange={(checked) => {
                    if (
                      checked &&
                      !temPermissao("devolucoes.processar_creditos")
                    ) {
                      toast.error("Você não tem permissão para gerar créditos");
                      return;
                    }
                    setGerarCredito(checked);
                  }}
                  isDisabled={!temPermissao("devolucoes.processar_creditos")}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Gerar crédito para o cliente</span>
                  </div>
                  <p className="text-xs text-default-500 ml-6">
                    {gerarCredito
                      ? "O cliente poderá usar este crédito em compras futuras"
                      : temPermissao("devolucoes.processar_creditos")
                        ? "Nenhum crédito será gerado"
                        : "Você não tem permissão para gerar créditos"}
                  </p>
                </Checkbox>
              </div>

              <Textarea
                label="Motivo da Devolução"
                placeholder="Ex: Produto com defeito, insatisfação do cliente, etc."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                minRows={3}
                isRequired
                description="Descreva o motivo da devolução"
              />
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <Card className="bg-danger-50 border border-danger">
                <CardBody className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{erro}</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleProcessar}
            isLoading={loading}
            startContent={!loading && <CheckCircle2 className="w-4 h-4" />}
          >
            {loading ? "Processando..." : "Processar Devolução"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
