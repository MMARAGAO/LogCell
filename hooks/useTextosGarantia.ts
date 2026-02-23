import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";
import { TextoGarantia, TipoServicoGarantia } from "@/types/garantia";

export function useTextosGarantia() {
  const [textosGarantia, setTextosGarantia] = useState<TextoGarantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarTextos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("textos_garantia")
        .select("*")
        .eq("ativo", true)
        .order("tipo_servico", { ascending: true });

      if (err) throw err;

      setTextosGarantia(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao buscar textos de garantia:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarTextos();
  }, []);

  return { textosGarantia, loading, error, refetch: buscarTextos };
}

export function useTextoGarantiaPorTipo(
  tipoServico: TipoServicoGarantia | null,
) {
  const [textoGarantia, setTextoGarantia] = useState<TextoGarantia | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipoServico) {
      setTextoGarantia(null);

      return;
    }

    const buscarTexto = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase.rpc(
          "buscar_texto_garantia",
          { p_tipo_servico: tipoServico },
        );

        if (err) throw err;

        setTextoGarantia(data && data.length > 0 ? data[0] : null);
      } catch (err: any) {
        setError(err.message);
        console.error("Erro ao buscar texto de garantia:", err);
      } finally {
        setLoading(false);
      }
    };

    buscarTexto();
  }, [tipoServico]);

  return { textoGarantia, loading, error };
}
