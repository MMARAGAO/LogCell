"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  DevicePhoneMobileIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Aparelho, FiltrosAparelhos, FotoAparelho } from "@/types/aparelhos";
import {
  getAparelhos,
  deletarAparelho,
  atualizarStatusAparelho,
} from "@/services/aparelhosService";
import { getFotosAparelho } from "@/services/fotosAparelhosService";
import { AparelhoFormModal } from "@/components/aparelhos/AparelhoFormModal";

const ESTADOS = [
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado", label: "Usado" },
  { value: "recondicionado", label: "Recondicionado" },
];

const STATUS = [
  { value: "disponivel", label: "Disponível", color: "success" },
  { value: "vendido", label: "Vendido", color: "default" },
  { value: "reservado", label: "Reservado", color: "warning" },
  { value: "defeito", label: "Defeito", color: "danger" },
  { value: "transferido", label: "Transferido", color: "primary" },
];

export default function AparelhosPage() {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();
  const { lojaId } = useLojaFilter();
  const { temPermissao } = usePermissoes();

  const [aparelhos, setAparelhos] = useState<Aparelho[]>([]);
  const [fotosAparelhos, setFotosAparelhos] = useState<
    Record<string, FotoAparelho[]>
  >({});
  const [fotoAtualIndex, setFotoAtualIndex] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosAparelhos>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [visualizacao, setVisualizacao] = useState<"tabela" | "cards">("cards");
  const itensPorPagina = 20;

  // Modals
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [aparelhoParaEditar, setAparelhoParaEditar] = useState<
    Aparelho | undefined
  >(undefined);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [aparelhoParaDeletar, setAparelhoParaDeletar] = useState<
    Aparelho | undefined
  >(undefined);

  // Permissões
  const podeVisualizar = temPermissao("aparelhos.visualizar");
  const podeCriar = temPermissao("aparelhos.criar");
  const podeEditar = temPermissao("aparelhos.editar");
  const podeDeletar = temPermissao("aparelhos.deletar");

  // Carregar aparelhos e produtos
  useEffect(() => {
    if (podeVisualizar) {
      carregarDados();
    }
  }, [lojaId, podeVisualizar]);

  async function carregarDados() {
    try {
      setLoading(true);

      const filtrosComLoja: FiltrosAparelhos = {
        ...filtros,
        loja_id: lojaId || undefined,
      };

      const aparelhosData = await getAparelhos(filtrosComLoja);
      setAparelhos(aparelhosData);

      // Carregar fotos de todos os aparelhos
      const fotosMap: Record<string, FotoAparelho[]> = {};
      const indexMap: Record<string, number> = {};

      await Promise.all(
        aparelhosData.map(async (aparelho) => {
          try {
            const fotos = await getFotosAparelho(aparelho.id);
            fotosMap[aparelho.id] = fotos;
            indexMap[aparelho.id] = 0;
          } catch (error) {
            console.error(
              `Erro ao carregar fotos do aparelho ${aparelho.id}:`,
              error
            );
            fotosMap[aparelho.id] = [];
            indexMap[aparelho.id] = 0;
          }
        })
      );

      setFotosAparelhos(fotosMap);
      setFotoAtualIndex(indexMap);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast("Erro ao carregar aparelhos", "error");
    } finally {
      setLoading(false);
    }
  }

  // Navegar entre fotos do carrossel
  const proximaFoto = (aparelhoId: string) => {
    const fotos = fotosAparelhos[aparelhoId] || [];
    if (fotos.length === 0) return;

    setFotoAtualIndex((prev) => ({
      ...prev,
      [aparelhoId]: (prev[aparelhoId] + 1) % fotos.length,
    }));
  };

  const fotoAnterior = (aparelhoId: string) => {
    const fotos = fotosAparelhos[aparelhoId] || [];
    if (fotos.length === 0) return;

    setFotoAtualIndex((prev) => ({
      ...prev,
      [aparelhoId]:
        prev[aparelhoId] === 0 ? fotos.length - 1 : prev[aparelhoId] - 1,
    }));
  };

  // Filtrar aparelhos
  const aparelhosFiltrados = aparelhos.filter((aparelho) => {
    if (busca) {
      const buscaLower = busca.toLowerCase();
      return (
        aparelho.marca?.toLowerCase().includes(buscaLower) ||
        aparelho.modelo?.toLowerCase().includes(buscaLower) ||
        aparelho.imei?.toLowerCase().includes(buscaLower) ||
        aparelho.numero_serie?.toLowerCase().includes(buscaLower) ||
        aparelho.cor?.toLowerCase().includes(buscaLower)
      );
    }
    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(aparelhosFiltrados.length / itensPorPagina);
  const aparelhosPaginados = aparelhosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Handlers
  const handleAbrirFormNovo = () => {
    setAparelhoParaEditar(undefined);
    setModalFormAberto(true);
  };

  const handleAbrirFormEditar = (aparelho: Aparelho) => {
    setAparelhoParaEditar(aparelho);
    setModalFormAberto(true);
  };

  const handleFecharForm = async (sucesso?: boolean) => {
    setModalFormAberto(false);
    setAparelhoParaEditar(undefined);
    if (sucesso) {
      await carregarDados();
    }
  };

  const handleAbrirConfirmDelete = (aparelho: Aparelho) => {
    setAparelhoParaDeletar(aparelho);
    setModalDeleteAberto(true);
  };

  const handleDeletar = async () => {
    if (!aparelhoParaDeletar || !usuario) return;

    try {
      await deletarAparelho(aparelhoParaDeletar.id);
      showToast("Aparelho deletado com sucesso", "success");
      setModalDeleteAberto(false);
      setAparelhoParaDeletar(undefined);
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao deletar aparelho:", error);
      showToast(error.message || "Erro ao deletar aparelho", "error");
    }
  };

  const handleAtualizarStatus = async (
    aparelhoId: string,
    novoStatus: string
  ) => {
    if (!usuario) return;

    try {
      await atualizarStatusAparelho(aparelhoId, novoStatus as any, usuario.id);
      showToast("Status atualizado com sucesso", "success");
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      showToast(error.message || "Erro ao atualizar status", "error");
    }
  };

  const getStatusChipColor = (status: string) => {
    const statusObj = STATUS.find((s) => s.value === status);
    return statusObj?.color || "default";
  };

  const getEstadoLabel = (estado: string) => {
    const estadoObj = ESTADOS.find((e) => e.value === estado);
    return estadoObj?.label || estado;
  };

  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardBody>
            <p className="text-danger">
              Você não tem permissão para visualizar aparelhos.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <DevicePhoneMobileIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Aparelhos</h1>
            <p className="text-sm text-default-500">
              Gerencie o cadastro de aparelhos individuais
            </p>
          </div>
        </div>
        {podeCriar && (
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={handleAbrirFormNovo}
          >
            Novo Aparelho
          </Button>
        )}
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Buscar por marca, modelo, IMEI, número de série..."
                value={busca}
                onValueChange={setBusca}
                startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                className="flex-1"
              />
              <Select
                placeholder="Filtrar por estado"
                selectedKeys={filtros.estado ? [filtros.estado] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFiltros((prev) => ({
                    ...prev,
                    estado: (value || undefined) as any,
                  }));
                  carregarDados();
                }}
                className="w-full md:w-60"
                startContent={<FunnelIcon className="w-4 h-4" />}
              >
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado.value}>{estado.label}</SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Filtrar por status"
                selectedKeys={filtros.status ? [filtros.status] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFiltros((prev) => ({
                    ...prev,
                    status: (value || undefined) as any,
                  }));
                  carregarDados();
                }}
                className="w-full md:w-60"
                startContent={<FunnelIcon className="w-4 h-4" />}
              >
                {STATUS.map((status) => (
                  <SelectItem key={status.value}>{status.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Toggle de Visualização */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-default-500">
                {aparelhosFiltrados.length} aparelho(s) encontrado(s)
              </p>
              <div className="flex gap-1 bg-default-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={visualizacao === "cards" ? "solid" : "light"}
                  color={visualizacao === "cards" ? "primary" : "default"}
                  onPress={() => setVisualizacao("cards")}
                  isIconOnly
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={visualizacao === "tabela" ? "solid" : "light"}
                  color={visualizacao === "tabela" ? "primary" : "default"}
                  onPress={() => setVisualizacao("tabela")}
                  isIconOnly
                >
                  <TableCellsIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Visualização em Cards ou Tabela */}
      {visualizacao === "cards" ? (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-80">
                <CardBody className="animate-pulse">
                  <div className="h-40 bg-default-200 rounded-lg mb-4" />
                  <div className="h-4 bg-default-200 rounded mb-2" />
                  <div className="h-4 bg-default-200 rounded w-2/3" />
                </CardBody>
              </Card>
            ))
          ) : aparelhosPaginados.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardBody className="text-center py-12">
                  <DevicePhoneMobileIcon className="w-12 h-12 mx-auto text-default-400 mb-2" />
                  <p className="text-default-500">Nenhum aparelho encontrado</p>
                </CardBody>
              </Card>
            </div>
          ) : (
            aparelhosPaginados.map((aparelho) => {
              const fotos = fotosAparelhos[aparelho.id] || [];
              const fotoIndex = fotoAtualIndex[aparelho.id] || 0;
              const fotoAtual = fotos[fotoIndex];

              return (
                <Card
                  key={aparelho.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-0">
                    {/* Carrossel de Fotos */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden group">
                      {fotos.length > 0 ? (
                        <>
                          <img
                            src={fotoAtual?.url}
                            alt={`${aparelho.marca} ${aparelho.modelo}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Navegação do carrossel */}
                          {fotos.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fotoAnterior(aparelho.id);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeftIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  proximaFoto(aparelho.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRightIcon className="w-5 h-5" />
                              </button>

                              {/* Indicadores */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {fotos.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      index === fotoIndex
                                        ? "bg-white w-4"
                                        : "bg-white/50"
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {/* Badge de quantidade de fotos */}
                          {fotos.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {fotoIndex + 1}/{fotos.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <DevicePhoneMobileIcon className="w-20 h-20 text-primary-300" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 space-y-3">
                      {/* Marca e Modelo */}
                      <div>
                        <h3 className="font-bold text-lg truncate">
                          {aparelho.marca}
                        </h3>
                        <p className="text-sm text-default-600 truncate">
                          {aparelho.modelo}
                        </p>
                      </div>

                      {/* Armazenamento e RAM */}
                      {(aparelho.armazenamento || aparelho.memoria_ram) && (
                        <div className="flex gap-2 text-xs">
                          {aparelho.armazenamento && (
                            <Chip size="sm" variant="flat" color="primary">
                              {aparelho.armazenamento}
                            </Chip>
                          )}
                          {aparelho.memoria_ram && (
                            <Chip size="sm" variant="flat" color="secondary">
                              {aparelho.memoria_ram}
                            </Chip>
                          )}
                        </div>
                      )}

                      {/* Cor */}
                      {aparelho.cor && (
                        <p className="text-sm text-default-500">
                          <span className="font-medium">Cor:</span>{" "}
                          {aparelho.cor}
                        </p>
                      )}

                      {/* Estado e Status */}
                      <div className="flex gap-2">
                        <Chip size="sm" variant="flat">
                          {getEstadoLabel(aparelho.estado)}
                        </Chip>
                        <Chip
                          size="sm"
                          color={getStatusChipColor(aparelho.status) as any}
                          variant="flat"
                        >
                          {
                            STATUS.find((s) => s.value === aparelho.status)
                              ?.label
                          }
                        </Chip>
                      </div>

                      {/* IMEI */}
                      {aparelho.imei && (
                        <p className="text-xs text-default-400 font-mono truncate">
                          IMEI: {aparelho.imei}
                        </p>
                      )}

                      {/* Valores */}
                      <div className="pt-2 border-t border-default-200">
                        {aparelho.valor_venda && (
                          <p className="text-lg font-bold text-success">
                            {formatarMoeda(aparelho.valor_venda)}
                          </p>
                        )}
                        {aparelho.valor_compra && (
                          <p className="text-xs text-default-400">
                            Compra: {formatarMoeda(aparelho.valor_compra)}
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2">
                        {podeEditar && (
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleAbrirFormEditar(aparelho)}
                            className="flex-1"
                            startContent={<PencilIcon className="w-4 h-4" />}
                          >
                            Editar
                          </Button>
                        )}
                        {podeDeletar && aparelho.status !== "vendido" && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleAbrirConfirmDelete(aparelho)}
                            isIconOnly
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Tabela de Aparelhos */
        <Card>
          <CardBody>
            <Table
              aria-label="Tabela de aparelhos"
              bottomContent={
                totalPaginas > 1 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      showControls
                      total={totalPaginas}
                      page={paginaAtual}
                      onChange={setPaginaAtual}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>MARCA/MODELO</TableColumn>
                <TableColumn>ARMAZENAMENTO</TableColumn>
                <TableColumn>IMEI</TableColumn>
                <TableColumn>COR</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>VALOR VENDA</TableColumn>
                <TableColumn>DATA ENTRADA</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={loading}
                emptyContent="Nenhum aparelho encontrado"
              >
                {aparelhosPaginados.map((aparelho) => (
                  <TableRow key={aparelho.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{aparelho.marca}</p>
                        <p className="text-xs text-default-500">
                          {aparelho.modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {aparelho.armazenamento && (
                          <span className="text-sm">
                            {aparelho.armazenamento}
                          </span>
                        )}
                        {aparelho.memoria_ram && (
                          <span className="text-xs text-default-500">
                            RAM: {aparelho.memoria_ram}
                          </span>
                        )}
                        {!aparelho.armazenamento &&
                          !aparelho.memoria_ram &&
                          "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-default-100 px-2 py-1 rounded">
                        {aparelho.imei || "-"}
                      </code>
                    </TableCell>
                    <TableCell>{aparelho.cor || "-"}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {getEstadoLabel(aparelho.estado)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Chip
                            size="sm"
                            color={getStatusChipColor(aparelho.status) as any}
                            variant="flat"
                            className="cursor-pointer"
                          >
                            {STATUS.find((s) => s.value === aparelho.status)
                              ?.label || aparelho.status}
                          </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Alterar status"
                          onAction={(key) =>
                            handleAtualizarStatus(aparelho.id, key as string)
                          }
                        >
                          {STATUS.map((status) => (
                            <DropdownItem key={status.value}>
                              {status.label}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                    <TableCell>
                      {aparelho.valor_venda
                        ? formatarMoeda(aparelho.valor_venda)
                        : "-"}
                    </TableCell>
                    <TableCell>{formatarData(aparelho.data_entrada)}</TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            aria-label="Ações"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Ações do aparelho">
                          {podeEditar ? (
                            <DropdownItem
                              key="editar"
                              startContent={<PencilIcon className="w-4 h-4" />}
                              onPress={() => handleAbrirFormEditar(aparelho)}
                            >
                              Editar
                            </DropdownItem>
                          ) : null}
                          {podeDeletar && aparelho.status !== "vendido" ? (
                            <DropdownItem
                              key="deletar"
                              className="text-danger"
                              color="danger"
                              startContent={<TrashIcon className="w-4 h-4" />}
                              onPress={() => handleAbrirConfirmDelete(aparelho)}
                            >
                              Deletar
                            </DropdownItem>
                          ) : null}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPaginas}
            page={paginaAtual}
            onChange={setPaginaAtual}
            showControls
          />
        </div>
      )}

      {/* Modals */}
      {modalFormAberto && (
        <AparelhoFormModal
          aparelho={aparelhoParaEditar}
          lojaId={lojaId || 1}
          onClose={handleFecharForm}
        />
      )}

      {modalDeleteAberto && aparelhoParaDeletar && (
        <ConfirmModal
          isOpen={modalDeleteAberto}
          onClose={() => {
            setModalDeleteAberto(false);
            setAparelhoParaDeletar(undefined);
          }}
          onConfirm={handleDeletar}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja deletar o aparelho ${aparelhoParaDeletar.marca} ${aparelhoParaDeletar.modelo} - ${aparelhoParaDeletar.imei || aparelhoParaDeletar.numero_serie}?`}
          confirmText="Deletar"
          confirmColor="danger"
        />
      )}
    </div>
  );
}
