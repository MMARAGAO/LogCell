"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Divider } from "@heroui/divider";
import { createBrowserClient } from "@supabase/ssr";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon, DevicePhoneMobileIcon, UserIcon, BuildingStorefrontIcon, CurrencyDollarIcon, GiftIcon, ShieldCheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { CadastroClienteModal } from "./CadastroClienteModal";
import { CaixaService } from "@/services/caixaService";
import type { Aparelho } from "@/types/aparelhos";
import type { Cliente } from "@/types/clientesTecnicos";

const TIPOS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

const GARANTIA_PADRAO = `PRAZO DE GARANTIA
A garantia concedida pela AUTORIZADA CELL é de 03 (três) meses, contados a partir da data da compra.

COBERTURA DA GARANTIA
A garantia cobre exclusivamente defeitos de funcionamento interno e de fabricação, desde que o aparelho seja utilizado em condições normais.

A GARANTIA NÃO COBRE
• Danos causados por mau uso, quedas, impactos ou contato com líquidos
• Oxidação, umidade ou surtos de energia
• Instalação de software não autorizado
• Danos causados por assistência técnica não autorizada
• Problemas estéticos ou desgaste natural pelo uso
• Danos decorrentes de uso de acessórios inadequados
• Perda ou bloqueio de IMEI por qualquer motivo externo

TERMOS DE GARANTIA
(1) A garantia somente será válida mediante a apresentação deste termo de garantia.
(2) A AUTORIZADA CELL oferece garantia conforme descrito neste documento, contada a partir da data de entrega do aparelho ao cliente.
(3) Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, curtos de energia ou instalação de software não autorizado serão excluídos da garantia.
(4) Brindes não estão sujeitos à garantia e devem ser testados e conferidos no ato da entrega.
(5) O cliente declara estar ciente de todas as informações e condições descritas neste documento.

CONDIÇÕES GERAIS
• Este termo comprova que a compra foi realizada junto à AUTORIZADA CELL.
• Para acionar a garantia, é obrigatória a apresentação deste termo.
• O prazo para análise do produto será informado no momento da solicitação.
• Caso seja constatado mau uso, será apresentado orçamento para reparo.

Declaro estar ciente e de acordo com todas as condições descritas neste termo.`;

interface PagamentoItem {
  tipo: string;
  valor: number;
  id?: string;
  existente?: boolean;
}

interface BrindeItem {
  descricao: string;
  valor: number;
}

interface NovaVendaModalProps {
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
  venda?: any;
}

export function NovaVendaModal({ isOpen, onClose, venda }: NovaVendaModalProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { usuario } = useAuthContext();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Cliente
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [cadastroClienteAberto, setCadastroClienteAberto] = useState(false);
  const [buscandoClientes, setBuscandoClientes] = useState(false);

  // Loja
  const [lojas, setLojas] = useState<{ id: number; nome: string }[]>([]);
  const [lojaId, setLojaId] = useState<number>(0);
  const [lojasComCaixaAberto, setLojasComCaixaAberto] = useState<Set<number>>(new Set());

  // Aparelho do estoque
  const [aparelhosDisponiveis, setAparelhosDisponiveis] = useState<Aparelho[]>([]);
  const [buscaAparelho, setBuscaAparelho] = useState("");
  const [aparelhoSelecionado, setAparelhoSelecionado] = useState<Aparelho | null>(null);

  // Trocas (múltiplos aparelhos)
  const [trocas, setTrocas] = useState<{ modelo: string; imei: string; condicao: string; bateria: string; cor: string; armazenamento: string; valor: number }[]>([]);
  const [mostrarFormTroca, setMostrarFormTroca] = useState(false);
  const [formTroca, setFormTroca] = useState({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
  const [trocaValorStr, setTrocaValorStr] = useState("");

  // Pagamentos
  const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([]);
  const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
  const [valorPagamento, setValorPagamento] = useState("");

  // Brindes
  const [brindes, setBrindes] = useState<BrindeItem[]>([]);
  const [descBrinde, setDescBrinde] = useState("");
  const [valorBrinde, setValorBrinde] = useState("");

  // Garantia
  const [diasGarantia, setDiasGarantia] = useState(90);
  const [mostrarGarantia, setMostrarGarantia] = useState(false);

  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const valorTroca = trocas.reduce((s, t) => s + (t.valor || 0), 0);
  const custoBrindes = brindes.reduce((s, b) => s + b.valor, 0);
  const valorAparelho = aparelhoSelecionado?.valor_venda || 0;

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
    setAparelhoSelecionado(null);
    setPagamentos([]);
    setBrindes([]);
    setTrocas([]);
    setFormTroca({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
    setTrocaValorStr("");
    setDiasGarantia(90);
    setMostrarFormTroca(false);
    setMostrarGarantia(false);
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

      // Pagamentos existentes (exceto troca)
      if (venda.venda_id) {
        const { data: pagamentosDB } = await supabase
          .from("pagamentos_venda")
          .select("*")
          .eq("venda_id", venda.venda_id);
        if (pagamentosDB) {
          setPagamentos(pagamentosDB
            .filter((p: any) => p.tipo_pagamento !== "troca_aparelho")
            .map((p: any) => ({
              tipo: p.tipo_pagamento,
              valor: p.liquido ?? p.valor,
              id: p.id,
              existente: true,
            })));
        }
      }

      // Trocas existentes
      if (venda.venda_id) {
        const trocaPattern = `%"venda_id":"${venda.venda_id}"%`;
        const { data: trocasDB } = await supabase
          .from("aparelhos")
          .select("*")
          .eq("marca", "Troca")
          .ilike("observacoes", trocaPattern);
        if (trocasDB && trocasDB.length > 0) {
          setTrocas(trocasDB.map((t: any) => {
            const obs = (() => { try { return JSON.parse(t.observacoes || "{}"); } catch { return {}; } })();
            return {
              modelo: t.modelo || "",
              imei: t.imei || "",
              condicao: obs.condicao || "",
              bateria: t.saude_bateria?.toString() || "",
              cor: t.cor || "",
              armazenamento: t.armazenamento || "",
              valor: t.valor_venda || 0,
            };
          }));
        }

      }

      // Garantia
      setDiasGarantia(venda.garantia_dias || 90);
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
    const { data: lj } = await supabase.from("lojas").select("id, nome").order("nome");
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

  const parseValor = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits ? parseInt(digits) / 100 : 0;
  };

  const formatValor = (val: number) =>
    val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    if (!aparelhoSelecionado) {
      toast.error("Selecione um aparelho");
      return;
    }
    if (!venda && totalPago <= 0 && valorTroca <= 0) {
      toast.error("Adicione pelo menos um pagamento ou troca");
      return;
    }
    setLoading(true);
    try {
      const totalPagoComTroca = totalPago + valorTroca;
      const ehEdicao = !!venda;

      if (ehEdicao) {
        // === EDIÇÃO ===
        const vendaId = venda.venda_id;
        const { error: vendaUpdateError } = await supabase.from("vendas").update({
          cliente_id: clienteSelecionado?.id || null,
          loja_id: lojaId,
          status: totalPagoComTroca >= valorAparelho ? "concluida" : "em_andamento",
          valor_total: valorAparelho,
          valor_pago: totalPagoComTroca,
          saldo_devedor: Math.max(0, valorAparelho - totalPagoComTroca),
        }).eq("id", vendaId);

        if (vendaUpdateError) {
          throw vendaUpdateError;
        }

        // Remove pagamentos antigos e insere novos
        await supabase.from("pagamentos_venda").delete().eq("venda_id", vendaId).neq("tipo_pagamento", "troca_aparelho");
        for (const pag of pagamentos) {
          await supabase.from("pagamentos_venda").insert({
            venda_id: vendaId, tipo_pagamento: pag.tipo, valor: pag.valor,
            data_pagamento: new Date().toISOString().split("T")[0], criado_por: usuario?.id,
          });
        }

        // Remove brindes antigos e insere novos
        await supabase.from("brindes_aparelhos").delete().eq("venda_id", vendaId);
        for (const b of brindes) {
          await supabase.from("brindes_aparelhos").insert({
            venda_id: vendaId, descricao: b.descricao, valor_custo: b.valor,
            loja_id: lojaId, criado_por: usuario?.id,
          });
        }

        // Sincroniza trocas: remove do estoque trocas sem pagamento
        const { data: trocaPagtos } = await supabase
          .from("pagamentos_venda")
          .select("id")
          .eq("venda_id", vendaId)
          .eq("tipo_pagamento", "troca_aparelho");
        const temPagtoTroca = (trocaPagtos?.length || 0) > 0;

        if (!temPagtoTroca) {
          const trocaPattern = `%"venda_id":"${vendaId}"%`;
          const { data: trocaDevices } = await supabase
            .from("aparelhos")
            .select("id")
            .eq("marca", "Troca")
            .ilike("observacoes", trocaPattern);
          if (trocaDevices && trocaDevices.length > 0) {
            await supabase.from("aparelhos").delete().in("id", trocaDevices.map((d: any) => d.id));
          }
        }

        toast.success("Venda atualizada com sucesso!");
        onClose(true);
      } else {
        // === CRIAÇÃO ===
        const vendaData = {
          cliente_id: clienteSelecionado?.id || null,
          loja_id: lojaId,
          vendedor_id: usuario?.id,
          status: totalPagoComTroca >= valorAparelho ? "concluida" : "em_andamento",
          tipo: "normal",
          valor_total: valorAparelho,
          valor_pago: totalPagoComTroca,
          valor_desconto: 0,
          saldo_devedor: Math.max(0, valorAparelho - totalPagoComTroca),
        };

        const { data: vendaCriada, error: errVenda } = await supabase
          .from("vendas")
          .insert(vendaData)
          .select("id, numero_venda")
          .single();

        if (errVenda || !vendaCriada) throw errVenda || new Error("Erro ao criar venda");

        await supabase
          .from("aparelhos")
          .update({ status: "vendido", venda_id: vendaCriada.id, data_venda: new Date().toISOString(), atualizado_por: usuario?.id })
          .eq("id", aparelhoSelecionado.id);

        for (const pag of pagamentos) {
          await supabase.from("pagamentos_venda").insert({
            venda_id: vendaCriada.id, tipo_pagamento: pag.tipo, valor: pag.valor,
            data_pagamento: new Date().toISOString().split("T")[0], criado_por: usuario?.id,
          });
        }

        for (const b of brindes) {
          await supabase.from("brindes_aparelhos").insert({
            venda_id: vendaCriada.id, descricao: b.descricao, valor_custo: b.valor,
            loja_id: lojaId, criado_por: usuario?.id,
          });
        }

        for (const t of trocas) {
          if (!t.modelo) continue;
          const { error: errA } = await supabase.from("aparelhos").insert({
            marca: "Troca", modelo: t.modelo, imei: t.imei || null, cor: t.cor || null,
            armazenamento: t.armazenamento || null, saude_bateria: t.bateria ? parseInt(t.bateria) : null,
            estado: "usado", condicao: null, valor_compra: 0, valor_venda: t.valor || 0,
            loja_id: lojaId, status: "disponivel", criado_por: usuario?.id,
            data_entrada: new Date().toISOString().split("T")[0],
            observacoes: JSON.stringify({ tipo: "troca", venda_id: vendaCriada.id, numero_venda: vendaCriada.numero_venda, condicao: t.condicao || null }),
          });
          if (errA) throw errA;

          if (t.valor > 0) {
            const { error: errP } = await supabase.from("pagamentos_venda").insert({
              venda_id: vendaCriada.id, tipo_pagamento: "troca_aparelho", valor: t.valor,
              data_pagamento: new Date().toISOString().split("T")[0], criado_por: usuario?.id,
            });
            if (errP) throw errP;
          }
        }

        const usuarioNome = usuario?.nome || "Sistema";
        await supabase.from("historico_aparelhos").insert({
          aparelho_id: aparelhoSelecionado.id,
          tipo_acao: "vendido",
          descricao: `Venda #${vendaCriada.numero_venda} finalizada${clienteSelecionado ? ` — ${clienteSelecionado.nome}` : ""}${diasGarantia > 0 ? `, garantia de ${diasGarantia} dias` : ""}${trocas.length > 0 ? `, ${trocas.length} troca(s)` : ""}`,
          dados_depois: { venda_id: vendaCriada.id, valor: valorAparelho, trocas: trocas.map((t) => t.modelo), garantia_dias: diasGarantia },
          usuario_id: usuario?.id,
        });

        toast.success(`Venda #${vendaCriada.numero_venda} realizada com sucesso!`);
        onClose(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao finalizar venda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} size="3xl" scrollBehavior="inside" onClose={() => onClose()}>
      <ModalContent className="dark:bg-zinc-900">
        <ModalHeader className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <CurrencyDollarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Nova Venda</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Preencha os dados para realizar a venda</p>
          </div>
        </ModalHeader>
        <ModalBody className="py-5 gap-6">
          {/* Step indicators */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
            <span className={`px-2 py-0.5 rounded-full ${step >= 1 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>1. Cliente</span>
            <span className="text-gray-300">→</span>
            <span className={`px-2 py-0.5 rounded-full ${step >= 2 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>2. Aparelho</span>
            <span className="text-gray-300">→</span>
            <span className={`px-2 py-0.5 rounded-full ${step >= 3 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>3. Pagamento</span>
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
                variant="bordered"
                size="sm"
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
                      {item.telefone && <span className="text-xs text-gray-500">{item.telefone}</span>}
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <Button size="sm" variant="flat" className="rounded-xl" onPress={() => setCadastroClienteAberto(true)}>
                <PlusIcon className="w-4 h-4" /> Novo
              </Button>
            </div>
            {clienteSelecionado && (
              <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{clienteSelecionado.nome}</span>
                  {clienteSelecionado.telefone && <span className="text-gray-400 truncate">{clienteSelecionado.telefone}</span>}
                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  className="rounded-lg shrink-0"
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
              <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" /> Loja
            </p>
            <Select
              placeholder="Selecionar loja"
              description={lojasComCaixaAberto.size === 0 ? "Nenhuma loja com caixa aberto" : ""}
              disabledKeys={lojas.filter((l) => !lojasComCaixaAberto.has(l.id)).map((l) => String(l.id))}
              selectedKeys={lojaId ? [String(lojaId)] : []}
              size="sm"
              variant="bordered"
              classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
              onSelectionChange={(keys) => setLojaId(Number(Array.from(keys)[0]) || 0)}
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
              <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" /> Aparelho do Estoque
            </p>
            <Input
              placeholder="Buscar por modelo ou IMEI..."
              size="sm"
              variant="bordered"
              classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
              value={buscaAparelho}
              onChange={(e) => setBuscaAparelho(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-100 dark:border-zinc-800 rounded-xl p-2">
              {aparelhosFiltrados.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Nenhum aparelho disponível nesta loja</p>
              ) : (
                aparelhosFiltrados.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors ${
                      aparelhoSelecionado?.id === a.id
                        ? "bg-primary/5 border-primary/30 text-primary"
                        : "bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                    onClick={() => setAparelhoSelecionado(a)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{a.marca} {a.modelo}</p>
                        <p className="text-gray-400">{a.imei ? `IMEI: ${a.imei}` : a.armazenamento ? a.armazenamento : ""}</p>
                      </div>
                      <p className="font-bold">{formatarMoeda(a.valor_venda || 0)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 3. Trocas (múltiplos aparelhos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" /> Aparelhos de Troca
              </p>
              {!mostrarFormTroca && (
                <Button size="sm" variant="flat" className="rounded-xl text-xs" onPress={() => setMostrarFormTroca(true)}>
                  <PlusIcon className="w-3.5 h-3.5" /> Adicionar
                </Button>
              )}
            </div>

            {trocas.length > 0 && (
              <div className="space-y-1.5">
                {trocas.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-800 dark:text-amber-300">{t.modelo}</p>
                      <p className="text-amber-600 dark:text-amber-400">{t.imei && `IMEI: ${t.imei}`}{t.condicao ? ` • ${t.condicao}` : ""}</p>
                    </div>
                    <span className="font-semibold text-amber-700 dark:text-amber-300 shrink-0">{formatarMoeda(t.valor)}</span>
                  </div>
                ))}
              </div>
            )}

            {mostrarFormTroca && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                <Input label="Modelo" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} value={formTroca.modelo} onChange={(e) => setFormTroca({ ...formTroca, modelo: e.target.value })} />
                <Input label="IMEI" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} value={formTroca.imei} onChange={(e) => setFormTroca({ ...formTroca, imei: e.target.value })} />
                <Input label="Condição" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} placeholder="Ex.: Bom, com marcas de uso" value={formTroca.condicao} onChange={(e) => setFormTroca({ ...formTroca, condicao: e.target.value })} />
                <Input label="Bateria %" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} value={formTroca.bateria} onChange={(e) => setFormTroca({ ...formTroca, bateria: e.target.value })} />
                <Input label="Cor" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} value={formTroca.cor} onChange={(e) => setFormTroca({ ...formTroca, cor: e.target.value })} />
                <Input label="Armazenamento" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }} value={formTroca.armazenamento} onChange={(e) => setFormTroca({ ...formTroca, armazenamento: e.target.value })} />
                <Input
                  label="Valor da Troca"
                  size="sm"
                  variant="bordered"
                  classNames={{ inputWrapper: "bg-white dark:bg-zinc-800" }}
                  startContent={<span className="text-xs text-gray-400">R$</span>}
                  value={trocaValorStr}
                  onChange={(e) => {
                    const v = parseValor(e.target.value);
                    setTrocaValorStr(e.target.value.replace(/[^0-9]/g, "") ? formatValor(v) : "");
                    setFormTroca({ ...formTroca, valor: v });
                  }}
                />
                <div className="col-span-2 flex justify-end gap-2">
                  <Button size="sm" variant="flat" className="rounded-xl text-xs" onPress={() => { setMostrarFormTroca(false); setFormTroca({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 }); setTrocaValorStr(""); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" color="primary" className="rounded-xl text-xs" onPress={() => {
                    if (!formTroca.modelo) { toast.warning("Informe o modelo"); return; }
                    setTrocas([...trocas, { ...formTroca }]);
    setFormTroca({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
                    setTrocaValorStr("");
                    setMostrarFormTroca(false);
                  }}>
                    <PlusIcon className="w-3.5 h-3.5" /> Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Pagamentos */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" /> Pagamentos
            </p>
            <div className="flex gap-2 items-start">
              <Select className="flex-1" placeholder="Tipo" selectedKeys={[tipoPagamento]} size="sm" variant="bordered" classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} onSelectionChange={(keys) => setTipoPagamento(Array.from(keys)[0] as string || "dinheiro")}>
                {TIPOS_PAGAMENTO.map((t) => <SelectItem key={t.value}>{t.label}</SelectItem>)}
              </Select>
              <Input className="flex-1" placeholder="0,00" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} startContent={<span className="text-xs text-gray-400">R$</span>} value={valorPagamento} onChange={(e) => setValorPagamento(e.target.value.replace(/[^0-9]/g, "") ? formatValor(parseValor(e.target.value)) : "")} />
              <Button isIconOnly color="primary" className="rounded-xl" onPress={() => {
                const v = parseValor(valorPagamento);
                if (!tipoPagamento || v <= 0) { toast.warning("Selecione tipo e valor"); return; }
                setPagamentos([...pagamentos, { tipo: tipoPagamento, valor: v }]);
                setValorPagamento("");
              }}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            {pagamentos.length > 0 && (
              <div className="space-y-1">
                {pagamentos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{TIPOS_PAGAMENTO.find((t) => t.value === p.tipo)?.label || p.tipo}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatarMoeda(p.valor)}</span>
                      <Button isIconOnly color="danger" size="sm" variant="light" className="rounded-lg" onPress={() => setPagamentos(pagamentos.filter((_, j) => j !== i))}>
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Brindes */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
              <GiftIcon className="w-4 h-4 text-gray-400" /> Brindes
            </p>
            <div className="flex gap-2 items-start">
              <Input className="flex-1" placeholder="Descrição do brinde" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={descBrinde} onChange={(e) => setDescBrinde(e.target.value)} />
              <Input className="w-24" placeholder="0,00" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} startContent={<span className="text-xs text-gray-400">R$</span>} value={valorBrinde} onChange={(e) => setValorBrinde(e.target.value.replace(/[^0-9]/g, "") ? formatValor(parseValor(e.target.value)) : "")} />
              <Button isIconOnly color="primary" className="rounded-xl" onPress={() => {
                if (!descBrinde) { toast.warning("Informe a descrição"); return; }
                const v = parseValor(valorBrinde);
                setBrindes([...brindes, { descricao: descBrinde, valor: v }]);
                setDescBrinde("");
                setValorBrinde("");
              }}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            {brindes.length > 0 && (
              <div className="space-y-1">
                {brindes.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs">
                    <span className="text-gray-700 dark:text-gray-300">{b.descricao}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">{formatarMoeda(b.valor)}</span>
                      <Button isIconOnly color="danger" size="sm" variant="light" className="rounded-lg" onPress={() => setBrindes(brindes.filter((_, j) => j !== i))}>
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Garantia */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400" /> Garantia
            </p>
            <div className="flex items-center gap-3">
              <Input className="w-32" label="Dias" size="sm" type="number" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={String(diasGarantia)} onChange={(e) => setDiasGarantia(parseInt(e.target.value) || 0)} min={0} />
              <Button size="sm" variant="flat" className="rounded-xl text-xs" startContent={<ClipboardDocumentListIcon className="w-4 h-4" />} onPress={() => setMostrarGarantia(!mostrarGarantia)}>
                {mostrarGarantia ? "Ocultar" : "Visualizar"} Termo
              </Button>
            </div>
            {mostrarGarantia && (
              <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-[11px] text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {GARANTIA_PADRAO
                  .replace("03 (três) meses", `${diasGarantia} dias`)
                  .replace("Vendedor Responsável: Matheus Mendes Neves", `Vendedor Responsável: ${usuario?.nome || "Sistema"}`)
                  .replace("25 /maio/2026", new Date().toLocaleDateString("pt-BR"))}
              </div>
            )}
          </div>

          {/* 7. Resumo */}
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Resumo da Venda</p>
            <div className="space-y-1.5 text-xs">
              {aparelhoSelecionado && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Aparelho</span>
                  <span className="font-medium text-gray-800 dark:text-white">{aparelhoSelecionado.marca} {aparelhoSelecionado.modelo}</span>
                </div>
              )}
              {clienteSelecionado && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-medium text-gray-800 dark:text-white">{clienteSelecionado.nome}</span>
                </div>
              )}
              {lojaId > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Loja</span>
                  <span className="font-medium text-gray-800 dark:text-white">{lojas.find((l) => l.id === lojaId)?.nome || ""}</span>
                </div>
              )}
              {trocas.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Troca(s) ({trocas.length})</span>
                  <span className="font-medium text-emerald-600">- {formatarMoeda(valorTroca)}</span>
                </div>
              )}
              <Divider className="my-1" />
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Valor do Aparelho</span>
                <span className="text-gray-900 dark:text-white">{formatarMoeda(valorAparelho)}</span>
              </div>
              {brindes.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Custo Brindes</span>
                  <span className="text-red-600">- {formatarMoeda(custoBrindes)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200 dark:border-zinc-700">
                <span className="text-gray-800 dark:text-white">Total a Pagar</span>
                <span className="text-primary">{formatarMoeda(valorAparelho - valorTroca)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Pago</span>
                <span className="font-semibold text-emerald-600">{formatarMoeda(totalPago + valorTroca)}</span>
              </div>
              {diasGarantia > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Garantia</span>
                  <span className="font-medium text-gray-800 dark:text-white">{diasGarantia} dias</span>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 dark:border-zinc-800">
          <Button variant="flat" className="rounded-xl text-sm font-medium" onPress={() => onClose()}>
            Cancelar
          </Button>
          <Button
            color="primary"
            className="rounded-xl text-sm font-medium"
            isLoading={loading}
             isDisabled={!aparelhoSelecionado || (!venda && totalPago <= 0 && valorTroca <= 0) || lojasComCaixaAberto.size === 0}
            onPress={handleFinalizar}
          >
            Finalizar Venda
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
  );
}
