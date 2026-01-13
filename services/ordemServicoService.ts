// =====================================================
// SERVICE: ORDEM DE SERVIÇO
// =====================================================

import { supabase } from "@/lib/supabaseClient";
import {
  OrdemServico,
  OrdemServicoFormData,
  OrdemServicoPeca,
  OrdemServicoPecaFormData,
  HistoricoOrdemServico,
  EstatisticasOS,
  StatusOS,
  OrdemServicoCaixa,
} from "@/types/ordemServico";

// =====================================================
// CRUD ORDEM DE SERVIÇO
// =====================================================

/**
 * Buscar todas as ordens de serviço
 */
export async function buscarOrdensServico(filtros?: {
  status?: StatusOS;
  id_loja?: number;
  cliente_nome?: string;
  numero_os?: number;
  data_inicio?: string;
  data_fim?: string;
}) {
  try {
    let query = supabase
      .from("ordem_servico")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome),
        pagamentos:ordem_servico_pagamentos(id, valor, forma_pagamento, criado_em),
        caixa:ordem_servico_caixa(id, status_caixa)
      `
      )
      .order("numero_os", { ascending: false });

    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }

    if (filtros?.id_loja) {
      query = query.eq("id_loja", filtros.id_loja);
    }

    if (filtros?.cliente_nome) {
      query = query.ilike("cliente_nome", `%${filtros.cliente_nome}%`);
    }

    if (filtros?.numero_os) {
      query = query.eq("numero_os", filtros.numero_os);
    }

    if (filtros?.data_inicio) {
      query = query.gte("data_entrada", filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte("data_entrada", filtros.data_fim);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Buscar informações dos técnicos separadamente
    if (data && data.length > 0) {
      const tecnicosIds = data
        .map((os) => os.tecnico_responsavel)
        .filter((id): id is string => !!id);

      if (tecnicosIds.length > 0) {
        const { data: tecnicos, error: tecnicoError } = await supabase
          .from("tecnicos")
          .select("id, nome")
          .in("id", tecnicosIds);

        if (tecnicos && tecnicos.length > 0) {
          // Fazer merge dos dados
          const ordensComTecnicos = data.map((os) => {
            const tecnicoEncontrado = os.tecnico_responsavel
              ? tecnicos.find((t) => t.id === os.tecnico_responsavel)
              : undefined;

            return {
              ...os,
              tecnico: tecnicoEncontrado,
            };
          });

          return { data: ordensComTecnicos as OrdemServico[], error: null };
        } else {
          console.warn("Nenhum técnico encontrado ou erro na busca");
        }
      }
    }

    return { data: data as OrdemServico[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar ordens de serviço:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Buscar OS por ID
 */
export async function buscarOrdemServicoPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome),
        pecas:ordem_servico_pecas(
          *,
          produto:produtos(id, descricao, marca, categoria)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // Buscar informações do técnico separadamente
    if (data && data.tecnico_responsavel) {
      const { data: tecnico, error: tecnicoError } = await supabase
        .from("tecnicos")
        .select("id, nome")
        .eq("id", data.tecnico_responsavel)
        .single();

      if (tecnico) {
        const osComTecnico = { ...data, tecnico };
        return {
          data: osComTecnico as OrdemServico,
          error: null,
        };
      }
    }

    return { data: data as OrdemServico, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar ordem de serviço:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Criar nova OS
 */
export async function criarOrdemServico(
  dados: OrdemServicoFormData,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico")
      .insert({
        ...dados,
        criado_por: userId,
        atualizado_por: userId,
      })
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .single();

    if (error) throw error;
    return { data: data as OrdemServico, error: null };
  } catch (error: any) {
    console.error("Erro ao criar ordem de serviço:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Atualizar OS
 */
export async function atualizarOrdemServico(
  id: string,
  dados: Partial<OrdemServicoFormData>,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico")
      .update({
        ...dados,
        atualizado_por: userId,
      })
      .eq("id", id)
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .single();

    if (error) throw error;
    return { data: data as OrdemServico, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar ordem de serviço:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Mudar status da OS
 */
export async function mudarStatusOS(
  id: string,
  novoStatus: StatusOS,
  userId: string
) {
  try {
    const dados: any = {
      status: novoStatus,
      atualizado_por: userId,
    };

    // Atualizar datas conforme o status
    if (novoStatus === "em_andamento" && !dados.data_inicio_servico) {
      dados.data_inicio_servico = new Date().toISOString();
    } else if (novoStatus === "concluido" && !dados.data_conclusao) {
      dados.data_conclusao = new Date().toISOString();
    } else if (novoStatus === "entregue" && !dados.data_entrega_cliente) {
      dados.data_entrega_cliente = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("ordem_servico")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as OrdemServico, error: null };
  } catch (error: any) {
    console.error("Erro ao mudar status da OS:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Cancelar OS (trigger do banco devolve peças ao estoque automaticamente)
 */
export async function cancelarOrdemServico(id: string, userId: string) {
  try {
    const result = await mudarStatusOS(id, "cancelado", userId);

    if (result?.error) {
      throw new Error(result.error);
    }

    // Remover pagamentos vinculados à OS cancelada para evitar lançamentos inconsistentes
    const { error: pagamentosError } = await supabase
      .from("ordem_servico_pagamentos")
      .delete()
      .eq("id_ordem_servico", id);

    if (pagamentosError) {
      throw pagamentosError;
    }

    try {
      // Cancelar lançamento no caixa vinculado à OS, se existir
      await supabase
        .from("ordem_servico_caixa")
        .update({ status_caixa: "cancelado" })
        .eq("id_ordem_servico", id);
    } catch (err) {
      console.warn("Aviso: falha ao cancelar lançamento do caixa da OS", err);
    }

    return result;
  } catch (error: any) {
    console.error("Erro ao cancelar ordem de serviço:", error);
    return { error: error.message || "Erro ao cancelar ordem de serviço" };
  }
}

/**
 * Devolver OS (serviço desfeito):
 * - devolve peças ao estoque removendo-as da OS
 * - apaga pagamentos vinculados
 * - marca status como "devolvida" e cancela lançamento no caixa
 * - registra histórico com valor a reembolsar
 */
export async function devolverOrdemServico(id: string, userId: string) {
  try {
    // Buscar pagamentos para calcular reembolso
    const { data: pagamentos } = await supabase
      .from("ordem_servico_pagamentos")
      .select("id, valor, forma_pagamento")
      .eq("id_ordem_servico", id);

    const totalReembolsar = (pagamentos || []).reduce(
      (sum, pag) => sum + Number(pag.valor || 0),
      0
    );

    // Buscar peças e devolver/remoção
    const { data: pecas } = await supabase
      .from("ordem_servico_pecas")
      .select("id")
      .eq("id_ordem_servico", id);

    if (pecas && pecas.length > 0) {
      for (const peca of pecas) {
        await removerPecaOS(peca.id, userId);
      }
    }

    // Remover pagamentos vinculados
    if (pagamentos && pagamentos.length > 0) {
      await supabase
        .from("ordem_servico_pagamentos")
        .delete()
        .eq("id_ordem_servico", id);
    }

    // Atualizar status para devolvida
    const { error: erroStatus } = await mudarStatusOS(id, "devolvida", userId);
    if (erroStatus) throw new Error(erroStatus);

    // Cancelar lançamento no caixa vinculado à OS, se existir
    try {
      await supabase
        .from("ordem_servico_caixa")
        .update({ status_caixa: "cancelado" })
        .eq("id_ordem_servico", id);
    } catch (err) {
      console.warn("Aviso: falha ao cancelar lançamento do caixa da OS", err);
    }

    // Registrar histórico
    await registrarHistoricoOS(
      id,
      "devolucao",
      `OS devolvida. Reembolsar R$ ${totalReembolsar.toFixed(2)}`,
      userId
    );

    return { data: { total_reembolsar: totalReembolsar }, error: null };
  } catch (error: any) {
    console.error("Erro ao devolver ordem de serviço:", error);
    return { data: null, error: error.message || "Erro ao devolver OS" };
  }
}

/**
 * Substituir uma peça da OS (remove a peça antiga e adiciona a nova)
 */
export async function substituirPecaOS(
  idPecaAtual: string,
  novaPeca: OrdemServicoPecaFormData,
  userId: string
) {
  try {
    // Garantir que a peça pertença à OS alvo
    const { data: pecaAtual, error: erroBusca } = await supabase
      .from("ordem_servico_pecas")
      .select("id, id_ordem_servico")
      .eq("id", idPecaAtual)
      .single();

    if (erroBusca || !pecaAtual) {
      throw new Error("Peça não encontrada para substituição");
    }

    // Remove peça antiga (devolve estoque se aplicável)
    const { error: erroRemocao } = await removerPecaOS(idPecaAtual, userId);
    if (erroRemocao) {
      throw new Error(erroRemocao);
    }

    // Adiciona nova peça (já devolve estoque e registra histórico)
    const { data, error: erroAdicionar } = await adicionarPecaOS(
      {
        ...novaPeca,
        id_ordem_servico: pecaAtual.id_ordem_servico,
      },
      userId
    );

    if (erroAdicionar) {
      throw new Error(erroAdicionar);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao substituir peça da OS:", error);
    return { data: null, error: error.message || "Erro ao substituir peça" };
  }
}

/**
 * Deletar OS (trigger do banco devolve peças ao estoque automaticamente)
 */
export async function deletarOrdemServico(id: string) {
  try {
    console.log("🗑️ Deletando ordem de serviço:", id);

    // Deletar ordem de serviço - CASCADE vai deletar registros relacionados
    const { error } = await supabase
      .from("ordem_servico")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao deletar OS:", error);
      throw error;
    }

    console.log("✅ Ordem de serviço deletada com sucesso!");
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao deletar ordem de serviço:", error);
    return { error: error.message || "Erro ao excluir ordem de serviço" };
  }
}

// =====================================================
// PEÇAS DA ORDEM DE SERVIÇO
// =====================================================

/**
 * Buscar peças de uma OS
 */
export async function buscarPecasOS(idOrdemServico: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_pecas")
      .select(
        `
        *,
        produto:produtos(id, descricao, marca, categoria, preco_venda)
      `
      )
      .eq("id_ordem_servico", idOrdemServico);

    if (error) throw error;
    return { data: data as OrdemServicoPeca[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar peças da OS:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Adicionar peça à OS com controle de estoque direto (sem trigger)
 */
export async function adicionarPecaOS(
  dados: OrdemServicoPecaFormData,
  userId: string
) {
  try {
    // Validações
    if (dados.tipo_produto === "avulso" && !dados.descricao_peca) {
      throw new Error("Descrição é obrigatória para produto avulso");
    }

    if (dados.tipo_produto === "estoque" && !dados.id_produto) {
      throw new Error("Produto é obrigatório para tipo estoque");
    }

    // Buscar descrição do produto e verificar estoque se for do estoque
    let descricaoPeca = dados.descricao_peca || "";
    let quantidadeMinima = 5;

    if (dados.tipo_produto === "estoque" && dados.id_produto) {
      const { data: produto } = await supabase
        .from("produtos")
        .select("descricao, quantidade_minima")
        .eq("id", dados.id_produto)
        .single();

      if (produto) {
        descricaoPeca = produto.descricao;
        quantidadeMinima = produto.quantidade_minima || 5;
      }

      // VERIFICAR E BAIXAR ESTOQUE MANUALMENTE (como em vendas)
      const { data: estoqueAtual } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", dados.id_produto)
        .eq("id_loja", dados.id_loja)
        .single();

      if (!estoqueAtual) {
        throw new Error("Produto não encontrado no estoque desta loja");
      }

      if (estoqueAtual.quantidade < dados.quantidade) {
        throw new Error(
          `Estoque insuficiente! Disponível: ${estoqueAtual.quantidade}, Necessário: ${dados.quantidade}`
        );
      }

      // Baixar do estoque
      const novaQuantidade = estoqueAtual.quantidade - dados.quantidade;
      const { error: erroEstoque } = await supabase
        .from("estoque_lojas")
        .update({
          quantidade: novaQuantidade,
          atualizado_em: new Date().toISOString(),
          atualizado_por: userId,
        })
        .eq("id_produto", dados.id_produto)
        .eq("id_loja", dados.id_loja);

      if (erroEstoque) throw erroEstoque;

      // Registrar no histórico de estoque
      const { error: erroHistorico } = await supabase
        .from("historico_estoque")
        .insert({
          id_produto: dados.id_produto,
          id_loja: dados.id_loja,
          tipo_movimentacao: "saida",
          quantidade: dados.quantidade,
          quantidade_anterior: estoqueAtual.quantidade,
          quantidade_nova: novaQuantidade,
          quantidade_alterada: dados.quantidade,
          motivo: "ordem_servico",
          observacao: `Saída para OS - ${descricaoPeca}`,
          usuario_id: userId,
          id_ordem_servico: dados.id_ordem_servico,
        });

      if (erroHistorico) {
        console.error("Erro ao registrar histórico de estoque:", erroHistorico);
        // Não falhar a operação por causa do histórico
      }
    }

    // Calcular valor total
    const valorTotal = dados.quantidade * dados.valor_venda;

    const { data, error } = await supabase
      .from("ordem_servico_pecas")
      .insert({
        id_ordem_servico: dados.id_ordem_servico,
        tipo_produto: dados.tipo_produto,
        id_produto: dados.id_produto,
        id_loja: dados.id_loja,
        descricao_peca: descricaoPeca,
        quantidade: dados.quantidade,
        valor_custo: dados.valor_custo,
        valor_venda: dados.valor_venda,
        valor_total: valorTotal,
        observacao: dados.observacao,
        criado_por: userId,
        estoque_baixado: dados.tipo_produto === "estoque",
        data_baixa_estoque:
          dados.tipo_produto === "estoque" ? new Date().toISOString() : null,
      })
      .select(
        `
        *,
        produto:produtos(id, descricao, marca, categoria)
      `
      )
      .single();

    if (error) throw error;

    // Registrar no histórico da OS
    const tipoProdutoLabel =
      dados.tipo_produto === "estoque" ? "do estoque" : "avulso";
    await registrarHistoricoOS(
      dados.id_ordem_servico,
      "adicao_peca",
      `Peça ${tipoProdutoLabel} adicionada: ${descricaoPeca} (${dados.quantidade}x) - R$ ${dados.valor_venda.toFixed(2)}`,
      userId
    );

    return { data: data as OrdemServicoPeca, error: null };
  } catch (error: any) {
    console.error("Erro ao adicionar peça à OS:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Remover peça da OS (devolve ao estoque se já foi baixado)
 */
export async function removerPecaOS(id: string, userId: string) {
  try {
    // Buscar dados da peça antes de deletar
    const { data: peca } = await supabase
      .from("ordem_servico_pecas")
      .select("*, produto:produtos(descricao)")
      .eq("id", id)
      .single();

    if (!peca) {
      throw new Error("Peça não encontrada");
    }

    // Se o estoque já foi baixado, devolver
    if (peca.estoque_baixado && peca.tipo_produto === "estoque") {
      // Buscar estoque atual
      const { data: estoqueAtual } = await supabase
        .from("estoque_lojas")
        .select("quantidade")
        .eq("id_produto", peca.id_produto)
        .eq("id_loja", peca.id_loja)
        .single();

      if (estoqueAtual) {
        const novaQuantidade = estoqueAtual.quantidade + peca.quantidade;

        await supabase
          .from("estoque_lojas")
          .update({
            quantidade: novaQuantidade,
            atualizado_por: userId,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id_produto", peca.id_produto)
          .eq("id_loja", peca.id_loja);

        // Registrar no histórico de estoque
        await supabase.from("historico_estoque").insert({
          id_produto: peca.id_produto,
          id_loja: peca.id_loja,
          tipo_movimentacao: "entrada",
          quantidade: peca.quantidade,
          quantidade_anterior: estoqueAtual.quantidade,
          quantidade_nova: novaQuantidade,
          quantidade_alterada: peca.quantidade,
          motivo: "ordem_servico",
          observacao: `Devolução por remoção de peça da OS`,
          usuario_id: userId,
        });
      }
    }

    // Deletar peça
    const { error } = await supabase
      .from("ordem_servico_pecas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Registrar no histórico
    await registrarHistoricoOS(
      peca.id_ordem_servico,
      "remocao_peca",
      `Peça removida: ${peca.produto?.descricao}`,
      userId
    );

    return { error: null };
  } catch (error: any) {
    console.error("Erro ao remover peça da OS:", error);
    return { error: error.message };
  }
}

// =====================================================
// HISTÓRICO
// =====================================================

/**
 * Buscar histórico de uma OS
 */
export async function buscarHistoricoOS(idOrdemServico: string) {
  try {
    const { data, error } = await supabase
      .from("historico_ordem_servico")
      .select("*")
      .eq("id_ordem_servico", idOrdemServico)
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return { data: data as HistoricoOrdemServico[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar histórico da OS:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Registrar evento no histórico
 */
export async function registrarHistoricoOS(
  idOrdemServico: string,
  tipoEvento: string,
  descricao: string,
  userId: string
) {
  try {
    // Buscar nome do usuário
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("nome")
      .eq("id", userId)
      .single();

    const { error } = await supabase.from("historico_ordem_servico").insert({
      id_ordem_servico: idOrdemServico,
      tipo_evento: tipoEvento,
      descricao: descricao,
      criado_por: userId,
      criado_por_nome: usuario?.nome,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao registrar histórico:", error);
    return { error: error.message };
  }
}

// =====================================================
// ESTATÍSTICAS
// =====================================================

/**
 * Obter estatísticas de OS
 */
export async function obterEstatisticasOS(idLoja?: number) {
  try {
    const { data, error } = await supabase.rpc("obter_estatisticas_os", {
      p_id_loja: idLoja,
    });

    if (error) throw error;
    return { data: data[0] as EstatisticasOS, error: null };
  } catch (error: any) {
    console.error("Erro ao obter estatísticas:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Buscar OS por cliente (histórico do cliente)
 */
export async function buscarOSPorCliente(
  clienteNome?: string,
  clienteTelefone?: string
) {
  try {
    let query = supabase
      .from("ordem_servico")
      .select(
        `
        *,
        loja:lojas!id_loja(id, nome)
      `
      )
      .order("data_entrada", { ascending: false });

    if (clienteNome) {
      query = query.ilike("cliente_nome", `%${clienteNome}%`);
    }

    if (clienteTelefone) {
      query = query.eq("cliente_telefone", clienteTelefone);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as OrdemServico[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar OS por cliente:", error);
    return { data: null, error: error.message };
  }
}

// =====================================================
// CAIXA
// =====================================================

/**
 * Buscar lançamentos pendentes no caixa
 */
export async function buscarLancamentosCaixaOS(idLoja?: number) {
  try {
    let query = supabase
      .from("ordem_servico_caixa")
      .select(
        `
        *,
        ordem_servico:ordem_servico(
          numero_os,
          cliente_nome,
          cliente_telefone,
          equipamento_tipo,
          equipamento_marca,
          equipamento_modelo,
          data_entrada,
          data_entrega_cliente
        )
      `
      )
      .order("criado_em", { ascending: false });

    if (idLoja) {
      query = query.eq("id_loja", idLoja);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as OrdemServicoCaixa[], error: null };
  } catch (error: any) {
    console.error("Erro ao buscar lançamentos do caixa:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Atualizar dados do lançamento no caixa (forma pagamento, etc)
 */
export async function atualizarLancamentoCaixaOS(
  id: string,
  dados: {
    forma_pagamento?: string;
    parcelas?: number;
    observacoes?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_caixa")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as OrdemServicoCaixa, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar lançamento do caixa:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Confirmar lançamento no caixa (recebimento)
 */
export async function confirmarLancamentoCaixaOS(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_caixa")
      .update({
        status_caixa: "confirmado",
        data_confirmacao: new Date().toISOString(),
        confirmado_por: userId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar valor pago na OS
    if (data) {
      await supabase
        .from("ordem_servico")
        .update({
          valor_pago: data.valor_total,
        })
        .eq("id", data.id_ordem_servico);
    }

    return { data: data as OrdemServicoCaixa, error: null };
  } catch (error: any) {
    console.error("Erro ao confirmar lançamento do caixa:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Cancelar lançamento no caixa
 */
export async function cancelarLancamentoCaixaOS(id: string) {
  try {
    const { data, error } = await supabase
      .from("ordem_servico_caixa")
      .update({
        status_caixa: "cancelado",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as OrdemServicoCaixa, error: null };
  } catch (error: any) {
    console.error("Erro ao cancelar lançamento do caixa:", error);
    return { data: null, error: error.message };
  }
}
