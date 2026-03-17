"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";

import { PermissoesModulos, Loja } from "@/types";
import { PermissoesService } from "@/services/permissoesService";
import { MetasService } from "@/services/metasService";
import {
  getPermissoes,
  salvarPermissoes,
} from "@/app/sistema/usuarios/actions/permissoes";
import { salvarMetaUsuario } from "@/app/sistema/usuarios/actions/metas";

interface PermissoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
  usuarioNome: string;
  onSuccess: () => void;
}

export function PermissoesModal({
  isOpen,
  onClose,
  usuarioId,
  usuarioNome,
  onSuccess,
}: PermissoesModalProps) {
  const META_MENSAL_PADRAO = "10000";
  const DIAS_UTEIS_PADRAO = "26";
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissoes, setPermissoes] = useState<PermissoesModulos>(
    PermissoesService.getPermissoesPadrao(),
  );
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<number | null>(null);
  const [todasLojas, setTodasLojas] = useState(false);

  // Estados para metas do usuário
  const [metaMensalVendas, setMetaMensalVendas] = useState(META_MENSAL_PADRAO);
  const [diasUteis, setDiasUteis] = useState(DIAS_UTEIS_PADRAO);

  useEffect(() => {
    if (isOpen) {
      carregarPermissoes();
      carregarLojas();
    }
  }, [isOpen, usuarioId]);

  const carregarLojas = async () => {
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setLojas(data || []);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
    }
  };

  const carregarPermissoes = async () => {
    setLoadingData(true);
    setError(null);
    // Evita vazamento de estado ao alternar entre usuários no mesmo modal.
    setMetaMensalVendas(META_MENSAL_PADRAO);
    setDiasUteis(DIAS_UTEIS_PADRAO);

    try {
      console.log("🔍 Carregando permissões do usuário:", usuarioId);
      const result = await getPermissoes(usuarioId);

      console.log("📥 Resultado do carregamento:", result);

      if (result.success) {
        if (result.data) {
          console.log(
            "✅ Aplicando permissões carregadas:",
            result.data.permissoes,
          );

          // Merge das permissões do banco com o padrão para garantir estrutura completa
          const permissoesPadrao = PermissoesService.getPermissoesPadrao();
          const permissoesMerged = {
            ...permissoesPadrao,
          };

          // Para cada módulo, fazer merge das ações
          (
            Object.keys(permissoesPadrao) as Array<keyof PermissoesModulos>
          ).forEach((modulo) => {
            if (result.data.permissoes[modulo]) {
              permissoesMerged[modulo] = {
                ...permissoesPadrao[modulo],
                ...result.data.permissoes[modulo],
              } as any;
            }
          });

          console.log("🔀 Permissões após merge:", permissoesMerged);
          setPermissoes(permissoesMerged);
          setLojaSelecionada(result.data.loja_id || null);
          setTodasLojas(result.data.todas_lojas || false);

          // Carregar metas do usuário
          if (usuarioId) {
            try {
              const metas = await MetasService.buscarMetaUsuario(
                usuarioId,
                result.data.todas_lojas
                  ? undefined
                  : result.data.loja_id || undefined,
              );

              if (metas) {
                setMetaMensalVendas(
                  metas.meta_mensal_vendas?.toString() || META_MENSAL_PADRAO,
                );
                setDiasUteis(
                  metas.dias_uteis_mes?.toString() || DIAS_UTEIS_PADRAO,
                );
              } else {
                setMetaMensalVendas(META_MENSAL_PADRAO);
                setDiasUteis(DIAS_UTEIS_PADRAO);
              }
            } catch (metaError) {
              console.log("ℹ️ Nenhuma meta encontrada, usando valores padrão");
              setMetaMensalVendas(META_MENSAL_PADRAO);
              setDiasUteis(DIAS_UTEIS_PADRAO);
            }
          }
        } else {
          console.log("ℹ️ Nenhuma permissão customizada, usando padrão");
          setPermissoes(PermissoesService.getPermissoesPadrao());
          setLojaSelecionada(null);
          setTodasLojas(false);
          setMetaMensalVendas(META_MENSAL_PADRAO);
          setDiasUteis(DIAS_UTEIS_PADRAO);
        }
      } else {
        console.error("❌ Erro ao carregar:", result.error);
        setError(result.error || "Erro ao carregar permissões");
      }
    } catch (err) {
      console.error("❌ Exceção ao carregar permissões:", err);
      setError("Erro ao carregar permissões");
    } finally {
      setLoadingData(false);
    }
  };

  const handleTogglePermissao = (
    modulo: keyof PermissoesModulos,
    acao: string,
  ) => {
    setPermissoes((prev) => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acao]: !prev[modulo]?.[acao as keyof (typeof prev)[typeof modulo]],
      },
    }));
  };

  const handleToggleTodos = (
    modulo: keyof PermissoesModulos,
    valor: boolean,
  ) => {
    setPermissoes((prev) => {
      const moduloAtual = prev[modulo];

      // Se o módulo não existe, pegar as permissões padrão como referência
      if (!moduloAtual) {
        const permissoesPadrao = PermissoesService.getPermissoesPadrao();
        const moduloPadrao = permissoesPadrao[modulo];

        if (!moduloPadrao) return prev;

        // Criar novo módulo com todas as permissões definidas
        const novoModulo = Object.entries(moduloPadrao).reduce(
          (acc, [key, defaultValue]) => {
            // Se não for boolean, manter o valor padrão
            if (typeof defaultValue !== "boolean") {
              acc[key as keyof typeof moduloPadrao] = defaultValue;
            } else {
              acc[key as keyof typeof moduloPadrao] = valor;
            }

            return acc;
          },
          {} as any,
        );

        return {
          ...prev,
          [modulo]: novoModulo,
        };
      }

      // Se o módulo existe, atualizar apenas os campos booleanos
      const novoModulo = Object.entries(moduloAtual).reduce(
        (acc, [key, currentValue]) => {
          // Preservar valores não-booleanos (como desconto_maximo)
          if (typeof currentValue !== "boolean") {
            acc[key as keyof typeof moduloAtual] = currentValue;
          } else {
            acc[key as keyof typeof moduloAtual] = valor;
          }

          return acc;
        },
        {} as any,
      );

      return {
        ...prev,
        [modulo]: novoModulo,
      };
    });
  };

  const handleAplicarAdmin = () => {
    setPermissoes(PermissoesService.getPermissoesAdmin());
  };

  const handleLimparTodos = () => {
    setPermissoes(PermissoesService.getPermissoesPadrao());
  };

  const handleSalvar = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("💾 Iniciando salvamento de permissões");
      console.log("🔍 Estado atual do modal:", {
        todasLojas,
        lojaSelecionada,
        lojaNome: lojas.find((l) => l.id === lojaSelecionada)?.nome,
      });
      console.log("📊 Dados que serão salvos no banco:", {
        usuarioId,
        loja_id: todasLojas ? null : lojaSelecionada,
        todas_lojas: todasLojas,
      });

      const dadosSalvar = {
        permissoes,
        loja_id: todasLojas ? null : lojaSelecionada,
        todas_lojas: todasLojas,
      };

      console.log(
        "📤 Enviando para action:",
        JSON.stringify(dadosSalvar, null, 2),
      );

      const result = await salvarPermissoes(usuarioId, dadosSalvar);

      console.log("📤 Resultado do salvamento:", result);

      if (result.success) {
        console.log("✅ Permissões salvas com sucesso!");

        // Salvar metas do usuário
        if (usuarioId) {
          try {
            const dashboardPessoalHabilitado =
              !!permissoes.dashboard_pessoal?.visualizar ||
              !!permissoes.dashboard_pessoal?.definir_metas ||
              !!permissoes.dashboard_pessoal?.visualizar_metas_outros;

            if (dashboardPessoalHabilitado) {
              const metaResult = await salvarMetaUsuario({
                usuario_id: usuarioId,
                loja_id: todasLojas ? null : (lojaSelecionada ?? null),
                meta_mensal_vendas: parseFloat(metaMensalVendas || "0"),
                meta_mensal_os: 0,
                dias_uteis_mes: parseInt(diasUteis || "26", 10),
              });

              if (!metaResult.success) {
                console.error("❌ Erro ao salvar metas:", metaResult.error);
              } else {
                console.log("✅ Metas salvas com sucesso!");
              }
            }
          } catch (metaError) {
            console.error("❌ Erro ao salvar metas:", metaError);
            // Não bloquear o salvamento de permissões por erro nas metas
          }
        }

        onSuccess();
        onClose();
      } else {
        console.error("❌ Falha ao salvar:", result.error);
        setError(result.error || "Erro ao salvar permissões");
      }
    } catch (err) {
      console.error("❌ Exceção ao salvar permissões:", err);
      setError("Erro inesperado ao salvar permissões");
    } finally {
      setLoading(false);
    }
  };

  const todosMarcados = (modulo: keyof PermissoesModulos) => {
    const moduloPermissoes = permissoes[modulo];

    if (!moduloPermissoes) return false;

    // Filtrar apenas as propriedades booleanas
    return Object.entries(moduloPermissoes).every(([key, value]) => {
      // Ignorar campos que não são boolean (como desconto_maximo)
      if (typeof value !== "boolean") return true;

      return value === true;
    });
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div>Gerenciar Permissões</div>
          <div className="text-sm font-normal text-default-500">
            {usuarioNome}
          </div>
        </ModalHeader>

        <ModalBody>
          {loadingData ? (
            <div className="py-8 text-center">
              <p className="text-default-500">Carregando permissões...</p>
            </div>
          ) : (
            <>
              {/* Ações Rápidas */}
              <div className="flex gap-2 mb-4">
                <Button
                  color="success"
                  size="sm"
                  variant="flat"
                  onPress={handleAplicarAdmin}
                >
                  Aplicar Permissões Admin
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  variant="flat"
                  onPress={handleLimparTodos}
                >
                  Limpar Todas
                </Button>
              </div>

              <Divider className="mb-4" />

              {/* Seleção de Loja de Operação */}
              <div className="mb-6 p-4 bg-default-50 rounded-lg border border-default-200">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold mb-1">
                    Loja de Operação
                  </h3>
                  <p className="text-sm text-default-500">
                    Defina em qual loja o usuário terá acesso
                  </p>
                </div>

                <div className="space-y-3">
                  <Checkbox
                    isSelected={todasLojas}
                    onValueChange={(checked) => {
                      console.log(
                        "🔄 Checkbox 'Todas as Lojas' alterado:",
                        checked,
                      );
                      setTodasLojas(checked);
                      if (checked) {
                        console.log(
                          "✅ Marcado 'Todas as Lojas' - limpando loja específica",
                        );
                        setLojaSelecionada(null);
                      } else {
                        console.log(
                          "❌ Desmarcado 'Todas as Lojas' - selecione uma loja específica",
                        );
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium">Todas as Lojas</p>
                      <p className="text-xs text-default-400">
                        Este usuário terá acesso a todas as lojas do sistema
                      </p>
                    </div>
                  </Checkbox>

                  {!todasLojas && (
                    <Autocomplete
                      className="max-w-full"
                      isDisabled={todasLojas}
                      label="Loja"
                      placeholder="Selecione uma loja"
                      selectedKey={lojaSelecionada?.toString()}
                      onSelectionChange={(key) => {
                        const lojaId = key ? Number(key) : null;
                        const lojaNome = lojas.find(
                          (l) => l.id === lojaId,
                        )?.nome;

                        console.log("🏪 Loja selecionada:", {
                          id: lojaId,
                          nome: lojaNome,
                        });
                        setLojaSelecionada(lojaId);
                      }}
                    >
                      {lojas.map((loja) => (
                        <AutocompleteItem key={loja.id.toString()}>
                          {loja.nome}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}

                  {!todasLojas && !lojaSelecionada && (
                    <p className="text-xs text-warning font-semibold">
                      ⚠️ ATENÇÃO: Nenhuma loja selecionada! Você precisa
                      selecionar uma loja ou marcar &quot;Todas as Lojas&quot;.
                    </p>
                  )}

                  {lojaSelecionada && !todasLojas && (
                    <p className="text-xs text-success font-semibold">
                      ✓ Acesso restrito à loja:{" "}
                      {lojas.find((l) => l.id === lojaSelecionada)?.nome}
                    </p>
                  )}

                  {todasLojas && (
                    <p className="text-xs text-primary font-semibold">
                      ✓ Acesso a TODAS as lojas do sistema
                    </p>
                  )}
                </div>
              </div>

              <Divider className="mb-4" />

              {/* Módulo: Usuários */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Usuários</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      Gerenciamento
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("usuarios")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("usuarios", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.usuarios?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("usuarios", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.usuarios?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("usuarios", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.usuarios?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("usuarios", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.usuarios?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("usuarios", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.usuarios?.gerenciar_permissoes}
                    onValueChange={() =>
                      handleTogglePermissao("usuarios", "gerenciar_permissoes")
                    }
                  >
                    Gerenciar Permissões
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Estoque */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Estoque</h3>
                    <Chip color="secondary" size="sm" variant="flat">
                      Inventário
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("estoque")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("estoque", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.estoque?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.ajustar}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "ajustar")
                    }
                  >
                    Ajustar Quantidade
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.ver_estatisticas}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "ver_estatisticas")
                    }
                  >
                    Ver Estatísticas
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.estoque?.ver_preco_custo}
                    onValueChange={() =>
                      handleTogglePermissao("estoque", "ver_preco_custo")
                    }
                  >
                    Ver Preço de Custo
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Lojas */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Lojas</h3>
                    <Chip color="success" size="sm" variant="flat">
                      Filiais
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("lojas")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("lojas", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.lojas?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("lojas", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.lojas?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("lojas", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.lojas?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("lojas", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.lojas?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("lojas", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Clientes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Clientes</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      CRM
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("clientes")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("clientes", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.clientes?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("clientes", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.clientes?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("clientes", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.clientes?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("clientes", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.clientes?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("clientes", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.clientes?.processar_creditos}
                    onValueChange={() =>
                      handleTogglePermissao("clientes", "processar_creditos")
                    }
                  >
                    Processar Créditos
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Fornecedores */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Fornecedores</h3>
                    <Chip color="warning" size="sm" variant="flat">
                      Suprimentos
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("fornecedores")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("fornecedores", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.fornecedores?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("fornecedores", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.fornecedores?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("fornecedores", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.fornecedores?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("fornecedores", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.fornecedores?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("fornecedores", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Vendas */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Vendas</h3>
                    <Chip color="success" size="sm" variant="flat">
                      Comercial
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("vendas")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("vendas", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.vendas?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.cancelar}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "cancelar")
                    }
                  >
                    Cancelar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.gerenciar_descontos}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "gerenciar_descontos")
                    }
                  >
                    Gerenciar Descontos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.editar_pagas}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "editar_pagas")
                    }
                  >
                    Editar Vendas Pagas
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.concluir}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "concluir")
                    }
                  >
                    Concluir Venda
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.aplicar_desconto}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "aplicar_desconto")
                    }
                  >
                    Aplicar Desconto
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.processar_pagamentos}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "processar_pagamentos")
                    }
                  >
                    Processar Pagamentos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.ver_estatisticas_faturamento}
                    onValueChange={() =>
                      handleTogglePermissao(
                        "vendas",
                        "ver_estatisticas_faturamento",
                      )
                    }
                  >
                    Ver Estatísticas Faturamento
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.ver_todas_vendas}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "ver_todas_vendas")
                    }
                  >
                    Ver Todas as Vendas
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.vendas?.ver_resumo_pagamentos}
                    onValueChange={() =>
                      handleTogglePermissao("vendas", "ver_resumo_pagamentos")
                    }
                  >
                    Ver Resumo de Pagamentos
                  </Checkbox>
                </div>

                {/* Campo de desconto máximo */}
                <div className="mt-4 pl-4">
                  <Input
                    className="max-w-xs"
                    description="Percentual máximo de desconto permitido (0-100%)"
                    label="Desconto Máximo (%)"
                    max="100"
                    min="0"
                    placeholder="0"
                    type="number"
                    value={
                      permissoes.vendas?.desconto_maximo?.toString() || "0"
                    }
                    onChange={(e) => {
                      const valor = parseInt(e.target.value) || 0;

                      setPermissoes((prev) => ({
                        ...prev,
                        vendas: {
                          ...prev.vendas,
                          desconto_maximo: Math.min(Math.max(valor, 0), 100),
                        } as any,
                      }));
                    }}
                  />
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Ordem de Serviço */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Ordem de Serviço</h3>
                    <Chip color="secondary" size="sm" variant="flat">
                      Assistência
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("os")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("os", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.os?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("os", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.criar}
                    onValueChange={() => handleTogglePermissao("os", "criar")}
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.editar}
                    onValueChange={() => handleTogglePermissao("os", "editar")}
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.excluir}
                    onValueChange={() => handleTogglePermissao("os", "excluir")}
                  >
                    Excluir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.deletar_entregue}
                    onValueChange={() =>
                      handleTogglePermissao("os", "deletar_entregue")
                    }
                  >
                    Deletar Entregue
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.cancelar}
                    onValueChange={() =>
                      handleTogglePermissao("os", "cancelar")
                    }
                  >
                    Cancelar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.cancelar_entregue}
                    onValueChange={() =>
                      handleTogglePermissao("os", "cancelar_entregue")
                    }
                  >
                    Cancelar Entregue
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.assumir}
                    onValueChange={() => handleTogglePermissao("os", "assumir")}
                  >
                    Assumir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.gerenciar_pecas}
                    onValueChange={() =>
                      handleTogglePermissao("os", "gerenciar_pecas")
                    }
                  >
                    Gerenciar Peças
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.gerenciar_fotos}
                    onValueChange={() =>
                      handleTogglePermissao("os", "gerenciar_fotos")
                    }
                  >
                    Gerenciar Fotos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.os?.gerenciar_pagamentos}
                    onValueChange={() =>
                      handleTogglePermissao("os", "gerenciar_pagamentos")
                    }
                  >
                    Gerenciar Pagamentos
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Técnicos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Técnicos</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      Equipe
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("tecnicos")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("tecnicos", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.tecnicos?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("tecnicos", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.tecnicos?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("tecnicos", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.tecnicos?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("tecnicos", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.tecnicos?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("tecnicos", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Devoluções */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Devoluções</h3>
                    <Chip color="danger" size="sm" variant="flat">
                      Reversão
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("devolucoes")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("devolucoes", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.devolucoes?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("devolucoes", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.devolucoes?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("devolucoes", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.devolucoes?.processar_creditos}
                    onValueChange={() =>
                      handleTogglePermissao("devolucoes", "processar_creditos")
                    }
                  >
                    Processar Créditos
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Aparelhos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Aparelhos</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      Inventário
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("aparelhos")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("aparelhos", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.aparelhos?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.deletar}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "deletar")
                    }
                  >
                    Deletar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.alterar_status}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "alterar_status")
                    }
                  >
                    Alterar Status
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.receber}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "receber")
                    }
                  >
                    Receber
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.vender}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "vender")
                    }
                  >
                    Vender
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.gerenciar_fotos}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "gerenciar_fotos")
                    }
                  >
                    Gerenciar Fotos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.ver_relatorios}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "ver_relatorios")
                    }
                  >
                    Ver Relatórios
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.aparelhos?.ver_dashboard}
                    onValueChange={() =>
                      handleTogglePermissao("aparelhos", "ver_dashboard")
                    }
                  >
                    Ver Dashboard (KPIs)
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: RMAs */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">RMAs</h3>
                    <Chip color="warning" size="sm" variant="flat">
                      Garantia
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("rma")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("rma", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.rma?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("rma", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.rma?.criar}
                    onValueChange={() => handleTogglePermissao("rma", "criar")}
                  >
                    Criar
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Transferências */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Transferências</h3>
                    <Chip color="secondary" size="sm" variant="flat">
                      Logística
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("transferencias")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("transferencias", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.transferencias?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.transferencias?.criar}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "criar")
                    }
                  >
                    Criar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.transferencias?.editar}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "editar")
                    }
                  >
                    Editar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.transferencias?.excluir}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "excluir")
                    }
                  >
                    Excluir
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.transferencias?.confirmar}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "confirmar")
                    }
                  >
                    Confirmar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.transferencias?.aprovar}
                    onValueChange={() =>
                      handleTogglePermissao("transferencias", "aprovar")
                    }
                  >
                    Aprovar
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Caixa */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Caixa</h3>
                    <Chip color="success" size="sm" variant="flat">
                      Financeiro
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("caixa")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("caixa", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.caixa?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("caixa", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.caixa?.abrir}
                    onValueChange={() =>
                      handleTogglePermissao("caixa", "abrir")
                    }
                  >
                    Abrir Caixa
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.caixa?.fechar}
                    onValueChange={() =>
                      handleTogglePermissao("caixa", "fechar")
                    }
                  >
                    Fechar Caixa
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.caixa?.visualizar_movimentacoes}
                    onValueChange={() =>
                      handleTogglePermissao("caixa", "visualizar_movimentacoes")
                    }
                  >
                    Visualizar Movimentações
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Financeiro */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Financeiro</h3>
                    <Chip color="warning" size="sm" variant="flat">
                      Gestão Financeira
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("financeiro")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("financeiro", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.financeiro?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.folha}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "folha")
                    }
                  >
                    Folha Salarial
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.contas_lojas}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "contas_lojas")
                    }
                  >
                    Contas das Lojas
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.vales}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "vales")
                    }
                  >
                    Vales de Funcionários
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.retiradas}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "retiradas")
                    }
                  >
                    Retiradas Pessoais
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.fornecedores}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "fornecedores")
                    }
                  >
                    Contas Fornecedores
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.impostos}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "impostos")
                    }
                  >
                    Impostos e Tributos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.funcionarios}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "funcionarios")
                    }
                  >
                    Gestão de Funcionários
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.custos}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "custos")
                    }
                  >
                    Centro de Custos
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.financeiro?.relatorios}
                    onValueChange={() =>
                      handleTogglePermissao("financeiro", "relatorios")
                    }
                  >
                    Relatórios Gerenciais
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Configurações */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Configurações</h3>
                    <Chip color="danger" size="sm" variant="flat">
                      Sistema
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("configuracoes")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("configuracoes", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.configuracoes?.gerenciar}
                    onValueChange={() =>
                      handleTogglePermissao("configuracoes", "gerenciar")
                    }
                  >
                    Gerenciar Sistema
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Dashboard */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Dashboard</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      Relatórios
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("dashboard")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("dashboard", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.dashboard?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("dashboard", "visualizar")
                    }
                  >
                    Visualizar Dashboard
                  </Checkbox>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Dashboard Pessoal */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Dashboard Pessoal</h3>
                    <Chip color="success" size="sm" variant="flat">
                      Metas
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("dashboard_pessoal")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("dashboard_pessoal", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.dashboard_pessoal?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("dashboard_pessoal", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                  <Checkbox
                    isSelected={permissoes.dashboard_pessoal?.definir_metas}
                    onValueChange={() =>
                      handleTogglePermissao(
                        "dashboard_pessoal",
                        "definir_metas",
                      )
                    }
                  >
                    Definir Metas
                  </Checkbox>
                  <Checkbox
                    isSelected={
                      permissoes.dashboard_pessoal?.visualizar_metas_outros
                    }
                    onValueChange={() =>
                      handleTogglePermissao(
                        "dashboard_pessoal",
                        "visualizar_metas_outros",
                      )
                    }
                  >
                    Ver Metas de Outros
                  </Checkbox>
                </div>

                {/* Campos de Metas */}
                <div className="mt-4 pt-4 border-t border-divider">
                  <h4 className="text-sm font-semibold mb-3 text-default-700">
                    Configuração de Metas Mensais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      description="Valor em reais que o usuário deve atingir por mês"
                      label="Meta Mensal de Vendas (R$)"
                      min="0"
                      placeholder="10000"
                      size="sm"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">
                            R$
                          </span>
                        </div>
                      }
                      step="100"
                      type="number"
                      value={metaMensalVendas}
                      onValueChange={setMetaMensalVendas}
                    />

                    <Input
                      description="Para cálculo da meta diária"
                      label="Dias Úteis do Mês"
                      max="31"
                      min="1"
                      placeholder="26"
                      size="sm"
                      type="number"
                      value={diasUteis}
                      onValueChange={setDiasUteis}
                    />
                  </div>

                  <div className="mt-3 bg-success-50 dark:bg-success-100/10 p-3 rounded-lg">
                    <p className="text-xs text-success-700 dark:text-success-600">
                      <strong>Meta Diária Calculada:</strong> R${" "}
                      {(
                        parseFloat(metaMensalVendas || "0") /
                        parseInt(diasUteis || "1")
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Notificações */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Notificações</h3>
                    <Chip color="secondary" size="sm" variant="flat">
                      Sistema
                    </Chip>
                  </div>
                  <Checkbox
                    isSelected={todosMarcados("notificacoes")}
                    size="sm"
                    onValueChange={(checked) =>
                      handleToggleTodos("notificacoes", checked)
                    }
                  >
                    Marcar todos
                  </Checkbox>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  <Checkbox
                    isSelected={permissoes.notificacoes?.visualizar}
                    onValueChange={() =>
                      handleTogglePermissao("notificacoes", "visualizar")
                    }
                  >
                    Visualizar
                  </Checkbox>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={loading} variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={loadingData}
            isLoading={loading}
            onPress={handleSalvar}
          >
            Salvar Permissões
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
