"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  TruckIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import MiniCarrossel from "@/components/MiniCarrossel";
import { useFotosProduto } from "@/hooks/useFotosProduto";
import { formatarMoeda, formatarPorcentagem } from "@/lib/formatters";

interface ProdutoCardProps {
  produto: any;
  onAbrirEstoque: (produto: any) => void;
  onAbrirHistoricoProduto: (produto: any) => void;
  onAbrirHistoricoEstoque: (produto: any) => void;
  onAbrirFotos: (produto: any) => void;
  onAbrirFornecedores: (produto: any) => void;
  onAbrirTransferencia: (produto: any) => void;
  onEditar: (produto: any) => void;
  onClonar: (produto: any) => void;
  onDeletar: (produto: any) => void;
  onToggleAtivo: (produto: any) => void;
  onBaixarRelatorio: (produto: any) => void;
  canAdjust: boolean;
  canClonar: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canFornecedores: boolean;
  canHistoricoEstoque: boolean;
  canHistoricoProduto: boolean;
  canRelatorio: boolean;
  canTransferir: boolean;
  temVerPrecoCusto: boolean;
}

export function ProdutoCard({
  produto,
  onAbrirEstoque,
  onAbrirHistoricoProduto,
  onAbrirHistoricoEstoque,
  onAbrirFotos,
  onAbrirFornecedores,
  onAbrirTransferencia,
  onEditar,
  onClonar,
  onDeletar,
  onToggleAtivo,
  onBaixarRelatorio,
  canAdjust,
  canClonar,
  canDelete,
  canEdit,
  canFornecedores,
  canHistoricoEstoque,
  canHistoricoProduto,
  canRelatorio,
  canTransferir,
  temVerPrecoCusto,
}: ProdutoCardProps) {
  const { fotos, loading: loadingFotos } = useFotosProduto(produto.id);

  const margem =
    produto.preco_compra && produto.preco_venda
      ? ((produto.preco_venda - produto.preco_compra) / produto.preco_compra) *
        100
      : 0;
  const margemTone =
    margem > 30
      ? "text-emerald-600 dark:text-emerald-400"
      : margem > 15
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
        produto.ativo ? "" : "border-l-4 border-l-danger"
      }`}
      shadow="sm"
    >
      {/* Carrossel de Fotos */}
      <div className="relative">
        {loadingFotos ? (
          <Skeleton className="h-48 rounded-none">
            <div className="h-48 bg-default-200" />
          </Skeleton>
        ) : (
          <div className="h-48 overflow-hidden">
            <MiniCarrossel
              alt={produto.descricao}
              aspectRatio="video"
              images={fotos}
              showControls={fotos.length > 1}
            />
          </div>
        )}

        <div className="absolute left-2 top-2 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-default-200/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-default-600 backdrop-blur-md">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                produto.ativo ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {produto.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>

        <div className="absolute right-2 top-2 z-20">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-md ${
              (produto.total_estoque || 0) > (produto.quantidade_minima || 0)
                ? "border-default-200/60 bg-background/80 text-default-700"
                : "border-rose-200 bg-rose-50/90 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300"
            }`}
          >
            {produto.total_estoque || 0} un
          </span>
        </div>
      </div>

      {/* Informações do Produto */}
      <CardBody className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground line-clamp-2">
              {produto.descricao}
            </h3>
            <p className="text-xs text-default-400 font-mono mt-1">
              #{produto.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {(produto.marca || produto.categoria || produto.codigo_fabricante) && (
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {produto.marca && (
              <span className="truncate">
                <span className="text-default-400">Marca </span>
                <span className="font-medium text-default-600">
                  {produto.marca}
                </span>
              </span>
            )}
            {produto.categoria && (
              <span className="truncate">
                <span className="text-default-400">Categoria </span>
                <span className="font-medium text-default-600">
                  {produto.categoria}
                </span>
              </span>
            )}
            {produto.codigo_fabricante && (
              <span className="truncate">
                <span className="text-default-400">Código </span>
                <span className="font-mono font-medium text-default-600">
                  {produto.codigo_fabricante}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Preços */}
        {(produto.preco_venda ||
          (temVerPrecoCusto && produto.preco_compra)) && (
          <div className="mb-3 flex divide-x divide-default-200 overflow-hidden rounded-lg border border-default-200 dark:divide-default-100/20 dark:border-default-100/20">
            {temVerPrecoCusto && produto.preco_compra && (
              <div className="flex-1 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-default-400">
                  Compra
                </p>
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatarMoeda(produto.preco_compra)}
                </p>
              </div>
            )}
            {produto.preco_venda && (
              <div className="flex-1 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-default-400">
                  Venda
                </p>
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatarMoeda(produto.preco_venda)}
                </p>
              </div>
            )}
            {temVerPrecoCusto &&
              produto.preco_compra &&
              produto.preco_venda && (
                <div className="flex-1 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-default-400">
                    Margem
                  </p>
                  <p className={`text-sm font-bold tabular-nums ${margemTone}`}>
                    {formatarPorcentagem(margem, 0)}
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Estoque por Loja */}
        {produto.estoques_lojas && produto.estoques_lojas.length > 0 && (
          <div className="border-t border-default-200 pt-2 dark:border-default-100/20">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-default-400">
              Estoque por loja
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {produto.estoques_lojas.map((estoque: any) => (
                <div
                  key={estoque.id_loja}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate text-default-500">
                    {estoque.loja_nome}
                  </span>
                  <span
                    className={`flex-shrink-0 font-semibold tabular-nums ${
                      estoque.quantidade > 0
                        ? "text-default-700"
                        : "text-rose-500"
                    }`}
                  >
                    {estoque.quantidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>

      {/* Footer com Ações */}
      <Divider />
      <CardBody className="p-2 bg-default-50/50 dark:bg-default-50/5">
        <div className="flex gap-1.5">
          {canAdjust && (
            <Button
              className="flex-1 font-semibold"
              color="primary"
              size="sm"
              startContent={<BuildingStorefrontIcon className="w-4 h-4" />}
              variant="solid"
              onPress={() => onAbrirEstoque(produto)}
            >
              Estoque
            </Button>
          )}

          <Button
            isIconOnly
            color="default"
            size="sm"
            variant="flat"
            onPress={() => onAbrirFotos(produto)}
          >
            <PhotoIcon className="w-4 h-4" />
          </Button>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="flat">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Ações do produto"
              onAction={(key) => {
                switch (key) {
                  case "editar":
                    onEditar(produto);
                    break;
                  case "clonar":
                    onClonar(produto);
                    break;
                  case "relatorio":
                    onBaixarRelatorio(produto);
                    break;
                  case "historico-produto":
                    onAbrirHistoricoProduto(produto);
                    break;
                  case "historico-estoque":
                    onAbrirHistoricoEstoque(produto);
                    break;
                  case "fornecedores":
                    onAbrirFornecedores(produto);
                    break;
                  case "transferir":
                    onAbrirTransferencia(produto);
                    break;
                  case "toggle-ativo":
                    onToggleAtivo(produto);
                    break;
                  case "deletar":
                    onDeletar(produto);
                    break;
                }
              }}
            >
              {canEdit ? (
                <DropdownItem
                  key="editar"
                  startContent={<PencilIcon className="w-4 h-4" />}
                >
                  Editar Produto
                </DropdownItem>
              ) : null}
              {canClonar ? (
                <DropdownItem
                  key="clonar"
                  color="secondary"
                  startContent={<DocumentDuplicateIcon className="w-4 h-4" />}
                >
                  Clonar Produto
                </DropdownItem>
              ) : null}
              {canRelatorio ? (
                <DropdownItem
                  key="relatorio"
                  color="success"
                  startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                >
                  Baixar Relatório PDF
                </DropdownItem>
              ) : null}
              {canHistoricoProduto ? (
                <DropdownItem
                  key="historico-produto"
                  startContent={<ClockIcon className="w-4 h-4" />}
                >
                  Histórico do Produto
                </DropdownItem>
              ) : null}
              {canHistoricoEstoque ? (
                <DropdownItem
                  key="historico-estoque"
                  startContent={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Histórico de Movimentações
                </DropdownItem>
              ) : null}
              {canFornecedores ? (
                <DropdownItem
                  key="fornecedores"
                  color="secondary"
                  startContent={<TruckIcon className="w-4 h-4" />}
                >
                  Gerenciar Fornecedores
                </DropdownItem>
              ) : null}
              {canTransferir ? (
                <DropdownItem
                  key="transferir"
                  color="primary"
                  startContent={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Transferir entre Lojas
                </DropdownItem>
              ) : null}
              {canEdit ? (
                <DropdownItem
                  key="toggle-ativo"
                  color={produto.ativo ? "warning" : "success"}
                  startContent={<ArrowPathIcon className="w-4 h-4" />}
                >
                  {produto.ativo ? "Desativar Produto" : "Ativar Produto"}
                </DropdownItem>
              ) : null}
              {canDelete ? (
                <DropdownItem
                  key="deletar"
                  className="text-danger"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                >
                  Excluir Produto
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardBody>
    </Card>
  );
}
