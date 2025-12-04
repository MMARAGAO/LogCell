import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrdemServico } from "@/types/ordemServico";

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

export const gerarPDFOrdemServico = (
  os: OrdemServico,
  pecas: PecaOS[],
  dadosLoja: DadosLoja
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Cabeçalho da Empresa
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(dadosLoja.nome, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (dadosLoja.endereco) {
    doc.text(dadosLoja.endereco, pageWidth / 2, y, { align: "center" });
    y += 5;
  }
  if (dadosLoja.telefone) {
    doc.text(`Tel: ${dadosLoja.telefone}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
  }
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
      head: [["Descrição", "Qtd", "Valor Unit.", "Total"]],
      body: pecas.map((peca) => [
        peca.descricao_peca,
        peca.quantidade.toString(),
        `R$ ${peca.valor_venda.toFixed(2)}`,
        `R$ ${(peca.quantidade * peca.valor_venda).toFixed(2)}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [100, 100, 100], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Valores
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, pageWidth - 30, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VALORES", 17, y + 5);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const valorMaoDeObra = os.valor_orcamento || 0;
  const valorPecas = pecas.reduce(
    (acc, peca) => acc + peca.quantidade * peca.valor_venda,
    0
  );
  const valorDesconto = os.valor_desconto || 0;
  const valorTotal = valorMaoDeObra + valorPecas - valorDesconto;

  doc.text(`Mão de Obra:`, 17, y);
  doc.text(`R$ ${valorMaoDeObra.toFixed(2)}`, pageWidth - 17, y, {
    align: "right",
  });
  y += 6;

  if (valorPecas > 0) {
    doc.text(`Peças:`, 17, y);
    doc.text(`R$ ${valorPecas.toFixed(2)}`, pageWidth - 17, y, {
      align: "right",
    });
    y += 6;
  }

  if (valorDesconto > 0) {
    doc.text(`Desconto:`, 17, y);
    doc.text(`- R$ ${valorDesconto.toFixed(2)}`, pageWidth - 17, y, {
      align: "right",
    });
    y += 6;
  }

  y += 2;
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL:`, 17, y);
  doc.text(`R$ ${valorTotal.toFixed(2)}`, pageWidth - 17, y, {
    align: "right",
  });
  y += 10;

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

export const gerarCupomTermicoOS = (
  os: OrdemServico,
  pecas: PecaOS[],
  dadosLoja: DadosLoja
): string => {
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
      const total = peca.quantidade * peca.valor_venda;
      cupom += `${peca.descricao_peca}\n`;
      cupom += `  ${peca.quantidade}x R$ ${peca.valor_venda.toFixed(2).padStart(10)} = R$ ${total.toFixed(2).padStart(10)}\n`;
    });
    cupom += "\n";
  }

  // Valores
  cupom += linhaDiv + "\n";
  const valorMaoDeObra = os.valor_orcamento || 0;
  const valorPecas = pecas.reduce(
    (acc, peca) => acc + peca.quantidade * peca.valor_venda,
    0
  );
  const valorDesconto = os.valor_desconto || 0;
  const valorTotal = valorMaoDeObra + valorPecas - valorDesconto;

  cupom += `Mao de Obra:${`R$ ${valorMaoDeObra.toFixed(2)}`.padStart(36)}\n`;
  if (valorPecas > 0) {
    cupom += `Pecas:${`R$ ${valorPecas.toFixed(2)}`.padStart(42)}\n`;
  }
  if (valorDesconto > 0) {
    cupom += `Desconto:${`- R$ ${valorDesconto.toFixed(2)}`.padStart(39)}\n`;
  }
  cupom += linhaDiv + "\n";
  cupom += `TOTAL:${`R$ ${valorTotal.toFixed(2)}`.padStart(42)}\n`;
  cupom += linhaDiv + "\n\n";

  // Observações
  if (os.observacoes_tecnicas) {
    cupom += "OBSERVACOES:\n";
    cupom += os.observacoes_tecnicas + "\n\n";
  }

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
