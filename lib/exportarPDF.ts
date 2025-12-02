import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProdutoEstoque {
  id: string;
  descricao: string;
  marca?: string;
  modelos?: string;
  categoria?: string;
  grupo?: string;
  codigo_fabricante?: string;
  preco_compra?: number;
  preco_venda?: number;
  quantidade_minima?: number;
  ativo: boolean;
  estoque_total?: number;
  estoques_lojas?: Array<{
    loja_nome: string;
    quantidade: number;
  }>;
  criado_em?: string;
  atualizado_em?: string;
}

function formatarValorMonetario(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function gerarRelatorioProdutoPDF(produto: ProdutoEstoque) {
  const doc = new jsPDF();
  const margemEsquerda = 14;
  let yPos = 20;

  // Cabeçalho do documento
  doc.setFillColor(68, 114, 196); // Azul
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE PRODUTO", margemEsquerda, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    margemEsquerda,
    25
  );

  yPos = 45;

  // Resetar cor do texto
  doc.setTextColor(0, 0, 0);

  // ========== INFORMAÇÕES GERAIS ==========
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES GERAIS", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const infoGeral = [
    ["Código:", produto.id],
    ["Descrição:", produto.descricao],
    ["Marca:", produto.marca || "-"],
    ["Modelos:", produto.modelos || "-"],
    ["Categoria:", produto.categoria || "-"],
    ["Grupo:", produto.grupo || "-"],
    ["Código Fabricante:", produto.codigo_fabricante || "-"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: infoGeral,
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

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ========== PREÇOS E MARGEM ==========
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PREÇOS E MARGEM", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);

  const margemLucro =
    produto.preco_compra && produto.preco_venda
      ? (
          ((produto.preco_venda - produto.preco_compra) /
            produto.preco_compra) *
          100
        ).toFixed(2)
      : "-";

  const lucroPorUnidade =
    produto.preco_compra && produto.preco_venda
      ? formatarValorMonetario(produto.preco_venda - produto.preco_compra)
      : "-";

  const precos = [
    [
      "Preço de Compra:",
      produto.preco_compra
        ? formatarValorMonetario(Number(produto.preco_compra))
        : "-",
    ],
    [
      "Preço de Venda:",
      produto.preco_venda
        ? formatarValorMonetario(Number(produto.preco_venda))
        : "-",
    ],
    ["Margem de Lucro:", margemLucro !== "-" ? `${margemLucro}%` : "-"],
    ["Lucro por Unidade:", lucroPorUnidade],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: precos,
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

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ========== ESTOQUE ==========
  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ESTOQUE", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);

  const valorEstoqueCompra =
    produto.preco_compra && produto.estoque_total
      ? formatarValorMonetario(produto.preco_compra * produto.estoque_total)
      : "-";

  const valorEstoqueVenda =
    produto.preco_venda && produto.estoque_total
      ? formatarValorMonetario(produto.preco_venda * produto.estoque_total)
      : "-";

  const estoque = [
    ["Quantidade Mínima:", (produto.quantidade_minima || 0).toString()],
    ["Estoque Total:", (produto.estoque_total || 0).toString()],
    ["Valor do Estoque (Compra):", valorEstoqueCompra],
    ["Valor do Estoque (Venda):", valorEstoqueVenda],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: estoque,
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

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ========== ESTOQUE POR LOJA ==========
  if (produto.estoques_lojas && produto.estoques_lojas.length > 0) {
    // Verificar se precisa de nova página
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(46, 117, 182);
    doc.rect(margemEsquerda, yPos, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ESTOQUE POR LOJA", margemEsquerda + 2, yPos + 5.5);
    yPos += 12;

    doc.setTextColor(0, 0, 0);

    const estoqueLojas = produto.estoques_lojas.map((estoque) => [
      estoque.loja_nome,
      estoque.quantidade.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Loja", "Quantidade"]],
      body: estoqueLojas,
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
      margin: { left: margemEsquerda },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== STATUS E DATAS ==========
  // Verificar se precisa de nova página
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(46, 117, 182);
  doc.rect(margemEsquerda, yPos, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("STATUS E DATAS", margemEsquerda + 2, yPos + 5.5);
  yPos += 12;

  doc.setTextColor(0, 0, 0);

  const statusDatas = [
    ["Status:", produto.ativo ? "✓ Ativo" : "✗ Inativo"],
    [
      "Criado em:",
      produto.criado_em
        ? new Date(produto.criado_em).toLocaleString("pt-BR")
        : "-",
    ],
    [
      "Atualizado em:",
      produto.atualizado_em
        ? new Date(produto.atualizado_em).toLocaleString("pt-BR")
        : "-",
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: statusDatas,
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
      { align: "center" }
    );
  }

  // Salvar o PDF
  const timestamp = new Date().toISOString().split("T")[0];
  const nomeArquivo = `produto_${produto.descricao.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;
  doc.save(`${nomeArquivo}.pdf`);
}
