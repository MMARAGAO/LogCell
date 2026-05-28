"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Divider } from "@heroui/divider";
import { createBrowserClient } from "@supabase/ssr";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";
import { DescontoModal } from "@/components/vendas/DescontoModal";
import { CadastroClienteModal } from "./CadastroClienteModal";
import { CaixaService } from "@/services/caixaService";
import type { Aparelho } from "@/types/aparelhos";
import type { Cliente } from "@/types/clientesTecnicos";

interface NovaVendaModalProps {
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
  venda?: any;
}

export function NovaVendaModal({
  isOpen,
  onClose,
  venda,
}: NovaVendaModalProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { usuario } = useAuthContext();
  const toast = useToast();
  const { temPermissao } = usePermissoes();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Cliente
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );
  const [cadastroClienteAberto, setCadastroClienteAberto] = useState(false);
  const [buscandoClientes, setBuscandoClientes] = useState(false);

  // Loja
  const [lojas, setLojas] = useState<{ id: number; nome: string }[]>([]);
  const [lojaId, setLojaId] = useState<number>(0);
  const [lojasComCaixaAberto, setLojasComCaixaAberto] = useState<Set<number>>(
    new Set(),
  );

  // Aparelho do estoque
  const [aparelhosDisponiveis, setAparelhosDisponiveis] = useState<Aparelho[]>(
    [],
  );
  const [buscaAparelho, setBuscaAparelho] = useState("");
  const [aparelhoSelecionado, setAparelhoSelecionado] =
    useState<Aparelho | null>(null);

  const valorAparelho = aparelhoSelecionado?.valor_venda || 0;

  const [descontoInfo, setDescontoInfo] = useState<{
    tipo: "valor" | "percentual";
    valor: number;
    motivo: string;
  } | null>(null);
  const [descontoModalOpen, setDescontoModalOpen] = useState(false);

  const valorDescontoCalculado = (): number => {
    if (!descontoInfo) return 0;
    if (descontoInfo.tipo === "percentual") {
      return (valorAparelho * descontoInfo.valor) / 100;
    }

    return descontoInfo.valor;
  };

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
    setAparelhoSelecionado(null);
    setDescontoInfo(null);
    setDescontoModalOpen(false);
    carregarLojas();
  }, [isOpen]);

  // Preenche campos quando editando
  useEffect(() => {
    if (!isOpen || !venda) return;
    const preencher = async () => {
      // Cliente
      if (venda.cliente) {
        setClienteSelecionado(venda.cliente);
        setClienteBusca(venda.cliente.nome);
        setClientes([venda.cliente]);
      }

      // Aparelho
      setAparelhoSelecionado(venda);

      // Loja
      if (venda.loja_id) {
        setLojaId(venda.loja_id);
      }
    };

    preencher();
  }, [isOpen, venda]);

  // Busca de clientes com debounce
  useEffect(() => {
    if (!isOpen) return;
    if (!clienteBusca || clienteBusca.length < 2) {
      setClientes([]);

      return;
    }
    const timer = setTimeout(async () => {
      setBuscandoClientes(true);
      try {
        const termo = `%${clienteBusca}%`;
        const { data } = await supabase
          .from("clientes")
          .select("*")
          .eq("ativo", true)
          .or(`nome.ilike.${termo},telefone.ilike.${termo},doc.ilike.${termo}`)
          .limit(15)
          .order("nome");

        setClientes(data || []);
      } catch {
        setClientes([]);
      } finally {
        setBuscandoClientes(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [clienteBusca, isOpen]);

  async function carregarLojas() {
    const { data: lj } = await supabase
      .from("lojas")
      .select("id, nome")
      .order("nome");

    setLojas(lj || []);

    const lojasAbertas = new Set<number>();

    if (lj) {
      for (const loja of lj) {
        const caixa = await CaixaService.buscarCaixaAberto(loja.id);

        if (caixa) lojasAbertas.add(loja.id);
      }
    }
    // Em modo edição, sempre inclui a loja original da venda
    if (venda?.loja_id) lojasAbertas.add(venda.loja_id);
    setLojasComCaixaAberto(lojasAbertas);

    const primeiraAberta = lj?.find((l) => lojasAbertas.has(l.id));

    setLojaId(venda?.loja_id || primeiraAberta?.id || 0);
  }

  async function buscarAparelhos(loja: number) {
    if (!loja) return;
    const { data } = await supabase
      .from("aparelhos")
      .select("*")
      .eq("status", "disponivel")
      .eq("loja_id", loja)
      .order("criado_em", { ascending: false });

    setAparelhosDisponiveis(data || []);
  }

  useEffect(() => {
    if (lojaId) buscarAparelhos(lojaId);
  }, [lojaId]);

  const aparelhosFiltrados = aparelhosDisponiveis.filter((a) => {
    if (!buscaAparelho) return true;
    const b = buscaAparelho.toLowerCase();

    return (
      a.modelo?.toLowerCase().includes(b) ||
      a.marca?.toLowerCase().includes(b) ||
      a.imei?.includes(buscaAparelho)
    );
  });

  async function handleFinalizar() {
    console.log("[NovaVenda] handleFinalizar chamado", {
      aparelhoSelecionado,
      clienteSelecionado,
      lojaId,
      lojasComCaixaAberto: Array.from(lojasComCaixaAberto),
    });

    if (!aparelhoSelecionado) {
      console.warn("[NovaVenda] Nenhum aparelho selecionado");
      toast.error("Selecione um aparelho");

      return;
    }

    if (!lojaId || lojasComCaixaAberto.size === 0) {
      console.warn("[NovaVenda] Loja inválida ou caixa fechado", {
        lojaId,
        lojasComCaixaAberto: Array.from(lojasComCaixaAberto),
      });
      toast.error("Selecione uma loja com caixa aberto");

      return;
    }

    console.log("[NovaVenda] Iniciando criação da venda...");
    setLoading(true);
    try {
      const ehEdicao = !!venda;

      console.log("[NovaVenda] Modo:", ehEdicao ? "EDIÇÃO" : "CRIAÇÃO");

      if (ehEdicao) {
        // === EDIÇÃO ===
        const vendaId = venda.venda_id;

        console.log("[NovaVenda] Editando venda:", vendaId);

        const valorDescCalculado = valorDescontoCalculado();
        const valorComDesconto = valorAparelho - valorDescCalculado;

        const { error: vendaUpdateError } = await supabase
          .from("vendas")
          .update({
            cliente_id: clienteSelecionado?.id || null,
            loja_id: lojaId,
            status: "concluida",
            valor_total: valorComDesconto,
            valor_pago: valorComDesconto,
            valor_desconto: valorDescCalculado,
            saldo_devedor: 0,
          })
          .eq("id", vendaId);

        if (vendaUpdateError) {
          console.error(
            "[NovaVenda] Erro ao atualizar venda:",
            vendaUpdateError,
          );
          throw vendaUpdateError;
        }

        // Remove descontos anteriores e insere o novo
        if (descontoInfo) {
          await supabase
            .from("descontos_venda")
            .delete()
            .eq("venda_id", vendaId);
          await supabase.from("descontos_venda").insert({
            venda_id: vendaId,
            tipo: descontoInfo.tipo,
            valor: descontoInfo.valor,
            motivo: descontoInfo.motivo,
            aplicado_por: usuario?.id,
          });
        }

        console.log("[NovaVenda] Venda atualizada com sucesso");
        toast.success("Venda atualizada com sucesso!");
        onClose(true);
      } else {
        // === CRIAÇÃO ===
        const valorDescCalculado = valorDescontoCalculado();
        const valorComDesconto = valorAparelho - valorDescCalculado;

        const vendaData = {
          cliente_id: clienteSelecionado?.id || null,
          loja_id: lojaId,
          vendedor_id: usuario?.id,
          status: "concluida",
          tipo: "normal",
          valor_total: valorComDesconto,
          valor_pago: valorComDesconto,
          valor_desconto: valorDescCalculado,
          saldo_devedor: 0,
        };

        console.log("[NovaVenda] Dados da venda:", vendaData);

        const { data: vendaCriada, error: errVenda } = await supabase
          .from("vendas")
          .insert(vendaData)
          .select("id, numero_venda")
          .single();

        if (errVenda) {
          console.error("[NovaVenda] Erro ao inserir venda:", errVenda);
          throw errVenda;
        }

        if (!vendaCriada) {
          console.error("[NovaVenda] Venda criada mas sem retorno de dados");
          throw new Error("Erro ao criar venda: sem retorno");
        }

        console.log("[NovaVenda] Venda criada:", vendaCriada);

        // Inserir desconto na tabela descontos_venda (para relatórios)
        if (descontoInfo) {
          const { error: errDesc } = await supabase
            .from("descontos_venda")
            .insert({
              venda_id: vendaCriada.id,
              tipo: descontoInfo.tipo,
              valor: descontoInfo.valor,
              motivo: descontoInfo.motivo,
              aplicado_por: usuario?.id,
            });

          if (errDesc) {
            console.error("[NovaVenda] Erro ao inserir desconto:", errDesc);
          } else {
            await supabase.from("historico_vendas").insert({
              venda_id: vendaCriada.id,
              tipo_acao: "desconto",
              descricao: `Desconto aplicado: ${descontoInfo.tipo === "valor" ? `R$ ${descontoInfo.valor.toFixed(2)}` : `${descontoInfo.valor}%`} - ${descontoInfo.motivo}`,
              usuario_id: usuario?.id,
            });
          }
        }

        console.log("[NovaVenda] Atualizando status do aparelho...");
        const { error: errUpdate } = await supabase
          .from("aparelhos")
          .update({
            status: "vendido",
            venda_id: vendaCriada.id,
            data_venda: new Date().toISOString(),
            atualizado_por: usuario?.id,
          })
          .eq("id", aparelhoSelecionado.id);

        if (errUpdate) {
          console.error("[NovaVenda] Erro ao atualizar aparelho:", errUpdate);
        } else {
          console.log("[NovaVenda] Aparelho atualizado para vendido");
        }

        console.log("[NovaVenda] Inserindo histórico...");
        const { error: errHist } = await supabase
          .from("historico_aparelhos")
          .insert({
            aparelho_id: aparelhoSelecionado.id,
            tipo_acao: "vendido",
            descricao: `Venda #${vendaCriada.numero_venda} finalizada${clienteSelecionado ? ` — ${clienteSelecionado.nome}` : ""}`,
            dados_depois: { venda_id: vendaCriada.id, valor: valorAparelho },
            usuario_id: usuario?.id,
          });

        if (errHist) {
          console.error("[NovaVenda] Erro ao inserir histórico:", errHist);
        } else {
          console.log("[NovaVenda] Histórico inserido com sucesso");
        }

        console.log(
          "[NovaVenda] Venda finalizada com sucesso:",
          vendaCriada.numero_venda,
        );
        toast.success(
          `Venda #${vendaCriada.numero_venda} realizada com sucesso!`,
        );
        onClose(true);
      }
    } catch (err: any) {
      console.error("[NovaVenda] Erro capturado:", err);
      toast.error(err.message || "Erro ao cadastrar venda");
    } finally {
      console.log("[NovaVenda] Finalizando, setLoading(false)");
      setLoading(false);
    }
  }

  return (
    <>
      <Modal
        isDismissable={!descontoModalOpen}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={() => onClose()}
      >
        <ModalContent className="dark:bg-zinc-900">
          <ModalHeader className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Nova Venda
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Preencha os dados para realizar a venda
              </p>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 gap-6">
            {/* Step indicators */}
            <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
              <span
                className={`px-2 py-0.5 rounded-full ${step >= 1 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}
              >
                1. Cliente
              </span>
              <span className="text-gray-300">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${step >= 2 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}
              >
                2. Aparelho
              </span>
            </div>

            {/* 1. Cliente + Loja */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-gray-400" /> Cliente
              </p>
              <div className="flex gap-2">
                <Autocomplete
                  className="flex-1"
                  defaultItems={clientes}
                  inputValue={clienteBusca}
                  placeholder="Buscar cliente por nome, telefone ou CPF..."
                  selectedKey={clienteSelecionado?.id || null}
                  size="sm"
                  variant="bordered"
                  onInputChange={setClienteBusca}
                  onSelectionChange={(key) => {
                    const c = clientes.find((cl) => cl.id === key);

                    setClienteSelecionado(c || null);
                  }}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nome}>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.nome}</span>
                        {item.telefone && (
                          <span className="text-xs text-gray-500">
                            {item.telefone}
                          </span>
                        )}
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Button
                  className="rounded-xl"
                  size="sm"
                  variant="flat"
                  onPress={() => setCadastroClienteAberto(true)}
                >
                  <PlusIcon className="w-4 h-4" /> Novo
                </Button>
              </div>
              {clienteSelecionado && (
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {clienteSelecionado.nome}
                    </span>
                    {clienteSelecionado.telefone && (
                      <span className="text-gray-400 truncate">
                        {clienteSelecionado.telefone}
                      </span>
                    )}
                  </div>
                  <Button
                    className="rounded-lg shrink-0"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setClienteSelecionado(null);
                      setClienteBusca("");
                    }}
                  >
                    Remover cliente
                  </Button>
                </div>
              )}

              <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />{" "}
                Loja
              </p>
              <Select
                classNames={{
                  trigger:
                    "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
                }}
                description={
                  lojasComCaixaAberto.size === 0
                    ? "Nenhuma loja com caixa aberto"
                    : ""
                }
                disabledKeys={lojas
                  .filter((l) => !lojasComCaixaAberto.has(l.id))
                  .map((l) => String(l.id))}
                placeholder="Selecionar loja"
                selectedKeys={lojaId ? [String(lojaId)] : []}
                size="sm"
                variant="bordered"
                onSelectionChange={(keys) =>
                  setLojaId(Number(Array.from(keys)[0]) || 0)
                }
              >
                {lojas.map((l) => (
                  <SelectItem key={String(l.id)} textValue={l.nome}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{l.nome}</span>
                      {!lojasComCaixaAberto.has(l.id) && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
                          Caixa Fechado
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* 2. Aparelho */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />{" "}
                Aparelho do Estoque
              </p>
              <Input
                classNames={{
                  inputWrapper:
                    "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
                }}
                placeholder="Buscar por modelo ou IMEI..."
                size="sm"
                startContent={
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                }
                value={buscaAparelho}
                variant="bordered"
                onChange={(e) => setBuscaAparelho(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-100 dark:border-zinc-800 rounded-xl p-2">
                {aparelhosFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Nenhum aparelho disponível nesta loja
                  </p>
                ) : (
                  aparelhosFiltrados.map((a) => (
                    <button
                      key={a.id}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors ${
                        aparelhoSelecionado?.id === a.id
                          ? "bg-primary/5 border-primary/30 text-primary"
                          : "bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                      type="button"
                      onClick={() => setAparelhoSelecionado(a)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {a.marca} {a.modelo}
                          </p>
                          <p className="text-gray-400">
                            {a.imei
                              ? `IMEI: ${a.imei}`
                              : a.armazenamento
                                ? a.armazenamento
                                : ""}
                          </p>
                        </div>
                        <p className="font-bold">
                          {formatarMoeda(a.valor_venda || 0)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 7. Resumo */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 p-4 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Resumo da Venda
              </p>
              <div className="space-y-1.5 text-xs">
                {aparelhoSelecionado && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aparelho</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {aparelhoSelecionado.marca} {aparelhoSelecionado.modelo}
                    </span>
                  </div>
                )}
                {clienteSelecionado && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliente</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {clienteSelecionado.nome}
                    </span>
                  </div>
                )}
                {lojaId > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loja</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {lojas.find((l) => l.id === lojaId)?.nome || ""}
                    </span>
                  </div>
                )}
                <Divider className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">
                    Valor do Aparelho
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatarMoeda(valorAparelho)}
                  </span>
                </div>

                {temPermissao("vendas.aplicar_desconto") && (
                  <>
                    <div className="pt-2">
                      <Button
                        className="w-full"
                        color={descontoInfo ? "success" : "default"}
                        size="sm"
                        variant="flat"
                        onPress={() => setDescontoModalOpen(true)}
                      >
                        {descontoInfo ? "Alterar Desconto" : "Aplicar Desconto"}
                      </Button>
                    </div>

                    {descontoInfo && (
                      <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between text-xs text-success">
                          <span>
                            Desconto (
                            {descontoInfo.tipo === "percentual"
                              ? `${descontoInfo.valor}%`
                              : "R$"}
                            )
                          </span>
                          <span className="font-semibold">
                            - {formatarMoeda(valorDescontoCalculado())}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span>Valor Final</span>
                          <span className="text-primary">
                            {formatarMoeda(
                              valorAparelho - valorDescontoCalculado(),
                            )}
                          </span>
                        </div>
                        <Button
                          className="mt-1"
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => setDescontoInfo(null)}
                        >
                          Remover desconto
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-gray-100 dark:border-zinc-800">
            <Button
              className="rounded-xl text-sm font-medium"
              variant="flat"
              onPress={() => onClose()}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl text-sm font-medium"
              color="primary"
              isDisabled={
                !aparelhoSelecionado || lojasComCaixaAberto.size === 0
              }
              isLoading={loading}
              onPress={handleFinalizar}
            >
              Cadastrar Venda
            </Button>
          </ModalFooter>
        </ModalContent>

        <CadastroClienteModal
          isOpen={cadastroClienteAberto}
          onClose={(cliente) => {
            setCadastroClienteAberto(false);
            if (cliente) {
              setClienteSelecionado(cliente);
              setClientes([cliente]);
            }
          }}
        />
      </Modal>

      <DescontoModal
        isOpen={descontoModalOpen}
        valorTotal={valorAparelho}
        onAplicar={(tipo, valor, motivo) => {
          setDescontoInfo({ tipo, valor, motivo });
          setDescontoModalOpen(false);
        }}
        onClose={() => setDescontoModalOpen(false)}
      />
    </>
  );
}
