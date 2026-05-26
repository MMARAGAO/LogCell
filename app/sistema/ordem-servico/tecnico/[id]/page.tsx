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
  BuildingStorefrontIcon,
  UserIcon,
  FireIcon,
  ExclamationCircleIcon,
  CubeIcon,
  CheckIcon,
  VideoCameraIcon,
  ShareIcon,
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
  const [bancada, setBancada] = useState("");
  const [salvandoBancada, setSalvandoBancada] = useState(false);

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
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              aria-label="Voltar"
              className="text-gray-400 hover:text-gray-600"
              variant="light"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Ordem de Serviço
                </span>
                <span className="text-xs text-gray-300">
                  #{ordem.numero_os}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {ordem.cliente_nome}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">
                  Criada em{" "}
                  {new Date(ordem.criado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {ordem.criado_por && (
                  <span className="text-xs text-gray-400">
                    • {ordem.criado_por}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                ordem.status === "em_andamento"
                  ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                  : ordem.status === "concluido"
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : ordem.status === "aguardando"
                      ? "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
                      : ordem.status === "em_diagnostico"
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : ordem.status === "aguardando_peca"
                          ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
              }`}
            >
              {getStatusLabel(ordem.status)}
            </span>
            {ordem.equipamento_senha && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <LockClosedIcon className="w-3 h-3" />
                {ordem.equipamento_senha}
              </span>
            )}
            {ordem.prioridade === "urgente" && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                <FireIcon className="w-3 h-3" /> Urgente
              </span>
            )}
            {ordem.prioridade === "alta" && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                <ExclamationCircleIcon className="w-3 h-3" /> Alta
              </span>
            )}
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
          {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-3 h-3" />
              R$ {ordem.valor_orcamento.toFixed(2)}
            </span>
          )}
          {ordem.previsao_entrega && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${(() => {
                const diff = Math.ceil(
                  (new Date(ordem.previsao_entrega).getTime() - Date.now()) /
                    86400000,
                );

                if (diff < 0)
                  return "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800";
                if (diff <= 2)
                  return "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800";

                return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800";
              })()}`}
            >
              <CalendarIcon className="w-3 h-3" />
              {new Date(ordem.previsao_entrega).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
          {ordem.laudo_garantia_dias && ordem.laudo_garantia_dias > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3 h-3" />
              {ordem.laudo_garantia_dias}{" "}
              {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
            </span>
          )}
          {ordem.tipo_cliente && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                ordem.tipo_cliente === "lojista"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              }`}
            >
              {ordem.tipo_cliente === "lojista" ? (
                <BuildingStorefrontIcon className="w-3 h-3" />
              ) : (
                <UserIcon className="w-3 h-3" />
              )}
              {ordem.tipo_cliente === "lojista" ? "Lojista" : "Consumidor"}
            </span>
          )}
        </div>

        {/* Status Progress Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <StatusProgressBar current={ordem.status} />
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
            {/* Grid 2 colunas: Info OS + Controles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna esquerda: Dados da OS */}
              <div className="lg:col-span-2 space-y-6">
                {/* OS Info Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <InformationCircleIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      Informações da OS
                    </span>
                  </div>
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
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                          Senha do Dispositivo
                        </p>
                        <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300">
                          {ordem.equipamento_senha}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Defeito Reclamado
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-100 dark:border-zinc-700">
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
                </div>

                {/* Valores + Guarantia */}
                {(ordem.valor_orcamento || ordem.laudo_garantia_dias) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-emerald-100 dark:border-emerald-900 p-5">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                          Valor do Serviço
                        </p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                          R$ {ordem.valor_orcamento.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {ordem.laudo_garantia_dias &&
                      ordem.laudo_garantia_dias > 0 && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Garantia
                          </p>
                          <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {ordem.laudo_garantia_dias}{" "}
                              {ordem.laudo_garantia_dias === 1 ? "dia" : "dias"}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Observações Técnicas */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      Observações Técnicas
                    </span>
                  </div>
                  {ordem.observacoes_tecnicas ? (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {ordem.observacoes_tecnicas}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Nenhuma observação registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Coluna direita: Controles + Câmera */}
              <div className="space-y-6">
                {/* Status Update */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      Status
                    </span>
                  </div>
                  <div className="space-y-4">
                    <Select
                      classNames={{
                        trigger:
                          "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
                      }}
                      isDisabled={ordem.status === "concluido"}
                      label="Alterar status"
                      labelPlacement="outside"
                      placeholder="Selecione..."
                      selectedKeys={[novoStatus]}
                      size="md"
                      variant="bordered"
                      onChange={(e) => setNovoStatus(e.target.value)}
                    >
                      <SelectItem key="em_andamento">Em Andamento</SelectItem>
                      <SelectItem key="em_diagnostico">
                        Em Diagnóstico
                      </SelectItem>
                      <SelectItem key="aguardando_pecas">
                        Aguardando Peças
                      </SelectItem>
                    </Select>
                    <Button
                      fullWidth
                      className="font-medium"
                      color="primary"
                      isDisabled={ordem.status === "concluido"}
                      isLoading={salvando}
                      size="md"
                      startContent={<ClockIcon className="w-4 h-4" />}
                      variant="solid"
                      onPress={salvarAtualizacao}
                    >
                      Salvar
                    </Button>
                    <Button
                      fullWidth
                      className="font-medium"
                      color="success"
                      isDisabled={
                        ordem.status === "concluido" || !observacoes.trim()
                      }
                      isLoading={salvando}
                      size="md"
                      startContent={<CheckCircleIcon className="w-4 h-4" />}
                      variant="flat"
                      onPress={concluirOS}
                    >
                      Concluir OS
                    </Button>
                  </div>
                </div>

                {/* Câmera */}
                <div
                  className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border p-5 ${
                    bancada
                      ? "border-emerald-200 dark:border-emerald-900"
                      : "border-gray-100 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <VideoCameraIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      Câmera ao Vivo
                    </span>
                  </div>

                  {novoStatus === "em_andamento" || bancada ? (
                    <div className="space-y-4">
                      <Select
                        classNames={{
                          trigger:
                            "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
                        }}
                        isLoading={salvandoBancada}
                        label="Bancada"
                        labelPlacement="outside"
                        placeholder="Selecione a bancada"
                        selectedKeys={bancada ? [bancada] : []}
                        size="md"
                        variant="bordered"
                        onChange={(e) => salvarBancada(e.target.value)}
                      >
                        <SelectItem key="bancada-1">Bancada 1</SelectItem>
                        <SelectItem key="bancada-2">Bancada 2</SelectItem>
                        <SelectItem key="bancada-3">Bancada 3</SelectItem>
                        <SelectItem key="bancada-4">Bancada 4</SelectItem>
                        <SelectItem key="bancada-5">Bancada 5</SelectItem>
                      </Select>

                      {bancada && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Bancada {bancada.replace("bancada-", "")} ativa
                              </p>
                              <p className="text-[11px] text-emerald-500">
                                Transmitindo ao vivo
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="font-medium text-xs"
                              color="primary"
                              size="sm"
                              startContent={
                                <VideoCameraIcon className="w-3.5 h-3.5" />
                              }
                              variant="flat"
                              onPress={() =>
                                window.open(
                                  `/ver-stream/${ordem.id}`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              Ver ao Vivo
                            </Button>
                            <Button
                              className="font-medium text-xs"
                              color="success"
                              size="sm"
                              startContent={
                                <ShareIcon className="w-3.5 h-3.5" />
                              }
                              variant="solid"
                              onPress={compartilharStream}
                            >
                              Compartilhar
                            </Button>
                          </div>
                          <p className="text-[10px] text-gray-400 text-center">
                            Link copiável para enviar ao cliente
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                        <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Câmera disponível
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ao iniciar manutenção
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observações Editor + Timeline */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  Observações Técnicas
                </span>
              </div>

              <div className="relative pl-6 space-y-4">
                {/* Linha vertical da timeline */}
                <div className="absolute left-2.5 top-1 bottom-0 w-px bg-gray-200 dark:bg-zinc-700" />

                {/* Observação existente (se houver) */}
                {ordem.observacoes_tecnicas && (
                  <div className="relative">
                    <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-zinc-900" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {ordem.data_inicio_servico
                        ? new Date(ordem.data_inicio_servico).toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : new Date(ordem.criado_em).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-100 dark:border-zinc-700">
                      {ordem.observacoes_tecnicas}
                    </p>
                  </div>
                )}

                {/* Nova observação */}
                <div className="relative">
                  <div className="absolute -left-4 top-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-zinc-900" />
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                    Nova Observação
                  </p>
                  <Textarea
                    classNames={{
                      input: "text-sm",
                      inputWrapper:
                        "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
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
            </div>
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
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-gray-800 dark:text-white ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
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
    bg: "bg-gray-200 dark:bg-gray-700",
    dot: "bg-gray-400",
    line: "bg-gray-200 dark:bg-gray-700",
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
            dot: "bg-gray-400",
            line: "bg-gray-200",
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
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
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
                  className={`mt-1.5 text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isCurrent
                      ? meta.dot
                          .replace("bg-", "text-")
                          .replace("-500", "-600") +
                        " dark:" +
                        meta.dot.replace("bg-", "text-").replace("-500", "-400")
                      : isCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {meta.label}
                </span>
              </div>
              {idx < visibleSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                    currentIndex > stepIdx
                      ? "bg-emerald-400"
                      : "bg-gray-200 dark:bg-gray-700"
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
