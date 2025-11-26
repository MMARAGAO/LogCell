import { supabase } from "@/lib/supabaseClient";
import {
  RMA,
  NovoRMA,
  HistoricoRMA,
  FotoRMA,
  FiltrosRMA,
  StatusRMA,
} from "@/types/rma";

class RMAService {
  // ==================== CRIAR RMA ====================
  async criarRMA(dados: NovoRMA, usuarioId: string): Promise<RMA> {
    try {
      console.log("🔵 Iniciando criação de RMA:", dados);

      // Gerar número de RMA único
      const numeroRMA = await this.gerarNumeroRMA();

      // 1. Criar o RMA
      const { data: rma, error: erroRMA } = await supabase
        .from("rmas")
        .insert({
          numero_rma: numeroRMA,
          tipo_origem: dados.tipo_origem,
          tipo_rma: dados.tipo_rma,
          status: dados.status,
          produto_id: dados.produto_id,
          loja_id: dados.loja_id,
          cliente_id: dados.cliente_id,
          fornecedor_id: dados.fornecedor_id,
          quantidade: dados.quantidade,
          motivo: dados.motivo,
          observacoes_assistencia: dados.observacoes_assistencia,
          criado_por: usuarioId,
        })
        .select(
          `
          *,
          produtos:produtos(id, descricao),
          lojas:lojas(id, nome),
          clientes:clientes(id, nome, telefone),
          fornecedores:fornecedores(id, nome, telefone)
        `
        )
        .single();

      if (erroRMA) {
        console.error("❌ Erro ao criar RMA:", erroRMA);
        throw erroRMA;
      }

      console.log("✅ RMA criado:", rma);

      // 2. Registrar histórico de criação
      await this.registrarHistorico({
        rma_id: rma.id,
        tipo_acao: "criacao",
        descricao: `RMA #${numeroRMA} criado`,
        dados_novos: rma,
        criado_por: usuarioId,
      });

      // 3. Dar baixa no estoque (se for RMA de cliente, remove do estoque)
      if (dados.tipo_origem === "cliente") {
        await this.movimentarEstoque({
          rma_id: rma.id,
          produto_id: dados.produto_id,
          loja_id: dados.loja_id,
          quantidade: dados.quantidade,
          tipo_movimentacao: "saida",
          motivo: `RMA #${numeroRMA} - ${dados.motivo}`,
          criado_por: usuarioId,
        });
      }

      // 4. Upload de fotos (se houver)
      if (dados.fotos && dados.fotos.length > 0) {
        await this.uploadFotos(rma.id, dados.fotos, usuarioId);
      }

      return rma as RMA;
    } catch (error) {
      console.error("❌ Erro ao criar RMA:", error);
      throw error;
    }
  }

  // ==================== GERAR NÚMERO RMA ====================
  private async gerarNumeroRMA(): Promise<string> {
    const ano = new Date().getFullYear();
    const prefixo = `RMA${ano}`;

    const { data, error } = await supabase
      .from("rmas")
      .select("numero_rma")
      .like("numero_rma", `${prefixo}%`)
      .order("criado_em", { ascending: false })
      .limit(1);

    if (error) throw error;

    let proximoNumero = 1;
    if (data && data.length > 0) {
      const ultimoNumero = data[0].numero_rma.replace(prefixo, "");
      proximoNumero = parseInt(ultimoNumero) + 1;
    }

    return `${prefixo}${proximoNumero.toString().padStart(6, "0")}`;
  }

  // ==================== BUSCAR RMAS ====================
  async buscarRMAs(filtros?: FiltrosRMA): Promise<RMA[]> {
    try {
      let query = supabase
        .from("rmas")
        .select(
          `
          *,
          produtos:produtos(id, descricao),
          lojas:lojas(id, nome),
          clientes:clientes(id, nome, telefone),
          fornecedores:fornecedores(id, nome, telefone)
        `
        )
        .order("criado_em", { ascending: false });

      // Aplicar filtros
      if (filtros?.tipo_origem) {
        query = query.eq("tipo_origem", filtros.tipo_origem);
      }
      if (filtros?.status) {
        query = query.eq("status", filtros.status);
      }
      if (filtros?.loja_id) {
        query = query.eq("loja_id", filtros.loja_id);
      }
      if (filtros?.cliente_id) {
        query = query.eq("cliente_id", filtros.cliente_id);
      }
      if (filtros?.fornecedor_id) {
        query = query.eq("fornecedor_id", filtros.fornecedor_id);
      }
      if (filtros?.data_inicio) {
        query = query.gte("criado_em", filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte("criado_em", filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtro de busca (cliente-side para busca em múltiplos campos)
      let rmas = data as RMA[];
      if (filtros?.busca) {
        const termoBusca = filtros.busca.toLowerCase();
        rmas = rmas.filter(
          (rma) =>
            rma.numero_rma.toLowerCase().includes(termoBusca) ||
            rma.produtos?.descricao.toLowerCase().includes(termoBusca) ||
            rma.clientes?.nome.toLowerCase().includes(termoBusca) ||
            rma.fornecedores?.nome.toLowerCase().includes(termoBusca) ||
            rma.motivo.toLowerCase().includes(termoBusca)
        );
      }

      return rmas;
    } catch (error) {
      console.error("❌ Erro ao buscar RMAs:", error);
      throw error;
    }
  }

  // ==================== BUSCAR RMA POR ID ====================
  async buscarRMAPorId(id: string): Promise<RMA | null> {
    try {
      const { data, error } = await supabase
        .from("rmas")
        .select(
          `
          *,
          produtos:produtos(id, descricao),
          lojas:lojas(id, nome),
          clientes:clientes(id, nome, telefone),
          fornecedores:fornecedores(id, nome, telefone)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as RMA;
    } catch (error) {
      console.error("❌ Erro ao buscar RMA:", error);
      throw error;
    }
  }

  // ==================== ATUALIZAR STATUS ====================
  async atualizarStatus(
    rmaId: string,
    novoStatus: StatusRMA,
    usuarioId: string,
    devolverAoEstoque: boolean = false
  ): Promise<void> {
    try {
      console.log(`🔵 Atualizando status do RMA ${rmaId} para ${novoStatus}`);

      // Buscar dados atuais
      const rmaAtual = await this.buscarRMAPorId(rmaId);
      if (!rmaAtual) throw new Error("RMA não encontrado");

      const statusAnterior = rmaAtual.status;

      // Atualizar status
      const { error } = await supabase
        .from("rmas")
        .update({ status: novoStatus, atualizado_em: new Date().toISOString() })
        .eq("id", rmaId);

      if (error) throw error;

      // Registrar histórico
      await this.registrarHistorico({
        rma_id: rmaId,
        tipo_acao: "mudanca_status",
        descricao: `Status alterado de "${statusAnterior}" para "${novoStatus}"`,
        dados_anteriores: { status: statusAnterior },
        dados_novos: { status: novoStatus },
        criado_por: usuarioId,
      });

      // Lógica especial: Se status mudou para "recebido" e é RMA interno/fornecedor, adicionar ao estoque
      if (
        novoStatus === "recebido" &&
        rmaAtual.tipo_origem === "interno_fornecedor"
      ) {
        await this.movimentarEstoque({
          rma_id: rmaId,
          produto_id: rmaAtual.produto_id,
          loja_id: rmaAtual.loja_id,
          quantidade: rmaAtual.quantidade,
          tipo_movimentacao: "entrada",
          motivo: `RMA #${rmaAtual.numero_rma} recebido do fornecedor`,
          criado_por: usuarioId,
        });
      }

      // Se usuário optou por devolver ao estoque ao concluir
      if (novoStatus === "concluido" && devolverAoEstoque) {
        await this.movimentarEstoque({
          rma_id: rmaId,
          produto_id: rmaAtual.produto_id,
          loja_id: rmaAtual.loja_id,
          quantidade: rmaAtual.quantidade,
          tipo_movimentacao: "entrada",
          motivo: `RMA #${rmaAtual.numero_rma} concluído - retorno ao estoque`,
          criado_por: usuarioId,
        });
      }

      console.log("✅ Status atualizado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      throw error;
    }
  }

  // ==================== ATUALIZAR RMA ====================
  async atualizarRMA(
    id: string,
    dados: Partial<NovoRMA>,
    usuarioId: string
  ): Promise<void> {
    try {
      console.log("🔵 Atualizando RMA:", id);

      // Buscar dados anteriores
      const rmaAnterior = await this.buscarRMAPorId(id);
      if (!rmaAnterior) throw new Error("RMA não encontrado");

      // Atualizar RMA
      const { error } = await supabase
        .from("rmas")
        .update({
          ...dados,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Registrar histórico
      await this.registrarHistorico({
        rma_id: id,
        tipo_acao: "atualizacao",
        descricao: "RMA atualizado",
        dados_anteriores: rmaAnterior,
        dados_novos: dados,
        criado_por: usuarioId,
      });

      console.log("✅ RMA atualizado");
    } catch (error) {
      console.error("❌ Erro ao atualizar RMA:", error);
      throw error;
    }
  }

  // ==================== DEVOLVER AO ESTOQUE ====================
  async devolverAoEstoque(
    id: string,
    usuarioId: string,
    motivo?: string
  ): Promise<void> {
    try {
      console.log("🔵 Devolvendo produto ao estoque:", id);

      // Buscar RMA
      const rma = await this.buscarRMAPorId(id);
      if (!rma) throw new Error("RMA não encontrado");

      if (rma.status === "cancelado") {
        throw new Error(
          "RMA cancelado não pode ser devolvido (já foi devolvido no cancelamento)"
        );
      }

      // Devolver ao estoque
      await this.movimentarEstoque({
        rma_id: id,
        produto_id: rma.produto_id,
        loja_id: rma.loja_id,
        quantidade: rma.quantidade,
        tipo_movimentacao: "entrada",
        motivo: motivo || `Devolução ao estoque - RMA #${rma.numero_rma}`,
        criado_por: usuarioId,
      });

      // Registrar histórico
      await this.registrarHistorico({
        rma_id: id,
        tipo_acao: "movimentacao_estoque",
        descricao: `Produto devolvido ao estoque`,
        dados_anteriores: null,
        dados_novos: { quantidade: rma.quantidade, motivo },
        criado_por: usuarioId,
      });

      console.log("✅ Produto devolvido ao estoque com sucesso");
    } catch (error) {
      console.error("❌ Erro ao devolver ao estoque:", error);
      throw error;
    }
  }

  // ==================== CANCELAR RMA ====================
  async cancelarRMA(id: string, usuarioId: string): Promise<void> {
    try {
      console.log("🔵 Cancelando RMA:", id);

      // Buscar RMA
      const rma = await this.buscarRMAPorId(id);
      if (!rma) throw new Error("RMA não encontrado");

      if (rma.status === "cancelado") {
        throw new Error("RMA já está cancelado");
      }

      // Devolver ao estoque (saída negativa = entrada)
      await this.movimentarEstoque({
        rma_id: id,
        produto_id: rma.produto_id,
        loja_id: rma.loja_id,
        quantidade: rma.quantidade,
        tipo_movimentacao: "entrada", // Devolve ao estoque
        motivo: `Cancelamento do RMA #${rma.numero_rma}`,
        criado_por: usuarioId,
      });

      // Atualizar status para cancelado
      const { error } = await supabase
        .from("rmas")
        .update({
          status: "cancelado",
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Registrar histórico
      await this.registrarHistorico({
        rma_id: id,
        tipo_acao: "mudanca_status",
        descricao: `Status alterado para Cancelado`,
        dados_anteriores: rma.status,
        dados_novos: "cancelado",
        criado_por: usuarioId,
      });

      console.log("✅ RMA cancelado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao cancelar RMA:", error);
      throw error;
    }
  }

  // ==================== DELETAR RMA ====================
  async deletarRMA(id: string): Promise<void> {
    try {
      console.log("🔵 Deletando RMA:", id);

      // Buscar RMA para verificar status
      const rma = await this.buscarRMAPorId(id);
      if (!rma) throw new Error("RMA não encontrado");

      if (rma.status !== "cancelado") {
        throw new Error("Apenas RMAs cancelados podem ser deletados");
      }

      // Deletar RMA (cascade deleta histórico e fotos)
      const { error } = await supabase.from("rmas").delete().eq("id", id);

      if (error) throw error;

      console.log("✅ RMA deletado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao deletar RMA:", error);
      throw error;
    }
  }

  // ==================== MOVIMENTAR ESTOQUE ====================
  private async movimentarEstoque(params: {
    rma_id: string;
    produto_id: string;
    loja_id: number;
    quantidade: number;
    tipo_movimentacao: "entrada" | "saida";
    motivo: string;
    criado_por: string;
  }): Promise<void> {
    try {
      console.log("🔵 Movimentando estoque:", params);

      // Buscar estoque atual
      const { data: estoqueAtual, error: erroConsulta } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", params.produto_id)
        .eq("id_loja", params.loja_id)
        .single();

      if (erroConsulta && erroConsulta.code !== "PGRST116") {
        throw erroConsulta;
      }

      const quantidadeAtual = estoqueAtual?.quantidade || 0;
      const quantidadeMovimentacao =
        params.tipo_movimentacao === "entrada"
          ? params.quantidade
          : -params.quantidade;
      const novaQuantidade = quantidadeAtual + quantidadeMovimentacao;

      // Atualizar ou inserir estoque
      if (estoqueAtual) {
        const { error: erroEstoque } = await supabase
          .from("estoque_lojas")
          .update({
            quantidade: novaQuantidade,
            atualizado_por: params.criado_por,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id_produto", params.produto_id)
          .eq("id_loja", params.loja_id);

        if (erroEstoque) {
          // Verifica se é erro de estoque negativo
          if (
            erroEstoque.code === "23514" ||
            erroEstoque.message?.includes("estoque_lojas_quantidade_check")
          ) {
            throw new Error(
              `Estoque insuficiente. Disponível: ${quantidadeAtual}, Solicitado: ${params.quantidade}`
            );
          }
          throw erroEstoque;
        }
      } else {
        const { error: erroEstoque } = await supabase
          .from("estoque_lojas")
          .insert({
            id_produto: params.produto_id,
            id_loja: params.loja_id,
            quantidade: novaQuantidade,
            atualizado_por: params.criado_por,
          });

        if (erroEstoque) throw erroEstoque;
      }

      // Registrar no histórico de estoque
      const { error: erroHistorico } = await supabase
        .from("historico_estoque")
        .insert({
          id_produto: params.produto_id,
          id_loja: params.loja_id,
          usuario_id: params.criado_por,
          quantidade: Math.abs(quantidadeMovimentacao),
          quantidade_anterior: quantidadeAtual,
          quantidade_nova: novaQuantidade,
          tipo_movimentacao: params.tipo_movimentacao,
          motivo: params.motivo,
          observacao: `RMA #${params.rma_id}`,
        });

      if (erroHistorico) throw erroHistorico;

      // Registrar no histórico do RMA
      await this.registrarHistorico({
        rma_id: params.rma_id,
        tipo_acao: "movimentacao_estoque",
        descricao: `${
          params.tipo_movimentacao === "entrada" ? "Entrada" : "Saída"
        } de ${params.quantidade} unidade(s) no estoque`,
        dados_novos: {
          tipo_movimentacao: params.tipo_movimentacao,
          quantidade: params.quantidade,
        },
        criado_por: params.criado_por,
      });

      console.log("✅ Estoque movimentado");
    } catch (error) {
      console.error("❌ Erro ao movimentar estoque:", error);
      throw error;
    }
  }

  // ==================== REGISTRAR HISTÓRICO ====================
  private async registrarHistorico(params: {
    rma_id: string;
    tipo_acao: HistoricoRMA["tipo_acao"];
    descricao: string;
    dados_anteriores?: any;
    dados_novos?: any;
    criado_por: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("historico_rma").insert({
        rma_id: params.rma_id,
        tipo_acao: params.tipo_acao,
        descricao: params.descricao,
        dados_anteriores: params.dados_anteriores,
        dados_novos: params.dados_novos,
        criado_por: params.criado_por,
      });

      if (error) {
        console.error("❌ Erro ao registrar histórico:", error);
        throw error;
      }

      console.log("✅ Histórico registrado");
    } catch (error) {
      console.error("❌ Erro ao registrar histórico:", error);
      // Não lançar erro para não bloquear a operação principal
    }
  }

  // ==================== BUSCAR HISTÓRICO ====================
  async buscarHistorico(rmaId: string): Promise<HistoricoRMA[]> {
    try {
      const { data, error } = await supabase
        .from("historico_rma")
        .select(
          `
          *
        `
        )
        .eq("rma_id", rmaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      return data as HistoricoRMA[];
    } catch (error) {
      console.error("❌ Erro ao buscar histórico:", error);
      throw error;
    }
  }

  // ==================== UPLOAD DE FOTOS ====================
  async uploadFotos(
    rmaId: string,
    arquivos: File[],
    usuarioId: string
  ): Promise<FotoRMA[]> {
    try {
      console.log(`🔵 Fazendo upload de ${arquivos.length} foto(s)`);

      const fotosUpload: FotoRMA[] = [];

      for (const arquivo of arquivos) {
        // Validar tamanho (5MB)
        if (arquivo.size > 5 * 1024 * 1024) {
          throw new Error(
            `Arquivo ${arquivo.name} excede o tamanho máximo de 5MB`
          );
        }

        // Validar formato
        if (!["image/jpeg", "image/jpg", "image/png"].includes(arquivo.type)) {
          throw new Error(`Formato do arquivo ${arquivo.name} não suportado`);
        }

        // Gerar nome único
        const extensao = arquivo.name.split(".").pop();
        const nomeArquivo = `${rmaId}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${extensao}`;

        // Upload para storage
        const { error: erroUpload } = await supabase.storage
          .from("fotos_rma")
          .upload(nomeArquivo, arquivo);

        if (erroUpload) throw erroUpload;

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("fotos_rma").getPublicUrl(nomeArquivo);

        // Salvar registro no banco
        const { data: foto, error: erroFoto } = await supabase
          .from("fotos_rma")
          .insert({
            rma_id: rmaId,
            url: publicUrl,
            nome_arquivo: nomeArquivo,
            tamanho: arquivo.size,
            criado_por: usuarioId,
          })
          .select()
          .single();

        if (erroFoto) throw erroFoto;

        fotosUpload.push(foto as FotoRMA);
      }

      // Registrar histórico
      await this.registrarHistorico({
        rma_id: rmaId,
        tipo_acao: "adicao_foto",
        descricao: `${arquivos.length} foto(s) adicionada(s)`,
        dados_novos: { quantidade_fotos: arquivos.length },
        criado_por: usuarioId,
      });

      console.log("✅ Fotos enviadas com sucesso");
      return fotosUpload;
    } catch (error) {
      console.error("❌ Erro ao fazer upload de fotos:", error);
      throw error;
    }
  }

  // ==================== BUSCAR FOTOS ====================
  async buscarFotos(rmaId: string): Promise<FotoRMA[]> {
    try {
      const { data, error } = await supabase
        .from("fotos_rma")
        .select("*")
        .eq("rma_id", rmaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      return data as FotoRMA[];
    } catch (error) {
      console.error("❌ Erro ao buscar fotos:", error);
      throw error;
    }
  }

  // ==================== DELETAR FOTO ====================
  async deletarFoto(fotoId: string, usuarioId: string): Promise<void> {
    try {
      // Buscar foto
      const { data: foto, error: erroFoto } = await supabase
        .from("fotos_rma")
        .select("*")
        .eq("id", fotoId)
        .single();

      if (erroFoto) throw erroFoto;

      // Deletar do storage
      const { error: erroStorage } = await supabase.storage
        .from("fotos_rma")
        .remove([foto.nome_arquivo]);

      if (erroStorage) throw erroStorage;

      // Deletar registro
      const { error: erroDelete } = await supabase
        .from("fotos_rma")
        .delete()
        .eq("id", fotoId);

      if (erroDelete) throw erroDelete;

      console.log("✅ Foto deletada");
    } catch (error) {
      console.error("❌ Erro ao deletar foto:", error);
      throw error;
    }
  }
}

export const rmaService = new RMAService();
