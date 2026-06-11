"use client";

import type { DadosDashboard } from "@/types/dashboard";
import type { ReactNode } from "react";

import {
  BriefcaseIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";

import { MetricCard, type MetricTone } from "./MetricCard";

interface OperacaoSectionProps {
  dados: DadosDashboard | null;
  loading?: boolean;
}

const num = (v: number | undefined | null) => Number(v || 0);

function SubTitulo({ titulo, hint }: { titulo: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-default-600">
        {titulo}
      </h3>
      {hint ? <span className="text-xs text-default-400">{hint}</span> : null}
    </div>
  );
}

function OsTipoCard({
  nome,
  icon,
  pagas,
  faturamento,
  lucro,
  loading,
}: {
  nome: string;
  icon: ReactNode;
  pagas: number;
  faturamento: number;
  lucro: number;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100 text-default-500 text-sm">
          {icon}
        </span>
        <span className="text-sm font-semibold text-foreground">{nome}</span>
        <span className="ml-auto text-xs text-default-400">
          {loading ? "…" : `${pagas} paga(s)`}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-default-400">
            Faturamento
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {loading ? "…" : formatarMoeda(faturamento)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-default-400">
            Lucro
          </p>
          <p className="text-lg font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
            {loading ? "…" : formatarMoeda(lucro)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function OperacaoSection({
  dados,
  loading = false,
}: OperacaoSectionProps) {
  const m = dados?.metricas_adicionais;
  const rc = dados?.resumo_caixa;

  const saldo = num(rc?.saldo_final);
  const saldoTone: MetricTone = saldo >= 0 ? "success" : "danger";

  return (
    <div className="space-y-6">
      {/* OS por tipo de cliente */}
      <section className="space-y-3">
        <SubTitulo hint="Pagas no período" titulo="OS por tipo de cliente" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OsTipoCard
            faturamento={num(m?.os_consumidor_final_faturamento)}
            icon={<UsersIcon className="h-5 w-5" />}
            loading={loading}
            lucro={num(m?.os_consumidor_final_lucro)}
            nome="Consumidor final"
            pagas={num(m?.os_consumidor_final_pagas)}
          />
          <OsTipoCard
            faturamento={num(m?.os_lojista_faturamento)}
            icon={<BriefcaseIcon className="h-5 w-5" />}
            loading={loading}
            lucro={num(m?.os_lojista_lucro)}
            nome="Lojista"
            pagas={num(m?.os_lojista_pagas)}
          />
        </div>
      </section>

      {/* Resumo de Caixa do período */}
      <section className="space-y-3">
        <SubTitulo hint="No período" titulo="Resumo de caixa" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            footnote="Entradas no período"
            icon={<ArrowUpIcon className="h-5 w-5" />}
            label="Entradas"
            loading={loading}
            tone="success"
            value={formatarMoeda(num(rc?.total_entradas))}
          />
          <MetricCard
            footnote="Sangrias + saídas"
            icon={<ArrowDownIcon className="h-5 w-5" />}
            label="Saídas"
            loading={loading}
            tone="warning"
            value={formatarMoeda(
              num(rc?.total_saidas) + num(rc?.total_sangrias),
            )}
          />
          <MetricCard
            footnote="Devoluções no período"
            icon={<ArrowUturnLeftIcon className="h-5 w-5" />}
            label="Devoluções"
            loading={loading}
            tone="danger"
            value={formatarMoeda(num(rc?.total_devolucoes))}
          />
          <MetricCard
            emphasis
            footnote="Saldo do período (sem saldo inicial)"
            icon={<WalletIcon className="h-5 w-5" />}
            label="Saldo do período"
            loading={loading}
            tone={saldoTone}
            value={formatarMoeda(saldo)}
          />
        </div>
      </section>

      {/* Transferências */}
      <section className="space-y-3">
        <SubTitulo titulo="Transferências" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            footnote="Transferências no período"
            icon={<ArrowsRightLeftIcon className="h-5 w-5" />}
            label="Total de transferências"
            loading={loading}
            tone="primary"
            value={num(m?.total_transferencias).toLocaleString("pt-BR")}
          />
          <MetricCard
            emphasis={num(m?.transferencias_pendentes) > 0}
            footnote="Aguardando recebimento"
            icon={<ArrowsRightLeftIcon className="h-5 w-5" />}
            label="Transferências pendentes"
            loading={loading}
            tone="warning"
            value={num(m?.transferencias_pendentes).toLocaleString("pt-BR")}
          />
        </div>
      </section>

      {/* Quebras, créditos e devoluções */}
      <section className="space-y-3">
        <SubTitulo titulo="Quebras, créditos e devoluções" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            emphasis={num(m?.total_quebras) > 0}
            footnote={`${num(m?.quantidade_quebras)} quebra(s)`}
            icon={<ExclamationTriangleIcon className="h-5 w-5" />}
            label="Quebra de peças"
            loading={loading}
            tone="danger"
            value={formatarMoeda(num(m?.total_quebras))}
          />
          <MetricCard
            footnote="Saldo disponível dos clientes"
            icon={<CreditCardIcon className="h-5 w-5" />}
            label="Crédito de cliente"
            loading={loading}
            tone="primary"
            value={formatarMoeda(num(m?.total_creditos_cliente))}
          />
          <MetricCard
            footnote={`${num(m?.devolucoes_com_credito_quantidade)} devolução(ões)`}
            icon={<ArrowUturnLeftIcon className="h-5 w-5" />}
            label="Devoluções c/ crédito"
            loading={loading}
            tone="warning"
            value={formatarMoeda(num(m?.devolucoes_com_credito_total))}
          />
          <MetricCard
            footnote={`${num(m?.devolucoes_sem_credito_quantidade)} devolução(ões)`}
            icon={<ArrowUturnLeftIcon className="h-5 w-5" />}
            label="Devoluções s/ crédito"
            loading={loading}
            tone="danger"
            value={formatarMoeda(num(m?.devolucoes_sem_credito_total))}
          />
        </div>
      </section>
    </div>
  );
}
