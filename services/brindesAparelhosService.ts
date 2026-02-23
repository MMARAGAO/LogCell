import type { BrindeAparelho } from "@/types/aparelhos";

import { supabase } from "@/lib/supabaseClient";

interface RegistrarBrindeInput {
  loja_id: number;
  venda_id?: string | null;
  descricao: string;
  valor_custo: number;
  data_ocorrencia?: string;
  usuario_id: string;
}

export const BrindesAparelhosService = {
  async registrarBrinde(dados: RegistrarBrindeInput): Promise<BrindeAparelho> {
    const { data, error } = await supabase
      .from("brindes_aparelhos")
      .insert({
        loja_id: dados.loja_id,
        venda_id: dados.venda_id || null,
        descricao: dados.descricao,
        valor_custo: dados.valor_custo,
        data_ocorrencia: dados.data_ocorrencia || new Date().toISOString(),
        criado_por: dados.usuario_id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as BrindeAparelho;
  },

  async somarBrindesPeriodo(params: {
    dataInicio: string;
    dataFim: string;
    lojaId?: number;
  }): Promise<number> {
    const inicioISO = `${params.dataInicio}T00:00:00`;
    const fimISO = `${params.dataFim}T23:59:59`;

    const pageSize = 1000;
    let from = 0;
    let to = pageSize - 1;
    let total = 0;

    while (true) {
      let query = supabase
        .from("brindes_aparelhos")
        .select("valor_custo, data_ocorrencia, loja_id")
        .gte("data_ocorrencia", inicioISO)
        .lte("data_ocorrencia", fimISO)
        .range(from, to);

      if (params.lojaId) query = query.eq("loja_id", params.lojaId);

      const { data, error } = await query;

      if (error) throw error;

      const batch = data || [];

      batch.forEach((item: any) => {
        total += Number(item.valor_custo || 0);
      });

      if (batch.length < pageSize) break;
      from += pageSize;
      to += pageSize;
    }

    return total;
  },
};
