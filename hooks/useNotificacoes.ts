import { useState, useEffect, useCallback, useRef } from "react";
import { NotificacoesService } from "@/services/notificacoesService";
import type { NotificacaoCompleta } from "@/types";

export function useNotificacoes(usuarioId: string | undefined) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoCompleta[]>([]);
  const [naoLidas, setNaoLidas] = useState<NotificacaoCompleta[]>([]);
  const [countNaoLidas, setCountNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const carregarRef = useRef<() => Promise<void>>();
  const ultimoCarregamentoRef = useRef<number>(0);
  const carregandoRef = useRef(false);

  const carregarNotificacoes = useCallback(async () => {
    if (!usuarioId) {
      setNotificacoes([]);
      setNaoLidas([]);
      setCountNaoLidas(0);
      setLoading(false);
      return;
    }

    // Throttle: não carregar se já carregou há menos de 2 segundos
    const agora = Date.now();
    if (agora - ultimoCarregamentoRef.current < 2000) {
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (carregandoRef.current) {
      return;
    }

    try {
      carregandoRef.current = true;
      setLoading(true);
      ultimoCarregamentoRef.current = agora;

      // Buscar todas as notificações
      const todasNotificacoes =
        await NotificacoesService.obterNotificacoesUsuario(usuarioId, false);
      setNotificacoes(todasNotificacoes);

      // Filtrar não lidas
      const naoLidasFiltradas = todasNotificacoes.filter((n) => !n.lida);
      setNaoLidas(naoLidasFiltradas);
      setCountNaoLidas(naoLidasFiltradas.length);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [usuarioId]);

  const limparTodas = useCallback(async () => {
    if (!usuarioId) return;
    try {
      await NotificacoesService.deletarTodasNotificacoes(usuarioId);
      await carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  }, [usuarioId, carregarNotificacoes]);

  // Manter a ref atualizada
  useEffect(() => {
    carregarRef.current = carregarNotificacoes;
  }, [carregarNotificacoes]);

  const marcarComoLida = useCallback(
    async (notificacaoId: number) => {
      if (!usuarioId) return;

      try {
        await NotificacoesService.marcarComoLida(notificacaoId, usuarioId);
        await carregarNotificacoes();
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    },
    [usuarioId, carregarNotificacoes]
  );

  const marcarTodasComoLidas = useCallback(async () => {
    if (!usuarioId) return;

    try {
      await NotificacoesService.marcarTodasComoLidas(usuarioId);
      await carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }, [usuarioId, carregarNotificacoes]);

  // Effect para carregar notificações iniciais
  useEffect(() => {
    if (usuarioId) {
      carregarNotificacoes();
    }
  }, [usuarioId, carregarNotificacoes]);

  // Effect separado para subscription (executado apenas quando usuarioId muda)
  useEffect(() => {
    if (!usuarioId) {
      return;
    }

    // Cleanup da subscription anterior se existir
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Pequeno delay para evitar criar subscription antes do cleanup
    const timeoutId = setTimeout(() => {
      const subscription = NotificacoesService.subscribeToNotifications(
        usuarioId,
        () => {
          // Usar a ref para chamar a função sem adicionar dependência
          if (carregarRef.current) {
            carregarRef.current();
          }
        }
      );

      subscriptionRef.current = subscription;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [usuarioId]); // Apenas usuarioId como dependência

  return {
    notificacoes,
    naoLidas,
    countNaoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarNotificacoes,
    limparTodas,
  };
}
