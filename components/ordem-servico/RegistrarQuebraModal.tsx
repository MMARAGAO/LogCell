"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { Alert } from "@heroui/react";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

import {
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  ClockIcon,
  UserIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  TruckIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

import { useToast } from "@/components/Toast";

interface RegistrarQuebraModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordemServicoId: string;
  idLoja: number;
  onQuebraRegistrada?: () => void;
}

interface Produto {
  id: string;
  descricao: string;
  preco_venda: number;
  quantidade_na_os: number; // quantidade disponível na OS
  tipo?: "estoque" | "externa"; // novo: tipo de produto
  peca_os_id?: string; // novo: ID da peça na ordem_servico_pecas (para externas)
}

interface QuebraItem {
  id_produto: string | null; // pode ser null para peças externas
  produto_nome: string;
  quantidade: number;
  tipo_ocorrencia: string;
  motivo: string;
  responsavel: string;
  valor_unitario: number;
  valor_total: number;
  descontar_tecnico: boolean;
}

export default function RegistrarQuebraModal({
  isOpen,
  onClose,
  ordemServicoId,
  idLoja,
  onQuebraRegistrada,
}: RegistrarQuebraModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [quebrasLista, setQuebrasLista] = useState<QuebraItem[]>([]);
  const [quebrasExistentes, setQuebrasExistentes] = useState<
    Record<string, number>
  >({}); // { id_produto: quantidade_total_quebrada }

  // Estados do formulário atual
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [tipoOcorrencia, setTipoOcorrencia] = useState("quebra");
  const [motivo, setMotivo] = useState("");
  const [responsavel, setResponsavel] = useState("tecnico");
  const [descontarTecnico, setDescontarTecnico] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarProdutos();
      carregarQuebrasExistentes();
      // Resetar form ao abrir
      setQuebrasLista([]);
      limparFormulario();
    }
  }, [isOpen, idLoja]);

  const limparFormulario = () => {
    setProdutoSelecionado("");
    setQuantidade("1");
    setTipoOcorrencia("quebra");
    setMotivo("");
    setResponsavel("tecnico");
    setDescontarTecnico(false);
  };

  const carregarProdutos = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Buscar TODAS as peças da OS (estoque + externas)
      const { data, error } = await supabase
        .from("ordem_servico_pecas")
        .select(
          `
          id,
          id_produto,
          descricao_peca,
          quantidade,
          valor_venda,
          tipo_produto,
          produtos:id_produto (
            id,
            descricao,
            preco_venda
          )
        `,
        )
        .eq("id_ordem_servico", ordemServicoId);

      if (error) throw error;

      // Transformar dados - incluir TANTO peças do estoque QUANTO externas
      const produtosDaOS: Produto[] = (data || []).map((item: any) => {
        // Se tem produtos (do estoque)
        if (item.produtos && item.id_produto) {
          return {
            id: item.produtos.id,
            descricao: item.produtos.descricao,
            preco_venda: item.produtos.preco_venda || 0,
            quantidade_na_os: item.quantidade,
            tipo: "estoque" as const,
          };
        }
        // Se é peça externa (sem id_produto)
        else {
          return {
            id: `externa_${item.id}`, // ID único para peça externa
            descricao: item.descricao_peca + " (Externa)",
            preco_venda: item.valor_venda || 0,
            quantidade_na_os: item.quantidade,
            tipo: "externa" as const,
            peca_os_id: item.id, // guardar ID da peça na OS
          };
        }
      });

      // Remover duplicatas (caso o mesmo produto do estoque apareça mais de uma vez)
      const produtosUnicos = produtosDaOS.filter(
        (produto: any, index: number, self: any[]) =>
          self.findIndex((p) => p.id === produto.id) === index,
      );

      console.log("Produtos carregados (estoque + externos):", produtosUnicos);
      setProdutos(produtosUnicos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos da OS");
    }
  };

  const carregarQuebrasExistentes = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Buscar todas as quebras já registradas desta OS (incluindo produto_descricao para peças externas)
      const { data, error } = await supabase
        .from("quebra_pecas")
        .select("id_produto, produto_descricao, quantidade")
        .eq("id_ordem_servico", ordemServicoId);

      if (error) throw error;

      // Agrupar por produto e somar quantidades
      // Para peças externas (id_produto null), usa o produto_descricao como chave
      const quebrasMap: Record<string, number> = {};

      (data || []).forEach((quebra: any) => {
        // Define a chave: para externos usa descricao, para internos usa id
        const chave =
          quebra.id_produto || quebra.produto_descricao || "externa_sem_nome";

        if (quebrasMap[chave]) {
          quebrasMap[chave] += quebra.quantidade;
        } else {
          quebrasMap[chave] = quebra.quantidade;
        }
      });

      setQuebrasExistentes(quebrasMap);
      console.log("Quebras existentes no banco:", quebrasMap);
    } catch (error) {
      console.error("Erro ao carregar quebras existentes:", error);
      // Não mostrar erro ao usuário, apenas log
    }
  };

  const adicionarQuebraALista = () => {
    console.log("Tentando adicionar quebra. Produto:", produtoSelecionado);
    console.log("Motivo:", motivo);

    if (!produtoSelecionado) {
      toast.error("Selecione o produto");

      return;
    }

    if (!motivo.trim()) {
      toast.error("Descreva o motivo da quebra/perda");

      return;
    }

    // Buscar info do produto
    const produto = produtos.find((p) => p.id === produtoSelecionado);

    console.log("Produto encontrado:", produto);

    if (!produto) {
      toast.error("Produto não encontrado");

      return;
    }

    // Verificar se o produto já está na lista (impede duplicatas)
    // Para produtos do estoque, compara pelo ID
    // Para peças externas, compara pelo nome (produto_nome)
    console.log("Verificando duplicatas...");
    console.log("Produto selecionado:", produto);
    console.log("Quebras na lista:", quebrasLista);

    // Verificar na lista atual
    const produtoJaAdicionado = quebrasLista.some((q) => {
      console.log("Comparando com quebra:", q);

      if (produto.tipo === "estoque") {
        // Produto interno: compara ID
        const duplicado = q.id_produto === produtoSelecionado;

        console.log(
          `Produto estoque - ID ${q.id_produto} === ${produtoSelecionado}? ${duplicado}`,
        );

        return duplicado;
      } else {
        // Peça externa: compara pelo nome do produto
        const duplicado = q.produto_nome === produto.descricao;

        console.log(
          `Peça externa - Nome "${q.produto_nome}" === "${produto.descricao}"? ${duplicado}`,
        );

        return duplicado;
      }
    });

    console.log("Produto já adicionado na lista?", produtoJaAdicionado);

    if (produtoJaAdicionado) {
      toast.error(
        "Este produto já foi adicionado à lista. Remova o item anterior para adicionar novamente com valores diferentes.",
      );

      return;
    }

    // Verificar se já foi registrado no banco
    // Para peças externas, usa a descrição do produto como chave (COM o sufixo)
    // Para produtos internos, usa o ID
    const chaveParaBusca =
      produto.tipo === "externa"
        ? produto.descricao // Mantém o sufixo "(Externa)" para comparar
        : produtoSelecionado;

    const jaRegistradoNoBanco = chaveParaBusca in quebrasExistentes;

    console.log("Chave para busca no banco:", chaveParaBusca);
    console.log("Quebras existentes:", quebrasExistentes);
    console.log("Já registrado no banco?", jaRegistradoNoBanco);

    if (jaRegistradoNoBanco) {
      const quantidadeJaRegistrada = quebrasExistentes[chaveParaBusca] || 0;

      toast.error(
        `Este produto já foi registrado anteriormente (${quantidadeJaRegistrada} quebra(s)). Não é possível adicionar mais quebras do mesmo produto.`,
      );

      return;
    }

    const qtd = parseInt(quantidade) || 1;

    // Verificar quantidade já adicionada na lista atual para este produto
    const quantidadeNaLista = quebrasLista
      .filter((q) => q.id_produto === produtoSelecionado)
      .reduce((sum, q) => sum + q.quantidade, 0);

    // Verificar quantidade já registrada no banco para este produto
    const quantidadeNoBank = quebrasExistentes[produtoSelecionado] || 0;

    // Total de quebras (banco + lista + nova)
    const quantidadeTotal = quantidadeNoBank + quantidadeNaLista + qtd;

    console.log("Validação de quantidade:");
    console.log("  - Na lista atual:", quantidadeNaLista);
    console.log("  - Já no banco:", quantidadeNoBank);
    console.log("  - Nova quebra:", qtd);
    console.log("  - Total:", quantidadeTotal);
    console.log("  - Disponível na OS:", produto.quantidade_na_os);

    // Validar se não excede a quantidade disponível na OS
    if (quantidadeTotal > produto.quantidade_na_os) {
      toast.error(
        `Não é possível adicionar. Total de quebras (${quantidadeTotal}) excederia a quantidade disponível na OS (${produto.quantidade_na_os}). Já foram registradas ${quantidadeNoBank} quebra(s) anteriormente.`,
      );

      return;
    }

    const valorUnitario = produto.preco_venda || 0;
    const valorTotal = valorUnitario * qtd;

    // Para peças externas, id_produto deve ser NULL
    const idProduto = produto.tipo === "externa" ? null : produtoSelecionado;

    const novaQuebra: QuebraItem = {
      id_produto: idProduto,
      produto_nome: produto.descricao,
      quantidade: qtd,
      tipo_ocorrencia: tipoOcorrencia,
      motivo: motivo,
      responsavel: responsavel,
      valor_unitario: valorUnitario,
      valor_total: valorTotal,
      descontar_tecnico: descontarTecnico,
    };

    console.log("Adicionando quebra:", novaQuebra);
    setQuebrasLista([...quebrasLista, novaQuebra]);
    limparFormulario();
    toast.success("Quebra adicionada! Adicione mais ou clique em Registrar");
  };

  const removerQuebraDaLista = (index: number) => {
    setQuebrasLista(quebrasLista.filter((_, i) => i !== index));
  };

  const registrarQuebras = async () => {
    console.log("Tentando registrar quebras. Lista:", quebrasLista);

    if (quebrasLista.length === 0) {
      toast.error("Adicione pelo menos uma quebra antes de registrar");

      return;
    }

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Usuário:", user?.id);

      // Inserir todas as quebras de uma vez
      const quebrasParaInserir = quebrasLista.map((quebra) => ({
        id_ordem_servico: ordemServicoId,
        id_produto: quebra.id_produto,
        produto_descricao: quebra.produto_nome, // Salvar nome do produto
        id_loja: idLoja,
        quantidade: quebra.quantidade,
        tipo_ocorrencia: quebra.tipo_ocorrencia,
        motivo: quebra.motivo,
        responsavel: quebra.responsavel,
        valor_unitario: quebra.valor_unitario,
        // valor_total é calculado automaticamente (GENERATED ALWAYS)
        descontar_tecnico: quebra.descontar_tecnico,
        criado_por: user?.id,
        aprovado: false, // Precisa aprovação do admin
      }));

      console.log("Inserindo quebras:", quebrasParaInserir);

      const { error } = await supabase
        .from("quebra_pecas")
        .insert(quebrasParaInserir);

      if (error) {
        console.error("Erro ao inserir:", error);
        throw error;
      }

      console.log("Quebras registradas com sucesso!");

      const totalQuebras = quebrasLista.length;

      toast.success(
        `${totalQuebras} quebra(s) registrada(s)! Aguardando aprovação do administrador`,
      );
      setQuebrasLista([]);
      limparFormulario();
      onClose();
      if (onQuebraRegistrada) onQuebraRegistrada();
    } catch (error) {
      console.error("Erro ao registrar quebras:", error);
      toast.error("Erro ao registrar quebras de peças");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
            Registrar Quebra/Perda de Peça
          </div>
          <p className="text-sm font-normal text-default-500">
            O registro vai para aprovação do administrador antes da baixa no
            estoque.
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Aviso se não houver produtos */}
            {produtos.length === 0 && (
              <Alert
                color="danger"
                description="Adicione produtos na OS antes de registrar quebras."
                title="Nenhum produto vinculado a esta OS"
                variant="faded"
              />
            )}

            {/* Seção: Peça */}
            <Secao icon={<CubeIcon className="w-4 h-4" />} title="Peça">
              {/* Produto */}
              <Select
                classNames={{
                  trigger: "min-h-12",
                  value: "text-default-900",
                }}
                description={
                  produtos.length > 0
                    ? `${produtos.length} produto(s) nesta OS`
                    : "Nenhum produto vinculado a esta OS"
                }
                isDisabled={produtos.length === 0}
                label="Produto/Peça que quebrou"
                placeholder="Selecione o produto"
                selectedKeys={
                  produtoSelecionado ? [produtoSelecionado] : undefined
                }
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys as Set<string>)[0];

                  setProdutoSelecionado(selected || "");
                }}
              >
                {produtos.map((produto) => {
                  // Para produtos internos usa ID, para externos usa descrição completa
                  const chaveQuebra =
                    produto.tipo === "externa" ? produto.descricao : produto.id;
                  const quantidadeQuebradaBanco =
                    quebrasExistentes[chaveQuebra] || 0;
                  const quantidadeQuebradaLista = quebrasLista
                    .filter((q) =>
                      produto.tipo === "externa"
                        ? q.produto_nome === produto.descricao
                        : q.id_produto === produto.id,
                    )
                    .reduce((sum, q) => sum + q.quantidade, 0);
                  const quantidadeQuebradaTotal =
                    quantidadeQuebradaBanco + quantidadeQuebradaLista;
                  const disponivel =
                    produto.quantidade_na_os - quantidadeQuebradaTotal;

                  return (
                    <SelectItem
                      key={produto.id}
                      className={disponivel <= 0 ? "opacity-50" : ""}
                      isDisabled={disponivel <= 0}
                      textValue={produto.descricao}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex-1 truncate">
                          {produto.descricao}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {quantidadeQuebradaTotal > 0 && (
                            <Chip color="danger" size="sm" variant="flat">
                              {quantidadeQuebradaTotal} quebrada(s)
                            </Chip>
                          )}
                          <Chip
                            color={disponivel === 0 ? "danger" : "default"}
                            size="sm"
                            variant="flat"
                          >
                            {disponivel === 0
                              ? "Esgotado"
                              : `${disponivel} disp.`}
                          </Chip>
                          <span className="text-xs text-default-500 tabular-nums">
                            R$ {produto.preco_venda.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>

              {/* Aviso de quebras existentes */}
              {produtoSelecionado &&
                quebrasExistentes[produtoSelecionado] > 0 && (
                  <Alert
                    color="warning"
                    description={
                      <>
                        Este produto já tem{" "}
                        <strong>{quebrasExistentes[produtoSelecionado]}</strong>{" "}
                        quebra(s) registrada(s) nesta OS. Disponível para
                        quebrar:{" "}
                        <strong>
                          {(produtos.find((p) => p.id === produtoSelecionado)
                            ?.quantidade_na_os || 0) -
                            quebrasExistentes[produtoSelecionado]}
                        </strong>
                      </>
                    }
                    variant="faded"
                  />
                )}

              {/* Quantidade */}
              <Input
                label="Quantidade"
                min={1}
                type="number"
                value={quantidade}
                variant="bordered"
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </Secao>

            {/* Seção: Classificação */}
            <Secao icon={<TagIcon className="w-4 h-4" />} title="Classificação">
              {/* Tipo de Ocorrência */}
              <Select
                disallowEmptySelection
                label="Tipo de Ocorrência"
                selectedKeys={[tipoOcorrencia]}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];

                  setTipoOcorrencia(selected ? String(selected) : "quebra");
                }}
              >
                <SelectItem
                  key="quebra"
                  startContent={<WrenchScrewdriverIcon className="w-4 h-4" />}
                >
                  Quebra (durante o reparo)
                </SelectItem>
                <SelectItem
                  key="defeito"
                  startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
                >
                  Defeito (peça veio com defeito)
                </SelectItem>
                <SelectItem
                  key="perda"
                  startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                >
                  Perda (extraviada)
                </SelectItem>
                <SelectItem
                  key="vencimento"
                  startContent={<ClockIcon className="w-4 h-4" />}
                >
                  Vencimento (prazo vencido)
                </SelectItem>
              </Select>

              {/* Responsável */}
              <Select
                disallowEmptySelection
                description="Quem causou ou foi responsável pela ocorrência"
                label="Responsável"
                selectedKeys={[responsavel]}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];

                  setResponsavel(selected ? String(selected) : "tecnico");
                }}
              >
                <SelectItem
                  key="tecnico"
                  startContent={<UserIcon className="w-4 h-4" />}
                >
                  Técnico
                </SelectItem>
                <SelectItem
                  key="fornecedor"
                  startContent={<BuildingStorefrontIcon className="w-4 h-4" />}
                >
                  Fornecedor (peça com defeito)
                </SelectItem>
                <SelectItem
                  key="cliente"
                  startContent={<UsersIcon className="w-4 h-4" />}
                >
                  Cliente (equipamento danificado)
                </SelectItem>
                <SelectItem
                  key="transporte"
                  startContent={<TruckIcon className="w-4 h-4" />}
                >
                  Transporte (danificada no envio)
                </SelectItem>
              </Select>

              {/* Descontar do Técnico */}
              {responsavel === "tecnico" && (
                <Checkbox
                  isSelected={descontarTecnico}
                  onValueChange={setDescontarTecnico}
                >
                  <div>
                    <p className="text-sm">Descontar do salário do técnico</p>
                    <p className="text-xs text-default-500">
                      O valor será descontado no pagamento
                    </p>
                  </div>
                </Checkbox>
              )}
            </Secao>

            {/* Seção: Detalhes */}
            <Secao
              icon={<DocumentTextIcon className="w-4 h-4" />}
              title="Detalhes"
            >
              {/* Motivo */}
              <Textarea
                isRequired
                label="Motivo Detalhado"
                minRows={3}
                placeholder="Descreva o que aconteceu com a peça..."
                value={motivo}
                variant="bordered"
                onChange={(e) => setMotivo(e.target.value)}
              />
            </Secao>

            {/* Faixa de ação: resumo + adicionar */}
            {produtoSelecionado && (
              <div className="flex items-center justify-between rounded-lg border border-default-200/70 bg-default-100 px-3 py-2.5">
                <span className="text-sm text-default-600">
                  Valor desta quebra
                </span>
                <span className="text-lg font-semibold text-danger tabular-nums">
                  R${" "}
                  {(
                    (produtos.find((p) => p.id === produtoSelecionado)
                      ?.preco_venda || 0) * parseInt(quantidade || "1")
                  ).toFixed(2)}
                </span>
              </div>
            )}

            {/* Botão Adicionar à Lista */}
            <Button
              className="w-full"
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              variant="flat"
              onPress={adicionarQuebraALista}
            >
              Adicionar Quebra à Lista
            </Button>

            {/* Lista de Quebras Adicionadas */}
            {quebrasLista.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-default-200/70">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-default-700">
                    Quebras a serem registradas
                  </p>
                  <Chip color="default" size="sm" variant="flat">
                    {quebrasLista.length}
                  </Chip>
                </div>
                <div className="space-y-2">
                  {quebrasLista.map((quebra, index) => (
                    <div
                      key={index}
                      className="bg-default-50 dark:bg-default-100/10 p-3 rounded-lg border border-default-200 dark:border-default-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {quebra.produto_nome}
                          </p>
                          <p className="text-xs text-default-500 mt-1">
                            Qtd: {quebra.quantidade} • {quebra.tipo_ocorrencia}{" "}
                            • {quebra.responsavel}
                          </p>
                          <p className="text-xs text-default-500 mt-1 line-clamp-2">
                            {quebra.motivo}
                          </p>
                          <p className="text-sm font-semibold text-danger mt-1">
                            R$ {quebra.valor_total.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => removerQuebraDaLista(index)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Valor Total de Todas as Quebras */}
                <div className="flex items-center justify-between bg-danger-100 dark:bg-danger-900/40 p-3 rounded-lg border border-danger dark:border-danger-700/60">
                  <p className="text-sm font-medium text-danger-700 dark:text-danger-300">
                    Valor total de todas as quebras
                  </p>
                  <p className="text-xl font-bold text-danger tabular-nums">
                    R${" "}
                    {quebrasLista
                      .reduce((acc, q) => acc + q.valor_total, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            variant="light"
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto"
            color="danger"
            isDisabled={quebrasLista.length === 0}
            isLoading={loading}
            startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
            onPress={registrarQuebras}
          >
            Registrar {quebrasLista.length > 0 && `(${quebrasLista.length})`}{" "}
            Quebra(s)
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/** Bloco de seção do formulário: container neutro com ícone + título. */
function Secao({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-default-200/70 bg-default-50 dark:bg-default-100/5 p-3 space-y-3">
      <div className="flex items-center gap-2 text-default-500">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}
