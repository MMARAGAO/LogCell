"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Button,
} from "@heroui/react";

import { formatarMoeda } from "@/lib/formatters";
import { DashboardService } from "@/services/dashboardService";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  filtro: { data_inicio: string; data_fim: string; loja_id?: number };
}

interface Row {
  produto_id: string;
  descricao: string;
  quantidade: number;
  valor_vendido: number;
  valor_recebido: number;
  lucro: number;
  origem: string;
}

const PAGE_SIZE = 10;

/**
 * Modal de detalhamento (drill-down) dos produtos vendidos no período.
 * Usa DashboardService.buscarProdutosVendidosPeriodo (com busca e paginação).
 */
export function DetailModal({ isOpen, onClose, filtro }: DetailModalProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ativo = true;

    const carregar = async () => {
      setLoading(true);
      try {
        const res = await DashboardService.buscarProdutosVendidosPeriodo(
          filtro,
          busca,
          page,
          PAGE_SIZE,
        );

        if (!ativo) return;
        setRows(res.rows);
        setTotal(res.total);
        setQuantidadeTotal(res.quantidade_total);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [isOpen, page, busca, filtro]);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setBusca("");
    }
  }, [isOpen]);

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="text-lg font-bold">
            Produtos vendidos no período
          </span>
          <span className="text-xs font-normal text-default-500">
            {total} produto(s) · {quantidadeTotal} unidade(s)
          </span>
        </ModalHeader>
        <ModalBody>
          <Input
            isClearable
            placeholder="Buscar produto…"
            size="sm"
            value={busca}
            onClear={() => {
              setBusca("");
              setPage(1);
            }}
            onValueChange={(v) => {
              setBusca(v);
              setPage(1);
            }}
          />

          <Table
            aria-label="Produtos vendidos"
            classNames={{ wrapper: "shadow-none border border-default-200" }}
            removeWrapper={false}
          >
            <TableHeader>
              <TableColumn>PRODUTO</TableColumn>
              <TableColumn>QTD</TableColumn>
              <TableColumn>VENDIDO</TableColumn>
              <TableColumn>RECEBIDO</TableColumn>
              <TableColumn>LUCRO</TableColumn>
              <TableColumn>ORIGEM</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={loading ? "Carregando…" : "Nenhum produto."}
              items={rows}
            >
              {(item) => (
                <TableRow key={`${item.produto_id}-${item.origem}`}>
                  <TableCell className="max-w-[260px] truncate">
                    {item.descricao}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.quantidade}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatarMoeda(item.valor_vendido)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatarMoeda(item.valor_recebido)}
                  </TableCell>
                  <TableCell className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatarMoeda(item.lucro)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-default-500">
                      {item.origem}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPaginas > 1 && (
            <div className="flex justify-center pt-1">
              <Pagination
                showControls
                page={page}
                total={totalPaginas}
                onChange={setPage}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="flat" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
