import * as XLSX from "xlsx";
import { buscarAnalyticsCliente } from "./clienteAnalyticsService";
import type { Cliente } from "@/types/clientesTecnicos";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string | null) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}

export async function exportarAnalyticsClientes(
  clientes: Cliente[],
): Promise<Blob> {
  const linhas: Record<string, any>[] = [];

  for (const cliente of clientes) {
    try {
      const analytics = await buscarAnalyticsCliente(cliente.id);
      const r = analytics.resumo;

      const pagamentosMap: Record<string, number> = {};
      for (const p of analytics.pagamentosPorTipo) {
        pagamentosMap[p.tipo] = p.valor;
      }

      linhas.push({
        Cliente: cliente.nome,
        Telefone: cliente.telefone || "—",
        "Total Vendas": r.totalVendas,
        "Total Gasto": r.totalGasto,
        "Total Pago": r.totalPago,
        "Saldo Devedor": r.saldoDevedor,
        "Ticket Médio": r.ticketMedio,
        "Última Compra": r.ultimaCompra ? formatarData(r.ultimaCompra) : "—",
        "Dias Inativo": r.diasDesdeUltimaCompra ?? "—",
        "Aparelhos Comprados": r.totalAparelhos,
        "Serviços Realizados": r.totalServicos,
        "Créditos": analytics.creditos,
        "PIX": pagamentosMap["PIX"] || 0,
        "Dinheiro": pagamentosMap["Dinheiro"] || 0,
        "Cartão de Crédito": pagamentosMap["Cartão de Crédito"] || 0,
        "Cartão de Débito": pagamentosMap["Cartão de Débito"] || 0,
        "Transferência": pagamentosMap["Transferência"] || 0,
        "Boleto": pagamentosMap["Boleto"] || 0,
        "Credito Cliente": pagamentosMap["Crédito Cliente"] || 0,
        "Troca": pagamentosMap["Troca"] || 0,
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

  // Ajustar largura das colunas
  const colunas = Object.keys(linhas[0] || {});
  const larguras = colunas.map((col) => {
    const maxLen = Math.max(
      col.length,
      ...linhas.map((l) => String(l[col] || "").length),
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws["!cols"] = larguras;

  XLSX.utils.book_append_sheet(wb, ws, "Analytics");

  const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
