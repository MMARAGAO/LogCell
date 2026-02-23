"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { DocumentTextIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

import { useToast } from "@/components/Toast";

interface LaudoTecnicoProps {
  ordemServicoId: string;
  onSalvar?: () => void;
}

interface LaudoData {
  laudo_diagnostico: string;
  laudo_causa: string;
  laudo_procedimentos: string;
  laudo_recomendacoes: string;
  laudo_condicao_final: string;
}

export default function LaudoTecnico({
  ordemServicoId,
  onSalvar,
}: LaudoTecnicoProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [laudo, setLaudo] = useState<LaudoData>({
    laudo_diagnostico: "",
    laudo_causa: "",
    laudo_procedimentos: "",
    laudo_recomendacoes: "",
    laudo_condicao_final: "",
  });

  useEffect(() => {
    carregarLaudo();
  }, [ordemServicoId]);

  const carregarLaudo = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(
          "laudo_diagnostico, laudo_causa, laudo_procedimentos, laudo_recomendacoes, laudo_condicao_final",
        )
        .eq("id", ordemServicoId)
        .single();

      if (error) throw error;

      if (data) {
        setLaudo({
          laudo_diagnostico: data.laudo_diagnostico || "",
          laudo_causa: data.laudo_causa || "",
          laudo_procedimentos: data.laudo_procedimentos || "",
          laudo_recomendacoes: data.laudo_recomendacoes || "",
          laudo_condicao_final: data.laudo_condicao_final || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar laudo:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarLaudo = async () => {
    setSalvando(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { error } = await supabase
        .from("ordem_servico")
        .update(laudo)
        .eq("id", ordemServicoId);

      if (error) throw error;

      toast.success("Laudo técnico salvo com sucesso!");
      if (onSalvar) onSalvar();
    } catch (error) {
      console.error("Erro ao salvar laudo:", error);
      toast.error("Erro ao salvar laudo técnico");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Laudo Técnico Estruturado
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-default-500 mb-2">
          Preencha o laudo técnico detalhado para profissionalizar o atendimento
        </p>

        {/* Diagnóstico */}
        <Textarea
          description="O que foi identificado durante a análise do equipamento"
          label="Diagnóstico Técnico"
          minRows={3}
          placeholder="Descreva o problema identificado e os testes realizados..."
          value={laudo.laudo_diagnostico}
          onChange={(e) =>
            setLaudo({ ...laudo, laudo_diagnostico: e.target.value })
          }
        />

        {/* Causa */}
        <Textarea
          description="O que causou o defeito"
          label="Causa do Problema"
          minRows={2}
          placeholder="Ex: Oxidação dos contatos, queda, mau uso, desgaste natural..."
          value={laudo.laudo_causa}
          onChange={(e) => setLaudo({ ...laudo, laudo_causa: e.target.value })}
        />

        {/* Procedimentos */}
        <Textarea
          description="Detalhes da execução do reparo"
          label="Procedimentos Realizados"
          minRows={4}
          placeholder="Liste todos os procedimentos técnicos executados..."
          value={laudo.laudo_procedimentos}
          onChange={(e) =>
            setLaudo({ ...laudo, laudo_procedimentos: e.target.value })
          }
        />

        {/* Condição Final */}
        <Textarea
          description="Estado do equipamento após o reparo"
          label="Condição Final do Equipamento"
          minRows={2}
          placeholder="Ex: Funcionando perfeitamente, testado em todas as funções..."
          value={laudo.laudo_condicao_final}
          onChange={(e) =>
            setLaudo({ ...laudo, laudo_condicao_final: e.target.value })
          }
        />

        {/* Recomendações */}
        <Textarea
          description="Orientações de uso e manutenção preventiva"
          label="Recomendações ao Cliente"
          minRows={3}
          placeholder="Ex: Evitar contato com água, usar carregador original, manter atualizado..."
          value={laudo.laudo_recomendacoes}
          onChange={(e) =>
            setLaudo({ ...laudo, laudo_recomendacoes: e.target.value })
          }
        />

        {/* Botão Salvar */}
        <Button
          className="w-full"
          color="success"
          isLoading={salvando}
          startContent={<CheckCircleIcon className="w-4 h-4" />}
          onPress={salvarLaudo}
        >
          Salvar Laudo Técnico
        </Button>
      </CardBody>
    </Card>
  );
}
