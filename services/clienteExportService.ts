import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";
import { buscarAnalyticsCliente } from "./clienteAnalyticsService";
import type { Cliente } from "@/types/clientesTecnicos";

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString("pt-BR");
}

const COLUNAS_MOEDA = new Set([
  "Total Gasto",
  "Total Pago",
  "Saldo Devedor",
  "Ticket Médio",
  "Créditos",
  "PIX",
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
  "Boleto",
  "Credito Cliente",
  "Troca",
  "Valor Total Serviços",
  "Lucro Estimado",
]);

export async function exportarAnalyticsClientes(
  clientes: Cliente[],
): Promise<Blob> {
  // Carregar nomes das lojas uma única vez
  const { data: lojasData } = await supabase.from("lojas").select("id, nome");
  const lojasMap = new Map((lojasData || []).map((l: any) => [l.id, l.nome]));

  const linhas: Record<string, any>[] = [];

  for (const cliente of clientes) {
    try {
      const analytics = await buscarAnalyticsCliente(cliente.id);
      const r = analytics.resumo;

      const pagamentosMap: Record<string, number> = {};

      for (const p of analytics.pagamentosPorTipo) {
        pagamentosMap[p.tipo] = p.valor;
      }

      const frequencia =
        r.totalVendas > 1 && r.diasRelacionamento
          ? Math.round(r.diasRelacionamento / (r.totalVendas - 1))
          : null;

      const churnRisk =
        r.diasDesdeUltimaCompra == null
          ? "⚪ Sem dados"
          : r.diasDesdeUltimaCompra > 90
            ? "🔴 Alto"
            : r.diasDesdeUltimaCompra > 30
              ? "🟡 Médio"
              : "🟢 Baixo";

      const segmento =
        r.totalVendas === 0
          ? "🆕 Sem compras"
          : r.totalGasto >= 20000
            ? "🏆 VIP"
            : (r.totalVendas >= 5 || r.totalAparelhos >= 5) &&
                (r.diasDesdeUltimaCompra == null ||
                  r.diasDesdeUltimaCompra < 60)
              ? "💎 Fiel"
              : r.diasDesdeUltimaCompra != null && r.diasDesdeUltimaCompra >= 90
                ? "💤 Perdido"
                : r.totalVendas === 1 &&
                    r.diasRelacionamento != null &&
                    r.diasRelacionamento < 30
                  ? "🆕 Novo"
                  : "👋 Regular";

      linhas.push({
        Cliente: cliente.nome,
        Telefone: cliente.telefone || "—",
        Status: cliente.ativo ? "Ativo" : "Inativo",
        Loja: lojasMap.get(cliente.id_loja || 0) || "—",
        "Cliente Desde": cliente.criado_em
          ? formatarData(cliente.criado_em)
          : "—",
        "Total Vendas": r.totalVendas,
        "Total Gasto": r.totalGasto,
        "Total Pago": r.totalPago,
        "Saldo Devedor": r.saldoDevedor,
        "Ticket Médio": r.ticketMedio,
        "Lucro Estimado": r.totalPago - r.totalServicosValor,
        "Primeira Compra": r.primeiraCompra
          ? formatarData(r.primeiraCompra)
          : "—",
        "Dias Relacionamento": r.diasRelacionamento ?? "—",
        "Frequência (dias)": frequencia ?? "—",
        "Última Compra": r.ultimaCompra ? formatarData(r.ultimaCompra) : "—",
        "Dias Inativo": r.diasDesdeUltimaCompra ?? "—",
        "Churn Risk": churnRisk,
        Segmento: segmento,
        "Aparelhos Comprados": r.totalAparelhos,
        "Serviços Realizados": r.totalServicos,
        "Valor Total Serviços": r.totalServicosValor,
        "Produto Favorito": analytics.produtoFavorito || "—",
        "Vendedor Preferido": analytics.vendedorPreferidoNome || "—",
        "Loja Preferida": analytics.lojaPreferidaNome || "—",
        Créditos: analytics.creditos,
        PIX: pagamentosMap["PIX"] || 0,
        Dinheiro: pagamentosMap["Dinheiro"] || 0,
        "Cartão de Crédito": pagamentosMap["Cartão de Crédito"] || 0,
        "Cartão de Débito": pagamentosMap["Cartão de Débito"] || 0,
        Transferência: pagamentosMap["Transferência"] || 0,
        Boleto: pagamentosMap["Boleto"] || 0,
        "Credito Cliente": pagamentosMap["Crédito Cliente"] || 0,
        Troca: pagamentosMap["Troca"] || 0,
      });
    } catch (err) {
      console.error(`Erro ao buscar analytics de ${cliente.nome}:`, err);
      linhas.push({
        Cliente: cliente.nome,
        Telefone: cliente.telefone || "—",
        Erro: "Falha ao carregar dados",
      });
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(linhas);

  const colunas = Object.keys(linhas[0] || {});
  const larguras = colunas.map((col) => {
    const maxLen = Math.max(
      col.length,
      ...linhas.map((l) => String(l[col] || "").length),
    );

    return { wch: Math.min(maxLen + 2, 40) };
  });

  ws["!cols"] = larguras;

  // Aplicar formatação de moeda nas colunas financeiras
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let C = range.s.c; C <= range.e.c; C++) {
    const colName = colunas[C];

    if (COLUNAS_MOEDA.has(colName)) {
      for (let R = range.s.r + 1; R <= range.e.r; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[addr];

        if (cell && cell.t === "n") {
          cell.z = "#,##0.00";
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Analytics");

  const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  return new Blob([wbOut], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
