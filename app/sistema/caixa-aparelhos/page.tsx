"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Smartphone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import { usePermissoes } from "@/hooks/usePermissoes";
import { CaixaAparelhos } from "@/components/aparelhos/CaixaAparelhos";
import { supabase } from "@/lib/supabaseClient";

interface Loja {
  id: number;
  nome: string;
}

export default function CaixaAparelhosPage() {
  const router = useRouter();
  const { lojaId, loading, todasLojas } = usePermissoes();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("");

  useEffect(() => {
    const carregarLojas = async () => {
      if (!todasLojas) return;
      setLoadingLojas(true);
      try {
        const { data, error } = await supabase
          .from("lojas")
          .select("id, nome")
          .order("nome");

        if (error) throw error;
        setLojas(data || []);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        setLojas([]);
      } finally {
        setLoadingLojas(false);
      }
    };

    carregarLojas();
  }, [todasLojas]);

  useEffect(() => {
    if (!loading && !todasLojas && lojaId) {
      setLojaSelecionada(lojaId.toString());
    }
  }, [loading, todasLojas, lojaId]);

  const lojaIdFinal = todasLojas
    ? lojaSelecionada
      ? Number(lojaSelecionada)
      : null
    : lojaId;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/sistema/aparelhos")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Smartphone className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Caixa de Aparelhos</h1>
            <p className="text-sm text-default-500">
              Controle financeiro específico de vendas de celulares
            </p>
          </div>
        </div>
        {todasLojas ? (
          <Select
            className="w-full md:w-56"
            isDisabled={loadingLojas}
            label="Loja"
            placeholder={
              loadingLojas ? "Carregando lojas..." : "Selecione uma loja"
            }
            selectedKeys={lojaSelecionada ? [lojaSelecionada] : []}
            onChange={(e) => setLojaSelecionada(e.target.value)}
          >
            {lojas.map((loja) => (
              <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
            ))}
          </Select>
        ) : null}
      </div>

      {/* Componente do Caixa */}
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          </CardBody>
        </Card>
      ) : lojaIdFinal ? (
        <CaixaAparelhos lojaId={lojaIdFinal} />
      ) : (
        <Card>
          <CardBody>
            <p className="text-center text-default-500 py-8">
              Selecione uma loja para visualizar o caixa de aparelhos
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
