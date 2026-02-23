import { supabase } from "@/lib/supabaseClient";

export interface ResumoCaixaAparelhos {
  // Vendas
  total_vendas: number;
  quantidade_aparelhos_vendidos: number;
  valor_total_vendas: number;

  // Por forma de pagamento
  vendas_dinheiro: number;
  vendas_pix: number;
  vendas_credito: number;
  vendas_debito: number;
  vendas_transferencia: number;

  // Trocas
  quantidade_trocas: number;
  valor_total_trocas: number;

  // Lucro
  valor_total_custo: number;
  lucro_bruto: number;

  // Lista de aparelhos vendidos
  aparelhos_vendidos: Array<{
    id: string;
    marca: string;
    modelo: string;
    imei?: string;
    valor_venda: number;
    valor_compra: number;
    lucro: number;
    cliente_nome: string;
    vendedor_nome: string;
    data_venda: string;
  }>;

  // Lista de trocas recebidas
  trocas_recebidas: Array<{
    id: string;
    marca: string;
    modelo: string;
    imei?: string;
    valor_avaliado: number;
    data_entrada: string;
  }>;
}

export class CaixaAparelhosService {
  /**
   * Buscar resumo do caixa de aparelhos para um período
   */
  static async buscarResumoCaixaAparelhos(
    lojaId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ResumoCaixaAparelhos> {
    try {
      // 1. Buscar aparelhos vendidos no período
      const { data: aparelhosVendidos, error: erroAparelhos } = await supabase
        .from("aparelhos")
        .select(
          `
          id,
          marca,
          modelo,
          imei,
          numero_serie,
          cor,
          armazenamento,
          valor_venda,
          valor_compra,
          data_venda,
          venda_id,
          venda:vendas!aparelhos_venda_id_fkey(
            id,
            numero_venda,
            cliente_id,
            vendedor_id,
            cliente:clientes!vendas_cliente_id_fkey(nome),
            vendedor:usuarios!vendas_vendedor_id_fkey(nome)
          )
        `,
        )
        .eq("loja_id", lojaId)
        .eq("status", "vendido")
        .gte("data_venda", dataInicio)
        .lte("data_venda", dataFim)
        .order("data_venda", { ascending: false });

      if (erroAparelhos) throw erroAparelhos;

      // 2. Buscar pagamentos das vendas de aparelhos
      const vendasIds =
        aparelhosVendidos?.map((a: any) => a.venda_id).filter(Boolean) || [];

      let pagamentos: any[] = [];

      if (vendasIds.length > 0) {
        const { data: pagamentosData, error: erroPagamentos } = await supabase
          .from("pagamentos_venda")
          .select("*")
          .in("venda_id", vendasIds);

        if (erroPagamentos) throw erroPagamentos;
        pagamentos = pagamentosData || [];
      }

      // 3. Buscar aparelhos recebidos em troca no período
      const { data: trocasRecebidas, error: erroTrocas } = await supabase
        .from("aparelhos")
        .select("*")
        .eq("loja_id", lojaId)
        .eq("status", "disponivel")
        .gte("data_entrada", dataInicio)
        .lte("data_entrada", dataFim)
        .ilike("observacoes", "%troca%");

      if (erroTrocas) throw erroTrocas;

      // Calcular totais
      const quantidadeAparelhosVendidos = aparelhosVendidos?.length || 0;
      const valorTotalVendas =
        aparelhosVendidos?.reduce(
          (sum: number, a: any) => sum + (a.valor_venda || 0),
          0,
        ) || 0;
      const valorTotalCusto =
        aparelhosVendidos?.reduce(
          (sum: number, a: any) => sum + (a.valor_compra || 0),
          0,
        ) || 0;
      const lucroBruto = valorTotalVendas - valorTotalCusto;

      // Calcular por forma de pagamento
      const vendasDinheiro = pagamentos
        .filter((p) => p.tipo_pagamento === "dinheiro")
        .reduce((sum, p) => sum + p.valor, 0);
      const vendasPix = pagamentos
        .filter((p) => p.tipo_pagamento === "pix")
        .reduce((sum, p) => sum + p.valor, 0);
      const vendasCredito = pagamentos
        .filter((p) => p.tipo_pagamento === "cartao_credito")
        .reduce((sum, p) => sum + p.valor, 0);
      const vendasDebito = pagamentos
        .filter((p) => p.tipo_pagamento === "cartao_debito")
        .reduce((sum, p) => sum + p.valor, 0);
      const vendasTransferencia = pagamentos
        .filter((p) => p.tipo_pagamento === "transferencia")
        .reduce((sum, p) => sum + p.valor, 0);

      // Calcular trocas
      const quantidadeTrocas = trocasRecebidas?.length || 0;
      const valorTotalTrocas =
        trocasRecebidas?.reduce(
          (sum: number, t: any) => sum + (t.valor_compra || 0),
          0,
        ) || 0;

      // Formatar aparelhos vendidos
      const aparelhosFormatados =
        aparelhosVendidos?.map((a: any) => ({
          id: a.id,
          marca: a.marca,
          modelo: a.modelo,
          imei: a.imei || a.numero_serie,
          valor_venda: a.valor_venda || 0,
          valor_compra: a.valor_compra || 0,
          lucro: (a.valor_venda || 0) - (a.valor_compra || 0),
          cliente_nome: a.venda?.cliente?.nome || "Cliente não informado",
          vendedor_nome: a.venda?.vendedor?.nome || "Vendedor não informado",
          data_venda: a.data_venda,
        })) || [];

      // Formatar trocas recebidas
      const trocasFormatadas =
        trocasRecebidas?.map((t: any) => ({
          id: t.id,
          marca: t.marca,
          modelo: t.modelo,
          imei: t.imei || t.numero_serie,
          valor_avaliado: t.valor_compra || 0,
          data_entrada: t.data_entrada,
        })) || [];

      return {
        total_vendas: quantidadeAparelhosVendidos,
        quantidade_aparelhos_vendidos: quantidadeAparelhosVendidos,
        valor_total_vendas: valorTotalVendas,

        vendas_dinheiro: vendasDinheiro,
        vendas_pix: vendasPix,
        vendas_credito: vendasCredito,
        vendas_debito: vendasDebito,
        vendas_transferencia: vendasTransferencia,

        quantidade_trocas: quantidadeTrocas,
        valor_total_trocas: valorTotalTrocas,

        valor_total_custo: valorTotalCusto,
        lucro_bruto: lucroBruto,

        aparelhos_vendidos: aparelhosFormatados,
        trocas_recebidas: trocasFormatadas,
      };
    } catch (error: any) {
      console.error("Erro ao buscar resumo do caixa de aparelhos:", error);
      throw error;
    }
  }
}
