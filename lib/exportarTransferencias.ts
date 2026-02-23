import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { abrirPreviewPDF } from "@/lib/pdfPreview";

interface TransferenciaItem {
  produto_descricao?: string;
  produto_marca?: string;
  produto_codigo?: string;
  quantidade: number;
}

interface TransferenciaCompleta {
  id: string;
  loja_origem?: string;
  loja_destino?: string;
  loja_origem_nome?: string;
  loja_destino_nome?: string;
  status: "pendente" | "confirmada" | "cancelada";
  criado_em: string;
  confirmado_em?: string;
  cancelado_em?: string;
  observacao?: string;
  motivo_cancelamento?: string;
  usuario_nome?: string;
  confirmado_por_nome?: string;
  cancelado_por_nome?: string;
  itens: TransferenciaItem[];
}

function formatarValorMonetario(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// ============== EXPORTAÇÃO GERAL (EXCEL) ==============
export function exportarTransferenciasParaExcel(
  transferencias: TransferenciaCompleta[],
  nomeArquivo: string = "transferencias",
) {
  // Criar dados formatados
  const dadosExcel = transferencias.map((t) => ({
    ID: t.id.substring(0, 8),
    Origem: t.loja_origem_nome || t.loja_origem || "-",
    Destino: t.loja_destino_nome || t.loja_destino || "-",
    "Qtd. Itens": t.itens.length,
    "Qtd. Total": t.itens.reduce((sum, item) => sum + item.quantidade, 0),
    Status:
      t.status === "pendente"
        ? "⏳ Pendente"
        : t.status === "confirmada"
          ? "✓ Confirmada"
          : "✗ Cancelada",
    "Criado em": new Date(t.criado_em).toLocaleString("pt-BR"),
    "Criado por": t.usuario_nome || "-",
    "Confirmado em": t.confirmado_em
      ? new Date(t.confirmado_em).toLocaleString("pt-BR")
      : "-",
    "Confirmado por": t.confirmado_por_nome || "-",
    "Cancelado em": t.cancelado_em
      ? new Date(t.cancelado_em).toLocaleString("pt-BR")
      : "-",
    "Cancelado por": t.cancelado_por_nome || "-",
    "Motivo Cancelamento": t.motivo_cancelamento || "-",
    Observação: t.observacao || "-",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  // Larguras das colunas
  ws["!cols"] = [
    { wch: 10 }, // ID
    { wch: 20 }, // Origem
    { wch: 20 }, // Destino
    { wch: 12 }, // Qtd. Itens
    { wch: 12 }, // Qtd. Total
    { wch: 15 }, // Status
    { wch: 18 }, // Criado em
    { wch: 20 }, // Criado por
    { wch: 18 }, // Confirmado em
    { wch: 20 }, // Confirmado por
    { wch: 18 }, // Cancelado em
    { wch: 20 }, // Cancelado por
    { wch: 30 }, // Motivo Cancelamento
    { wch: 30 }, // Observação
  ];

  // Aplicar estilos
  aplicarEstilosCabecalho(ws);
  aplicarEstilosLinhas(ws);

  XLSX.utils.book_append_sheet(wb, ws, "Transferências");

  // Aba de resumo
  const resumoData = [
    { Indicador: "Total de Transferências", Valor: transferencias.length },
    {
      Indicador: "Pendentes",
      Valor: transferencias.filter((t) => t.status === "pendente").length,
    },
    {
      Indicador: "Confirmadas",
      Valor: transferencias.filter((t) => t.status === "confirmada").length,
    },
    {
      Indicador: "Canceladas",
      Valor: transferencias.filter((t) => t.status === "cancelada").length,
    },
    {
      Indicador: "Total de Itens Transferidos",
      Valor: transferencias.reduce(
        (sum, t) => sum + t.itens.reduce((s, i) => s + i.quantidade, 0),
        0,
      ),
    },
  ];

  const wsResumo = XLSX.utils.json_to_sheet(resumoData);

  wsResumo["!cols"] = [{ wch: 30 }, { wch: 25 }];

  aplicarEstilosCabecalho(wsResumo);
  aplicarEstilosLinhas(wsResumo);

  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Salvar arquivo
  const timestamp = new Date().toISOString().split("T")[0];

  XLSX.writeFile(wb, `${nomeArquivo}_${timestamp}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}

// ============== RELATÓRIO INDIVIDUAL (PDF) ==============
export function gerarRelatorioTransferenciaPDF(
  transferencia: TransferenciaCompleta,
) {
  const doc = new jsPDF();
  const margemEsquerda = 14;
  let yPos = 20;

  // Cabeçalho
  doc.setFillColor(68, 114, 196);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE TRANSFERÊNCIA", margemEsquerda, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${transferencia.id}`, margemEsquerda, 25);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    margemEsquerda,
    32,
  );

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Status com cor
  const statusConfig = {
    pendente: { text: "⏳ PENDENTE", color: [255, 193, 7] },
    confirmada: { text: "✓ CONFIRMADA", color: [76, 175, 80] },
    cancelada: { text: "✗ CANCELADA", color: [244, 67, 54] },
  };

  const status = statusConfig[transferencia.status];

  doc.setFillColor(status.color[0], status.color[1], status.color[2]);
  doc.rect(margemEsquerda, yPos, 182, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(status.text, doc.internal.pageSize.getWidth() / 2, yPos + 7, {
    align: "center",
  });
  yPos += 18;

  doc.setTextColor(0, 0, 0);

  // ========== INFORMAÇÕES DA TRANSFERÊNCIA ==========
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES DA TRANSFERÊNCIA", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);

  const infoTransferencia = [
    [
      "Loja de Origem:",
      transferencia.loja_origem_nome || transferencia.loja_origem || "-",
    ],
    [
      "Loja de Destino:",
      transferencia.loja_destino_nome || transferencia.loja_destino || "-",
    ],
    ["Criado em:", new Date(transferencia.criado_em).toLocaleString("pt-BR")],
    ["Criado por:", transferencia.usuario_nome || "-"],
  ];

  if (transferencia.confirmado_em) {
    infoTransferencia.push(
      [
        "Confirmado em:",
        new Date(transferencia.confirmado_em).toLocaleString("pt-BR"),
      ],
      ["Confirmado por:", transferencia.confirmado_por_nome || "-"],
    );
  }

  if (transferencia.cancelado_em) {
    infoTransferencia.push(
      [
        "Cancelado em:",
        new Date(transferencia.cancelado_em).toLocaleString("pt-BR"),
      ],
      ["Cancelado por:", transferencia.cancelado_por_nome || "-"],
      ["Motivo:", transferencia.motivo_cancelamento || "-"],
    );
  }

  if (transferencia.observacao) {
    infoTransferencia.push(["Observação:", transferencia.observacao]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: infoTransferencia,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 132 },
    },
    margin: { left: margemEsquerda },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ========== PRODUTOS TRANSFERIDOS ==========
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUTOS TRANSFERIDOS", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);

  const produtosData = transferencia.itens.map((item, index) => [
    (index + 1).toString(),
    item.produto_descricao || "-",
    item.produto_marca || "-",
    item.quantidade.toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Produto", "Marca", "Quantidade"]],
    body: produtosData,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 40 },
      3: { cellWidth: 37, halign: "center" },
    },
    margin: { left: margemEsquerda },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ========== RESUMO ==========
  const totalItens = transferencia.itens.length;
  const totalQuantidade = transferencia.itens.reduce(
    (sum, item) => sum + item.quantidade,
    0,
  );

  doc.setFillColor(245, 245, 245);
  doc.rect(margemEsquerda, yPos, 182, 20, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Total de Produtos Diferentes: ${totalItens}`,
    margemEsquerda + 5,
    yPos + 8,
  );
  doc.text(
    `Quantidade Total Transferida: ${totalQuantidade}`,
    margemEsquerda + 5,
    yPos + 15,
  );

  // Rodapé
  const totalPaginas = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Salvar
  const timestamp = new Date().toISOString().split("T")[0];
  const nomeArquivo = `transferencia_${transferencia.id.substring(0, 8)}_${timestamp}`;

  abrirPreviewPDF(doc, `${nomeArquivo}.pdf`);
}

// ============== RELATÓRIO DETALHADO DE TRANSFERÊNCIA ==============
export function gerarRelatorioTransferenciaDetalhado(
  transferencia: TransferenciaCompleta,
) {
  const doc = new jsPDF();
  const margemEsquerda = 14;
  let yPos = 20;

  // Cabeçalho
  doc.setFillColor(46, 117, 182);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DETALHADO", margemEsquerda, 15);
  doc.setFontSize(12);
  doc.text("Transferência de Estoque", margemEsquerda, 23);

  yPos = 40;
  doc.setTextColor(0, 0, 0);

  // Informações da transferência
  const infoTransferencia = [
    ["ID da Transferência:", `#${transferencia.id.substring(0, 8)}`],
    ["Loja de Origem:", transferencia.loja_origem_nome || "-"],
    ["Loja de Destino:", transferencia.loja_destino_nome || "-"],
    [
      "Status:",
      transferencia.status === "pendente"
        ? "⏳ Pendente"
        : transferencia.status === "confirmada"
          ? "✓ Confirmada"
          : "✗ Cancelada",
    ],
    [
      "Data de Criação:",
      new Date(transferencia.criado_em).toLocaleString("pt-BR"),
    ],
    ["Criado por:", transferencia.usuario_nome || "-"],
  ];

  if (transferencia.confirmado_em) {
    infoTransferencia.push(
      [
        "Confirmado em:",
        new Date(transferencia.confirmado_em).toLocaleString("pt-BR"),
      ],
      ["Confirmado por:", transferencia.confirmado_por_nome || "-"],
    );
  }

  if (transferencia.cancelado_em) {
    infoTransferencia.push(
      [
        "Cancelado em:",
        new Date(transferencia.cancelado_em).toLocaleString("pt-BR"),
      ],
      ["Cancelado por:", transferencia.cancelado_por_nome || "-"],
      ["Motivo:", transferencia.motivo_cancelamento || "-"],
    );
  }

  if (transferencia.observacao) {
    infoTransferencia.push(["Observação:", transferencia.observacao]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: infoTransferencia,
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 132 },
    },
    margin: { left: margemEsquerda },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Produtos detalhados
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUTOS TRANSFERIDOS (DETALHADO)", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;
  doc.setTextColor(0, 0, 0);

  const produtosData = transferencia.itens.map((item, index) => [
    (index + 1).toString(),
    item.produto_descricao || "-",
    item.produto_marca || "-",
    item.produto_codigo || "-",
    item.quantidade.toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Produto", "Marca", "Código", "Qtd"]],
    body: produtosData,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 75 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25, halign: "center" },
    },
    margin: { left: margemEsquerda },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Resumo estatístico
  const totalItens = transferencia.itens.length;
  const totalQuantidade = transferencia.itens.reduce(
    (sum, item) => sum + item.quantidade,
    0,
  );

  doc.setFillColor(240, 248, 255);
  doc.rect(margemEsquerda, yPos, 182, 25, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO ESTATÍSTICO", margemEsquerda + 5, yPos + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `• Total de Produtos Diferentes: ${totalItens}`,
    margemEsquerda + 5,
    yPos + 14,
  );
  doc.text(
    `• Quantidade Total Transferida: ${totalQuantidade} unidades`,
    margemEsquerda + 5,
    yPos + 20,
  );

  // Rodapé
  const totalPaginas = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Relatório Detalhado - Página ${i} de ${totalPaginas} - Gerado em ${new Date().toLocaleString("pt-BR")}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const nomeArquivo = `transferencia_detalhado_${transferencia.id.substring(0, 8)}_${timestamp}`;

  abrirPreviewPDF(doc, `${nomeArquivo}.pdf`);
}

// ============== RELATÓRIO RESUMIDO DE TRANSFERÊNCIA ==============
export function gerarRelatorioTransferenciaResumido(
  transferencia: TransferenciaCompleta,
) {
  const doc = new jsPDF();
  const margemEsquerda = 14;
  let yPos = 20;

  // Cabeçalho compacto
  doc.setFillColor(46, 117, 182);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO RESUMIDO", margemEsquerda, 12);
  doc.setFontSize(10);
  doc.text("Transferência de Estoque", margemEsquerda, 19);

  yPos = 35;
  doc.setTextColor(0, 0, 0);

  // Informações essenciais
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Transferência:", margemEsquerda, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `#${transferencia.id.substring(0, 8)} - ${new Date(transferencia.criado_em).toLocaleDateString("pt-BR")}`,
    margemEsquerda + 35,
    yPos,
  );

  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("De:", margemEsquerda, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(transferencia.loja_origem_nome || "-", margemEsquerda + 35, yPos);

  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Para:", margemEsquerda, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(transferencia.loja_destino_nome || "-", margemEsquerda + 35, yPos);

  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", margemEsquerda, yPos);
  doc.setFont("helvetica", "normal");
  const statusTexto =
    transferencia.status === "pendente"
      ? "Pendente"
      : transferencia.status === "confirmada"
        ? "Confirmada"
        : "Cancelada";

  doc.text(statusTexto, margemEsquerda + 35, yPos);

  yPos += 12;

  // Lista de produtos resumida
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUTOS", margemEsquerda + 2, yPos + 5);
  yPos += 10;
  doc.setTextColor(0, 0, 0);

  const produtosData = transferencia.itens.map((item, index) => [
    (index + 1).toString(),
    item.produto_descricao || "-",
    item.quantidade.toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Produto", "Qtd"]],
    body: produtosData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 145 },
      2: { cellWidth: 25, halign: "center" },
    },
    margin: { left: margemEsquerda },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Totais
  const totalItens = transferencia.itens.length;
  const totalQuantidade = transferencia.itens.reduce(
    (sum, item) => sum + item.quantidade,
    0,
  );

  doc.setFillColor(245, 245, 245);
  doc.rect(margemEsquerda, yPos, 182, 15, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total: ${totalItens} produto(s) | ${totalQuantidade} unidade(s)`,
    margemEsquerda + 5,
    yPos + 10,
  );

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Relatório Resumido - Gerado em ${new Date().toLocaleString("pt-BR")}`,
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" },
  );

  const timestamp = new Date().toISOString().split("T")[0];
  const nomeArquivo = `transferencia_resumido_${transferencia.id.substring(0, 8)}_${timestamp}`;

  abrirPreviewPDF(doc, `${nomeArquivo}.pdf`);
}

// ============== FUNÇÕES AUXILIARES ==============
function aplicarEstilosCabecalho(ws: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";

    if (!ws[address]) continue;

    ws[address].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
        sz: 12,
      },
      fill: {
        fgColor: { rgb: "4472C4" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  }
}

function aplicarEstilosLinhas(ws: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const isEven = R % 2 === 0;

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[address]) continue;

      ws[address].s = {
        fill: {
          fgColor: { rgb: isEven ? "F2F2F2" : "FFFFFF" },
        },
        alignment: {
          vertical: "center",
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { rgb: "D0D0D0" } },
          bottom: { style: "thin", color: { rgb: "D0D0D0" } },
          left: { style: "thin", color: { rgb: "D0D0D0" } },
          right: { style: "thin", color: { rgb: "D0D0D0" } },
        },
      };
    }
  }
}
