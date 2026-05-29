"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { createBrowserClient } from "@supabase/ssr";
import {
  DevicePhoneMobileIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";
import type { Aparelho, HistoricoAparelho } from "@/types/aparelhos";

interface Props {
  isOpen: boolean;
  aparelho: Aparelho;
  onClose: () => void;
}

const TIPO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
  credito_cliente: "Crédito Cliente",
  troca_aparelho: "Troca",
};

const ACAO_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  criacao: {
    label: "Criação",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: "●",
  },
  edicao: {
    label: "Edição",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: "✎",
  },
  vendido: {
    label: "Venda",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: "💰",
  },
  pagamento: {
    label: "Pagamento",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: "💳",
  },
  exclusao_pagamento: {
    label: "Pagamento Removido",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "🗑",
  },
  status: {
    label: "Status",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    icon: "↻",
  },
  devolucao: {
    label: "Devolução",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    icon: "↩",
  },
  transferencia: {
    label: "Transferência",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: "⇄",
  },
};

export function DetalhesAparelhoModal({ isOpen, aparelho, onClose }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [venda, setVenda] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [brindes, setBrindes] = useState<any[]>([]);
  const [trocas, setTrocas] = useState<any[]>([]);
  const [historico, setHistorico] = useState<HistoricoAparelho[]>([]);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (!isOpen || !aparelho.id) return;
    carregarDados();
  }, [isOpen, aparelho.id]);

  async function carregarDados() {
    // Carrega histórico do aparelho
    const { data: hist } = await supabase
      .from("historico_aparelhos")
      .select("*")
      .eq("aparelho_id", aparelho.id)
      .order("criado_em", { ascending: false });

    setHistorico(hist || []);

    // Se vendido, carrega venda + pagamentos
    if (aparelho.venda_id) {
      const { data: v } = await supabase
        .from("vendas")
        .select("*, cliente:clientes!vendas_cliente_id_fkey(nome, telefone)")
        .eq("id", aparelho.venda_id)
        .single();

      setVenda(v || null);

      if (v) {
        const { data: pags } = await supabase
          .from("pagamentos_venda")
          .select("*")
          .eq("venda_id", v.id);

        setPagamentos(pags || []);

        const { data: b } = await supabase
          .from("brindes_aparelhos")
          .select("*")
          .eq("venda_id", v.id);

        setBrindes(b || []);

        const trocaPattern = `%"venda_id":"${v.id}"%`;
        const { data: trocasDb } = await supabase
          .from("aparelhos")
          .select("*")
          .eq("marca", "Troca")
          .ilike("observacoes", trocaPattern);

        setTrocas(trocasDb || []);
      }
    }
  }

  const totalPago = pagamentos.reduce(
    (s: number, p: any) => s + (p.liquido ?? p.valor),
    0,
  );
  const custoBrindes = brindes.reduce(
    (s: number, b: any) => s + (b.valor_custo || 0),
    0,
  );
  const lucro = totalPago - (aparelho.valor_compra || 0) - custoBrindes;

  return (
    <Modal
      classNames={{ base: "dark:bg-zinc-900" }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent className="dark:bg-zinc-900">
        <ModalHeader className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {aparelho.marca} {aparelho.modelo}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Detalhes do Aparelho
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="py-4">
          <Tabs
            classNames={{
              tabList: "border-b border-gray-100 dark:border-zinc-800",
              cursor: "bg-primary",
              tab: "h-10",
              tabContent:
                "text-xs font-semibold text-gray-500 dark:text-gray-400 group-data-[selected=true]:text-primary",
            }}
            selectedKey={activeTab}
            variant="underlined"
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab
              key="info"
              title={
                <div className="flex items-center gap-1.5">
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                  <span>Informações</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Marca" value={aparelho.marca || "—"} />
                  <Field label="Modelo" value={aparelho.modelo || "—"} />
                  <Field mono label="IMEI" value={aparelho.imei || "—"} />
                  <Field
                    mono
                    label="Nº Série"
                    value={aparelho.numero_serie || "—"}
                  />
                  <Field label="Cor" value={aparelho.cor || "—"} />
                  <Field
                    label="Armazenamento"
                    value={aparelho.armazenamento || "—"}
                  />
                  <Field
                    label="Memória RAM"
                    value={aparelho.memoria_ram || "—"}
                  />
                  <Field
                    label="Bateria"
                    value={
                      aparelho.saude_bateria != null
                        ? `${aparelho.saude_bateria}%`
                        : "—"
                    }
                  />
                  <Field label="Estado" value={aparelho.estado || "—"} />
                  {aparelho.condicao && (
                    <Field label="Condição" value={aparelho.condicao} />
                  )}
                  <Field label="Status" value={aparelho.status || "—"} />
                  <Field
                    label="Valor Compra"
                    value={
                      aparelho.valor_compra
                        ? formatarMoeda(aparelho.valor_compra)
                        : "—"
                    }
                  />
                  <Field
                    label="Valor Venda"
                    value={
                      aparelho.valor_venda
                        ? formatarMoeda(aparelho.valor_venda)
                        : "—"
                    }
                  />
                </div>

                {aparelho.observacoes && (
                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {aparelho.observacoes}
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <p>
                    Criado em:{" "}
                    {new Date(aparelho.criado_em).toLocaleString("pt-BR")}
                  </p>
                  <p>
                    Atualizado em:{" "}
                    {new Date(aparelho.atualizado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </Tab>

            <Tab
              key="pagamentos"
              title={
                <div className="flex items-center gap-1.5">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>Pagamentos</span>
                  {pagamentos.length > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {pagamentos.length}
                    </span>
                  )}
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                {!aparelho.venda_id ? (
                  <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                    <CurrencyDollarIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Aparelho ainda não foi vendido</p>
                  </div>
                ) : venda ? (
                  <>
                    {/* Venda Info */}
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white">
                          Venda #{venda.numero_venda}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            venda.status === "concluida"
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : venda.status === "em_andamento"
                                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700"
                          }`}
                        >
                          {venda.status === "concluida"
                            ? "Concluída"
                            : venda.status === "em_andamento"
                              ? "Pendente"
                              : venda.status}
                        </span>
                      </div>
                      {venda.cliente && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cliente:{" "}
                          <span className="font-medium text-gray-800 dark:text-white">
                            {venda.cliente.nome}
                          </span>
                          {venda.cliente.telefone &&
                            ` • ${venda.cliente.telefone}`}
                        </p>
                      )}
                    </div>

                    {/* Lista pagamentos */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Pagamentos
                      </p>
                      {pagamentos.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Nenhum pagamento registrado
                        </p>
                      ) : (
                        pagamentos.map((p: any) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {TIPO_LABEL[p.tipo_pagamento] ||
                                  p.tipo_pagamento}
                              </p>
                              {p.tipo_pagamento === "troca_aparelho" && p.observacao && (
                                <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5">
                                  {(() => {
                                    try {
                                      const d = typeof p.observacao === "string"
                                        ? JSON.parse(p.observacao)
                                        : p.observacao;
                                      return [d.modelo, d.imei, d.cor, d.armazenamento].filter(Boolean).join(" · ");
                                    } catch { return p.observacao; }
                                  })()}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                {p.parcelas > 1 && <span>{p.parcelas}x</span>}
                                {p.taxa_percentual != null && (
                                  <span>
                                    Taxa {p.taxa_percentual.toFixed(2)}%
                                  </span>
                                )}
                                {p.liquido != null && (
                                  <span>Líq: {formatarMoeda(p.liquido)}</span>
                                )}
                                {p.editado && (
                                  <span className="text-amber-500">
                                    (editado)
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                              {formatarMoeda(p.valor)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Trocas */}
                    {trocas.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Aparelhos de Troca
                        </p>
                        {trocas.map((t: any) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {t.modelo}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                                {t.imei && (
                                  <span className="font-mono">
                                    IMEI: {t.imei}
                                  </span>
                                )}
                                {(() => {
                                  try {
                                    const o = JSON.parse(t.observacoes || "{}");

                                    return o.condicao ? (
                                      <span>Cond.: {o.condicao}</span>
                                    ) : null;
                                  } catch {
                                    return null;
                                  }
                                })()}
                                {t.cor && <span>Cor: {t.cor}</span>}
                                {t.armazenamento && (
                                  <span>Arm.: {t.armazenamento}</span>
                                )}
                                {t.saude_bateria != null && (
                                  <span>Bat.: {t.saude_bateria}%</span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300 shrink-0">
                              {formatarMoeda(t.valor_venda || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Brindes */}
                    {brindes.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Brindes
                        </p>
                        {brindes.map((b: any) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {b.descricao}
                            </span>
                            <span className="text-sm font-medium text-red-600">
                              {formatarMoeda(b.valor_custo || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Resumo */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Total Pago
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {formatarMoeda(totalPago)}
                        </span>
                      </div>
                      {custoBrindes > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            Custo Brindes
                          </span>
                          <span className="font-semibold text-red-600">
                            - {formatarMoeda(custoBrindes)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200 dark:border-zinc-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Lucro na Venda
                        </span>
                        <span
                          className={`font-semibold ${lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {formatarMoeda(lucro)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Carregando...</p>
                )}
              </div>
            </Tab>

            <Tab
              key="historico"
              title={
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  <span>Histórico</span>
                  {historico.length > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400">
                      {historico.length}
                    </span>
                  )}
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                {historico.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                    <ClockIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Nenhum evento registrado</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-3">
                    <div className="absolute left-2.5 top-1 bottom-0 w-px bg-gray-200 dark:bg-zinc-700" />
                    {historico.map((h) => {
                      const meta = ACAO_META[h.tipo_acao] || {
                        label: h.tipo_acao,
                        color: "bg-gray-100 text-gray-700",
                        icon: "●",
                      };

                      return (
                        <div key={h.id} className="relative">
                          <div
                            className={`absolute -left-4 top-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${meta.color.split(" ")[0]}`}
                          />
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.color}`}
                            >
                              {meta.icon} {meta.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(h.criado_em).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {h.descricao}
                          </p>
                          {h.dados_antes && h.dados_depois && (
                            <div className="mt-1 text-[11px] text-gray-400 space-x-2">
                              <span className="line-through">
                                {JSON.stringify(h.dados_antes)}
                              </span>
                              <span>→</span>
                              <span>{JSON.stringify(h.dados_depois)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-gray-800 dark:text-white ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
