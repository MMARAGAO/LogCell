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
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { CadastroClienteModal } from "./CadastroClienteModal";

import { useToast } from "@/components/Toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatarMoeda } from "@/lib/formatters";
import type { Aparelho } from "@/types/aparelhos";
import type { Cliente } from "@/types/clientesTecnicos";
import { buscarClientes } from "@/services/clienteService";
import { simularTaxaCartao } from "@/services/taxasCartaoService";

interface Pagamento {
  id?: string;
  tipo: string;
  valor: number;
  parcelas?: number;
  taxa?: number;
  liquido?: number;
  taxaInclusa?: boolean;
  existente?: boolean;
}

interface RecebimentoAparelhoModalProps {
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
  aparelho: Aparelho;
  lojaId?: number | null;
}

const TIPOS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export function RecebimentoAparelhoModal({
  isOpen,
  onClose,
  aparelho,
  lojaId,
}: RecebimentoAparelhoModalProps) {
  const { showToast } = useToast();
  const { usuario } = useAuthContext();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [clienteBusca, setClienteBusca] = useState<string>("");
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [tipoPagamento, setTipoPagamento] = useState<string>("dinheiro");
  const [valorPagamento, setValorPagamento] = useState<string>("");
  const [parcelas, setParcelas] = useState(1);
  const [taxaInclusa, setTaxaInclusa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cadastroClienteAberto, setCadastroClienteAberto] = useState(false);
  const [infoTaxa, setInfoTaxa] = useState<{
    taxa: number;
    liquido: number;
    bruto: number;
    parcelas: number;
  } | null>(null);
  const [brindes, setBrindes] = useState<{ descricao: string; valor: number }[]>([]);
  const [descricaoBrinde, setDescricaoBrinde] = useState("");
  const [valorBrinde, setValorBrinde] = useState("");
  const [editando, setEditando] = useState(false);
  const [carregandoPagamentos, setCarregandoPagamentos] = useState(false);
  const [pagamentosRemovidos, setPagamentosRemovidos] = useState<string[]>([]);
  const [removidosData, setRemovidosData] = useState<Record<string, Pagamento>>({});

  useEffect(() => {
    if (isOpen) {
      carregarClientes();
      setPagamentos([]);
      setClienteSelecionado("");
      setClienteBusca("");
      setValorPagamento("");
      setInfoTaxa(null);
      setParcelas(1);
      setTaxaInclusa(false);
      setBrindes([]);
      setDescricaoBrinde("");
      setValorBrinde("");
      setEditando(false);
      setPagamentosRemovidos([]);
      setRemovidosData({});

      if (aparelho.venda_id) {
        carregarPagamentosExistentes(aparelho.venda_id);
      }
    }
  }, [isOpen]);

  async function carregarPagamentosExistentes(vendaId: string) {
    setCarregandoPagamentos(true);
    setEditando(true);
    try {
      const supabase = (await import("@/lib/supabaseClient")).supabase;
      const { data: venda } = await supabase
        .from("vendas")
        .select("*")
        .eq("id", vendaId)
        .single();

      if (venda?.cliente_id) {
        setClienteSelecionado(venda.cliente_id);
      }

      const { data: pagamentosDB } = await supabase
        .from("pagamentos_venda")
        .select("*")
        .eq("venda_id", vendaId);

      if (pagamentosDB && pagamentosDB.length > 0) {
        setPagamentos(
          pagamentosDB.map((p: any) => ({
            id: p.id,
            tipo: p.tipo_pagamento,
            valor: p.valor,
            parcelas: p.parcelas || 1,
            taxa: p.taxa_percentual,
            liquido: p.liquido,
            existente: true,
          })),
        );
      }
    } catch {
      showToast("Erro ao carregar pagamentos existentes", "error");
    } finally {
      setCarregandoPagamentos(false);
    }
  }

  useEffect(() => {
    const valor = parseValor(valorPagamento);
    if (!valor || valor <= 0 || (tipoPagamento !== "cartao_credito" && tipoPagamento !== "cartao_debito")) {
      setInfoTaxa(null);
      return;
    }

    const forma = tipoPagamento === "cartao_credito" ? "cartao_credito" : "cartao_debito";
    const timer = setTimeout(async () => {
      try {
        const result = await simularTaxaCartao({
          valor_bruto: valor,
          tipo_produto: "aparelho",
          forma_pagamento: forma,
          parcelas: tipoPagamento === "cartao_credito" ? parcelas : 1,
          loja_id: lojaId,
          taxa_inclusa: taxaInclusa,
        });
        setInfoTaxa({
          taxa: result.taxa_percentual,
          liquido: result.valor_liquido,
          bruto: result.valor_bruto,
          parcelas: result.parcelas,
        });
      } catch {
        setInfoTaxa(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tipoPagamento, valorPagamento, parcelas, lojaId, taxaInclusa]);

  async function carregarClientes() {
    try {
      const pageSize = 1000;
      let page = 1;
      const acumulado: Cliente[] = [];

      while (true) {
        const { data, error, count } = await buscarClientes({ page, pageSize });

        if (error) throw new Error(error);

        if (data && data.length > 0) {
          acumulado.push(...data);
        }

        const total = count || 0;

        if (!data || data.length < pageSize || acumulado.length >= total) {
          break;
        }

        // Evita loop infinito em caso de count inconsistente
        if (page >= 50) break;
        page += 1;
      }

      setClientes(acumulado);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
      showToast(error.message || "Erro ao carregar clientes", "error");
    }
  }

  function parseValor(v: string) {
    if (!v) return 0;
    return parseFloat(v.replace(/\./g, '').replace(',', '.'));
  }

  async function adicionarPagamento() {
    if (!tipoPagamento || !valorPagamento) {
      showToast("Selecione tipo e valor do pagamento", "warning");

      return;
    }

    const valor = parseValor(valorPagamento);

    if (valor <= 0) {
      showToast("Valor deve ser maior que zero", "warning");

      return;
    }

    const ehCartao = tipoPagamento === "cartao_credito" || tipoPagamento === "cartao_debito";

    let taxa = infoTaxa?.taxa;
    let liquido = infoTaxa?.liquido;

    // Se for cartão e infoTaxa ainda não calculou (timing), calcula na hora
    if (ehCartao && !liquido) {
      try {
        const result = await simularTaxaCartao({
          valor_bruto: valor,
          tipo_produto: "aparelho",
          forma_pagamento: tipoPagamento as "cartao_credito" | "cartao_debito",
          parcelas: tipoPagamento === "cartao_credito" ? parcelas : 1,
          loja_id: lojaId,
          taxa_inclusa: taxaInclusa,
        });
        taxa = result.taxa_percentual;
        liquido = result.valor_liquido;
      } catch {
        // fallback: usa o próprio valor como líquido
        liquido = valor;
      }
    }

    setPagamentos([...pagamentos, {
      tipo: tipoPagamento,
      valor,
      parcelas: ehCartao ? parcelas : undefined,
      taxa,
      liquido,
      taxaInclusa: ehCartao ? taxaInclusa : undefined,
    }]);
    setValorPagamento("");
    setTipoPagamento("dinheiro");
    setInfoTaxa(null);
    setParcelas(1);
  }

  function removerPagamento(index: number) {
    const removido = pagamentos[index];
    if (removido?.id) {
      setPagamentosRemovidos((prev) => [...prev, removido.id!]);
      setRemovidosData((prev) => ({ ...prev, [removido.id!]: removido }));
    }
    setPagamentos(pagamentos.filter((_, i) => i !== index));
  }

  function adicionarBrinde() {
    if (!descricaoBrinde) {
      showToast("Informe a descrição do brinde", "warning");
      return;
    }
    const valor = parseValor(valorBrinde);
    if (valor <= 0) {
      showToast("Informe um valor válido para o brinde", "warning");
      return;
    }
    setBrindes([...brindes, { descricao: descricaoBrinde, valor }]);
    setDescricaoBrinde("");
    setValorBrinde("");
  }

  function removerBrinde(index: number) {
    setBrindes(brindes.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!clienteSelecionado) {
      showToast("Selecione um cliente", "warning");
      return;
    }

    if (pagamentos.length === 0 && pagamentosRemovidos.length === 0) {
      showToast("Adicione pelo menos um pagamento", "warning");
      return;
    }

    const totalPago = pagamentos.reduce((sum, p) => sum + (p.liquido ?? p.valor), 0);

    if (totalPago <= 0) {
      showToast("Valor total deve ser maior que zero", "warning");
      return;
    }

    const custoBrindes = brindes.reduce((s, b) => s + b.valor, 0);

    try {
      setLoading(true);
      const supabase = (await import("@/lib/supabaseClient")).supabase;

      if (editando && aparelho.venda_id) {
        const vendaId = aparelho.venda_id;

        // Remove pagamentos marcados para exclusão
        for (const pagId of pagamentosRemovidos) {
          const removido = removidosData[pagId];
          await supabase.from("pagamentos_venda").delete().eq("id", pagId);
          await supabase.from("historico_aparelhos").insert({
            aparelho_id: aparelho.id,
            tipo_acao: "exclusao_pagamento",
            descricao: `Pagamento${removido ? ` de ${formatarMoeda(removido.valor)} (${removido.tipo})` : ""} removido`,
            dados_antes: removido ? { valor: removido.valor, tipo: removido.tipo, parcelas: removido.parcelas } : null,
            usuario_id: usuario?.id,
          });
        }

        // Adiciona novos pagamentos
        const novos = pagamentos.filter((p) => !p.existente);
        for (const pag of novos) {
          await supabase.from("pagamentos_venda").insert({
            venda_id: vendaId,
            tipo_pagamento: pag.tipo,
            valor: pag.valor,
            parcelas: pag.parcelas || 1,
            liquido: pag.liquido || null,
            taxa_percentual: pag.taxa || null,
            data_pagamento: new Date().toISOString().split("T")[0],
            criado_por: usuario?.id,
          });
          await supabase.from("historico_aparelhos").insert({
            aparelho_id: aparelho.id,
            tipo_acao: "pagamento",
            descricao: `Pagamento de ${formatarMoeda(pag.valor)} adicionado via ${pag.tipo}${pag.parcelas && pag.parcelas > 1 ? ` (${pag.parcelas}x)` : ""}`,
            dados_depois: { valor: pag.valor, tipo: pag.tipo, parcelas: pag.parcelas },
            usuario_id: usuario?.id,
          });
        }

        // Recalcula totais
        const { data: todosPagamentos } = await supabase
          .from("pagamentos_venda")
          .select("valor, liquido")
          .eq("venda_id", vendaId);

        const novoTotalPago = todosPagamentos?.reduce((s, p: any) => s + (p.liquido ?? p.valor), 0) || 0;
        const novoSaldo = Math.max(0, (aparelho.valor_venda || 0) - novoTotalPago);
        const novoStatus = novoSaldo <= 0 ? "concluida" : "em_andamento";

        await supabase.from("vendas").update({
          valor_pago: novoTotalPago,
          saldo_devedor: novoSaldo,
          status: novoStatus,
          atualizado_em: new Date().toISOString(),
        }).eq("id", vendaId);
      } else {
        const res = await fetch("/api/aparelhos/pagamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aparelhoId: aparelho.id,
            clienteId: clienteSelecionado,
            lojaId: lojaId || 1,
            valorVenda: aparelho.valor_venda || 0,
            pagamentos: pagamentos.map((p) => ({
              tipo_pagamento: p.tipo,
              valor: p.valor,
              parcelas: p.parcelas,
              liquido: p.liquido,
              taxa: p.taxa,
            })),
            brindes: brindes.map((b) => ({
              descricao: b.descricao,
              valor: b.valor,
            })),
            usuarioId: usuario?.id || "",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Registra histórico da venda
        await supabase.from("historico_aparelhos").insert({
          aparelho_id: aparelho.id,
          tipo_acao: "vendido",
          descricao: `Aparelho vendido por ${formatarMoeda(aparelho.valor_venda || 0)} — ${pagamentos.length} pagamento(s)`,
          dados_depois: { venda_id: data.vendaId, valor: aparelho.valor_venda, pagamentos: pagamentos.length },
          usuario_id: usuario?.id,
        });
      }

      showToast(editando ? "Pagamentos atualizados com sucesso" : "Pagamento registrado com sucesso", "success");
      onClose(true);
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      showToast(error.message || "Erro ao registrar pagamento", "error");
    } finally {
      setLoading(false);
    }
  }

  const totalPago = pagamentos.reduce((sum, p) => sum + (p.liquido ?? p.valor), 0);
  const custoBrindes = brindes.reduce((s, b) => s + b.valor, 0);

  return (
    <>
      <Modal isOpen={isOpen} size="5xl" scrollBehavior="outside" onClose={() => onClose()} classNames={{ base: "dark:bg-zinc-900" }}>
        <ModalContent className="dark:bg-zinc-900">
          <ModalHeader className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Receber Pagamento — {aparelho.marca} {aparelho.modelo}
            </span>
          </ModalHeader>
          <ModalBody className="gap-5 py-5">
            {/* Aparelho Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Aparelho</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {aparelho.marca} {aparelho.modelo}
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatarMoeda(aparelho.valor_venda || 0)}
              </p>
            </div>

            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-800 dark:text-white">Cliente</p>
                <Button
                  size="sm"
                  className="text-xs rounded-xl font-medium"
                  startContent={<PlusIcon className="w-3.5 h-3.5" />}
                  variant="light"
                  onPress={() => setCadastroClienteAberto(true)}
                >
                  Novo Cliente
                </Button>
              </div>
              <Autocomplete
                isClearable
                defaultItems={clientes}
                inputValue={clienteBusca}
                placeholder="Digite para buscar"
                selectedKey={clienteSelecionado}
                variant="bordered"
                onInputChange={setClienteBusca}
                onSelectionChange={(key) =>
                  setClienteSelecionado((key as string) || "")
                }
              >
                {(item) => (
                  <AutocompleteItem key={item.id} textValue={item.nome}>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.nome}</span>
                      {item.doc ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.doc}
                        </span>
                      ) : null}
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            {/* Adicionar Pagamentos */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Formas de Pagamento</p>
              <div className="flex gap-2 items-start flex-wrap">
                <Select
                  className="flex-1 min-w-[120px]"
                  placeholder="Tipo"
                  selectedKeys={[tipoPagamento]}
                  size="sm"
                  variant="bordered"
                  classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
                  onSelectionChange={(keys) => {
                    setTipoPagamento(Array.from(keys)[0] as string);
                    setInfoTaxa(null);
                  }}
                >
                  {TIPOS_PAGAMENTO.map((tipo) => (
                    <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </Select>
                {(tipoPagamento === "cartao_credito" || tipoPagamento === "cartao_debito") && (
                  <Select
                    className="flex-1 min-w-[120px]"
                    placeholder="Taxa inclusa?"
                    selectedKeys={[taxaInclusa ? "sim" : "nao"]}
                    size="sm"
                    variant="bordered"
                    classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
                    onSelectionChange={(keys) => {
                      setTaxaInclusa(Array.from(keys)[0] === "sim");
                    }}
                  >
                    <SelectItem key="nao">Taxa à parte</SelectItem>
                    <SelectItem key="sim">Taxa inclusa</SelectItem>
                  </Select>
                )}
                {tipoPagamento === "cartao_credito" && (
                  <Select
                    className="flex-1 min-w-[100px]"
                    placeholder="Parcelas"
                    selectedKeys={[String(parcelas)]}
                    size="sm"
                    variant="bordered"
                    classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
                    onSelectionChange={(keys) =>
                      setParcelas(parseInt(Array.from(keys)[0] as string) || 1)
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={String(i + 1)}>
                        {i === 0 ? "À vista" : `${i + 1}x`}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <Input
                  className="flex-1 min-w-[140px]"
                  placeholder="0,00"
                  size="sm"
                  variant="bordered"
                  classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}
                  startContent={
                    <span className="text-xs text-gray-400 dark:text-gray-500">R$</span>
                  }
                  type="text"
                  value={valorPagamento}
                  onValueChange={(val) => {
                    const digits = val.replace(/\D/g, '');
                    if (!digits) {
                      setValorPagamento('');
                      return;
                    }
                    const formatted = (parseInt(digits) / 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    setValorPagamento(formatted);
                  }}
                />
                <Button isIconOnly color="primary" className="rounded-xl" onPress={adicionarPagamento}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              {infoTaxa && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Taxa: <strong className="text-red-600 dark:text-red-400">{infoTaxa.taxa.toFixed(2)}%</strong>
                  </span>
                  {!taxaInclusa && (
                    <span className="text-gray-600 dark:text-gray-400">
                      Valor bruto: <strong className="text-gray-800 dark:text-white">{formatarMoeda(infoTaxa.bruto)}</strong>
                    </span>
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    Líquido: <strong className="text-emerald-600 dark:text-emerald-400">{formatarMoeda(infoTaxa.liquido)}</strong>
                  </span>
                  {!taxaInclusa && infoTaxa.parcelas > 1 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      Parcela: <strong className="text-gray-800 dark:text-white">{formatarMoeda(infoTaxa.bruto / infoTaxa.parcelas)} x {infoTaxa.parcelas}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Brindes */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Brindes</p>
              <div className="flex gap-2 items-start">
                <Input
                  className="flex-1"
                  placeholder="Descrição do brinde"
                  type="text"
                  size="sm"
                  variant="bordered"
                  classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }}  value={descricaoBrinde}
                  onValueChange={setDescricaoBrinde}
                />
                <Input
                  className="w-40"
                  placeholder="0,00"
                  startContent={<span className="text-xs text-default-400">R$</span>}
                  type="text"
                  value={valorBrinde}
                  onValueChange={(val) => {
                    const digits = val.replace(/\D/g, '');
                    if (!digits) { setValorBrinde(''); return; }
                    setValorBrinde((parseInt(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                  }}
                />
                <Button isIconOnly color="primary" className="rounded-xl" onPress={adicionarBrinde}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              {brindes.length > 0 && (
                <div className="space-y-1.5">
                  {brindes.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-700">
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{b.descricao}</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">{formatarMoeda(b.valor)}</span>
                      <Button isIconOnly color="danger" size="sm" variant="light" className="rounded-lg" onPress={() => removerBrinde(idx)}>
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagamentos Adicionados */}
            {pagamentos.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">Pagamentos Adicionados</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400">
                    {pagamentos.length}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800/50">
                        <th className="py-2.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                        <th className="py-2.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                        <th className="py-2.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Detalhes</th>
                        <th className="py-2.5 px-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagamentos.map((pag, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-2.5 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {TIPOS_PAGAMENTO.find((t) => t.value === pag.tipo)?.label}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-medium text-gray-800 dark:text-white">{formatarMoeda(pag.valor)}</td>
                          <td className="py-2.5 px-4">
                            <div className="text-[11px] leading-tight space-y-0.5">
                              {pag.tipo === "cartao_credito" && pag.parcelas && (
                                <span className="text-gray-500 dark:text-gray-400">{pag.parcelas}x </span>
                              )}
                              {pag.taxaInclusa !== undefined && (
                                <span className="text-gray-400 dark:text-gray-500">{pag.taxaInclusa ? "Taxa inclusa" : "Taxa à parte"} </span>
                              )}
                              {pag.taxa != null && (
                                <span className="text-red-500">{pag.taxa.toFixed(2)}% </span>
                              )}
                              {pag.liquido != null && (
                                <span className="text-emerald-600 dark:text-emerald-400">Receber: {formatarMoeda(pag.liquido)}</span>
                              )}
                              {pag.taxa == null && pag.liquido == null && (
                                <span className="text-gray-400 dark:text-gray-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <Button isIconOnly color="danger" size="sm" variant="light" className="rounded-lg" onPress={() => removerPagamento(idx)}>
                              <TrashIcon className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumo */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Total Pago:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatarMoeda(totalPago)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Saldo Restante:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatarMoeda(0)}</span>
                  </div>
                  {custoBrindes > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Custo Brindes:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">- {formatarMoeda(custoBrindes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs pt-1.5 border-t border-gray-100 dark:border-zinc-800">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Lucro na Venda:</span>
                    <span className={`font-semibold ${
                      totalPago - (aparelho.valor_compra || 0) - custoBrindes >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatarMoeda(totalPago - (aparelho.valor_compra || 0) - custoBrindes)}
                    </span>
                  </div>
                </div>
              </div>
            )}


          </ModalBody>
          <Divider className="bg-gray-100 dark:bg-zinc-800" />
          <ModalFooter>
            <Button color="default" variant="flat" className="rounded-xl text-sm font-medium" onPress={() => onClose()}>
              Cancelar
            </Button>
            <Button
              color="primary"
              className="rounded-xl text-sm font-medium"
              isDisabled={pagamentos.length === 0 || !clienteSelecionado}
              isLoading={loading}
              onPress={handleSubmit}
            >
              Registrar Pagamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Cadastro Rápido */}
      <CadastroClienteModal
        isOpen={cadastroClienteAberto}
        onClose={async (cliente) => {
          setCadastroClienteAberto(false);
          if (cliente) {
            setClienteSelecionado(cliente.id);
            await carregarClientes();
          }
        }}
      />
    </>
  );
}
