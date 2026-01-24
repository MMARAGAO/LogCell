import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrdemServico } from "@/types/ordemServico";
import { supabase } from "@/lib/supabaseClient";
import { TipoServicoGarantia } from "@/types/garantia";

interface DadosLoja {
  nome: string;
  endereco?: string;
  telefone?: string;
  cnpj?: string;
}

interface PecaOS {
  descricao_peca: string;
  quantidade: number;
  valor_venda: number;
}

export const gerarPDFOrdemServico = async (
  os: OrdemServico,
  pecas: PecaOS[],
  dadosLoja: DadosLoja,
  tipoGarantia?: string,
  diasGarantia?: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Garantir dados da loja com fallback para dados padrão
  const nomeFinal = dadosLoja.nome || "Autorizada Cell";
  const enderecoFinal = dadosLoja.endereco || "Sia Trecho 7 Lote Único Conjunto D Loja 229 Zona Industrial - SIA, Brasília - DF, 71208-900";
  const telefoneFinal = dadosLoja.telefone || "(61) 98286-3441";

  // Cabeçalho da Empresa
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(nomeFinal, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // OBRIGATÓRIO: Endereço da loja
  const enderecoLines = doc.splitTextToSize(enderecoFinal, pageWidth - 30);
  enderecoLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4;
  });
  y += 1;
  
  // OBRIGATÓRIO: Telefone
  doc.text(`Tel: ${telefoneFinal}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  
  if (dadosLoja.cnpj) {
    doc.text(`CNPJ: ${dadosLoja.cnpj}`, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ORDEM DE SERVIÇO", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Número e Data
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº OS: ${os.numero_os || os.id}`, 15, y);
  doc.text(
    `Data: ${new Date(os.criado_em).toLocaleDateString("pt-BR")}`,
    pageWidth - 15,
    y,
    { align: "right" }
  );
  y += 10;

  // Status e Prioridade
  doc.setFont("helvetica", "bold");
  doc.text(`Status: `, 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(os.status.toUpperCase(), 35, y);

  doc.setFont("helvetica", "bold");
  doc.text(`Prioridade: `, pageWidth / 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(os.prioridade?.toUpperCase() || "MÉDIA", pageWidth / 2 + 25, y);
  y += 10;

  // Dados do Cliente
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DO CLIENTE", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${os.cliente_nome}`, 17, y);
  y += 6;
  if (os.cliente_telefone) {
    doc.text(`Telefone: ${os.cliente_telefone}`, 17, y);
    y += 6;
  }
  if (os.cliente_email) {
    doc.text(`E-mail: ${os.cliente_email}`, 17, y);
    y += 6;
  }
  y += 4;

  // Dados do Equipamento
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DO EQUIPAMENTO", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Equipamento: ${os.equipamento_tipo}`, 17, y);
  y += 6;
  if (os.equipamento_marca) {
    doc.text(`Marca: ${os.equipamento_marca}`, 17, y);
    y += 6;
  }
  if (os.equipamento_modelo) {
    doc.text(`Modelo: ${os.equipamento_modelo}`, 17, y);
    y += 6;
  }
  if (os.equipamento_numero_serie) {
    doc.text(`Nº Série: ${os.equipamento_numero_serie}`, 17, y);
    y += 6;
  }
  y += 4;

  // Defeito Reclamado
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DEFEITO RECLAMADO", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const defeitoLines = doc.splitTextToSize(os.defeito_reclamado, pageWidth - 40);
  doc.text(defeitoLines, 17, y);
  y += defeitoLines.length * 6 + 4;

  // Laudo Técnico (se houver)
  if (os.laudo_diagnostico) {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LAUDO TÉCNICO", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const laudoLines = doc.splitTextToSize(os.laudo_diagnostico, pageWidth - 40);
    doc.text(laudoLines, 17, y);
    y += laudoLines.length * 6 + 4;
  }

  // Peças Utilizadas (se houver)
  if (pecas && pecas.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PEÇAS UTILIZADAS", 17, y + 5);
    y += 12;

    autoTable(doc, {
      startY: y,
      head: [["Descrição", "Qtd"]],
      body: pecas.map((peca) => [
        peca.descricao_peca,
        peca.quantidade.toString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: [100, 100, 100], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 20, halign: "center" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Observações (se houver)
  if (os.observacoes_tecnicas) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES", 17, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(
      os.observacoes_tecnicas,
      pageWidth - 40
    );
    doc.text(obsLines, 17, y);
    y += obsLines.length * 5 + 10;
  }

  // Termos de Garantia
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Buscar texto de garantia do banco de dados
  let textoGarantia = null;
  let tituloGarantia = "TERMOS DE GARANTIA";
  let termos = [
    "(1) - A garantia só é válida mediante a apresentação dessa ordem de serviço/garantia.",
    "(2) - A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabeçalho a partir da data da entrega do aparelho ao cliente.",
    "(3) - Esta garantia cobre defeitos de peças e mão de obra decorrentes dos serviços realizados e/ou peças substituídas pela AUTORIZADA CELL. Não cobrimos garantia de terceiros.",
    "(4) - Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, surtos de energia, ou instalação de software não autorizado serão excluídos da garantia.",
    "(5) - Expirado o prazo da garantia, e apresentando esta ordem/garantia, poderá ser aplicado um desconto em caso de reparo no equipamento;",
    "(6) - O aparelho não procurado em 90 (NOVENTA) dias após a data de execução da ordem de serviço não nos responsabilizamos mais pelo aparelho.",
    "(7) - Brindes não estão sujeitos à garantia, e devem ser testados e conferidos no ato da entrega.",
    "(8) - Eu cliente, declaro ter ciência do que foi descrito acima.",
  ];

  if (os.tipo_garantia) {
    try {
      const { data } = await supabase
        .from("textos_garantia")
        .select("titulo, clausulas")
        .eq("tipo_servico", os.tipo_garantia)
        .eq("ativo", true)
        .single();

      if (data) {
        textoGarantia = data;
        tituloGarantia = data.titulo.toUpperCase();
        termos = data.clausulas.map((c: any) => `(${c.numero}) - ${c.texto}`);
      }
    } catch (error) {
      console.error("Erro ao buscar texto de garantia:", error);
      // Usar termos padrão em caso de erro
    }
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(tituloGarantia, 17, y + 5);
  y += 12;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  termos.forEach((termo) => {
    const termoLines = doc.splitTextToSize(termo, pageWidth - 40);
    doc.text(termoLines, 17, y);
    y += termoLines.length * 4 + 2;
  });

  y += 5;

  // Assinaturas
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y += 20;
  doc.setLineWidth(0.3);
  doc.line(15, y, 90, y);
  doc.line(pageWidth - 90, y, pageWidth - 15, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Cliente", 15, y);
  doc.text("Assinatura do Técnico", pageWidth - 90, y);

  return doc;
};

export const gerarOrcamentoOS = async (
  os: OrdemServico,
  pecas: PecaOS[],
  dadosLoja: DadosLoja,
  tipoGarantia?: string,
  diasGarantia?: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Garantir dados da loja com fallback para dados padrão
  const nomeFinal = dadosLoja.nome || "Autorizada Cell";
  const enderecoFinal = dadosLoja.endereco || "Sia Trecho 7 Lote Único Conjunto D Loja 229 Zona Industrial - SIA, Brasília - DF, 71208-900";
  const telefoneFinal = dadosLoja.telefone || "(61) 98286-3441";

  // Cabeçalho da Empresa
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(nomeFinal, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // OBRIGATÓRIO: Endereço da loja
  const enderecoLines = doc.splitTextToSize(enderecoFinal, pageWidth - 30);
  enderecoLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4;
  });
  y += 1;
  
  // OBRIGATÓRIO: Telefone
  doc.text(`Tel: ${telefoneFinal}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  
  if (dadosLoja.cnpj) {
    doc.text(`CNPJ: ${dadosLoja.cnpj}`, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ORÇAMENTO", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Número e Data
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº OS: ${os.numero_os || os.id}`, 15, y);
  doc.text(
    `Data: ${new Date(os.criado_em).toLocaleDateString("pt-BR")}`,
    pageWidth - 15,
    y,
    { align: "right" }
  );
  y += 10;

  // Dados do Cliente
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DO CLIENTE", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${os.cliente_nome}`, 17, y);
  y += 6;
  if (os.cliente_telefone) {
    doc.text(`Telefone: ${os.cliente_telefone}`, 17, y);
    y += 6;
  }
  if (os.cliente_email) {
    doc.text(`E-mail: ${os.cliente_email}`, 17, y);
    y += 6;
  }
  y += 4;

  // Dados do Equipamento / Aparelhos
  // Se houver múltiplos aparelhos, mostra cada um
  const temMultiplosAparelhos = (os.aparelhos?.length || 0) > 0;
  
  if (temMultiplosAparelhos && os.aparelhos) {
    // Múltiplos aparelhos
    os.aparelhos.forEach((aparelho, index) => {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`APARELHO ${aparelho.sequencia} - EQUIPAMENTO`, 17, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Equipamento: ${aparelho.equipamento_tipo}`, 17, y);
      y += 6;
      if (aparelho.equipamento_marca) {
        doc.text(`Marca: ${aparelho.equipamento_marca}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_modelo) {
        doc.text(`Modelo: ${aparelho.equipamento_modelo}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_numero_serie) {
        doc.text(`Nº Série: ${aparelho.equipamento_numero_serie}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_imei) {
        doc.text(`IMEI: ${aparelho.equipamento_imei}`, 17, y);
        y += 6;
      }
      
      // Estado do Equipamento
      doc.setFont("helvetica", "bold");
      doc.text(`Estado: `, 17, y);
      doc.setFont("helvetica", "normal");
      if (aparelho.estado_equipamento) {
        doc.text(aparelho.estado_equipamento, 45, y);
      } else {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(180, 0, 0);
        doc.text("[Informar estado]", 45, y);
        doc.setTextColor(0, 0, 0);
      }
      y += 8;

      // Problema Relatado
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`PROBLEMA - APARELHO ${aparelho.sequencia}`, 17, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const defeitoLines = doc.splitTextToSize(aparelho.defeito_reclamado || "[Informar]", pageWidth - 40);
      doc.text(defeitoLines, 17, y);
      y += defeitoLines.length * 6 + 4;

      // Serviço para este aparelho
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`SERVIÇO - APARELHO ${aparelho.sequencia}`, 17, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (aparelho.laudo_diagnostico) {
        const servicoLines = doc.splitTextToSize(aparelho.laudo_diagnostico, pageWidth - 40);
        doc.text(servicoLines, 17, y);
        y += servicoLines.length * 6 + 4;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(180, 0, 0);
        doc.text("A definir após diagnóstico", 17, y);
        doc.setTextColor(0, 0, 0);
        y += 10;
      }

      // Valores do aparelho
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(245, 245, 245);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`VALORES - APARELHO ${aparelho.sequencia}`, 17, y + 4);
      y += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Orçamento:`, 17, y);
      doc.text(`R$ ${(aparelho.valor_orcamento || 0).toFixed(2)}`, pageWidth - 15, y, { align: "right" });
      y += 5;
      
      if ((aparelho.valor_desconto || 0) > 0) {
        doc.text(`Desconto:`, 17, y);
        doc.text(`-R$ ${(aparelho.valor_desconto || 0).toFixed(2)}`, pageWidth - 15, y, { align: "right" });
        y += 5;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(`Total:`, 17, y);
      doc.text(`R$ ${(aparelho.valor_total || 0).toFixed(2)}`, pageWidth - 15, y, { align: "right" });
      y += 8;
    });
  } else {
    // Equipamento único (compatibilidade com OS antigas)
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DADOS DO EQUIPAMENTO", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Equipamento: ${os.equipamento_tipo}`, 17, y);
    y += 6;
    if (os.equipamento_marca) {
      doc.text(`Marca: ${os.equipamento_marca}`, 17, y);
      y += 6;
    }
    if (os.equipamento_modelo) {
      doc.text(`Modelo: ${os.equipamento_modelo}`, 17, y);
      y += 6;
    }
    if (os.equipamento_numero_serie) {
      doc.text(`Nº Série: ${os.equipamento_numero_serie}`, 17, y);
      y += 6;
    }
    
    // Estado do Equipamento (OBRIGATÓRIO no orçamento)
    doc.setFont("helvetica", "bold");
    doc.text(`Estado: `, 17, y);
    doc.setFont("helvetica", "normal");
    if (os.estado_equipamento) {
      doc.text(os.estado_equipamento, 45, y);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 0, 0);
      doc.text("[Informar estado do equipamento]", 45, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }
    y += 8;

    // Problema Relatado / Defeito Reclamado (OBRIGATÓRIO)
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PROBLEMA RELATADO PELO CLIENTE", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const defeitoLines = doc.splitTextToSize(os.defeito_reclamado || "[Informar o problema]", pageWidth - 40);
    doc.text(defeitoLines, 17, y);
    y += defeitoLines.length * 6 + 4;

    // Serviço a Realizar (OBRIGATÓRIO)
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SERVIÇO QUE SERÁ REALIZADO", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Se houver diagnóstico ou serviço realizado
    if (os.laudo_diagnostico) {
      const servicoLines = doc.splitTextToSize(os.laudo_diagnostico, pageWidth - 40);
      doc.text(servicoLines, 17, y);
      y += servicoLines.length * 6 + 4;
    } else if (os.servico_realizado) {
      const servicoLines = doc.splitTextToSize(os.servico_realizado, pageWidth - 40);
      doc.text(servicoLines, 17, y);
      y += servicoLines.length * 6 + 4;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 0, 0);
      doc.text("A definir após diagnóstico técnico", 17, y);
      doc.setTextColor(0, 0, 0);
      y += 10;
    }
  }

  // *** PEÇAS NÃO APARECEM NO ORÇAMENTO (CONFORME SOLICITADO) ***
  // Peças são gerenciadas internamente mas não exibidas no PDF de orçamento
  
  // Valores do Serviço
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Valores finais - suporta múltiplos aparelhos
  if (temMultiplosAparelhos && os.aparelhos) {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RESUMO DE VALORES", 17, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let totalGeralOrcamento = 0;
    let totalGeralDesconto = 0;
    let totalGeralServiço = 0;

    // Mostrar resumo de cada aparelho
    os.aparelhos.forEach((aparelho) => {
      const desconto = aparelho.valor_desconto || 0;
      const total = aparelho.valor_total || 0;
      totalGeralOrcamento += aparelho.valor_orcamento || 0;
      totalGeralDesconto += desconto;
      totalGeralServiço += total;

      doc.text(`Aparelho ${aparelho.sequencia} (${aparelho.equipamento_tipo}):`, 17, y);
      y += 4;
      doc.text(`  Orçamento: R$ ${(aparelho.valor_orcamento || 0).toFixed(2)}`, 20, y);
      y += 4;
      if (desconto > 0) {
        doc.text(`  Desconto: -R$ ${desconto.toFixed(2)}`, 20, y);
        y += 4;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`  Subtotal: R$ ${total.toFixed(2)}`, 20, y);
      doc.setFont("helvetica", "normal");
      y += 5;
    });

    y += 3;
    doc.setLineWidth(0.3);
    doc.line(17, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`TOTAL GERAL:`, 17, y);
    doc.text(`R$ ${totalGeralServiço.toFixed(2)}`, pageWidth - 15, y, { align: "right" });
    y += 10;
  }
  
  // *** SEÇÃO DE VALORES REMOVIDA (mão de obra e peças) ***
  // O orçamento não mostra breakdown de valores

  // Observações (se houver)
  if (os.observacoes_tecnicas) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES", 17, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(
      os.observacoes_tecnicas,
      pageWidth - 40
    );
    doc.text(obsLines, 17, y);
    y += obsLines.length * 5 + 10;
  }

  // Termo de autorização
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const termo = "Autorizo a execução dos serviços descritos acima e estou ciente dos valores apresentados.";
  const termoLines = doc.splitTextToSize(termo, pageWidth - 40);
  doc.text(termoLines, 17, y);
  y += termoLines.length * 5 + 15;

  // Assinatura
  doc.setLineWidth(0.3);
  doc.line(15, y, 90, y);
  y += 5;
  doc.text("Assinatura do Cliente", 15, y);

  return doc;
};

export const gerarGarantiaOS = async (
  os: OrdemServico,
  dadosLoja: DadosLoja,
  tipoGarantia?: string,
  diasGarantia?: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Garantir dados da loja com fallback para dados padrão
  const nomeFinal = dadosLoja.nome || "Autorizada Cell";
  const enderecoFinal = dadosLoja.endereco || "Sia Trecho 7 Lote Único Conjunto D Loja 229 Zona Industrial - SIA, Brasília - DF, 71208-900";
  const telefoneFinal = dadosLoja.telefone || "(61) 98286-3441";

  // Cabeçalho da Empresa
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(nomeFinal, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // OBRIGATÓRIO: Endereço da loja
  const enderecoLines = doc.splitTextToSize(enderecoFinal, pageWidth - 30);
  enderecoLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4;
  });
  y += 1;
  
  // OBRIGATÓRIO: Telefone
  doc.text(`Tel: ${telefoneFinal}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  
  if (dadosLoja.cnpj) {
    doc.text(`CNPJ: ${dadosLoja.cnpj}`, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TERMO DE GARANTIA", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Número e Data
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº OS: ${os.numero_os || os.id}`, 15, y);
  doc.text(
    `Data: ${new Date(os.criado_em).toLocaleDateString("pt-BR")}`,
    pageWidth - 15,
    y,
    { align: "right" }
  );
  y += 10;

  // Tipo de Garantia e Dias
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  
  const tipoGarantiaFinal = tipoGarantia || os.tipo_garantia || "servico";
  const diasGarantiaFinal = diasGarantia !== undefined ? diasGarantia : (os.dias_garantia || 90);
  
  doc.text(`Tipo de Garantia: ${tipoGarantiaFinal.toUpperCase()}`, 15, y);
  y += 7;
  doc.text(`Prazo de Garantia: ${diasGarantiaFinal} dias`, 15, y);
  y += 10;

  // Dados do Cliente
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DO CLIENTE", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${os.cliente_nome}`, 17, y);
  y += 6;
  if (os.cliente_telefone) {
    doc.text(`Telefone: ${os.cliente_telefone}`, 17, y);
    y += 6;
  }
  y += 4;

  // Dados do Equipamento / Aparelhos
  const temMultiplosAparelhosGarantia = (os.aparelhos?.length || 0) > 0;
  
  if (temMultiplosAparelhosGarantia && os.aparelhos) {
    // Múltiplos aparelhos - mostra cada um
    os.aparelhos.forEach((aparelho, index) => {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`APARELHO ${aparelho.sequencia} - EQUIPAMENTO`, 17, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Equipamento: ${aparelho.equipamento_tipo}`, 17, y);
      y += 6;
      if (aparelho.equipamento_marca) {
        doc.text(`Marca: ${aparelho.equipamento_marca}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_modelo) {
        doc.text(`Modelo: ${aparelho.equipamento_modelo}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_numero_serie) {
        doc.text(`Nº Série: ${aparelho.equipamento_numero_serie}`, 17, y);
        y += 6;
      }
      if (aparelho.equipamento_imei) {
        doc.text(`IMEI: ${aparelho.equipamento_imei}`, 17, y);
        y += 6;
      }
      y += 4;

      // Serviço Realizado para este aparelho
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, y, pageWidth - 30, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`SERVIÇO REALIZADO - APARELHO ${aparelho.sequencia}`, 17, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (aparelho.servico_realizado) {
        const servicoLines = doc.splitTextToSize(aparelho.servico_realizado, pageWidth - 40);
        doc.text(servicoLines, 17, y);
        y += servicoLines.length * 6 + 4;
      } else if (aparelho.laudo_diagnostico) {
        const laudoLines = doc.splitTextToSize(aparelho.laudo_diagnostico, pageWidth - 40);
        doc.text(laudoLines, 17, y);
        y += laudoLines.length * 6 + 4;
      } else {
        const defeitoLines = doc.splitTextToSize(aparelho.defeito_reclamado || "[Serviço a descrever]", pageWidth - 40);
        doc.text(defeitoLines, 17, y);
        y += defeitoLines.length * 6 + 4;
      }
    });
  } else {
    // Equipamento único (compatibilidade com OS antigas)
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DADOS DO EQUIPAMENTO", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Equipamento: ${os.equipamento_tipo}`, 17, y);
    y += 6;
    if (os.equipamento_marca) {
      doc.text(`Marca: ${os.equipamento_marca}`, 17, y);
      y += 6;
    }
    if (os.equipamento_modelo) {
      doc.text(`Modelo: ${os.equipamento_modelo}`, 17, y);
      y += 6;
    }
    if (os.equipamento_numero_serie) {
      doc.text(`Nº Série: ${os.equipamento_numero_serie}`, 17, y);
      y += 6;
    }
    y += 4;

    // Serviço Realizado
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SERVIÇO REALIZADO", 17, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (os.laudo_diagnostico) {
      const laudoLines = doc.splitTextToSize(os.laudo_diagnostico, pageWidth - 40);
      doc.text(laudoLines, 17, y);
      y += laudoLines.length * 6 + 4;
    } else {
      const defeitoLines = doc.splitTextToSize(os.defeito_reclamado, pageWidth - 40);
      doc.text(defeitoLines, 17, y);
      y += defeitoLines.length * 6 + 4;
    }
  }

  // Termos de Garantia
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Buscar texto de garantia do banco de dados
  let textoGarantia = null;
  let tituloGarantia = "TERMOS E CONDIÇÕES DA GARANTIA";
  let termos = [
    "(1) - A garantia só é válida mediante a apresentação dessa ordem de serviço/garantia.",
    "(2) - A AUTORIZADA CELL oferece uma garantia conforme combinado a cima no cabeçalho a partir da data da entrega do aparelho ao cliente.",
    "(3) - Esta garantia cobre defeitos de peças e mão de obra decorrentes dos serviços realizados e/ou peças substituídas pela AUTORIZADA CELL. Não cobrimos garantia de terceiros.",
    "(4) - Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, surtos de energia, ou instalação de software não autorizado serão excluídos da garantia.",
    "(5) - Expirado o prazo da garantia, e apresentando esta ordem/garantia, poderá ser aplicado um desconto em caso de reparo no equipamento;",
    "(6) - O aparelho não procurado em 90 (NOVENTA) dias após a data de execução da ordem de serviço não nos responsabilizamos mais pelo aparelho.",
    "(7) - Brindes não estão sujeitos à garantia, e devem ser testados e conferidos no ato da entrega.",
    "(8) - Eu cliente, declaro ter ciência do que foi descrito acima.",
  ];

  if (os.tipo_garantia) {
    try {
      const { data } = await supabase
        .from("textos_garantia")
        .select("titulo, clausulas")
        .eq("tipo_servico", os.tipo_garantia)
        .eq("ativo", true)
        .single();

      if (data) {
        textoGarantia = data;
        tituloGarantia = data.titulo.toUpperCase();
        termos = data.clausulas.map((c: any) => `(${c.numero}) - ${c.texto}`);
      }
    } catch (error) {
      console.error("Erro ao buscar texto de garantia:", error);
      // Usar termos padrão em caso de erro
    }
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(tituloGarantia, 17, y + 5);
  y += 12;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  termos.forEach((termo) => {
    const termoLines = doc.splitTextToSize(termo, pageWidth - 40);
    doc.text(termoLines, 17, y);
    y += termoLines.length * 4 + 2;
  });

  y += 5;

  // Observações Adicionais (se houver)
  if (os.observacoes_tecnicas) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageWidth - 30, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("OBSERVAÇÕES ADICIONAIS", 17, y + 5);
    y += 12;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(
      os.observacoes_tecnicas,
      pageWidth - 40
    );
    doc.text(obsLines, 17, y);
    y += obsLines.length * 5 + 10;
  }

  // Assinaturas
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y += 20;
  doc.setLineWidth(0.3);
  doc.line(15, y, 90, y);
  doc.line(pageWidth - 90, y, pageWidth - 15, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Cliente", 15, y);
  doc.text("Assinatura do Técnico", pageWidth - 90, y);

  return doc;
};

export const gerarCupomTermicoOS = async (
  os: OrdemServico,
  pecas: PecaOS[],
  dadosLoja: DadosLoja
): Promise<string> => {
  const largura = 80; // 80mm
  const linhaDiv = "=".repeat(48);
  const linhaTracejada = "-".repeat(48);

  let cupom = "";

  // Função auxiliar para centralizar texto
  const centralizar = (texto: string): string => {
    const espacos = Math.max(0, Math.floor((48 - texto.length) / 2));
    return " ".repeat(espacos) + texto;
  };

  // Cabeçalho
  cupom += centralizar(dadosLoja.nome.toUpperCase()) + "\n";
  if (dadosLoja.endereco) {
    cupom += centralizar(dadosLoja.endereco) + "\n";
  }
  if (dadosLoja.telefone) {
    cupom += centralizar(`Tel: ${dadosLoja.telefone}`) + "\n";
  }
  if (dadosLoja.cnpj) {
    cupom += centralizar(`CNPJ: ${dadosLoja.cnpj}`) + "\n";
  }

  cupom += linhaDiv + "\n";
  cupom += centralizar("ORDEM DE SERVICO") + "\n";
  cupom += linhaDiv + "\n\n";

  // Número e Data
  cupom += `OS: ${os.numero_os || os.id}\n`;
  cupom += `Data: ${new Date(os.criado_em).toLocaleDateString("pt-BR")} ${new Date(os.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n`;
  cupom += `Status: ${os.status.toUpperCase()}\n`;
  if (os.prioridade) {
    cupom += `Prioridade: ${os.prioridade.toUpperCase()}\n`;
  }
  cupom += "\n";

  // Cliente
  cupom += linhaTracejada + "\n";
  cupom += "CLIENTE\n";
  cupom += linhaTracejada + "\n";
  cupom += `Nome: ${os.cliente_nome}\n`;
  if (os.cliente_telefone) {
    cupom += `Tel: ${os.cliente_telefone}\n`;
  }
  if (os.cliente_email) {
    cupom += `Email: ${os.cliente_email}\n`;
  }
  cupom += "\n";

  // Equipamento
  cupom += linhaTracejada + "\n";
  cupom += "EQUIPAMENTO\n";
  cupom += linhaTracejada + "\n";
  cupom += `Equip.: ${os.equipamento_tipo}\n`;
  if (os.equipamento_marca) {
    cupom += `Marca: ${os.equipamento_marca}\n`;
  }
  if (os.equipamento_modelo) {
    cupom += `Modelo: ${os.equipamento_modelo}\n`;
  }
  if (os.equipamento_numero_serie) {
    cupom += `Serie: ${os.equipamento_numero_serie}\n`;
  }
  cupom += "\n";

  // Defeito
  cupom += linhaTracejada + "\n";
  cupom += "DEFEITO RECLAMADO\n";
  cupom += linhaTracejada + "\n";
  cupom += os.defeito_reclamado + "\n\n";

  // Laudo Técnico
  if (os.laudo_diagnostico) {
    cupom += linhaTracejada + "\n";
    cupom += "LAUDO TECNICO\n";
    cupom += linhaTracejada + "\n";
    cupom += os.laudo_diagnostico + "\n\n";
  }

  // Peças
  if (pecas && pecas.length > 0) {
    cupom += linhaTracejada + "\n";
    cupom += "PECAS UTILIZADAS\n";
    cupom += linhaTracejada + "\n";

    pecas.forEach((peca) => {
      cupom += `${peca.descricao_peca}\n`;
      cupom += `  Qtd: ${peca.quantidade}\n`;
    });
    cupom += "\n";
  }

  // Observações
  if (os.observacoes_tecnicas) {
    cupom += "OBSERVACOES:\n";
    cupom += os.observacoes_tecnicas + "\n\n";
  }

  // Termos de Garantia
  cupom += linhaDiv + "\n";
  
  // Buscar texto de garantia do banco de dados
  let tituloGarantia = "TERMOS DE GARANTIA";
  let termosTexto = [
    "(1) A garantia so e valida mediante\napresentacao desta OS/garantia.",
    "(2) Garantia conforme combinado no\ncabecalho a partir da entrega.",
    "(3) Cobre defeitos de pecas e mao de\nobra dos servicos realizados pela\nAUTORIZADA CELL. Nao cobrimos\ngarantia de terceiros.",
    "(4) Excluidos da garantia: mau uso,\nquedas, liquidos, umidade, oxidacao,\nsurtos, software nao autorizado.",
    "(5) Apos garantia, com esta OS,\npode ter desconto em reparos.",
    "(6) Aparelho nao procurado em 90\ndias: nao nos responsabilizamos.",
    "(7) Brindes sem garantia, conferir\nno ato da entrega.",
    "(8) Cliente declara ciencia do\ndescrito acima."
  ];

  if (os.tipo_garantia) {
    try {
      const { data } = await supabase
        .from("textos_garantia")
        .select("titulo, clausulas")
        .eq("tipo_servico", os.tipo_garantia)
        .eq("ativo", true)
        .single();

      if (data) {
        tituloGarantia = data.titulo.toUpperCase();
        // Formatar as cláusulas para cupom térmico (quebrar linhas longas)
        termosTexto = data.clausulas.map((c: any) => {
          const texto = `(${c.numero}) ${c.texto}`;
          // Quebrar linhas a cada 46 caracteres aproximadamente
          const palavras = texto.split(' ');
          let linhaAtual = '';
          const linhas = [];
          
          palavras.forEach(palavra => {
            if ((linhaAtual + palavra).length > 46) {
              linhas.push(linhaAtual.trim());
              linhaAtual = palavra + ' ';
            } else {
              linhaAtual += palavra + ' ';
            }
          });
          if (linhaAtual.trim()) {
            linhas.push(linhaAtual.trim());
          }
          
          return linhas.join('\n');
        });
      }
    } catch (error) {
      console.error("Erro ao buscar texto de garantia para cupom:", error);
      // Usar termos padrão em caso de erro
    }
  }

  cupom += centralizar(tituloGarantia) + "\n";
  cupom += linhaDiv + "\n\n";
  
  termosTexto.forEach(termo => {
    cupom += termo + "\n\n";
  });

  // Assinaturas
  cupom += "\n\n\n";
  cupom += "_______________________\n";
  cupom += "Assinatura do Cliente\n\n";
  cupom += centralizar("Obrigado pela preferencia!") + "\n";
  cupom += "\n\n\n";

  return cupom;
};

export const imprimirCupomTermico = (cupom: string) => {
  // Abre uma nova janela com o conteúdo do cupom
  const janelaImpressao = window.open("", "_blank", "width=300,height=600");

  if (!janelaImpressao) {
    alert("Bloqueador de pop-up ativado. Permita pop-ups para imprimir.");
    return;
  }

  janelaImpressao.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cupom - Ordem de Serviço</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.3;
          margin: 0;
          padding: 5mm;
          width: 80mm;
          background: white;
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 5mm;
          }
        }
      </style>
    </head>
    <body>
      <pre>${cupom}</pre>
      <script>
        window.onload = function() {
          window.print();
        };
        
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `);

  janelaImpressao.document.close();
};
