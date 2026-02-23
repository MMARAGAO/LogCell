import type {
  DevolucaoAparelho,
  TipoDevolucaoAparelho,
} from "@/types/aparelhos";

import { supabase } from "@/lib/supabaseClient";

interface RegistrarDevolucaoAparelhoInput {
  aparelho_id: string;
  venda_id?: string | null;
  loja_id: number;
  tipo: TipoDevolucaoAparelho;
  motivo: string;
  observacoes?: string | null;
  data_ocorrencia?: string;
  usuario_id: string;
}

export const DevolucoesAparelhosService = {
  async registrarDevolucaoAparelho(
    dados: RegistrarDevolucaoAparelhoInput,
  ): Promise<DevolucaoAparelho> {
    const { data, error } = await supabase
      .from("devolucoes_aparelhos")
      .insert({
        aparelho_id: dados.aparelho_id,
        venda_id: dados.venda_id || null,
        loja_id: dados.loja_id,
        tipo: dados.tipo,
        motivo: dados.motivo,
        observacoes: dados.observacoes || null,
        data_ocorrencia: dados.data_ocorrencia || new Date().toISOString(),
        criado_por: dados.usuario_id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (dados.tipo === "devolucao" || dados.tipo === "troca") {
      const { error: erroAtualizacao } = await supabase
        .from("aparelhos")
        .update({
          status: "disponivel",
          venda_id: null,
          data_venda: null,
          atualizado_em: new Date().toISOString(),
          atualizado_por: dados.usuario_id,
        })
        .eq("id", dados.aparelho_id);

      if (erroAtualizacao) {
        throw erroAtualizacao;
      }
    }

    return data as DevolucaoAparelho;
  },

  async listarDevolucoesAparelho(
    aparelhoId: string,
  ): Promise<DevolucaoAparelho[]> {
    const { data, error } = await supabase
      .from("devolucoes_aparelhos")
      .select(
        "*, usuario:usuarios!devolucoes_aparelhos_criado_por_fkey(id, nome)",
      )
      .eq("aparelho_id", aparelhoId)
      .order("data_ocorrencia", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as DevolucaoAparelho[];
  },
};
