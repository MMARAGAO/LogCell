import type { DadosDashboard } from "@/types/dashboard";

import { abrirPreviewPDF } from "@/lib/pdfPreview";

interface VendedorExport {
  vendedor_nome: string;
  total_vendas: number;
  receita_total: number;
  lucro_total: number;
}

interface ClienteExport {
  cliente_nome: string;
  total_vendas: number;
  receita_total: number;
}

interface ProdutoExport {
  descricao: string;
  quantidade: number;
  receita: number;
}

export interface DashboardExportInput {
  dados: DadosDashboard | null;
  periodoLabel: string;
  lojaLabel: string;
  vendedores: VendedorExport[];
  topClientes: ClienteExport[];
  topProdutos: ProdutoExport[];
}

const num = (v: number | undefined | null) => Number(v || 0);

function formatarValorMonetario(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Mesma lógica de composição usada em ExecutiveOverview.tsx. */
function montarCategorias(dados: DadosDashboard | null) {
  return [
    {
      nome: "Produtos",
      receita: num(dados?.metricas_produtos?.pagamentos),
      lucro: num(dados?.metricas_produtos?.lucro),
    },
    {
      nome: "Acessórios",
      receita: num(dados?.metricas_acessorios?.pagamentos),
      lucro: num(dados?.metricas_acessorios?.lucro),
    },
    {
      nome: "Aparelhos",
      receita: num(dados?.metricas_aparelhos?.pagamentos),
      lucro: num(dados?.metricas_aparelhos?.lucro),
    },
    {
      nome: "Ordens de Serviço",
      receita: num(dados?.metricas_adicionais?.faturamento_os),
      lucro: num(dados?.metricas_adicionais?.ganho_os),
    },
  ];
}

/** OS segmentada por lojista / consumidor final / sem tipo. */
function montarOsPorTipo(dados: DadosDashboard | null) {
  const m = dados?.metricas_adicionais;
  const linhas = [
    {
      tipo: "Lojista",
      quantidade: num(m?.os_lojista_pagas),
      faturamento: num(m?.os_lojista_faturamento),
      lucro: num(m?.os_lojista_lucro),
    },
    {
      tipo: "Consumidor Final",
      quantidade: num(m?.os_consumidor_final_pagas),
      faturamento: num(m?.os_consumidor_final_faturamento),
      lucro: num(m?.os_consumidor_final_lucro),
    },
  ];

  if (num(m?.os_sem_tipo_pagas) > 0) {
    linhas.push({
      tipo: "Sem Classificação",
      quantidade: num(m?.os_sem_tipo_pagas),
      faturamento: num(m?.os_sem_tipo_faturamento),
      lucro: num(m?.os_sem_tipo_lucro),
    });
  }

  return linhas;
}

async function carregarPdfLibs() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf/dist/jspdf.es.min.js"),
    import("jspdf-autotable"),
  ]);

  return { jsPDF, autoTable };
}

export async function gerarPDFDashboard({
  dados,
  periodoLabel,
  lojaLabel,
  vendedores,
  topClientes,
  topProdutos,
}: DashboardExportInput) {
  const { jsPDF, autoTable } = await carregarPdfLibs();
  const doc = new jsPDF();
  const margemEsquerda = 14;
  let yPos = 20;

  const faturamento =
    num(dados?.metricas_adicionais?.pagamentos_sem_credito_cliente) +
    num(dados?.metricas_adicionais?.faturamento_os);
  const lucro =
    num(dados?.metricas_adicionais?.ganho_total_vendas) +
    num(dados?.metricas_adicionais?.ganho_os);
  const ticket = num(dados?.metricas_adicionais?.ticket_medio);
  const contasReceber = num(dados?.metricas_adicionais?.contas_nao_pagas);

  const secao = (titulo: string) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(46, 117, 182);
    doc.rect(margemEsquerda, yPos, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, margemEsquerda + 2, yPos + 5.5);
    yPos += 12;
    doc.setTextColor(0, 0, 0);
  };

  // Cabeçalho
  doc.setFillColor(68, 114, 196);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DO DASHBOARD", margemEsquerda, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Período: ${periodoLabel}`, margemEsquerda, 24);
  doc.text(`Loja: ${lojaLabel}`, margemEsquerda, 30);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 120, 30);

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // KPIs
  secao("INDICADORES PRINCIPAIS");
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Faturamento Total:", formatarValorMonetario(faturamento)],
      ["Lucro Total:", formatarValorMonetario(lucro)],
      ["Ticket Médio:", formatarValorMonetario(ticket)],
      ["Contas a Receber:", formatarValorMonetario(contasReceber)],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 122 },
    },
    margin: { left: margemEsquerda },
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Composição da operação
  secao("COMPOSIÇÃO DA OPERAÇÃO");
  autoTable(doc, {
    startY: yPos,
    head: [["Linha de Negócio", "Receita", "Lucro"]],
    body: montarCategorias(dados).map((c) => [
      c.nome,
      formatarValorMonetario(c.receita),
      formatarValorMonetario(c.lucro),
    ]),
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: "bold",
    },
    margin: { left: margemEsquerda },
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // OS por tipo de cliente
  secao("ORDENS DE SERVIÇO — LOJISTA x CONSUMIDOR FINAL");
  autoTable(doc, {
    startY: yPos,
    head: [["Tipo de Cliente", "Qtd. OS", "Faturamento", "Lucro"]],
    body: montarOsPorTipo(dados).map((l) => [
      l.tipo,
      l.quantidade.toString(),
      formatarValorMonetario(l.faturamento),
      formatarValorMonetario(l.lucro),
    ]),
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: "bold",
    },
    margin: { left: margemEsquerda },
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Ranking de vendedores
  if (vendedores.length > 0) {
    secao("RANKING DE VENDEDORES");
    autoTable(doc, {
      startY: yPos,
      head: [["Vendedor", "Vendas", "Receita", "Lucro"]],
      body: vendedores.map((v) => [
        v.vendedor_nome,
        v.total_vendas.toString(),
        formatarValorMonetario(v.receita_total),
        formatarValorMonetario(v.lucro_total),
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: margemEsquerda },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Top clientes
  if (topClientes.length > 0) {
    secao("TOP 10 CLIENTES");
    autoTable(doc, {
      startY: yPos,
      head: [["Cliente", "Vendas", "Receita"]],
      body: topClientes.map((c) => [
        c.cliente_nome,
        c.total_vendas.toString(),
        formatarValorMonetario(c.receita_total),
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: margemEsquerda },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Top produtos
  if (topProdutos.length > 0) {
    secao("TOP 10 PRODUTOS");
    autoTable(doc, {
      startY: yPos,
      head: [["Produto", "Quantidade", "Receita"]],
      body: topProdutos.map((p) => [
        p.descricao,
        p.quantidade.toString(),
        formatarValorMonetario(p.receita),
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: margemEsquerda },
    });
  }

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

  const timestamp = new Date().toISOString().split("T")[0];

  abrirPreviewPDF(doc, `dashboard_${timestamp}.pdf`);
}

export async function exportarDashboardExcel({
  dados,
  periodoLabel,
  lojaLabel,
  vendedores,
  topClientes,
  topProdutos,
}: DashboardExportInput) {
  const XLSX = await import("xlsx");

  const faturamento =
    num(dados?.metricas_adicionais?.pagamentos_sem_credito_cliente) +
    num(dados?.metricas_adicionais?.faturamento_os);
  const lucro =
    num(dados?.metricas_adicionais?.ganho_total_vendas) +
    num(dados?.metricas_adicionais?.ganho_os);
  const ticket = num(dados?.metricas_adicionais?.ticket_medio);
  const contasReceber = num(dados?.metricas_adicionais?.contas_nao_pagas);

  const wb = XLSX.utils.book_new();

  const aplicarEstilosCabecalho = (ws: any) => {
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";

      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  };

  // Aba: Resumo
  const wsResumo = XLSX.utils.json_to_sheet([
    { Indicador: "Período", Valor: periodoLabel },
    { Indicador: "Loja", Valor: lojaLabel },
    {
      Indicador: "Faturamento Total",
      Valor: formatarValorMonetario(faturamento),
    },
    { Indicador: "Lucro Total", Valor: formatarValorMonetario(lucro) },
    { Indicador: "Ticket Médio", Valor: formatarValorMonetario(ticket) },
    {
      Indicador: "Contas a Receber",
      Valor: formatarValorMonetario(contasReceber),
    },
  ]);

  wsResumo["!cols"] = [{ wch: 24 }, { wch: 30 }];
  aplicarEstilosCabecalho(wsResumo);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Aba: Composição da Operação
  const wsComposicao = XLSX.utils.json_to_sheet(
    montarCategorias(dados).map((c) => ({
      "Linha de Negócio": c.nome,
      Receita: formatarValorMonetario(c.receita),
      Lucro: formatarValorMonetario(c.lucro),
    })),
  );

  wsComposicao["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }];
  aplicarEstilosCabecalho(wsComposicao);
  XLSX.utils.book_append_sheet(wb, wsComposicao, "Composição");

  // Aba: OS por tipo de cliente
  const wsOs = XLSX.utils.json_to_sheet(
    montarOsPorTipo(dados).map((l) => ({
      "Tipo de Cliente": l.tipo,
      "Qtd. OS": l.quantidade,
      Faturamento: formatarValorMonetario(l.faturamento),
      Lucro: formatarValorMonetario(l.lucro),
    })),
  );

  wsOs["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
  aplicarEstilosCabecalho(wsOs);
  XLSX.utils.book_append_sheet(wb, wsOs, "OS por Tipo Cliente");

  // Aba: Vendedores
  if (vendedores.length > 0) {
    const wsVendedores = XLSX.utils.json_to_sheet(
      vendedores.map((v) => ({
        Vendedor: v.vendedor_nome,
        Vendas: v.total_vendas,
        Receita: formatarValorMonetario(v.receita_total),
        Lucro: formatarValorMonetario(v.lucro_total),
      })),
    );

    wsVendedores["!cols"] = [
      { wch: 28 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
    ];
    aplicarEstilosCabecalho(wsVendedores);
    XLSX.utils.book_append_sheet(wb, wsVendedores, "Vendedores");
  }

  // Aba: Top Clientes
  if (topClientes.length > 0) {
    const wsClientes = XLSX.utils.json_to_sheet(
      topClientes.map((c) => ({
        Cliente: c.cliente_nome,
        Vendas: c.total_vendas,
        Receita: formatarValorMonetario(c.receita_total),
      })),
    );

    wsClientes["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 18 }];
    aplicarEstilosCabecalho(wsClientes);
    XLSX.utils.book_append_sheet(wb, wsClientes, "Top Clientes");
  }

  // Aba: Top Produtos
  if (topProdutos.length > 0) {
    const wsProdutos = XLSX.utils.json_to_sheet(
      topProdutos.map((p) => ({
        Produto: p.descricao,
        Quantidade: p.quantidade,
        Receita: formatarValorMonetario(p.receita),
      })),
    );

    wsProdutos["!cols"] = [{ wch: 40 }, { wch: 12 }, { wch: 18 }];
    aplicarEstilosCabecalho(wsProdutos);
    XLSX.utils.book_append_sheet(wb, wsProdutos, "Top Produtos");
  }

  const timestamp = new Date().toISOString().split("T")[0];

  XLSX.writeFile(wb, `dashboard_${timestamp}.xlsx`, { cellStyles: true });
}
