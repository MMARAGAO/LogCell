"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

interface Column {
  key: string;
  label: string;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  colunas: Column[];
  rows: Array<Record<string, string>>;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function DrillDownModal({
  isOpen,
  onClose,
  titulo,
  colunas,
  rows,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
}: DrillDownModalProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="text-lg font-bold">{titulo}</ModalHeader>
        <ModalBody className="pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-default-400">
              Nenhum registro encontrado no período.
            </p>
          ) : (
            <>
              <Table
                removeWrapper
                aria-label={titulo}
                classNames={{
                  table: "min-w-full",
                  th: "text-xs uppercase tracking-wider text-default-500 bg-default-50",
                  td: "text-sm py-2",
                }}
              >
                <TableHeader columns={colunas}>
                  {(col) => (
                    <TableColumn key={col.key}>{col.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={rows}>
                  {(row) => (
                    <TableRow key={JSON.stringify(row)}>
                      {(columnKey) => (
                        <TableCell>{row[columnKey as string]}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-default-400">
                    {total} registro(s)
                  </span>
                  <Pagination
                    showControls
                    page={page}
                    total={totalPages}
                    onChange={onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
