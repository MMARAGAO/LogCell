"use client";

import type { OrdemServico } from "@/types/ordemServico";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  UserIcon,
  FireIcon,
  ExclamationCircleIcon,
  BoltIcon,
  CubeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/hooks/useConfirm";
import LaudoTecnico from "@/components/ordem-servico/LaudoTecnico";
import RegistrarQuebraModal from "@/components/ordem-servico/RegistrarQuebraModal";

// Função para formatar telefone
const formatarTelefone = (telefone: string) => {
  const numero = telefone.replace(/\D/g, "");

  if (numero.length === 11) {
    // Celular com DDD: (XX) XXXXX-XXXX
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  } else if (numero.length === 10) {
    // Fixo com DDD: (XX) XXXX-XXXX
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  } else if (numero.length === 9) {
    // Celular sem DDD: XXXXX-XXXX
    return `${numero.slice(0, 5)}-${numero.slice(5)}`;
  } else if (numero.length === 8) {
    // Fixo sem DDD: XXXX-XXXX
    return `${numero.slice(0, 4)}-${numero.slice(4)}`;
  }

  return telefone;
};

export default function OrdemServicoDetalheTecnicoPage() {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuthContext();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [loading, setLoading] = useState(true);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [fotos, setFotos] = useState<any[]>([]);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quebraModal, setQuebraModal] = useState(false);
  const [quebras, setQuebras] = useState<any[]>([]);
  const [loadingQuebras, setLoadingQuebras] = useState(false);
  const [activeTab, setActiveTab] = useState("informacoes");
  const [pecas, setPecas] = useState<any[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(false);

  useEffect(() => {
    if (params.id) {
      carregarOrdem();
      carregarFotos();
      carregarQuebras();
      carregarPecas();
    }
  }, [params.id]);

  const carregarOrdem = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      // Verificar se é a OS do técnico
      if (data.tecnico_responsavel !== usuario?.id) {
        toast.error("Você não tem acesso a esta OS");
        router.push("/sistema/ordem-servico/tecnico");

        return;
      }

      setOrdem(data);
      setNovoStatus(data.status);
      setObservacoes(data.observacoes_tecnicas || "");
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
      toast.error("Erro ao carregar ordem de serviço");
      router.push("/sistema/ordem-servico/tecnico");
    } finally {
      setLoading(false);
    }
  };

  const carregarFotos = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { data, error } = await supabase
        .from("ordem_servico_fotos")
        .select("*")
        .eq("id_ordem_servico", params.id)
        .order("ordem", { ascending: true });

      if (error) throw error;
      setFotos(data || []);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const carregarQuebras = async () => {
    setLoadingQuebras(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { data, error } = await supabase
        .from("quebra_pecas")
        .select(
          `
          id,
          id_produto,
          produto_descricao,
          id_ordem_servico,
          quantidade,
          tipo_ocorrencia,
          motivo,
          responsavel,
          valor_unitario,
          valor_total,
          descontar_tecnico,
          criado_em,
          aprovado,
          aprovado_em,
          produtos:id_produto (
            id,
            descricao
          )
        `,
        )
        .eq("id_ordem_servico", params.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      // Usar produto_descricao quando disponível, senão buscar do join
      const quebrasComNomes = (data || []).map((quebra: any) => {
        let produtoNome = quebra.produto_descricao;

        // Se não tiver produto_descricao, tenta pegar do join
        if (!produtoNome && quebra.produtos?.descricao) {
          produtoNome = quebra.produtos.descricao;
        }

        // Fallback
        if (!produtoNome) {
          produtoNome = "Produto não identificado";
        }

        return {
          ...quebra,
          produtos: { id: quebra.id_produto, descricao: produtoNome },
        };
      });

      setQuebras(quebrasComNomes);
    } catch (error) {
      console.error("Erro ao carregar quebras:", error);
    } finally {
      setLoadingQuebras(false);
    }
  };

  const carregarPecas = async () => {
    setLoadingPecas(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      console.log("Carregando peças para OS:", params.id);

      const { data, error } = await supabase
        .from("ordem_servico_pecas")
        .select("*")
        .eq("id_ordem_servico", params.id)
        .order("criado_em", { ascending: true });

      if (error) {
        console.error("Erro Supabase ao carregar peças:", error);
        throw error;
      }

      console.log("Peças carregadas:", data);
      setPecas(data || []);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
      toast.error("Erro ao carregar peças da OS");
    } finally {
      setLoadingPecas(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    setUploadingFoto(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máx 5MB)`);
          continue;
        }

        // Gerar nome único
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}_${randomString}_${file.name}`;
        const filePath = `ordem-servico/${params.id}/${fileName}`;

        // Upload para o Storage
        const { error: uploadError } = await supabase.storage
          .from("ordem-servico-fotos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("ordem-servico-fotos").getPublicUrl(filePath);

        // Salvar no banco
        const proximaOrdem =
          fotos.length > 0 ? Math.max(...fotos.map((f) => f.ordem)) + 1 : 0;

        const { error: dbError } = await supabase
          .from("ordem_servico_fotos")
          .insert({
            id_ordem_servico: params.id,
            url: publicUrl,
            ordem: proximaOrdem,
            is_principal: fotos.length === 0, // Primeira foto é principal
          });

        if (dbError) throw dbError;
      }

      toast.success("Foto(s) adicionada(s) com sucesso!");
      carregarFotos();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao adicionar foto(s)");
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removerFoto = async (fotoId: string, fotoUrl: string) => {
    const confirmado = await confirm({
      title: "Remover Foto",
      message: "Deseja realmente remover esta foto?",
      confirmText: "Remover",
      cancelText: "Cancelar",
      variant: "danger",
      confirmColor: "danger",
    });

    if (!confirmado) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Extrair caminho do arquivo da URL
      const urlParts = fotoUrl.split("/ordem-servico-fotos/");

      if (urlParts.length > 1) {
        const filePath = urlParts[1].split("?")[0];

        // Deletar do Storage
        await supabase.storage.from("ordem-servico-fotos").remove([filePath]);
      }

      // Deletar do banco
      const { error } = await supabase
        .from("ordem_servico_fotos")
        .delete()
        .eq("id", fotoId);

      if (error) throw error;

      toast.success("Foto removida com sucesso!");
      carregarFotos();
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto");
    }
  };

  const salvarAtualizacao = async () => {
    if (!ordem) return;

    setSalvando(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { error } = await supabase
        .from("ordem_servico")
        .update({
          status: novoStatus,
          observacoes_tecnicas: observacoes,
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuario?.id,
        })
        .eq("id", ordem.id);

      if (error) throw error;

      toast.success("OS atualizada com sucesso!");
      carregarOrdem();
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar ordem de serviço");
    } finally {
      setSalvando(false);
    }
  };

  const concluirOS = async () => {
    if (!ordem) return;

    if (!observacoes.trim()) {
      toast.error("Adicione observações técnicas antes de concluir");

      return;
    }

    setSalvando(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { error } = await supabase
        .from("ordem_servico")
        .update({
          status: "concluido",
          observacoes_tecnicas: observacoes,
          data_conclusao: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuario?.id,
        })
        .eq("id", ordem.id);

      if (error) throw error;

      toast.success("OS concluída com sucesso!");
      router.push("/sistema/ordem-servico/tecnico");
    } catch (error) {
      console.error("Erro ao concluir OS:", error);
      toast.error("Erro ao concluir ordem de serviço");
    } finally {
      setSalvando(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aguardando":
        return "default";
      case "em_diagnostico":
        return "primary";
      case "em_andamento":
        return "warning";
      case "aguardando_pecas":
        return "danger";
      case "concluido":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aguardando":
        return "Aguardando";
      case "em_diagnostico":
        return "Em Diagnóstico";
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_pecas":
        return "Aguardando Peças";
      case "concluido":
        return "Concluído";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-default-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!ordem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-default-500">Ordem de serviço não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              aria-label="Voltar"
              variant="light"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">OS #{ordem.numero_os}</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                <p className="text-sm text-default-500">
                  Criada em{" "}
                  {new Date(ordem.criado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {ordem.criado_por && (
                  <p className="text-sm text-default-500">
                    • Por: {ordem.criado_por}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip color={getStatusColor(ordem.status)} size="lg" variant="flat">
              {getStatusLabel(ordem.status)}
            </Chip>
            {ordem.equipamento_senha && (
              <Chip
                color="warning"
                size="lg"
                startContent={<LockClosedIcon className="w-4 h-4" />}
                variant="flat"
              >
                {ordem.equipamento_senha}
              </Chip>
            )}
            {ordem.prioridade && ordem.prioridade !== "normal" && (
              <Chip
                color={
                  ordem.prioridade === "urgente"
                    ? "danger"
                    : ordem.prioridade === "alta"
                      ? "warning"
                      : "default"
                }
                size="lg"
                variant="dot"
              >
                {ordem.prioridade === "urgente" ? (
                  <span className="flex items-center gap-1">
                    <FireIcon className="w-4 h-4" /> Urgente
                  </span>
                ) : ordem.prioridade === "alta" ? (
                  <span className="flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" /> Alta
                  </span>
                ) : (
                  ordem.prioridade
                )}
              </Chip>
            )}
          </div>
        </div>

        {/* Linha de Informações Rápidas */}
        <div className="flex flex-wrap gap-3">
          {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
            <Chip
              color="success"
              size="md"
              startContent={<CurrencyDollarIcon className="w-4 h-4" />}
              variant="flat"
            >
              R$ {ordem.valor_orcamento.toFixed(2)}
            </Chip>
          )}
          {ordem.previsao_entrega && (
            <Chip
              color={(() => {
                const hoje = new Date();
                const prazo = new Date(ordem.previsao_entrega);
                const diffDays = Math.ceil(
                  (prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
                );

                if (diffDays < 0) return "danger";
                if (diffDays <= 2) return "warning";

                return "primary";
              })()}
              size="md"
              startContent={<CalendarIcon className="w-4 h-4" />}
              variant="flat"
            >
              {new Date(ordem.previsao_entrega).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </Chip>
          )}
          {ordem.laudo_garantia_dias && ordem.laudo_garantia_dias > 0 && (
            <Chip
              color="default"
              size="md"
              startContent={<ShieldCheckIcon className="w-4 h-4" />}
              variant="flat"
            >
              {ordem.laudo_garantia_dias}{" "}
              {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
            </Chip>
          )}
          {ordem.tipo_cliente && (
            <Chip
              color={ordem.tipo_cliente === "lojista" ? "primary" : "secondary"}
              size="md"
              startContent={
                ordem.tipo_cliente === "lojista" ? (
                  <BuildingStorefrontIcon className="w-4 h-4" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )
              }
              variant="flat"
            >
              {ordem.tipo_cliente === "lojista" ? "Lojista" : "Consumidor"}
            </Chip>
          )}
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-4 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
        color="primary"
        selectedKey={activeTab}
        size="lg"
        variant="underlined"
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        {/* Tab 1: Informações e Ações */}
        <Tab
          key="informacoes"
          title={
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5" />
              <span>Informações</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6">
            {/* Informações do Cliente e Equipamento */}
            <Card className="shadow-medium">
              <CardHeader>
                <h2 className="text-lg font-semibold">Dados da OS</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-content2 rounded-lg">
                    <p className="text-xs font-semibold text-default-500 mb-1">
                      Cliente
                    </p>
                    <p className="text-base font-medium">
                      {ordem.cliente_nome}
                    </p>
                    {ordem.tipo_cliente && (
                      <Chip
                        className="mt-1"
                        color={
                          ordem.tipo_cliente === "lojista"
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        startContent={
                          ordem.tipo_cliente === "lojista" ? (
                            <BuildingStorefrontIcon className="w-3 h-3" />
                          ) : (
                            <UserIcon className="w-3 h-3" />
                          )
                        }
                        variant="flat"
                      >
                        {ordem.tipo_cliente === "lojista"
                          ? "Lojista"
                          : "Consumidor Final"}
                      </Chip>
                    )}
                  </div>

                  <div className="p-3 bg-content2 rounded-lg">
                    <p className="text-xs font-semibold text-default-500 mb-1">
                      Equipamento
                    </p>
                    <p className="text-base font-medium">
                      {ordem.equipamento_tipo}
                      {ordem.equipamento_marca &&
                        ` - ${ordem.equipamento_marca}`}
                      {ordem.equipamento_modelo &&
                        ` ${ordem.equipamento_modelo}`}
                    </p>
                  </div>

                  {ordem.equipamento_numero_serie && (
                    <div className="p-3 bg-content2 rounded-lg">
                      <p className="text-xs font-semibold text-default-500 mb-1">
                        Número de Série
                      </p>
                      <p className="text-base font-medium font-mono">
                        {ordem.equipamento_numero_serie}
                      </p>
                    </div>
                  )}

                  {ordem.equipamento_senha && (
                    <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border-2 border-warning-200 dark:border-warning-800">
                      <div className="flex items-center gap-1 mb-1">
                        <LockClosedIcon className="w-4 h-4 text-warning-700 dark:text-warning-400" />
                        <p className="text-xs font-semibold text-warning-700 dark:text-warning-400">
                          Senha do Dispositivo
                        </p>
                      </div>
                      <p className="text-xl font-bold font-mono text-warning-700 dark:text-warning-400">
                        {ordem.equipamento_senha}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-content2 rounded-lg md:col-span-2">
                    <p className="text-xs font-semibold text-default-500 mb-1">
                      Defeito Reclamado
                    </p>
                    <p className="text-base">{ordem.defeito_reclamado}</p>
                  </div>

                  {/* Informações Financeiras */}
                  {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
                    <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border-2 border-success-200 dark:border-success-800">
                      <div className="flex items-center gap-1 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-success-700 dark:text-success-400" />
                        <p className="text-xs font-semibold text-success-700 dark:text-success-400">
                          Valor do Orçamento
                        </p>
                      </div>
                      <p className="text-xl font-bold text-success-700 dark:text-success-400">
                        R$ {ordem.valor_orcamento.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Prazo de Entrega */}
                  {ordem.previsao_entrega && (
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
                      <div className="flex items-center gap-1 mb-1">
                        <CalendarIcon className="w-4 h-4 text-primary-700 dark:text-primary-400" />
                        <p className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                          Previsão de Entrega
                        </p>
                      </div>
                      <p className="text-base font-bold text-primary-700 dark:text-primary-400">
                        {new Date(ordem.previsao_entrega).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
                        {(() => {
                          const hoje = new Date();
                          const prazo = new Date(ordem.previsao_entrega);
                          const diffTime = prazo.getTime() - hoje.getTime();
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24),
                          );

                          if (diffDays < 0) {
                            return (
                              <span className="flex items-center gap-1">
                                <ExclamationCircleIcon className="w-3 h-3" />
                                Atrasado {Math.abs(diffDays)} dia(s)
                              </span>
                            );
                          } else if (diffDays === 0) {
                            return (
                              <span className="flex items-center gap-1">
                                <FireIcon className="w-3 h-3" />
                                Entrega hoje!
                              </span>
                            );
                          } else if (diffDays === 1) {
                            return (
                              <span className="flex items-center gap-1">
                                <BoltIcon className="w-3 h-3" />
                                Entrega amanhã
                              </span>
                            );
                          } else {
                            return `Faltam ${diffDays} dias`;
                          }
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Garantia */}
                  {ordem.laudo_garantia_dias &&
                    ordem.laudo_garantia_dias > 0 && (
                      <div className="p-3 bg-content2 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <ShieldCheckIcon className="w-4 h-4 text-default-500" />
                          <p className="text-xs font-semibold text-default-500">
                            Garantia
                          </p>
                        </div>
                        <p className="text-base font-medium">
                          {ordem.laudo_garantia_dias}{" "}
                          {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
                        </p>
                      </div>
                    )}

                  {/* Contato do Cliente */}
                  {ordem.cliente_telefone && (
                    <div className="p-3 bg-content2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <PhoneIcon className="w-4 h-4 text-default-500" />
                        <p className="text-xs font-semibold text-default-500">
                          Telefone do Cliente
                        </p>
                      </div>
                      <p className="text-base font-medium">
                        {formatarTelefone(ordem.cliente_telefone)}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Atualização de Status e Observações */}
            <Card className="shadow-medium">
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Atualizar Status e Observações
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  disabled={ordem.status === "concluido"}
                  label="Status da OS"
                  selectedKeys={[novoStatus]}
                  size="lg"
                  variant="bordered"
                  onChange={(e) => setNovoStatus(e.target.value)}
                >
                  <SelectItem key="em_andamento">Em Andamento</SelectItem>
                  <SelectItem key="em_diagnostico">Em Diagnóstico</SelectItem>
                  <SelectItem key="aguardando_pecas">
                    Aguardando Peças
                  </SelectItem>
                </Select>

                <Textarea
                  disabled={ordem.status === "concluido"}
                  label="Observações Técnicas"
                  minRows={6}
                  placeholder="Descreva o diagnóstico, peças necessárias, procedimentos realizados..."
                  value={observacoes}
                  variant="bordered"
                  onChange={(e) => setObservacoes(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1"
                    color="primary"
                    isDisabled={ordem.status === "concluido"}
                    isLoading={salvando}
                    size="lg"
                    startContent={<ClockIcon className="w-5 h-5" />}
                    onPress={salvarAtualizacao}
                  >
                    Salvar Atualização
                  </Button>
                  <Button
                    className="flex-1"
                    color="success"
                    isDisabled={
                      ordem.status === "concluido" || !observacoes.trim()
                    }
                    isLoading={salvando}
                    size="lg"
                    startContent={<CheckCircleIcon className="w-5 h-5" />}
                    onPress={concluirOS}
                  >
                    Concluir OS
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Histórico de Observações */}
            {ordem.observacoes_tecnicas && (
              <Card className="shadow-medium">
                <CardHeader className="bg-gradient-to-r from-default/10 to-primary/10">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Histórico de Observações
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="p-4 bg-default-50 dark:bg-default-100/10 rounded-lg">
                    <p className="text-default-700 whitespace-pre-wrap leading-relaxed">
                      {ordem.observacoes_tecnicas}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>

        {/* Tab 2: Fotos */}
        <Tab
          key="fotos"
          title={
            <div className="flex items-center gap-2">
              <PhotoIcon className="w-5 h-5" />
              <span>Fotos</span>
              {fotos.length > 0 && (
                <Chip size="sm" variant="flat">
                  {fotos.length}
                </Chip>
              )}
            </div>
          }
        >
          <div className="mt-6">
            <Card className="shadow-medium">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-success/10">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Galeria de Fotos
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <Button
                    className="w-full"
                    color="secondary"
                    isLoading={uploadingFoto}
                    size="lg"
                    startContent={<PhotoIcon className="w-5 h-5" />}
                    variant="flat"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    {uploadingFoto ? "Enviando..." : "Adicionar Fotos"}
                  </Button>
                  <p className="text-xs text-default-400 mt-2 text-center">
                    Máximo 5MB por foto • JPG, PNG, GIF
                  </p>
                </div>

                {/* Grid de Fotos */}
                {fotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fotos.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <button
                          className="aspect-square rounded-xl overflow-hidden bg-default-100 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
                          type="button"
                          onClick={() => setFotoSelecionada(foto.url)}
                        >
                          <Image
                            alt="Foto da OS"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            height={300}
                            src={foto.url}
                            width={300}
                          />
                        </button>
                        {foto.is_principal && (
                          <Chip
                            className="absolute top-2 left-2 shadow-lg"
                            color="warning"
                            size="sm"
                          >
                            ⭐ Principal
                          </Chip>
                        )}
                        <Button
                          isIconOnly
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          color="danger"
                          size="sm"
                          variant="solid"
                          onPress={() => removerFoto(foto.id, foto.url)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-default-400 bg-default-50 dark:bg-default-100/10 rounded-xl">
                    <PhotoIcon className="w-20 h-20 mx-auto mb-4 opacity-40" />
                    <p className="font-medium text-lg">
                      Nenhuma foto adicionada
                    </p>
                    <p className="text-sm mt-2">
                      Clique no botão acima para adicionar fotos do equipamento
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Tab 3: Laudo Técnico */}
        <Tab
          key="laudo"
          title={
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Laudo Técnico</span>
            </div>
          }
        >
          <div className="mt-6">
            <LaudoTecnico ordemServicoId={ordem.id} />
          </div>
        </Tab>

        {/* Tab 4: Peças/Produtos */}
        <Tab
          key="pecas"
          title={
            <div className="flex items-center gap-2">
              <CubeIcon className="w-5 h-5" />
              <span>Peças</span>
              {pecas.length > 0 && (
                <Chip color="primary" size="sm" variant="flat">
                  {pecas.length}
                </Chip>
              )}
            </div>
          }
        >
          <div className="mt-6">
            <Card className="shadow-medium">
              <CardHeader>
                <h2 className="text-lg font-semibold">Peças Associadas à OS</h2>
              </CardHeader>
              <CardBody>
                {loadingPecas ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : pecas.length === 0 ? (
                  <div className="text-center py-16 text-default-400">
                    <CubeIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">
                      Nenhuma peça associada
                    </p>
                    <p className="text-sm mt-2">
                      Ainda não foram adicionadas peças a esta OS
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      // Agrupar peças pelo id_produto e tipo_produto
                      const pecasAgrupadas = pecas.reduce(
                        (acc: any[], peca) => {
                          const chave = `${peca.id_produto || peca.descricao_peca}_${peca.tipo_produto}`;
                          const existente = acc.find((p) => p.chave === chave);

                          if (existente) {
                            // Somar quantidades
                            existente.quantidade += peca.quantidade;
                            existente.ids.push(peca.id);
                            // Manter o mais recente baixado/reservado
                            if (peca.estoque_baixado) {
                              existente.estoque_baixado = true;
                              existente.data_baixa_estoque =
                                peca.data_baixa_estoque;
                            }
                            if (
                              peca.estoque_reservado &&
                              !existente.estoque_baixado
                            ) {
                              existente.estoque_reservado = true;
                              existente.data_reserva_estoque =
                                peca.data_reserva_estoque;
                            }
                          } else {
                            acc.push({
                              ...peca,
                              chave,
                              ids: [peca.id],
                            });
                          }

                          return acc;
                        },
                        [],
                      );

                      return pecasAgrupadas.map((peca) => (
                        <div
                          key={peca.chave}
                          className="p-4 rounded-lg border-2 bg-content2 hover:bg-content3 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                              {/* Tipo de Produto */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Chip
                                  color={
                                    peca.tipo_produto === "estoque"
                                      ? "primary"
                                      : "secondary"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {peca.tipo_produto === "estoque"
                                    ? "Estoque"
                                    : "Avulso/Externo"}
                                </Chip>
                                {peca.estoque_reservado && (
                                  <Chip color="warning" size="sm" variant="dot">
                                    Reservado
                                  </Chip>
                                )}
                                {peca.estoque_baixado && (
                                  <Chip
                                    color="success"
                                    size="sm"
                                    startContent={
                                      <CheckIcon className="w-3 h-3" />
                                    }
                                    variant="dot"
                                  >
                                    Baixado
                                  </Chip>
                                )}
                              </div>

                              {/* Descrição */}
                              <div>
                                <p className="font-semibold text-lg">
                                  {peca.tipo_produto === "estoque" &&
                                  peca.produtos
                                    ? peca.produtos.descricao
                                    : peca.descricao_peca}
                                </p>
                                {peca.tipo_produto === "estoque" &&
                                  peca.produtos?.codigo_barras && (
                                    <p className="text-xs text-default-500 font-mono mt-1">
                                      Código: {peca.produtos.codigo_barras}
                                    </p>
                                  )}
                              </div>

                              {/* Informações */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-600">
                                <span className="font-medium">
                                  Qtd: {peca.quantidade}
                                </span>
                                <span>
                                  Custo Un.: R$ {peca.valor_custo.toFixed(2)}
                                </span>
                                <span>
                                  Venda Un.: R$ {peca.valor_venda.toFixed(2)}
                                </span>
                              </div>

                              {/* Datas */}
                              {(peca.data_reserva_estoque ||
                                peca.data_baixa_estoque) && (
                                <div className="text-xs text-default-400 space-y-1">
                                  {peca.data_reserva_estoque && (
                                    <p>
                                      Reservado em:{" "}
                                      {new Date(
                                        peca.data_reserva_estoque,
                                      ).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                  {peca.data_baixa_estoque && (
                                    <p>
                                      Baixado em:{" "}
                                      {new Date(
                                        peca.data_baixa_estoque,
                                      ).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Observação */}
                              {peca.observacao && (
                                <p className="text-sm text-default-500 bg-default-100 dark:bg-default-50/10 p-2 rounded">
                                  Obs: {peca.observacao}
                                </p>
                              )}

                              {/* Quebras Associadas */}
                              {(() => {
                                const quebrasRelacionadas = quebras.filter(
                                  (q) => q.id_produto === peca.id_produto,
                                );

                                if (quebrasRelacionadas.length > 0) {
                                  const totalQuebrado =
                                    quebrasRelacionadas.reduce(
                                      (sum, q) => sum + q.quantidade,
                                      0,
                                    );
                                  const totalValor = quebrasRelacionadas.reduce(
                                    (sum, q) => sum + (q.valor_total || 0),
                                    0,
                                  );

                                  return (
                                    <div className="mt-2 p-3 bg-danger-50 dark:bg-danger-900/20 border-l-3 border-danger rounded">
                                      <div className="flex items-start gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-semibold text-danger">
                                              Quebras Registradas
                                            </p>
                                            <Chip
                                              color="danger"
                                              size="sm"
                                              variant="flat"
                                            >
                                              {quebrasRelacionadas.length}{" "}
                                              registro(s)
                                            </Chip>
                                          </div>

                                          <div className="space-y-2">
                                            {quebrasRelacionadas.map(
                                              (quebra) => (
                                                <div
                                                  key={quebra.id}
                                                  className="p-2 bg-white dark:bg-default-100/10 rounded text-xs"
                                                >
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <Chip
                                                      color={
                                                        quebra.aprovado
                                                          ? "success"
                                                          : "warning"
                                                      }
                                                      size="sm"
                                                      variant="flat"
                                                    >
                                                      {quebra.aprovado
                                                        ? "Aprovada"
                                                        : "Pendente"}
                                                    </Chip>
                                                    <span className="font-semibold text-danger-700 dark:text-danger-300">
                                                      Qtd: {quebra.quantidade}
                                                    </span>
                                                    <span className="text-default-500">
                                                      Tipo:{" "}
                                                      {quebra.tipo_ocorrencia ||
                                                        "quebra"}
                                                    </span>
                                                  </div>
                                                  {quebra.responsavel && (
                                                    <p className="text-default-600 dark:text-default-400 mb-1">
                                                      <span className="font-medium">
                                                        Resp.:
                                                      </span>{" "}
                                                      {quebra.responsavel}
                                                    </p>
                                                  )}
                                                  <p className="text-default-600 dark:text-default-400">
                                                    {quebra.motivo}
                                                  </p>
                                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-default-200 dark:border-default-100">
                                                    <span className="text-default-500">
                                                      Registrado em{" "}
                                                      {new Date(
                                                        quebra.criado_em,
                                                      ).toLocaleString(
                                                        "pt-BR",
                                                        {
                                                          day: "2-digit",
                                                          month: "2-digit",
                                                          year: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                        },
                                                      )}
                                                      {quebra.aprovado_em &&
                                                        ` • Aprovado em ${new Date(quebra.aprovado_em).toLocaleDateString("pt-BR")}`}
                                                    </span>
                                                    {quebra.valor_total > 0 && (
                                                      <span className="font-semibold text-danger">
                                                        R${" "}
                                                        {quebra.valor_total.toFixed(
                                                          2,
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>

                                          {quebrasRelacionadas.length > 1 && (
                                            <div className="mt-2 pt-2 border-t border-danger-200 dark:border-danger-800 flex items-center justify-between text-xs font-semibold text-danger-700 dark:text-danger-300">
                                              <span>
                                                Total Quebrado: {totalQuebrado}{" "}
                                                unidade(s)
                                              </span>
                                              {totalValor > 0 && (
                                                <span>
                                                  Total: R${" "}
                                                  {totalValor.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                return null;
                              })()}
                            </div>

                            {/* Valores Totais */}
                            <div className="text-right space-y-1">
                              <div>
                                <p className="text-xs text-default-500">
                                  Custo Total
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  R${" "}
                                  {(peca.valor_custo * peca.quantidade).toFixed(
                                    2,
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-default-500">
                                  Venda Total
                                </p>
                                <p className="text-base font-semibold text-success">
                                  R$ {peca.valor_total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Totais Gerais */}
                    {pecas.length > 1 && (
                      <div className="pt-4 mt-2 border-t-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                            <p className="text-sm text-default-600 mb-1">
                              Total de Itens
                            </p>
                            <p className="text-2xl font-bold">
                              {pecas.reduce((sum, p) => sum + p.quantidade, 0)}
                            </p>
                          </div>
                          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                            <p className="text-sm text-primary-700 dark:text-primary-400 mb-1">
                              Custo Total
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              R${" "}
                              {pecas
                                .reduce(
                                  (sum, p) =>
                                    sum + p.valor_custo * p.quantidade,
                                  0,
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                            <p className="text-sm text-success-700 dark:text-success-400 mb-1">
                              Venda Total
                            </p>
                            <p className="text-2xl font-bold text-success">
                              R${" "}
                              {pecas
                                .reduce((sum, p) => sum + p.valor_total, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Tab 5: Quebras/Perdas */}
        <Tab
          key="quebras"
          title={
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Quebras</span>
              {quebras.length > 0 && (
                <Chip
                  color={
                    quebras.some((q) => !q.aprovado) ? "warning" : "default"
                  }
                  size="sm"
                  variant="flat"
                >
                  {quebras.length}
                </Chip>
              )}
            </div>
          }
        >
          <div className="mt-6 space-y-6">
            {/* Botão de Registrar Quebra */}
            <Card className="shadow-medium">
              <CardBody>
                <Button
                  className="w-full"
                  color="danger"
                  size="lg"
                  startContent={<ExclamationTriangleIcon className="w-5 h-5" />}
                  variant="flat"
                  onPress={() => setQuebraModal(true)}
                >
                  Registrar Quebra/Perda de Peça
                </Button>
                <p className="text-xs text-center text-default-400 mt-3">
                  Use apenas se uma peça quebrar ou for perdida durante o reparo
                </p>
              </CardBody>
            </Card>

            {/* Lista de Quebras */}
            <Card className="shadow-medium">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-lg font-semibold">Quebras Registradas</h2>
                  {quebras.length > 0 && (
                    <Chip size="sm" variant="flat">
                      {quebras.length} registro(s)
                    </Chip>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {loadingQuebras ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : quebras.length === 0 ? (
                  <div className="text-center py-16 text-default-400">
                    <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 opacity-30 text-success" />
                    <p className="text-lg font-medium">
                      Nenhuma quebra registrada
                    </p>
                    <p className="text-sm mt-2">
                      Isso é ótimo! Mantenha o cuidado com as peças.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quebras.map((quebra) => (
                      <div
                        key={quebra.id}
                        className="p-4 rounded-lg border-2 bg-content2 hover:bg-content3 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-lg">
                                {quebra.produtos?.descricao ||
                                  "Produto não identificado"}
                              </span>
                              <Chip
                                color={quebra.aprovado ? "success" : "warning"}
                                size="sm"
                                variant="dot"
                              >
                                {quebra.aprovado ? "Aprovada" : "Pendente"}
                              </Chip>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-600">
                              <span className="font-medium">
                                Qtd: {quebra.quantidade}
                              </span>
                              <span>Tipo: {quebra.tipo_ocorrencia}</span>
                              <span>Resp.: {quebra.responsavel}</span>
                            </div>

                            {quebra.motivo && (
                              <p className="text-sm text-default-500 bg-default-100 dark:bg-default-50/10 p-2 rounded">
                                {quebra.motivo}
                              </p>
                            )}

                            <div className="text-xs text-default-400">
                              Registrado em{" "}
                              {new Date(quebra.criado_em).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                              {quebra.aprovado && quebra.aprovado_em && (
                                <span className="ml-2">
                                  • Aprovado em{" "}
                                  {new Date(
                                    quebra.aprovado_em,
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-danger">
                              R$ {quebra.valor_total.toFixed(2)}
                            </div>
                            {quebra.descontar_tecnico && (
                              <Chip
                                className="mt-2"
                                color="danger"
                                size="sm"
                                variant="flat"
                              >
                                Será Descontado
                              </Chip>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    {quebras.length > 1 && (
                      <div className="pt-4 mt-2 border-t-2">
                        <div className="flex justify-between items-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                          <div>
                            <span className="text-lg font-semibold">
                              Total de Quebras:
                            </span>
                            <div className="flex gap-4 mt-1 text-sm text-default-600">
                              <span>
                                {quebras.filter((q) => !q.aprovado).length}{" "}
                                pendente(s)
                              </span>
                              <span>
                                {quebras.filter((q) => q.aprovado).length}{" "}
                                aprovada(s)
                              </span>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-danger">
                            R${" "}
                            {quebras
                              .reduce((sum, q) => sum + q.valor_total, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      {/* Modal de visualização de foto */}
      {fotoSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="button"
          tabIndex={0}
          onClick={() => setFotoSelecionada(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFotoSelecionada(null);
            }
          }}
        >
          <Button
            isIconOnly
            className="absolute top-4 right-4 z-10 shadow-2xl"
            color="danger"
            size="lg"
            variant="solid"
            onPress={() => setFotoSelecionada(null)}
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
          <div className="max-w-6xl max-h-[90vh] p-4">
            <Image
              alt="Foto ampliada"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
              height={1600}
              src={fotoSelecionada}
              width={1600}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal de Quebra */}
      <RegistrarQuebraModal
        idLoja={ordem.id_loja}
        isOpen={quebraModal}
        ordemServicoId={ordem.id}
        onClose={() => setQuebraModal(false)}
        onQuebraRegistrada={() => {
          toast.success("Quebra registrada com sucesso!");
          carregarQuebras();
        }}
      />

      {/* Dialog de Confirmação */}
      <ConfirmDialog />
    </div>
  );
}
