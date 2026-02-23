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
import { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
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
        <ModalHeader className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
          Registrar Quebra/Perda de Peça
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
              <p className="text-sm text-warning-700 dark:text-warning-300">
                ⚠️ Este registro será enviado para aprovação do administrador
                antes da baixa no estoque.
              </p>
            </div>

            {/* Aviso se não houver produtos */}
            {produtos.length === 0 && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-3">
                <p className="text-sm text-danger-700 dark:text-danger-300">
                  ❌ Nenhum produto foi vinculado a esta OS ainda. Adicione
                  produtos na OS antes de registrar quebras.
                </p>
              </div>
            )}

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
                const value = selected || "";

                console.log("Produto selecionado:", value);
                console.log("Keys recebidas:", keys);
                setProdutoSelecionado(value);
              }}
            >
              {produtos.map((produto) => {
                // Para produtos internos usa ID, para externos usa descrição completa (com sufixo)
                const chaveQuebra =
                  produto.tipo === "externa"
                    ? produto.descricao // Mantém "(Externa)" para comparar com banco
                    : produto.id;

                // Quebras já registradas no banco
                const quantidadeQuebradaBanco =
                  quebrasExistentes[chaveQuebra] || 0;

                // Quebras na lista atual (aguardando registro)
                const quantidadeQuebradaLista = quebrasLista
                  .filter((q) => {
                    if (produto.tipo === "externa") {
                      return q.produto_nome === produto.descricao;
                    } else {
                      return q.id_produto === produto.id;
                    }
                  })
                  .reduce((sum, q) => sum + q.quantidade, 0);

                // Total de quebras (banco + lista)
                const quantidadeQuebradaTotal =
                  quantidadeQuebradaBanco + quantidadeQuebradaLista;

                // Disponível para quebrar
                const disponivel =
                  produto.quantidade_na_os - quantidadeQuebradaTotal;

                // Debug para peças externas
                if (produto.tipo === "externa") {
                  console.log(`[${produto.descricao}]`, {
                    chaveQuebra,
                    quantidade_na_os: produto.quantidade_na_os,
                    banco: quantidadeQuebradaBanco,
                    lista: quantidadeQuebradaLista,
                    total: quantidadeQuebradaTotal,
                    disponivel,
                  });
                }

                return (
                  <SelectItem
                    key={produto.id}
                    className={disponivel <= 0 ? "opacity-50" : ""}
                    isDisabled={disponivel <= 0}
                    textValue={produto.descricao}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="flex-1">{produto.descricao}</span>
                      <div className="flex items-center gap-2 text-xs">
                        {quantidadeQuebradaTotal > 0 && (
                          <span className="text-danger-500 font-medium">
                            {quantidadeQuebradaTotal} quebrada(s)
                          </span>
                        )}
                        <span
                          className={
                            disponivel === 0
                              ? "text-danger-500 font-bold"
                              : "text-default-400"
                          }
                        >
                          {disponivel === 0
                            ? "ESGOTADO"
                            : `${disponivel} disponível`}
                        </span>
                        <span className="text-default-400">
                          | R$ {produto.preco_venda.toFixed(2)}
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
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    ⚠️ Este produto já tem{" "}
                    <strong>{quebrasExistentes[produtoSelecionado]}</strong>{" "}
                    quebra(s) registrada(s) nesta OS. Disponível para quebrar:{" "}
                    <strong>
                      {(produtos.find((p) => p.id === produtoSelecionado)
                        ?.quantidade_na_os || 0) -
                        quebrasExistentes[produtoSelecionado]}
                    </strong>
                  </p>
                </div>
              )}

            {/* Quantidade */}
            <Input
              label="Quantidade"
              min={1}
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />

            {/* Tipo de Ocorrência */}
            <Select
              disallowEmptySelection
              label="Tipo de Ocorrência"
              selectedKeys={[tipoOcorrencia]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];

                setTipoOcorrencia(selected ? String(selected) : "quebra");
              }}
            >
              <SelectItem key="quebra">🔨 Quebra (durante o reparo)</SelectItem>
              <SelectItem key="defeito">
                ⚠️ Defeito (peça veio com defeito)
              </SelectItem>
              <SelectItem key="perda">📦 Perda (extraviada)</SelectItem>
              <SelectItem key="vencimento">
                ⏰ Vencimento (prazo vencido)
              </SelectItem>
            </Select>

            {/* Responsável */}
            <Select
              disallowEmptySelection
              description="Quem causou ou foi responsável pela ocorrência"
              label="Responsável"
              selectedKeys={[responsavel]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];

                setResponsavel(selected ? String(selected) : "tecnico");
              }}
            >
              <SelectItem key="tecnico">👤 Técnico</SelectItem>
              <SelectItem key="fornecedor">
                🏭 Fornecedor (peça com defeito)
              </SelectItem>
              <SelectItem key="cliente">
                👥 Cliente (equipamento danificado)
              </SelectItem>
              <SelectItem key="transporte">
                🚚 Transporte (danificada no envio)
              </SelectItem>
            </Select>

            {/* Motivo */}
            <Textarea
              isRequired
              label="Motivo Detalhado"
              minRows={3}
              placeholder="Descreva o que aconteceu com a peça..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            {/* Descontar do Técnico */}
            {responsavel === "tecnico" && (
              <Checkbox
                isSelected={descontarTecnico}
                onValueChange={setDescontarTecnico}
              >
                <div>
                  <p className="text-sm">Descontar do salário do técnico</p>
                  <p className="text-xs text-default-400">
                    O valor será descontado no pagamento
                  </p>
                </div>
              </Checkbox>
            )}

            {/* Valor Total */}
            {produtoSelecionado && (
              <div className="bg-default-100 rounded-lg p-3">
                <p className="text-sm text-default-600">Valor Total:</p>
                <p className="text-lg font-semibold text-danger">
                  R${" "}
                  {(
                    (produtos.find((p) => p.id === produtoSelecionado)
                      ?.preco_venda || 0) * parseInt(quantidade || "1")
                  ).toFixed(2)}
                </p>
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
              <div className="space-y-2">
                <p className="text-sm font-semibold text-default-700">
                  Quebras a serem registradas ({quebrasLista.length}):
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
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
                          <p className="text-xs text-default-400 mt-1 line-clamp-2">
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
                <div className="bg-danger-50 dark:bg-danger-900/20 p-3 rounded-lg border border-danger-200 dark:border-danger-800">
                  <p className="text-sm text-danger-700 dark:text-danger-300">
                    Valor Total de Todas as Quebras:
                  </p>
                  <p className="text-xl font-bold text-danger">
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
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
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
