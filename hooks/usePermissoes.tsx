"use client";

import { useMemo, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Permissao, PerfilUsuario } from "@/types/permissoes";
import { PERMISSOES_POR_PERFIL } from "@/types/permissoes";
import { toast } from "sonner";

export function usePermissoes() {
  const { usuario } = useAuthContext();
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
          acoes as Record<string, boolean>
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
      setLoading(false);
      return;
    }

    const buscarPermissoes = async () => {
      try {
        // Tentar buscar permissões do banco
        const { data, error } = await supabase
          .from("permissoes")
          .select("permissoes, loja_id, todas_lojas")
          .eq("usuario_id", usuario.id)
          .maybeSingle();

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
        } else if (data?.permissoes) {
          // Permissões customizadas encontradas
          console.log("✅ Permissões customizadas carregadas do banco");

          // Converter objeto JSONB para array de permissões
          const permissoesArray = converterObjetoParaArray(data.permissoes);
          setPermissoesCustomizadas(permissoesArray);
          setLojaId(data.loja_id || null);
          setTodasLojas(data.todas_lojas || false);
        } else {
          // Nenhuma permissão customizada, usar padrão
          console.log(
            "ℹ️ Nenhuma permissão customizada, usando padrão do perfil:",
            perfil
          );
          setPermissoesCustomizadas(null);
          setLojaId(null);
          setTodasLojas(false);
        }
      } catch (err: any) {
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
        setLoading(false);
      }
    };

    buscarPermissoes();

    // Configurar listener em tempo real para mudanças nas permissões
    const channel = supabase
      .channel(`permissoes_${usuario.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "permissoes",
          filter: `usuario_id=eq.${usuario.id}`,
        },
        (payload) => {
          console.log("🔄 Permissões atualizadas em tempo real:", payload);

          if (payload.eventType === "DELETE") {
            // Permissões removidas, voltar ao padrão
            console.log("🗑️ Permissões customizadas removidas, usando padrão");
            setPermissoesCustomizadas(null);
            setLojaId(null);
            setTodasLojas(false);

            // Notificar usuário
            toast.info("Permissões atualizadas", {
              description: "Suas permissões foram redefinidas para o padrão.",
            });
          } else if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            // Permissões criadas ou atualizadas
            const newData = payload.new as any;
            if (newData?.permissoes) {
              console.log("✅ Aplicando novas permissões:", newData.permissoes);
              const permissoesArray = converterObjetoParaArray(
                newData.permissoes
              );
              setPermissoesCustomizadas(permissoesArray);
              setLojaId(newData.loja_id || null);
              setTodasLojas(newData.todas_lojas || false);

              // Notificar usuário sobre mudança
              if (payload.eventType === "UPDATE") {
                toast.success("Permissões atualizadas!", {
                  description: "Suas permissões de acesso foram modificadas.",
                });
              } else {
                toast.success("Novas permissões atribuídas!", {
                  description: "Você recebeu novas permissões de acesso.",
                });
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Inscrito para updates de permissões em tempo real");
        } else if (status === "CHANNEL_ERROR") {
          console.info(
            "ℹ️ Realtime não habilitado para permissões. Atualizações manuais necessárias."
          );
        } else if (status === "TIMED_OUT") {
          console.info(
            "ℹ️ Timeout ao conectar no Realtime de permissões. Sistema funcionando normalmente."
          );
        } else if (status === "CLOSED") {
          console.log("🔌 Canal de permissões fechado");
        }
      });

    // Cleanup: remover listener quando o componente desmontar
    return () => {
      console.log("🔌 Desconectando listener de permissões");
      supabase.removeChannel(channel);
    };
  }, [usuario?.id, perfil]);

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

  // Verificar se é admin
  const isAdmin = perfil === "admin";

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
    percentualDesconto: number
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
    // Verificar se é a loja específica do usuário
    return lojaId === lojaIdVerificar;
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
    todasLojas,
    temAcessoLoja,
  };
}
