"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Troca {
  id: string;
  venda_id: string;
  produto_antigo_nome: string;
  produto_antigo_preco: number;
  produto_novo_nome: string;
  produto_novo_preco: number;
  quantidade_trocada: number;
  diferenca_valor: number;
  criado_em: string;
  usuario?: {
    nome: string;
  };
  vendas?: {
    numero_venda: number;
  };
}

interface HistoricoTrocasProps {
  vendaId?: string;
  lojaId?: number;
}

export function HistoricoTrocas({ vendaId, lojaId }: HistoricoTrocasProps) {
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTrocas();
  }, [vendaId, lojaId]);

  const carregarTrocas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trocas_produtos")
        .select(
          `
          *,
          usuario:usuario_id (nome),
          vendas:venda_id (numero_venda)
        `
        )
        .order("criado_em", { ascending: false });

      if (vendaId) {
        query = query.eq("venda_id", vendaId);
      } else if (lojaId) {
        query = query.eq("loja_id", lojaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrocas(data || []);
    } catch (error) {
      console.error("Erro ao carregar trocas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    const dataUTC = data.endsWith("Z") ? data : data + "Z";
    return new Date(dataUTC).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center p-8">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (trocas.length === 0) {
    return (
      <Card>
        <CardBody className="text-center p-8">
          <RefreshCw className="w-12 h-12 text-default-400 mx-auto mb-3" />
          <p className="text-default-600">Nenhuma troca registrada</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <Table aria-label="Histórico de trocas" removeWrapper>
          <TableHeader>
            <TableColumn>DATA/HORA</TableColumn>
            {vendaId ? <></> : <TableColumn>VENDA</TableColumn>}
            <TableColumn>PRODUTO ANTIGO</TableColumn>
            <TableColumn>PRODUTO NOVO</TableColumn>
            <TableColumn>QTD</TableColumn>
            <TableColumn>DIFERENÇA</TableColumn>
            <TableColumn>USUÁRIO</TableColumn>
          </TableHeader>
          <TableBody>
            {trocas.map((troca) => (
              <TableRow key={troca.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-default-400" />
                    {formatarData(troca.criado_em)}
                  </div>
                </TableCell>
                {vendaId ? (
                  <></>
                ) : (
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      #{troca.vendas?.numero_venda || "-"}
                    </Chip>
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {troca.produto_antigo_nome}
                    </p>
                    <p className="text-xs text-default-500">
                      {formatarMoeda(troca.produto_antigo_preco)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {troca.produto_novo_nome}
                    </p>
                    <p className="text-xs text-default-500">
                      {formatarMoeda(troca.produto_novo_preco)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {troca.quantidade_trocada}
                  </Chip>
                </TableCell>
                <TableCell>
                  {troca.diferenca_valor === 0 ? (
                    <Chip size="sm" color="default" variant="flat">
                      Sem diferença
                    </Chip>
                  ) : troca.diferenca_valor > 0 ? (
                    <Chip
                      size="sm"
                      color="warning"
                      variant="flat"
                      startContent={<TrendingUp className="w-3 h-3" />}
                    >
                      +{formatarMoeda(troca.diferenca_valor)}
                    </Chip>
                  ) : (
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<TrendingDown className="w-3 h-3" />}
                    >
                      {formatarMoeda(troca.diferenca_valor)}
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-default-400" />
                    {troca.usuario?.nome || "Sistema"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
