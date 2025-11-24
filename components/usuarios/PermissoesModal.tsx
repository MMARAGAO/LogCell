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
import {
  getPermissoes,
  salvarPermissoes,
} from "@/app/sistema/usuarios/actions/permissoes";

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
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissoes, setPermissoes] = useState<PermissoesModulos>(
    PermissoesService.getPermissoesPadrao()
  );
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<number | null>(null);
  const [todasLojas, setTodasLojas] = useState(false);

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
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    try {
      console.log("🔍 Carregando permissões do usuário:", usuarioId);
      const result = await getPermissoes(usuarioId);

      console.log("📥 Resultado do carregamento:", result);

      if (result.success) {
        if (result.data) {
          console.log(
            "✅ Aplicando permissões carregadas:",
            result.data.permissoes
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
        } else {
          console.log("ℹ️ Nenhuma permissão customizada, usando padrão");
          setPermissoes(PermissoesService.getPermissoesPadrao());
          setLojaSelecionada(null);
          setTodasLojas(false);
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
    acao: string
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
    valor: boolean
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
          {} as any
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
        {} as any
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
      console.log("📊 Dados a salvar:", {
        usuarioId,
        permissoes,
        loja_id: todasLojas ? null : lojaSelecionada,
        todas_lojas: todasLojas,
      });

      const result = await salvarPermissoes(usuarioId, {
        permissoes,
        loja_id: todasLojas ? null : lojaSelecionada,
        todas_lojas: todasLojas,
      });

      console.log("📤 Resultado do salvamento:", result);

      if (result.success) {
        console.log("✅ Permissões salvas com sucesso!");
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
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
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={handleAplicarAdmin}
                >
                  Aplicar Permissões Admin
                </Button>
                <Button
                  size="sm"
                  color="warning"
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
                      setTodasLojas(checked);
                      if (checked) {
                        setLojaSelecionada(null);
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
                      label="Loja"
                      placeholder="Selecione uma loja"
                      selectedKey={lojaSelecionada?.toString()}
                      onSelectionChange={(key) => {
                        setLojaSelecionada(key ? Number(key) : null);
                      }}
                      isDisabled={todasLojas}
                      className="max-w-full"
                    >
                      {lojas.map((loja) => (
                        <AutocompleteItem key={loja.id.toString()}>
                          {loja.nome}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}

                  {!todasLojas && !lojaSelecionada && (
                    <p className="text-xs text-warning">
                      ⚠️ Nenhuma loja selecionada. O usuário não terá acesso ao
                      sistema.
                    </p>
                  )}

                  {lojaSelecionada && !todasLojas && (
                    <p className="text-xs text-success">
                      ✓ Acesso restrito à loja:{" "}
                      {lojas.find((l) => l.id === lojaSelecionada)?.nome}
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
                    <Chip size="sm" variant="flat" color="primary">
                      Gerenciamento
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("usuarios")}
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
                    <Chip size="sm" variant="flat" color="secondary">
                      Inventário
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("estoque")}
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
                    <Chip size="sm" variant="flat" color="success">
                      Filiais
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("lojas")}
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
                    <Chip size="sm" variant="flat" color="primary">
                      CRM
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("clientes")}
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
                    <Chip size="sm" variant="flat" color="warning">
                      Suprimentos
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("fornecedores")}
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
                    <Chip size="sm" variant="flat" color="success">
                      Comercial
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("vendas")}
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
                        "ver_estatisticas_faturamento"
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
                </div>

                {/* Campo de desconto máximo */}
                <div className="mt-4 pl-4">
                  <Input
                    type="number"
                    label="Desconto Máximo (%)"
                    placeholder="0"
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
                    min="0"
                    max="100"
                    className="max-w-xs"
                    description="Percentual máximo de desconto permitido (0-100%)"
                  />
                </div>
              </div>

              <Divider className="my-4" />

              {/* Módulo: Ordem de Serviço */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Ordem de Serviço</h3>
                    <Chip size="sm" variant="flat" color="secondary">
                      Assistência
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("os")}
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
                    isSelected={permissoes.os?.cancelar}
                    onValueChange={() =>
                      handleTogglePermissao("os", "cancelar")
                    }
                  >
                    Cancelar
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
                    <Chip size="sm" variant="flat" color="primary">
                      Equipe
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("tecnicos")}
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
                    <Chip size="sm" variant="flat" color="danger">
                      Reversão
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("devolucoes")}
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

              {/* Módulo: RMAs */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">RMAs</h3>
                    <Chip size="sm" variant="flat" color="warning">
                      Garantia
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("rma")}
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
                    <Chip size="sm" variant="flat" color="secondary">
                      Logística
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("transferencias")}
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
                    <Chip size="sm" variant="flat" color="success">
                      Financeiro
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("caixa")}
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

              {/* Módulo: Configurações */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Configurações</h3>
                    <Chip size="sm" variant="flat" color="danger">
                      Sistema
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("configuracoes")}
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
                    <Chip size="sm" variant="flat" color="primary">
                      Relatórios
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("dashboard")}
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

              {/* Módulo: Notificações */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Notificações</h3>
                    <Chip size="sm" variant="flat" color="secondary">
                      Sistema
                    </Chip>
                  </div>
                  <Checkbox
                    size="sm"
                    isSelected={todosMarcados("notificacoes")}
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
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSalvar}
            isLoading={loading}
            isDisabled={loadingData}
          >
            Salvar Permissões
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
