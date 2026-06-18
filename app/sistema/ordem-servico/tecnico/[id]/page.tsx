"use client";

import type { OrdemServico } from "@/types/ordemServico";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Textarea } from "@heroui/input";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
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
  BuildingStorefrontIcon,
  UserIcon,
  FireIcon,
  ExclamationCircleIcon,
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/hooks/useConfirm";
import LaudoTecnico from "@/components/ordem-servico/LaudoTecnico";
import SectionCard from "@/components/ordem-servico/SectionCard";
import OSControlSidebar from "@/components/ordem-servico/OSControlSidebar";
import TabPecas from "@/components/ordem-servico/TabPecas";

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
  const [quebras, setQuebras] = useState<any[]>([]);
  const [loadingQuebras, setLoadingQuebras] = useState(false);
  const [activeTab, setActiveTab] = useState("informacoes");
  const [pecas, setPecas] = useState<any[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(false);
  const [bancada, setBancada] = useState("");
  const [salvandoBancada, setSalvandoBancada] = useState(false);
  const [checklistConclusao, setChecklistConclusao] = useState(false);
  const [bancadasOcupadas, setBancadasOcupadas] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      carregarOrdem();
      carregarFotos();
      carregarQuebras();
      carregarPecas();
      carregarBancadasOcupadas();
    }
  }, [params.id]);

  // Bancadas já associadas a OUTRAS OS ativas (não podem ser reutilizadas)
  const carregarBancadasOcupadas = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Bancada é liberada (null) automaticamente quando a OS sai do estado
      // ativo, então basta considerar ocupada qualquer OS (≠ esta) com bancada.
      const { data, error } = await supabase
        .from("ordem_servico")
        .select("bancada")
        .not("bancada", "is", null)
        .neq("id", params.id);

      if (error) throw error;

      const ocupadas = Array.from(
        new Set((data || []).map((o: any) => o.bancada).filter(Boolean)),
      );

      setBancadasOcupadas(ocupadas as string[]);
    } catch (error) {
      console.error("Erro ao carregar bancadas ocupadas:", error);
    }
  };

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
      setBancada(data.bancada || "");
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
          bancada: null, // libera a bancada ao concluir
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

  const salvarBancada = async (valor: string) => {
    if (!ordem) return;

    setSalvandoBancada(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { error } = await supabase
        .from("ordem_servico")
        .update({
          bancada: valor || null,
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuario?.id,
        })
        .eq("id", ordem.id);

      if (error) throw error;

      setBancada(valor);
      setOrdem({ ...ordem, bancada: valor });
      toast.success(
        valor ? `Bancada ${valor} associada com sucesso!` : "Bancada removida",
      );
    } catch (error) {
      console.error("Erro ao salvar bancada:", error);
      toast.error("Erro ao salvar bancada");
    } finally {
      setSalvandoBancada(false);
    }
  };

  const compartilharStream = () => {
    if (!ordem?.id) return;

    const url = `${window.location.origin}/ver-stream/${ordem.id}`;

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copiado para a área de transferência!"))
      .catch(() => {
        // Fallback para iOS/Safari
        const textarea = document.createElement("textarea");

        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Link copiado!");
      });
  };

  const getStatusColor = (
    status: string,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (status) {
      case "aguardando":
        return "default";
      case "em_diagnostico":
        return "primary";
      case "em_andamento":
        return "warning";
      case "aguardando_pecas":
      case "aguardando_peca":
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
      <div className="space-y-6 pb-8 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="bg-content1 rounded-xl shadow-sm border border-default-200/70 p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="rounded-lg w-10 h-10" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-32 rounded-lg" />
              <Skeleton className="h-5 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-px w-full rounded-none" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* Conteúdo: main + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
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

  const osConcluida = ordem.status === "concluido";
  const temAlteracoes =
    novoStatus !== ordem.status ||
    observacoes !== (ordem.observacoes_tecnicas || "");

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav
        aria-label="Trilha de navegação"
        className="flex items-center gap-1.5 text-xs text-default-400"
      >
        <button
          className="hover:text-default-600 transition-colors"
          type="button"
          onClick={() => router.push("/sistema/ordem-servico/tecnico")}
        >
          Minhas Ordens
        </button>
        <ChevronRightIcon className="w-3 h-3 shrink-0" />
        <span className="text-default-600 font-medium">
          OS #{ordem.numero_os}
        </span>
      </nav>

      {/* Header */}
      <div className="bg-content1 rounded-xl shadow-sm border border-default-200/70 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              aria-label="Voltar"
              className="text-default-400 hover:text-default-600"
              variant="light"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
                  Ordem de Serviço
                </span>
                <span className="text-xs text-default-300">
                  #{ordem.numero_os}
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {ordem.cliente_nome}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-default-500">
                  Criada em{" "}
                  {new Date(ordem.criado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {ordem.criado_por && (
                  <span className="text-xs text-default-400">
                    • {ordem.criado_por}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip color={getStatusColor(ordem.status)} size="sm" variant="flat">
              {getStatusLabel(ordem.status)}
            </Chip>
            {ordem.equipamento_senha && (
              <Chip
                color="warning"
                size="sm"
                startContent={<LockClosedIcon className="w-3 h-3" />}
                variant="flat"
              >
                {ordem.equipamento_senha}
              </Chip>
            )}
            {ordem.prioridade === "urgente" && (
              <Chip
                color="danger"
                size="sm"
                startContent={<FireIcon className="w-3 h-3" />}
                variant="flat"
              >
                Urgente
              </Chip>
            )}
            {ordem.prioridade === "alta" && (
              <Chip
                color="warning"
                size="sm"
                startContent={<ExclamationCircleIcon className="w-3 h-3" />}
                variant="flat"
              >
                Alta
              </Chip>
            )}
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-default-200/70">
          {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
            <Chip
              color="success"
              size="sm"
              startContent={<CurrencyDollarIcon className="w-3 h-3" />}
              variant="flat"
            >
              R$ {ordem.valor_orcamento.toFixed(2)}
            </Chip>
          )}
          {ordem.previsao_entrega && (
            <Chip
              color={(() => {
                const diff = Math.ceil(
                  (new Date(ordem.previsao_entrega).getTime() - Date.now()) /
                    86400000,
                );

                if (diff < 0) return "danger";
                if (diff <= 2) return "warning";

                return "default";
              })()}
              size="sm"
              startContent={<CalendarIcon className="w-3 h-3" />}
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
              size="sm"
              startContent={<ShieldCheckIcon className="w-3 h-3" />}
              variant="flat"
            >
              {ordem.laudo_garantia_dias}{" "}
              {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
            </Chip>
          )}
          {ordem.tipo_cliente && (
            <Chip
              color="default"
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
              {ordem.tipo_cliente === "lojista" ? "Lojista" : "Consumidor"}
            </Chip>
          )}
        </div>

        {/* Status Progress Bar */}
        <div className="mt-5 pt-4 border-t border-default-200/70">
          <StatusProgressBar current={ordem.status} />
        </div>
      </div>

      {/* Layout "issue": conteúdo principal + sidebar de controles */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Conteúdo principal: Tabs */}
        <div className="min-w-0">
          {/* Tabs de Navegação */}
          <Tabs
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 overflow-x-auto flex-nowrap",
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
                {/* OS Info Card */}
                <SectionCard
                  icon={<InformationCircleIcon className="w-4 h-4" />}
                  title="Informações da OS"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="Cliente" value={ordem.cliente_nome} />
                    <DetailField
                      label="Equipamento"
                      value={`${ordem.equipamento_tipo}${ordem.equipamento_marca ? ` - ${ordem.equipamento_marca}` : ""}${ordem.equipamento_modelo ? ` ${ordem.equipamento_modelo}` : ""}`}
                    />
                    {ordem.equipamento_numero_serie && (
                      <DetailField
                        mono
                        label="Nº de Série"
                        value={ordem.equipamento_numero_serie}
                      />
                    )}
                    {ordem.equipamento_senha && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                          Senha do Dispositivo
                        </p>
                        <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300">
                          {ordem.equipamento_senha}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Defeito Reclamado
                      </p>
                      <p className="text-sm text-default-600 bg-default-100 rounded-xl p-3 border border-default-200/70">
                        {ordem.defeito_reclamado}
                      </p>
                    </div>
                    {ordem.cliente_telefone && (
                      <DetailField
                        label="Telefone"
                        value={formatarTelefone(ordem.cliente_telefone)}
                      />
                    )}
                  </div>
                </SectionCard>

                {/* Valores + Guarantia */}
                {(ordem.valor_orcamento || ordem.laudo_garantia_dias) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
                      <div className="bg-content1 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900 p-5">
                        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                          Valor do Serviço
                        </p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                          R$ {ordem.valor_orcamento.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {ordem.laudo_garantia_dias &&
                      ordem.laudo_garantia_dias > 0 && (
                        <div className="bg-content1 rounded-xl shadow-sm border border-default-200/70 p-5">
                          <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider mb-1">
                            Garantia
                          </p>
                          <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-default-400" />
                            <p className="font-semibold text-foreground">
                              {ordem.laudo_garantia_dias}{" "}
                              {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Observações Editor + Timeline */}
                <SectionCard
                  icon={<DocumentTextIcon className="w-4 h-4" />}
                  title="Observações Técnicas"
                >
                  <div className="relative pl-6 space-y-4">
                    {/* Linha vertical da timeline */}
                    <div className="absolute left-2.5 top-1 bottom-0 w-px bg-default-200" />

                    {/* Observação existente (se houver) */}
                    {ordem.observacoes_tecnicas && (
                      <div className="relative">
                        <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-default-400 ring-2 ring-white dark:ring-zinc-900" />
                        <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider mb-1">
                          {ordem.data_inicio_servico
                            ? new Date(
                                ordem.data_inicio_servico,
                              ).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : new Date(ordem.criado_em).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                        </p>
                        <p className="text-sm text-default-600 whitespace-pre-wrap leading-relaxed bg-default-100 rounded-xl p-3 border border-default-200/70">
                          {ordem.observacoes_tecnicas}
                        </p>
                      </div>
                    )}

                    {/* Nova observação */}
                    <div className="relative">
                      <div className="absolute -left-4 top-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-zinc-900" />
                      <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
                        Nova Observação
                      </p>
                      <Textarea
                        classNames={{
                          input: "text-sm",
                          inputWrapper: "bg-default-100 border-default-200",
                        }}
                        isDisabled={ordem.status === "concluido"}
                        minRows={3}
                        placeholder="Descreva o diagnóstico, procedimentos realizados..."
                        value={observacoes}
                        variant="bordered"
                        onChange={(e) => setObservacoes(e.target.value)}
                      />
                    </div>
                  </div>
                </SectionCard>
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
                <SectionCard
                  bodyClassName="space-y-4"
                  icon={<PhotoIcon className="w-4 h-4" />}
                  title="Galeria de Fotos"
                >
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
                      {fotos.map((foto, fotoIdx) => (
                        <div key={foto.id} className="relative group">
                          <button
                            className="aspect-square rounded-xl overflow-hidden bg-default-100 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
                            type="button"
                            onClick={() => setFotoSelecionada(foto.url)}
                          >
                            <Image
                              alt={`Foto ${fotoIdx + 1} da OS`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                          <Tooltip closeDelay={0} content="Remover foto">
                            <Button
                              isIconOnly
                              aria-label="Remover foto"
                              className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity shadow-lg"
                              color="danger"
                              size="sm"
                              variant="solid"
                              onPress={() => removerFoto(foto.id, foto.url)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </Tooltip>
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
                        Clique no botão acima para adicionar fotos do
                        equipamento
                      </p>
                    </div>
                  )}
                </SectionCard>
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
              <TabPecas
                loadingPecas={loadingPecas}
                pecas={pecas}
                quebras={quebras}
              />
            </Tab>
          </Tabs>
        </div>

        {/* Sidebar de controles (Status + Câmera) — persistente em todas as abas */}
        <aside className="space-y-6 lg:sticky lg:top-4">
          <OSControlSidebar
            bancada={bancada}
            bancadasOcupadas={bancadasOcupadas}
            novoStatus={novoStatus}
            ordemId={ordem.id}
            salvandoBancada={salvandoBancada}
            statusAtual={ordem.status}
            onBancadaChange={salvarBancada}
            onCompartilhar={compartilharStream}
            onNovoStatusChange={setNovoStatus}
          />
        </aside>
      </div>

      {/* Barra de ações fixa */}
      <div className="sticky bottom-0 z-40 pt-2">
        <div className="bg-content1/95 backdrop-blur-md border border-default-200/70 rounded-xl shadow-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs">
            {osConcluida ? (
              <span className="flex items-center gap-1.5 font-medium text-success">
                <CheckCircleIcon className="w-4 h-4" />
                OS concluída
              </span>
            ) : temAlteracoes ? (
              <span className="flex items-center gap-1.5 font-medium text-warning-600 dark:text-warning-400">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                Alterações não salvas
              </span>
            ) : (
              <span className="text-default-400">
                Nenhuma alteração pendente
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none font-medium"
              color="primary"
              isDisabled={osConcluida}
              isLoading={salvando}
              size="md"
              startContent={<ClockIcon className="w-4 h-4" />}
              variant="solid"
              onPress={salvarAtualizacao}
            >
              Salvar
            </Button>
            <Button
              className="flex-1 sm:flex-none font-medium"
              color="success"
              isDisabled={osConcluida}
              isLoading={salvando}
              size="md"
              startContent={<CheckCircleIcon className="w-4 h-4" />}
              variant="solid"
              onPress={() => setChecklistConclusao(true)}
            >
              Concluir OS
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist de Conclusão */}
      <Modal
        isOpen={checklistConclusao}
        placement="center"
        size="md"
        onClose={() => setChecklistConclusao(false)}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-success" />
            Concluir Ordem de Serviço
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Revise os itens antes de concluir a OS #{ordem.numero_os}:
            </p>
            <div className="space-y-2">
              <ChecklistItem
                blocking
                action={
                  !observacoes.trim()
                    ? {
                        label: "Preencher",
                        onClick: () => {
                          setChecklistConclusao(false);
                          setActiveTab("informacoes");
                        },
                      }
                    : undefined
                }
                label="Observação técnica preenchida"
                ok={!!observacoes.trim()}
              />
              <ChecklistItem
                ok
                label={`Status: ${getStatusLabel(novoStatus)} → Concluído`}
              />
              {quebras.filter((q) => !q.aprovado).length > 0 && (
                <ChecklistItem
                  warning
                  label={`${quebras.filter((q) => !q.aprovado).length} quebra(s) pendente(s) de aprovação`}
                />
              )}
              {ordem.laudo_garantia_dias && ordem.laudo_garantia_dias > 0 ? (
                <ChecklistItem
                  info
                  label={`Garantia que será aplicada: ${ordem.laudo_garantia_dias} ${
                    ordem.laudo_garantia_dias === 1 ? "dia" : "dias"
                  }`}
                />
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setChecklistConclusao(false)}
            >
              Cancelar
            </Button>
            <Button
              color="success"
              isDisabled={!observacoes.trim()}
              isLoading={salvando}
              startContent={<CheckCircleIcon className="w-4 h-4" />}
              onPress={concluirOS}
            >
              Confirmar conclusão
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de visualização de foto */}
      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{
          base: "bg-transparent shadow-none",
          body: "p-0",
        }}
        isOpen={!!fotoSelecionada}
        size="5xl"
        onClose={() => setFotoSelecionada(null)}
      >
        <ModalContent>
          <ModalBody>
            {(() => {
              const idx = fotos.findIndex((f) => f.url === fotoSelecionada);
              const total = fotos.length;
              const irPara = (delta: number) => {
                if (idx < 0 || total === 0) return;
                const novo = (idx + delta + total) % total;

                setFotoSelecionada(fotos[novo].url);
              };

              return (
                <div className="relative flex items-center justify-center">
                  <Button
                    isIconOnly
                    aria-label="Fechar"
                    className="absolute top-2 right-2 z-10 shadow-lg"
                    color="danger"
                    size="sm"
                    variant="solid"
                    onPress={() => setFotoSelecionada(null)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>

                  {total > 1 && (
                    <Button
                      isIconOnly
                      aria-label="Foto anterior"
                      className="absolute left-2 z-10 shadow-lg"
                      radius="full"
                      variant="solid"
                      onPress={() => irPara(-1)}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </Button>
                  )}

                  {fotoSelecionada && (
                    <Image
                      alt="Foto ampliada"
                      className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl"
                      height={1600}
                      src={fotoSelecionada}
                      width={1600}
                    />
                  )}

                  {total > 1 && (
                    <Button
                      isIconOnly
                      aria-label="Próxima foto"
                      className="absolute right-2 z-10 shadow-lg"
                      radius="full"
                      variant="solid"
                      onPress={() => irPara(1)}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </Button>
                  )}

                  {total > 1 && idx >= 0 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                      <Chip size="sm" variant="solid">
                        {idx + 1} / {total}
                      </Chip>
                    </div>
                  )}
                </div>
              );
            })()}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Dialog de Confirmação */}
      <ConfirmDialog />
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-foreground ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ChecklistItem({
  label,
  ok,
  blocking,
  info,
  warning,
  action,
}: {
  label: string;
  ok?: boolean;
  blocking?: boolean;
  info?: boolean;
  warning?: boolean;
  action?: { label: string; onClick: () => void };
}) {
  // Item bloqueante não cumprido = pendência obrigatória (danger)
  const pendente = blocking && !ok;

  let Icon = InformationCircleIcon;
  let cor = "text-default-400";

  if (pendente) {
    Icon = ExclamationCircleIcon;
    cor = "text-danger";
  } else if (ok) {
    Icon = CheckCircleIcon;
    cor = "text-success";
  } else if (warning) {
    Icon = ExclamationTriangleIcon;
    cor = "text-warning-500";
  }

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-default-100 border border-default-200/70">
      <Icon className={`w-5 h-5 shrink-0 ${cor}`} />
      <span className="flex-1 text-sm text-default-600">{label}</span>
      {action && (
        <Button
          className="text-xs"
          color="primary"
          size="sm"
          variant="light"
          onPress={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

const STATUS_ORDER = [
  "aguardando",
  "aprovado",
  "em_diagnostico",
  "em_andamento",
  "aguardando_peca",
  "concluido",
  "entregue",
] as const;

const STATUS_META: Record<
  string,
  { label: string; bg: string; dot: string; line: string }
> = {
  aguardando: {
    label: "Aguardando",
    bg: "bg-default-200",
    dot: "bg-default-400",
    line: "bg-default-200",
  },
  aprovado: {
    label: "Aprovado",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    dot: "bg-blue-500",
    line: "bg-blue-300 dark:bg-blue-700",
  },
  em_diagnostico: {
    label: "Em Diagnóstico",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    dot: "bg-indigo-500",
    line: "bg-indigo-300 dark:bg-indigo-700",
  },
  em_andamento: {
    label: "Em Andamento",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    dot: "bg-orange-500",
    line: "bg-orange-300 dark:bg-orange-700",
  },
  aguardando_peca: {
    label: "Aguardando Peça",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
    line: "bg-red-300 dark:bg-red-700",
  },
  concluido: {
    label: "Concluído",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
    line: "bg-emerald-300 dark:bg-emerald-700",
  },
  entregue: {
    label: "Entregue",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
    line: "bg-emerald-300 dark:bg-emerald-700",
  },
};

function StatusProgressBar({ current }: { current: string }) {
  const currentIndex = STATUS_ORDER.indexOf(
    current as (typeof STATUS_ORDER)[number],
  );

  if (currentIndex === -1) return null;
  const visibleSteps = ["aguardando", "aprovado", "em_andamento", "concluido"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {visibleSteps.map((s, idx) => {
          const step = s as (typeof STATUS_ORDER)[number];
          const meta = STATUS_META[step] || {
            label: step,
            bg: "",
            dot: "bg-default-400",
            line: "bg-default-200",
          };
          const stepIdx = STATUS_ORDER.indexOf(step);
          const isCompleted = currentIndex > stepIdx;
          const isCurrent = currentIndex === stepIdx;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                        ? `${meta.dot.replace("bg-", "bg-").replace("-500", "-500")} text-white ring-4 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ${meta.dot.replace("bg-", "ring-").replace("-500", "-500/30")}`
                        : "bg-default-200 text-default-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isCurrent
                      ? meta.dot
                          .replace("bg-", "text-")
                          .replace("-500", "-600") +
                        " dark:" +
                        meta.dot.replace("bg-", "text-").replace("-500", "-400")
                      : isCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-default-500"
                  }`}
                >
                  {meta.label}
                </span>
              </div>
              {idx < visibleSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                    currentIndex > stepIdx ? "bg-emerald-400" : "bg-default-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
