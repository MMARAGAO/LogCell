"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
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
  canEdit: boolean;
  canDelete: boolean;
  canAdjust: boolean;
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
  canEdit,
  canDelete,
  temVerPrecoCusto,
}: ProdutoCardProps) {
  const { fotos, loading: loadingFotos } = useFotosProduto(produto.id);

  return (
    <Card
      className={`border-l-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${
        produto.ativo ? "border-l-success" : "border-l-danger"
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

        <div className="absolute top-2 left-2 z-20">
          <Chip
            color={produto.ativo ? "success" : "danger"}
            size="sm"
            variant="shadow"
          >
            {produto.ativo ? "Ativo" : "Inativo"}
          </Chip>
        </div>

        <div className="absolute top-2 right-2 z-20">
          <Chip
            className="font-bold"
            color={
              (produto.total_estoque || 0) > (produto.quantidade_minima || 0)
                ? "primary"
                : "danger"
            }
            size="md"
            variant="shadow"
          >
            {produto.total_estoque || 0} un
          </Chip>
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

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 text-xs">
          {produto.marca && (
            <>
              <span className="text-default-500 font-medium">Marca:</span>
              <span className="text-foreground truncate">{produto.marca}</span>
            </>
          )}
          {produto.categoria && (
            <>
              <span className="text-default-500 font-medium">Categoria:</span>
              <span className="text-foreground truncate">
                {produto.categoria}
              </span>
            </>
          )}
          {produto.codigo_fabricante && (
            <>
              <span className="text-default-500 font-medium">Código:</span>
              <span className="text-foreground font-mono truncate">
                {produto.codigo_fabricante}
              </span>
            </>
          )}
        </div>

        {/* Preços */}
        <div className="flex gap-2 mb-2">
          {temVerPrecoCusto && produto.preco_compra && (
            <div className="flex-1 bg-warning-500/15 rounded-md p-2">
              <p className="text-[10px] text-warning font-medium">Compra</p>
              <p className="text-sm font-bold text-warning">
                {formatarMoeda(produto.preco_compra)}
              </p>
            </div>
          )}
          {produto.preco_venda && (
            <div className="flex-1 bg-success-500/15 rounded-md p-2">
              <p className="text-[10px] text-success font-medium">Venda</p>
              <p className="text-sm font-bold text-success">
                {formatarMoeda(produto.preco_venda)}
              </p>
            </div>
          )}
          {temVerPrecoCusto && produto.preco_compra && produto.preco_venda && (
            <div className="flex items-center justify-center bg-primary-500/15 rounded-md px-2">
              <Chip
                color={
                  ((produto.preco_venda - produto.preco_compra) /
                    produto.preco_compra) *
                    100 >
                  30
                    ? "success"
                    : ((produto.preco_venda - produto.preco_compra) /
                          produto.preco_compra) *
                          100 >
                        15
                      ? "warning"
                      : "danger"
                }
                size="sm"
                variant="flat"
              >
                {formatarPorcentagem(
                  ((produto.preco_venda - produto.preco_compra) /
                    produto.preco_compra) *
                    100,
                  0,
                )}
              </Chip>
            </div>
          )}
        </div>

        {/* Estoque por Loja */}
        {produto.estoques_lojas && produto.estoques_lojas.length > 0 && (
          <div className="border-t border-default-200 dark:border-default-700 pt-2">
            <div className="flex flex-wrap gap-1">
              {produto.estoques_lojas.map((estoque: any) => (
                <div
                  key={estoque.id_loja}
                  className="flex items-center gap-1 bg-default-100 dark:bg-default-100/10 rounded px-2 py-0.5"
                >
                  <span className="text-[10px] text-default-600 truncate max-w-[60px]">
                    {estoque.loja_nome}
                  </span>
                  <Chip
                    className="h-4 min-w-[30px] text-[10px]"
                    color={estoque.quantidade > 0 ? "primary" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {estoque.quantidade}
                  </Chip>
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
                  case "editar": onEditar(produto); break;
                  case "clonar": onClonar(produto); break;
                  case "relatorio": onBaixarRelatorio(produto); break;
                  case "historico-produto": onAbrirHistoricoProduto(produto); break;
                  case "historico-estoque": onAbrirHistoricoEstoque(produto); break;
                  case "fornecedores": onAbrirFornecedores(produto); break;
                  case "transferir": onAbrirTransferencia(produto); break;
                  case "toggle-ativo": onToggleAtivo(produto); break;
                  case "deletar": onDeletar(produto); break;
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
              <DropdownItem
                key="clonar"
                color="secondary"
                startContent={<DocumentDuplicateIcon className="w-4 h-4" />}
              >
                Clonar Produto
              </DropdownItem>
              <DropdownItem
                key="relatorio"
                color="success"
                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              >
                Baixar Relatório PDF
              </DropdownItem>
              <DropdownItem
                key="historico-produto"
                startContent={<ClockIcon className="w-4 h-4" />}
              >
                Histórico do Produto
              </DropdownItem>
              <DropdownItem
                key="historico-estoque"
                startContent={<ArrowPathIcon className="w-4 h-4" />}
              >
                Histórico de Movimentações
              </DropdownItem>
              <DropdownItem
                key="fornecedores"
                color="secondary"
                startContent={<TruckIcon className="w-4 h-4" />}
              >
                Gerenciar Fornecedores
              </DropdownItem>
              <DropdownItem
                key="transferir"
                color="primary"
                startContent={<ArrowPathIcon className="w-4 h-4" />}
              >
                Transferir entre Lojas
              </DropdownItem>
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
