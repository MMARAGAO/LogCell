"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Progress,
  Card,
  CardBody,
  Chip,
  Pagination,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import {
  Package,
  Store,
  FileText,
  Camera,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { buscarTodosClientesAtivos } from "@/lib/clienteHelpers";
import { CarrosselFotos, CarrosselFoto } from "@/components/CarrosselFotos";
import { rmaService } from "@/services/rmaService";
import {
  TipoOrigemRMA,
  TipoRMA,
  StatusRMA,
  NovoRMA,
  LABELS_TIPO_ORIGEM,
  LABELS_TIPO_RMA,
  LABELS_STATUS_RMA,
} from "@/types/rma";

interface FormularioRMAProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Produto {
  id: string;
  descricao: string;
  marca?: string;
  categoria?: string;
  grupo?: string;
  modelos?: string;
  preco_venda?: number;
  codigo_fabricante?: string;
  foto_url?: string;
  estoque_lojas?: {
    quantidade: number;
  }[];
}

interface Loja {
  id: number;
  nome: string;
}

interface Cliente {
  id: string;
  nome: string;
  cpf?: string | null;
}

interface Fornecedor {
  id: string;
  nome: string;
}

const ETAPAS = [
  { numero: 1, titulo: "Loja e Origem", icone: Store },
  { numero: 2, titulo: "Produto e Quantidade", icone: Package },
  { numero: 3, titulo: "Detalhes da RMA", icone: FileText },
  { numero: 4, titulo: "Fotos", icone: Camera },
];

export default function FormularioRMA({
  isOpen,
  onClose,
  onSuccess,
}: FormularioRMAProps) {
  const { usuario } = useAuth();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputBuscaRef = React.useRef<HTMLInputElement>(null);

  // Dados do formulário
  const [tipoOrigem, setTipoOrigem] = useState<TipoOrigemRMA | "">("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");
  const [tipoRMA, setTipoRMA] = useState<TipoRMA | "">("");
  const [status, setStatus] = useState<StatusRMA>("pendente");
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<CarrosselFoto[]>([]);

  // Opções para selects
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const itensPorPagina = 8;
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [manterFoco, setManterFoco] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  const carregarDados = async () => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Carregar produtos com paginação (será filtrado por loja depois)
      let produtosData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("produtos")
          .select("id, descricao, marca, categoria")
          .eq("ativo", true)
          .order("descricao")
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        produtosData = [...produtosData, ...(data || [])];
        page++;
        hasMore = (data?.length || 0) === pageSize;
      }

      // Carregar lojas
      const { data: lojasData } = await supabase
        .from("lojas")
        .select("id, nome")
        .order("nome");

      // Carregar clientes ativos (com paginação automática)
      const todosClientes = await buscarTodosClientesAtivos();

      // Carregar fornecedores
      const { data: fornecedoresData } = await supabase
        .from("fornecedores")
        .select("id, nome")
        .order("nome");

      setProdutos(produtosData || []);
      setLojas(lojasData || []);
      setClientes(todosClientes);
      setFornecedores(fornecedoresData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const carregarProdutosComEstoque = async (
    lojaIdSelecionada: number,
    pagina: number = 1,
    termoBusca: string = ""
  ) => {
    setLoadingProdutos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Buscar todos os produtos da loja em lotes de 1000
      let todosEstoque: any[] = [];
      let paginaBusca = 0;
      const tamanhoPagina = 1000;
      let temMais = true;

      while (temMais) {
        const { data: estoqueData, error } = await supabase
          .from("estoque_lojas")
          .select(
            `
            quantidade,
            id_produto,
            produtos:id_produto (
              id,
              descricao,
              marca,
              categoria,
              grupo,
              modelos,
              preco_venda,
              codigo_fabricante
            )
          `
          )
          .eq("id_loja", lojaIdSelecionada)
          .gt("quantidade", 0)
          .range(
            paginaBusca * tamanhoPagina,
            (paginaBusca + 1) * tamanhoPagina - 1
          );

        if (error) {
          console.error("Erro ao carregar produtos:", error);
          setProdutos([]);
          setTotalProdutos(0);
          return;
        }

        todosEstoque = [...todosEstoque, ...(estoqueData || [])];
        paginaBusca++;
        temMais = (estoqueData?.length || 0) === tamanhoPagina;
      }

      // Transformar dados para o formato esperado
      let produtosComEstoque = todosEstoque
        .filter((item: any) => item.produtos)
        .map((item: any) => {
          return {
            id: item.produtos.id,
            descricao: item.produtos.descricao,
            marca: item.produtos.marca,
            categoria: item.produtos.categoria,
            grupo: item.produtos.grupo,
            modelos: item.produtos.modelos,
            preco_venda: item.produtos.preco_venda,
            codigo_fabricante: item.produtos.codigo_fabricante,
            foto_url: undefined,
            estoque_lojas: [{ quantidade: item.quantidade }],
          };
        });

      // Aplicar filtro de busca no cliente
      if (termoBusca.trim()) {
        const buscaLower = termoBusca.toLowerCase().trim();
        const palavrasBusca = buscaLower
          .split(/\s+/)
          .filter((p) => p.length > 0);

        produtosComEstoque = produtosComEstoque.filter((produto: any) => {
          const textoPesquisavel = [
            produto.descricao || "",
            produto.marca || "",
            produto.categoria || "",
            produto.grupo || "",
            produto.modelos || "",
            produto.codigo_fabricante || "",
          ]
            .join(" ")
            .toLowerCase();

          return palavrasBusca.every((palavra) =>
            textoPesquisavel.includes(palavra)
          );
        });
      }

      const totalFiltrados = produtosComEstoque.length;
      setTotalProdutos(totalFiltrados);

      // Aplicar paginação
      const inicio = (pagina - 1) * itensPorPagina;
      const fim = inicio + itensPorPagina;
      const produtosPaginados = produtosComEstoque.slice(inicio, fim);

      // Buscar fotos apenas para os produtos da página atual
      const produtoIds = produtosPaginados.map((p: any) => p.id);
      let fotosMap: Record<string, string> = {};

      if (produtoIds.length > 0) {
        const { data: fotosData } = await supabase
          .from("fotos_produtos")
          .select("produto_id, url, is_principal")
          .in("produto_id", produtoIds)
          .order("is_principal", { ascending: false })
          .order("ordem", { ascending: true });

        if (fotosData) {
          fotosData.forEach((foto: any) => {
            if (!fotosMap[foto.produto_id]) {
              fotosMap[foto.produto_id] = foto.url;
            }
          });
        }
      }

      // Adicionar fotos aos produtos paginados
      const produtosComFotos = produtosPaginados.map((produto: any) => ({
        ...produto,
        foto_url: fotosMap[produto.id] || undefined,
      }));

      setProdutos(produtosComFotos);
    } catch (error) {
      console.error("Erro ao carregar produtos com estoque:", error);
      setProdutos([]);
      setTotalProdutos(0);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Atualizar produtos quando a loja for selecionada
  useEffect(() => {
    if (lojaId) {
      setPaginaAtual(1);
      carregarProdutosComEstoque(lojaId, 1, "");
    } else {
      setProdutos([]);
      setTotalProdutos(0);
    }
  }, [lojaId]);

  // Busca dinâmica com debounce
  useEffect(() => {
    if (!lojaId) return;

    setManterFoco(true);

    const timeoutId = setTimeout(() => {
      setPaginaAtual(1);
      carregarProdutosComEstoque(lojaId, 1, buscaProduto);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [buscaProduto, lojaId]);

  // Restaurar foco após carregamento
  useEffect(() => {
    if (manterFoco && !loadingProdutos && inputBuscaRef.current) {
      inputBuscaRef.current.focus();
      setManterFoco(false);
    }
  }, [loadingProdutos, manterFoco]);

  const handleMudarPagina = (novaPagina: number) => {
    if (!lojaId) return;
    setPaginaAtual(novaPagina);
    carregarProdutosComEstoque(lojaId, novaPagina, buscaProduto);
  };

  const totalPaginas = Math.ceil(totalProdutos / itensPorPagina);

  const resetarFormulario = () => {
    setEtapaAtual(1);
    setTipoOrigem("");
    setProdutoId("");
    setQuantidade(1);
    setLojaId(null);
    setClienteId("");
    setFornecedorId("");
    setTipoRMA("");
    setStatus("pendente");
    setMotivo("");
    setObservacoes("");
    setFotos([]);
    setFotosPreview([]);
    setBuscaProduto("");
    setProdutos([]);
    setTotalProdutos(0);
    setPaginaAtual(1);
    setErro(null);
  };

  const validarEtapa = (etapa: number): boolean => {
    setErro(null);

    switch (etapa) {
      case 1:
        if (!lojaId) {
          setErro("Selecione uma loja");
          return false;
        }
        if (!tipoOrigem) {
          setErro("Selecione o tipo de origem do RMA");
          return false;
        }
        if (tipoOrigem === "cliente" && !clienteId) {
          setErro("Selecione um cliente");
          return false;
        }
        if (tipoOrigem === "interno_fornecedor" && !fornecedorId) {
          setErro("Selecione um fornecedor");
          return false;
        }
        return true;

      case 2:
        if (!produtoId) {
          setErro("Selecione um produto");
          return false;
        }
        if (quantidade < 1) {
          setErro("A quantidade deve ser maior que zero");
          return false;
        }
        return true;

      case 3:
        if (!tipoRMA) {
          setErro("Selecione o tipo de RMA");
          return false;
        }
        if (!motivo.trim()) {
          setErro("Informe o motivo da RMA");
          return false;
        }
        return true;

      case 4:
        // Fotos são opcionais
        return true;

      default:
        return false;
    }
  };

  const proximaEtapa = () => {
    if (validarEtapa(etapaAtual)) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const etapaAnterior = () => {
    setErro(null);
    setEtapaAtual(etapaAtual - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);

      // Validar cada arquivo
      for (const arquivo of arquivos) {
        if (arquivo.size > 5 * 1024 * 1024) {
          setErro(`Arquivo ${arquivo.name} excede 5MB`);
          return;
        }
        if (!["image/jpeg", "image/jpg", "image/png"].includes(arquivo.type)) {
          setErro(`Formato do arquivo ${arquivo.name} não suportado`);
          return;
        }
      }

      const novasFotos = [...fotos, ...arquivos];
      setFotos(novasFotos);

      // Criar previews das novas fotos
      arquivos.forEach((arquivo, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotosPreview((prev) => [
            ...prev,
            {
              id: Date.now() + index,
              url: reader.result as string,
              legenda: arquivo.name,
            },
          ]);
        };
        reader.readAsDataURL(arquivo);
      });

      setErro(null);
    }
  };

  const removerFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validarEtapa(4)) return;

    if (!usuario) {
      setErro("Usuário não autenticado");
      return;
    }

    if (!lojaId) {
      setErro("Loja não selecionada");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const dados: NovoRMA = {
        tipo_origem: tipoOrigem as TipoOrigemRMA,
        tipo_rma: tipoRMA as TipoRMA,
        status,
        produto_id: produtoId,
        loja_id: lojaId,
        cliente_id: tipoOrigem === "cliente" ? clienteId : undefined,
        fornecedor_id:
          tipoOrigem === "interno_fornecedor" ? fornecedorId : undefined,
        quantidade,
        motivo,
        observacoes_assistencia: observacoes || undefined,
        fotos: fotos.length > 0 ? fotos : undefined,
      };

      await rmaService.criarRMA(dados, usuario.id);

      onSuccess();
      onClose();
      resetarFormulario();
    } catch (error: any) {
      console.error("Erro ao criar RMA:", error);
      setErro(error.message || "Erro ao criar RMA");
    } finally {
      setLoading(false);
    }
  };

  const progresso = (etapaAtual / ETAPAS.length) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="outside"
      isDismissable={!loading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Novo RMA</h2>
          <p className="text-sm text-gray-600 font-normal">
            Registre uma nova solicitação de RMA
          </p>
        </ModalHeader>

        <ModalBody>
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {ETAPAS.map((etapa) => {
                const Icone = etapa.icone;
                const completa = etapa.numero < etapaAtual;
                const atual = etapa.numero === etapaAtual;

                return (
                  <div
                    key={etapa.numero}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        completa
                          ? "bg-success text-white"
                          : atual
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {completa ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icone className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={`text-xs text-center ${
                        atual ? "font-semibold" : "text-gray-500"
                      }`}
                    >
                      {etapa.titulo}
                    </p>
                  </div>
                );
              })}
            </div>
            <Progress value={progresso} color="primary" className="mt-2" />
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <Card className="bg-danger-50 border border-danger-200 mb-4">
              <CardBody className="flex flex-row items-center gap-2">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <p className="text-sm text-danger">{erro}</p>
              </CardBody>
            </Card>
          )}

          {/* Etapa 1: Loja e Origem */}
          {etapaAtual === 1 && (
            <div className="space-y-4">
              <Select
                label="Loja de Origem"
                placeholder="Selecione a loja"
                selectedKeys={lojaId ? [String(lojaId)] : []}
                onChange={(e) =>
                  setLojaId(e.target.value ? parseInt(e.target.value) : null)
                }
                isRequired
                description="Loja onde o produto está localizado"
              >
                {lojas.map((loja) => (
                  <SelectItem key={String(loja.id)}>{loja.nome}</SelectItem>
                ))}
              </Select>

              <Select
                label="Tipo de Origem"
                placeholder="Selecione o tipo"
                selectedKeys={tipoOrigem ? [tipoOrigem] : []}
                onChange={(e) => setTipoOrigem(e.target.value as TipoOrigemRMA)}
                isRequired
                description="Defina se é um RMA interno/fornecedor ou de cliente"
              >
                {Object.entries(LABELS_TIPO_ORIGEM).map(([valor, label]) => (
                  <SelectItem key={valor}>{label}</SelectItem>
                ))}
              </Select>

              {tipoOrigem === "cliente" && (
                <Autocomplete
                  label="Cliente"
                  placeholder="Digite para buscar..."
                  selectedKey={clienteId}
                  onSelectionChange={(key) => setClienteId(key as string)}
                  isRequired
                  description="Cliente que está devolvendo o produto"
                  allowsCustomValue={false}
                  defaultItems={clientes}
                >
                  {(cliente) => (
                    <AutocompleteItem
                      key={cliente.id}
                      textValue={`${cliente.nome} ${cliente.cpf || ""}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{cliente.nome}</span>
                        {cliente.cpf && (
                          <span className="text-xs text-gray-500">
                            CPF: {cliente.cpf}
                          </span>
                        )}
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}

              {tipoOrigem === "interno_fornecedor" && (
                <Select
                  label="Fornecedor"
                  placeholder="Selecione o fornecedor"
                  selectedKeys={fornecedorId ? [fornecedorId] : []}
                  onChange={(e) => setFornecedorId(e.target.value)}
                  description="Fornecedor do produto (opcional)"
                >
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Etapa 2: Produto e Quantidade */}
          {etapaAtual === 2 && (
            <div className="space-y-4">
              {!lojaId ? (
                <Card className="bg-warning-50 border border-warning-200">
                  <CardBody>
                    <p className="text-sm text-warning-700">
                      Selecione uma loja na etapa anterior para visualizar os
                      produtos disponíveis
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <>
                  <Input
                    type="text"
                    label="Buscar Produto"
                    placeholder="Ex: bat ip 11 (busca: bateria iphone 11)"
                    ref={inputBuscaRef}
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    onFocus={() => setManterFoco(true)}
                    description={`${totalProdutos} produto(s) encontrado(s) - Digite palavras-chave separadas por espaço`}
                    startContent={
                      loadingProdutos ? (
                        <div className="animate-spin">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <Package className="w-4 h-4 text-gray-400" />
                      )
                    }
                    isClearable
                    onClear={() => setBuscaProduto("")}
                  />

                  <div className="space-y-3">
                    {loadingProdutos ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : produtos.length === 0 ? (
                      <Card className="bg-gray-50">
                        <CardBody className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">
                            {buscaProduto
                              ? "Nenhum produto encontrado com esse termo"
                              : "Nenhum produto disponível nesta loja"}
                          </p>
                        </CardBody>
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                          {produtos.map((produto) => {
                            const estoque =
                              produto.estoque_lojas?.[0]?.quantidade || 0;
                            const selecionado = produtoId === produto.id;

                            return (
                              <Card
                                key={produto.id}
                                isPressable
                                isHoverable
                                className={`cursor-pointer transition-all h-full ${
                                  selecionado
                                    ? "ring-2 ring-primary border-primary bg-primary-50"
                                    : "hover:bg-gray-50 hover:shadow-md"
                                }`}
                                onPress={() => setProdutoId(produto.id)}
                              >
                                <CardBody className="p-3">
                                  {/* Foto do Produto */}
                                  <div className="w-full mb-3">
                                    {produto.foto_url ? (
                                      <img
                                        src={produto.foto_url}
                                        alt={produto.descricao}
                                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                                      />
                                    ) : (
                                      <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Informações do Produto */}
                                  <div className="space-y-2">
                                    <h3
                                      className={`font-semibold text-sm line-clamp-2 min-h-[2.5rem] ${
                                        selecionado ? "text-primary" : ""
                                      }`}
                                      title={produto.descricao}
                                    >
                                      {produto.descricao}
                                    </h3>

                                    {/* Chips: Marca, Categoria */}
                                    <div className="flex flex-wrap gap-1">
                                      {produto.marca && (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="primary"
                                          className="text-xs"
                                        >
                                          {produto.marca}
                                        </Chip>
                                      )}
                                      {produto.categoria && (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="secondary"
                                          className="text-xs"
                                        >
                                          {produto.categoria}
                                        </Chip>
                                      )}
                                    </div>

                                    {/* Grupo (se existir) */}
                                    {produto.grupo && (
                                      <p className="text-xs text-gray-600 line-clamp-1">
                                        <span className="font-semibold">
                                          Grupo:
                                        </span>{" "}
                                        {produto.grupo}
                                      </p>
                                    )}

                                    {/* Modelos */}
                                    {produto.modelos && (
                                      <p className="text-xs text-gray-600 line-clamp-2">
                                        <span className="font-semibold">
                                          Modelos:
                                        </span>{" "}
                                        {produto.modelos}
                                      </p>
                                    )}

                                    {/* Código */}
                                    {produto.codigo_fabricante && (
                                      <p className="text-xs text-gray-500">
                                        <span className="font-semibold">
                                          Cód:
                                        </span>{" "}
                                        {produto.codigo_fabricante}
                                      </p>
                                    )}

                                    {/* Footer: Preço e Estoque */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                      {produto.preco_venda ? (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="success"
                                        >
                                          <span className="font-bold">
                                            R$ {produto.preco_venda.toFixed(2)}
                                          </span>
                                        </Chip>
                                      ) : (
                                        <div></div>
                                      )}

                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                          estoque > 10
                                            ? "success"
                                            : estoque > 5
                                              ? "warning"
                                              : estoque > 0
                                                ? "danger"
                                                : "default"
                                        }
                                      >
                                        <span className="font-bold">
                                          {estoque}
                                        </span>{" "}
                                        un.
                                      </Chip>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Paginação */}
                        {totalPaginas > 1 && (
                          <div className="flex justify-center pt-2">
                            <Pagination
                              total={totalPaginas}
                              page={paginaAtual}
                              onChange={handleMudarPagina}
                              size="sm"
                              showControls
                              color="primary"
                              classNames={{
                                cursor: "bg-primary text-white",
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {produtoId && (
                    <Input
                      type="number"
                      label="Quantidade"
                      placeholder="Digite a quantidade"
                      value={quantidade.toString()}
                      onChange={(e) =>
                        setQuantidade(parseInt(e.target.value) || 1)
                      }
                      min={1}
                      isRequired
                      description="Quantidade de unidades para RMA"
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Etapa 3: Detalhes da RMA */}
          {etapaAtual === 3 && (
            <div className="space-y-4">
              <Select
                label="Tipo de RMA"
                placeholder="Selecione o tipo"
                selectedKeys={tipoRMA ? [tipoRMA] : []}
                onChange={(e) => setTipoRMA(e.target.value as TipoRMA)}
                isRequired
                description="Motivo principal do RMA"
              >
                {Object.entries(LABELS_TIPO_RMA).map(([valor, label]) => (
                  <SelectItem key={valor}>{label}</SelectItem>
                ))}
              </Select>

              <Textarea
                label="Motivo Detalhado"
                placeholder="Descreva o motivo do RMA..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                minRows={3}
                isRequired
                description="Explique em detalhes o problema ou motivo"
              />

              <Textarea
                label="Observações da Assistência"
                placeholder="Observações técnicas (opcional)..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                minRows={2}
                description="Informações adicionais da assistência técnica"
              />
            </div>
          )}

          {/* Etapa 4: Fotos */}
          {etapaAtual === 4 && (
            <div className="space-y-6">
              {/* Botão de seleção de fotos */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="font-semibold">
                    {fotos.length === 0
                      ? "Selecionar Fotos"
                      : `Adicionar Mais Fotos (${fotos.length} selecionada(s))`}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-default-500 text-center">
                  Formatos aceitos: JPG, PNG, JPEG. Máximo: 5MB por foto.
                </p>
              </div>

              {/* Carrossel com previews das fotos */}
              {fotosPreview.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {fotos.length} foto(s) selecionada(s)
                    </p>
                  </div>

                  <CarrosselFotos
                    fotos={fotosPreview}
                    height="400px"
                    showThumbnails={true}
                    showLegendas={true}
                  />

                  {/* Lista de fotos com opção de remover */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Gerenciar fotos:</p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {fotos.map((foto, index) => (
                        <Card key={index}>
                          <CardBody className="flex flex-row items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-default-100">
                                {fotosPreview[index] && (
                                  <img
                                    src={fotosPreview[index].url}
                                    alt={foto.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {foto.name}
                                </p>
                                <p className="text-xs text-default-500">
                                  {(foto.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              isIconOnly
                              onClick={() => removerFoto(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="bg-default-50">
                  <CardBody className="text-center py-12">
                    <Camera className="w-16 h-16 text-default-300 mx-auto mb-3" />
                    <p className="text-sm text-default-500 mb-1">
                      Nenhuma foto selecionada
                    </p>
                    <p className="text-xs text-default-400">
                      As fotos são opcionais, mas ajudam na análise do RMA
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {etapaAtual > 1 && (
            <Button
              variant="flat"
              onPress={etapaAnterior}
              startContent={<ArrowLeft className="w-4 h-4" />}
              isDisabled={loading}
            >
              Voltar
            </Button>
          )}

          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>

          {etapaAtual < ETAPAS.length ? (
            <Button
              color="primary"
              onPress={proximaEtapa}
              endContent={<ArrowRight className="w-4 h-4" />}
            >
              Próximo
            </Button>
          ) : (
            <Button
              color="success"
              onPress={handleSubmit}
              isLoading={loading}
              startContent={!loading && <CheckCircle2 className="w-4 h-4" />}
            >
              {loading ? "Criando RMA..." : "Criar RMA"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
