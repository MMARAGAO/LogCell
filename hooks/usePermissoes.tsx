"use client";

import type { Permissao, PerfilUsuario } from "@/types/permissoes";

import { useMemo, useEffect, useState } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoesRealtime } from "@/contexts/PermissoesRealtimeContext";
import { supabase } from "@/lib/supabaseClient";
import { PERMISSOES_POR_PERFIL } from "@/types/permissoes";

export function usePermissoes() {
  const { usuario } = useAuthContext();
  const { versaoPermissoes } = usePermissoesRealtime(); // Usa contexto Realtime
  const [permissoesCustomizadas, setPermissoesCustomizadas] = useState<
    Permissao[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [todasLojas, setTodasLojas] = useState(false);

  // Obter perfil do usuário
  const perfil = useMemo((): PerfilUsuario => {
    if (!usuario) return "vendedor";

    // Verificar se é admin pelo email ou flag específica
    // IMPORTANTE: Se usuário tem loja_id configurado, NÃO é admin global
    const emailsAdmin = ["admin@logcell.com", "matheusmoxil@gmail.com"];

    if (usuario.email && emailsAdmin.includes(usuario.email.toLowerCase())) {
      return "admin";
    }

    // Mapear tipo_usuario para PerfilUsuario
    if (usuario.tipo_usuario === "tecnico") {
      return "tecnico";
    }

    // Para usuários normais, verificar se é gerente por algum campo
    // TODO: Adicionar campo 'perfil' ou 'cargo' na tabela usuarios
    // Por enquanto, todos usuários não-técnicos são vendedores
    return "vendedor";
  }, [usuario]);

  // Função auxiliar para converter objeto JSONB em array de permissões
  const converterObjetoParaArray = (permissoesObj: any): Permissao[] => {
    if (Array.isArray(permissoesObj)) {
      // Já é array, retornar direto
      return permissoesObj;
    }

    const permissoes: Permissao[] = [];

    // Iterar sobre cada módulo (lojas, estoque, usuarios, etc)
    for (const [modulo, acoes] of Object.entries(permissoesObj)) {
      if (typeof acoes === "object" && acoes !== null) {
        // Iterar sobre cada ação (criar, editar, etc)
        for (const [acao, valor] of Object.entries(
          acoes as Record<string, boolean>,
        )) {
          if (valor === true) {
            permissoes.push(`${modulo}.${acao}` as Permissao);
          }
        }
      }
    }

    return permissoes;
  };

  // Buscar permissões customizadas do banco de dados em tempo real
  useEffect(() => {
    if (!usuario?.id) {
      setPermissoesCustomizadas(null);
      setLojaId(null);
      setTodasLojas(false);
      setLoading(false);

      return;
    }

    let isCancelled = false;

    const carregarPermissoes = async () => {
      if (!isCancelled) {
        setLoading(true);
      }

      try {
        console.log(
          "🔄 [PERMISSÕES] Recarregando do banco (versão:",
          versaoPermissoes,
          ")",
        );

        // Tentar buscar permissões do banco
        const { data, error } = await supabase
          .from("permissoes")
          .select("permissoes, loja_id, todas_lojas")
          .eq("usuario_id", usuario.id)
          .maybeSingle();

        if (isCancelled) return; // Não atualizar state se componente foi desmontado

        if (error) {
          // Qualquer erro: usar permissões padrão do perfil
          console.warn("⚠️ Erro ao buscar permissões customizadas:", {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details,
          });
          console.log("✅ Usando permissões padrão do perfil:", perfil);
          setPermissoesCustomizadas(null);
          setLojaId(null);
          setTodasLojas(false);
        } else if (data) {
          // Registro de permissões encontrado (pode ter ou não permissões customizadas)
          const novaLojaId = data.loja_id !== null ? data.loja_id : null;
          const novasTodasLojas = data.todas_lojas === true;

          console.log("✅ [PERMISSÕES] Carregadas do banco:", {
            loja_id: novaLojaId,
            todas_lojas: novasTodasLojas,
            usuario_id: usuario.id,
            has_custom_permissions: !!data.permissoes,
            timestamp: new Date().toLocaleTimeString(),
          });

          // Converter objeto JSONB para array de permissões (se existir)
          const permissoesArray = data.permissoes
            ? converterObjetoParaArray(data.permissoes)
            : PERMISSOES_POR_PERFIL[perfil] || [];

          setPermissoesCustomizadas(data.permissoes ? permissoesArray : null);
          setLojaId(novaLojaId);
          setTodasLojas(novasTodasLojas);
        } else {
          // Nenhum registro de permissões encontrado
          console.log(
            "ℹ️ Nenhum registro de permissões no banco, usando padrão do perfil:",
            perfil,
          );
          setPermissoesCustomizadas(null);
          setLojaId(null);
          setTodasLojas(false);
        }
      } catch (err: any) {
        if (isCancelled) return; // Não atualizar state se componente foi desmontado

        // Captura qualquer exceção JavaScript
        console.error("❌ Exceção ao buscar permissões:", {
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
        });
        console.log("✅ Usando permissões padrão do perfil:", perfil);
        setPermissoesCustomizadas(null);
        setLojaId(null);
        setTodasLojas(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    // Carregar permissões inicialmente e sempre que versaoPermissoes mudar
    carregarPermissoes();

    // Cleanup function para cancelar updates quando componente desmontar
    return () => {
      isCancelled = true;
    };
  }, [usuario?.id, versaoPermissoes]); // Recarrega quando versaoPermissoes muda!

  // Obter todas as permissões do usuário
  const permissoes = useMemo((): Permissao[] => {
    if (!usuario) return [];

    // Se tem permissões customizadas do banco, usar elas
    if (permissoesCustomizadas !== null) {
      return permissoesCustomizadas;
    }

    // Caso contrário, usar permissões base do perfil
    return PERMISSOES_POR_PERFIL[perfil] || [];
  }, [usuario, perfil, permissoesCustomizadas]);

  // Verificar se tem uma permissão específica
  const temPermissao = (permissao: Permissao): boolean => {
    if (!usuario) return false;

    return permissoes.includes(permissao);
  };

  // Verificar se tem TODAS as permissões listadas
  const temTodasPermissoes = (permissoesRequeridas: Permissao[]): boolean => {
    if (!usuario) return false;

    return permissoesRequeridas.every((p) => permissoes.includes(p));
  };

  // Verificar se tem ALGUMA das permissões listadas
  const temAlgumaPermissao = (permissoesRequeridas: Permissao[]): boolean => {
    if (!usuario) return false;

    return permissoesRequeridas.some((p) => permissoes.includes(p));
  };

  // Lista de lojas do usuário (multi-loja). Por enquanto derivada do loja_id
  // único; quando a coluna loja_ids existir no banco, passa a ler dela aqui.
  // Manter lojaId (= primeira) para compatibilidade com código legado.
  const lojaIds = useMemo<number[]>(
    () => (lojaId != null ? [lojaId] : []),
    [lojaId],
  );

  // Verificar se é admin
  const isAdmin = perfil === "admin";

  console.log(
    "👤 [PERFIL] Usuário:",
    usuario?.email,
    "| Perfil:",
    perfil,
    "| isAdmin:",
    isAdmin,
  );

  // Verificar se é gerente ou admin
  const isGerente = perfil === "gerente" || perfil === "admin";

  // Obter desconto máximo permitido para vendas
  const getDescontoMaximo = async (): Promise<number> => {
    if (!usuario?.id) return 0;

    try {
      const { data, error } = await supabase
        .from("permissoes")
        .select("permissoes")
        .eq("usuario_id", usuario.id)
        .maybeSingle();

      if (error || !data?.permissoes?.vendas?.desconto_maximo) {
        // Admin tem desconto ilimitado
        return perfil === "admin" ? 100 : 0;
      }

      return data.permissoes.vendas.desconto_maximo;
    } catch (err) {
      console.error("Erro ao buscar desconto máximo:", err);

      return perfil === "admin" ? 100 : 0;
    }
  };

  // Validar se um desconto está dentro do limite permitido
  const validarDesconto = async (
    percentualDesconto: number,
  ): Promise<boolean> => {
    const descontoMaximo = await getDescontoMaximo();

    return percentualDesconto <= descontoMaximo;
  };

  // Verificar se o usuário tem acesso a uma loja específica
  const temAcessoLoja = (lojaIdVerificar: number): boolean => {
    if (!usuario) return false;
    // Admin tem acesso a tudo
    if (perfil === "admin") return true;
    // Se tem acesso a todas as lojas
    if (todasLojas) return true;

    // Verificar se a loja está entre as do usuário
    return lojaIds.includes(lojaIdVerificar);
  };

  return {
    usuario,
    perfil,
    permissoes,
    temPermissao,
    temTodasPermissoes,
    temAlgumaPermissao,
    isAdmin,
    isGerente,
    loading,
    getDescontoMaximo,
    validarDesconto,
    lojaId,
    lojaIds,
    todasLojas,
    temAcessoLoja,
  };
}
