import * as XLSX from "xlsx";

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

// Função para aplicar estilos ao cabeçalho
function aplicarEstilosCabecalho(ws: XLSX.WorkSheet, numColunas: number) {
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

// Função para aplicar estilos alternados nas linhas
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

// Função para formatar valores monetários
function formatarValorMonetario(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function exportarEstoqueParaExcel(
  produtos: ProdutoEstoque[],
  nomeArquivo: string = "estoque",
) {
  // Coletar todas as lojas únicas e ordená-las
  const lojasUnicas = Array.from(
    new Set(
      produtos.flatMap((p) => p.estoques_lojas?.map((e) => e.loja_nome) || []),
    ),
  ).sort();

  // Criar dados formatados para o Excel
  const dadosExcel = produtos.map((produto) => {
    // Criar objeto base sem estoques
    const dadosBase: any = {
      Código: produto.id.substring(0, 8),
      Descrição: produto.descricao,
      Marca: produto.marca || "-",
      Modelos: produto.modelos || "-",
      Categoria: produto.categoria || "-",
      Grupo: produto.grupo || "-",
      "Cód. Fabricante": produto.codigo_fabricante || "-",
      "Preço Compra": produto.preco_compra
        ? formatarValorMonetario(Number(produto.preco_compra))
        : "-",
      "Preço Venda": produto.preco_venda
        ? formatarValorMonetario(Number(produto.preco_venda))
        : "-",
      "Margem %":
        produto.preco_compra && produto.preco_venda
          ? `${(((produto.preco_venda - produto.preco_compra) / produto.preco_compra) * 100).toFixed(1)}%`
          : "-",
      "Estoque Mín.": produto.quantidade_minima || 0,
      "Estoque Total": produto.estoque_total || 0,
    };

    // Adicionar colunas de estoque por loja na ordem correta
    lojasUnicas.forEach((lojaNome) => {
      const estoqueLoja = produto.estoques_lojas?.find(
        (e) => e.loja_nome === lojaNome,
      );

      dadosBase[`Estoque - ${lojaNome}`] = estoqueLoja
        ? estoqueLoja.quantidade
        : 0;
    });

    // Adicionar colunas finais
    dadosBase["Status"] = produto.ativo ? "✓ Ativo" : "✗ Inativo";
    dadosBase["Criado em"] = produto.criado_em
      ? new Date(produto.criado_em).toLocaleDateString("pt-BR")
      : "-";

    return dadosBase;
  });

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Código
    { wch: 45 }, // Descrição
    { wch: 18 }, // Marca
    { wch: 28 }, // Modelos
    { wch: 18 }, // Categoria
    { wch: 18 }, // Grupo
    { wch: 18 }, // Cód. Fabricante
    { wch: 16 }, // Preço Compra
    { wch: 16 }, // Preço Venda
    { wch: 12 }, // Margem %
    { wch: 14 }, // Estoque Mín.
    { wch: 14 }, // Estoque Total
  ];

  // Adicionar colunas para estoques de lojas (agora usando o número correto)
  for (let i = 0; i < lojasUnicas.length; i++) {
    colWidths.push({ wch: 16 });
  }

  // Adicionar colunas finais
  colWidths.push({ wch: 14 }); // Status
  colWidths.push({ wch: 14 }); // Criado em

  ws["!cols"] = colWidths;

  // Aplicar estilos
  aplicarEstilosCabecalho(ws, colWidths.length);
  aplicarEstilosLinhas(ws);

  // Congelar primeira linha
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Estoque");

  // Adicionar uma segunda aba com resumo
  const resumoData = [
    { Indicador: "Total de Produtos", Valor: produtos.length },
    {
      Indicador: "Produtos Ativos",
      Valor: produtos.filter((p) => p.ativo).length,
    },
    {
      Indicador: "Produtos Inativos",
      Valor: produtos.filter((p) => !p.ativo).length,
    },
    {
      Indicador: "Total de Itens em Estoque",
      Valor: produtos.reduce((sum, p) => sum + (p.estoque_total || 0), 0),
    },
    {
      Indicador: "Valor Total de Compra",
      Valor: formatarValorMonetario(
        produtos.reduce(
          (sum, p) => sum + (p.preco_compra || 0) * (p.estoque_total || 0),
          0,
        ),
      ),
    },
    {
      Indicador: "Valor Total de Venda",
      Valor: formatarValorMonetario(
        produtos.reduce(
          (sum, p) => sum + (p.preco_venda || 0) * (p.estoque_total || 0),
          0,
        ),
      ),
    },
  ];

  const wsResumo = XLSX.utils.json_to_sheet(resumoData);

  wsResumo["!cols"] = [
    { wch: 30 }, // Indicador
    { wch: 25 }, // Valor
  ];

  aplicarEstilosCabecalho(wsResumo, 2);
  aplicarEstilosLinhas(wsResumo);

  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Gerar arquivo e fazer download
  const timestamp = new Date().toISOString().split("T")[0];

  XLSX.writeFile(wb, `${nomeArquivo}_${timestamp}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}

export function exportarRelatorioProduto(produto: ProdutoEstoque) {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // ===== ABA 1: INFORMAÇÕES DO PRODUTO =====
  const infoGeral = [
    ["INFORMAÇÕES GERAIS", ""],
    ["Código", produto.id],
    ["Descrição", produto.descricao],
    ["Marca", produto.marca || "-"],
    ["Modelos", produto.modelos || "-"],
    ["Categoria", produto.categoria || "-"],
    ["Grupo", produto.grupo || "-"],
    ["Código Fabricante", produto.codigo_fabricante || "-"],
    ["", ""],
    ["PREÇOS E MARGEM", ""],
    [
      "Preço de Compra",
      produto.preco_compra
        ? formatarValorMonetario(Number(produto.preco_compra))
        : "-",
    ],
    [
      "Preço de Venda",
      produto.preco_venda
        ? formatarValorMonetario(Number(produto.preco_venda))
        : "-",
    ],
    [
      "Margem de Lucro",
      produto.preco_compra && produto.preco_venda
        ? `${(((produto.preco_venda - produto.preco_compra) / produto.preco_compra) * 100).toFixed(2)}%`
        : "-",
    ],
    [
      "Lucro por Unidade",
      produto.preco_compra && produto.preco_venda
        ? formatarValorMonetario(produto.preco_venda - produto.preco_compra)
        : "-",
    ],
    ["", ""],
    ["ESTOQUE", ""],
    ["Quantidade Mínima", produto.quantidade_minima || 0],
    ["Estoque Total", produto.estoque_total || 0],
    [
      "Valor do Estoque (Compra)",
      produto.preco_compra && produto.estoque_total
        ? formatarValorMonetario(produto.preco_compra * produto.estoque_total)
        : "-",
    ],
    [
      "Valor do Estoque (Venda)",
      produto.preco_venda && produto.estoque_total
        ? formatarValorMonetario(produto.preco_venda * produto.estoque_total)
        : "-",
    ],
  ];

  // Adicionar estoque por loja
  if (produto.estoques_lojas && produto.estoques_lojas.length > 0) {
    infoGeral.push(["", ""]);
    infoGeral.push(["ESTOQUE POR LOJA", ""]);
    produto.estoques_lojas.forEach((estoque) => {
      infoGeral.push([estoque.loja_nome, estoque.quantidade.toString()]);
    });
  }

  // Adicionar informações de status e datas
  infoGeral.push(["", ""]);
  infoGeral.push(["STATUS E DATAS", ""]);
  infoGeral.push(["Status", produto.ativo ? "✓ Ativo" : "✗ Inativo"]);
  infoGeral.push([
    "Criado em",
    produto.criado_em
      ? new Date(produto.criado_em).toLocaleString("pt-BR")
      : "-",
  ]);
  infoGeral.push([
    "Atualizado em",
    produto.atualizado_em
      ? new Date(produto.atualizado_em).toLocaleString("pt-BR")
      : "-",
  ]);

  const ws = XLSX.utils.aoa_to_sheet(infoGeral);

  // Ajustar largura das colunas
  ws["!cols"] = [
    { wch: 35 }, // Campo
    { wch: 50 }, // Valor
  ];

  // Aplicar estilos aos títulos das seções
  const titulosSecoes = [
    0,
    9,
    15,
    infoGeral.findIndex((row) => row[0] === "ESTOQUE POR LOJA"),
    infoGeral.findIndex((row) => row[0] === "STATUS E DATAS"),
  ];

  titulosSecoes.forEach((rowIndex) => {
    if (rowIndex >= 0) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });

      if (!ws[address]) return;

      ws[address].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
          sz: 13,
        },
        fill: {
          fgColor: { rgb: "2E75B6" },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Mesclar células do título
      const mergeAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });

      if (!ws[mergeAddress]) ws[mergeAddress] = { t: "s", v: "" };
      ws[mergeAddress].s = ws[address].s;
    }
  });

  // Aplicar estilos alternados nas outras linhas
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let R = range.s.r; R <= range.e.r; ++R) {
    // Pular títulos de seções e linhas vazias
    if (titulosSecoes.includes(R) || !infoGeral[R] || !infoGeral[R][0])
      continue;

    const isEven = R % 2 === 0;

    for (let C = 0; C <= 1; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[address]) continue;

      ws[address].s = {
        fill: {
          fgColor: { rgb: isEven ? "F2F2F2" : "FFFFFF" },
        },
        alignment: {
          vertical: "center",
          horizontal: C === 0 ? "left" : "right",
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { rgb: "D0D0D0" } },
          bottom: { style: "thin", color: { rgb: "D0D0D0" } },
          left: { style: "thin", color: { rgb: "D0D0D0" } },
          right: { style: "thin", color: { rgb: "D0D0D0" } },
        },
      };

      // Deixar labels em negrito
      if (C === 0 && infoGeral[R][0]) {
        ws[address].s.font = { bold: true };
      }
    }
  }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Detalhes do Produto");

  // Gerar arquivo e fazer download
  const timestamp = new Date().toISOString().split("T")[0];
  const nomeArquivo = `produto_${produto.descricao.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}

interface HistoricoEstoqueExport {
  criado_em: string;
  produto_descricao: string;
  produto_marca?: string;
  loja_nome?: string;
  usuario_nome?: string;
  quantidade_anterior?: number;
  quantidade_nova?: number;
  quantidade_alterada?: number;
  motivo?: string;
  observacao?: string;
}

export function exportarHistoricoEstoqueParaExcel(
  registros: HistoricoEstoqueExport[],
  nomeArquivo: string = "historico_inventario",
) {
  const dadosExcel = registros.map((item) => ({
    "Data/Hora": new Date(item.criado_em).toLocaleString("pt-BR"),
    Produto: item.produto_descricao,
    Marca: item.produto_marca || "-",
    Loja: item.loja_nome || "-",
    Usuário: item.usuario_nome || "Sistema",
    "Qtd. Anterior": item.quantidade_anterior ?? "-",
    "Qtd. Nova": item.quantidade_nova ?? "-",
    Diferença: item.quantidade_alterada ?? "-",
    Motivo: item.motivo || "-",
    Observação: item.observacao || "-",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  ws["!cols"] = [
    { wch: 18 }, // Data/Hora
    { wch: 40 }, // Produto
    { wch: 16 }, // Marca
    { wch: 18 }, // Loja
    { wch: 20 }, // Usuário
    { wch: 14 }, // Qtd. Anterior
    { wch: 12 }, // Qtd. Nova
    { wch: 12 }, // Diferença
    { wch: 20 }, // Motivo
    { wch: 30 }, // Observação
  ];

  aplicarEstilosCabecalho(ws, ws["!cols"].length);
  aplicarEstilosLinhas(ws);
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Histórico");

  const timestamp = new Date().toISOString().split("T")[0];

  XLSX.writeFile(wb, `${nomeArquivo}_${timestamp}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}

interface PerdaEstoqueExport {
  produto_descricao: string;
  produto_marca?: string;
  loja_nome?: string | null;
  unidades_reducao_bruta: number;
  valor_reducao_bruta: number;
  unidades_compensadas: number;
  valor_compensado: number;
  unidades_divergencia_liquida: number;
  valor_divergencia_liquida: number;
  unidades_perda_confirmada: number;
  valor_perda_confirmada: number;
  qtd_ajustes_reducao: number;
  qtd_ajustes_aumento: number;
  classificacao_pendente: boolean;
  ultima_ocorrencia: string;
}

export function exportarPerdasEstoqueParaExcel(
  registros: PerdaEstoqueExport[],
  nomeArquivo: string = "relatorio_perdas_estoque",
) {
  const dadosExcel = registros.map((item) => ({
    Produto: item.produto_descricao,
    Marca: item.produto_marca || "-",
    Lojas: item.loja_nome || "-",
    "Unidades — Redução Bruta": item.unidades_reducao_bruta,
    "Redução Bruta (R$)": formatarValorMonetario(item.valor_reducao_bruta),
    "Unidades Compensadas": item.unidades_compensadas,
    "Valor Compensado (R$)": formatarValorMonetario(item.valor_compensado),
    "Unidades — Divergência Líquida": item.unidades_divergencia_liquida,
    "Divergência Líquida (R$)": formatarValorMonetario(
      item.valor_divergencia_liquida,
    ),
    "Unidades — Perda Confirmada": item.unidades_perda_confirmada,
    "Perda Confirmada (R$)": formatarValorMonetario(
      item.valor_perda_confirmada,
    ),
    "Ajustes de Redução": item.qtd_ajustes_reducao,
    "Ajustes de Aumento": item.qtd_ajustes_aumento,
    "Classificação Pendente": item.classificacao_pendente ? "Sim" : "Não",
    "Última Ocorrência": new Date(item.ultima_ocorrencia).toLocaleString(
      "pt-BR",
    ),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExcel);

  ws["!cols"] = [
    { wch: 45 }, // Produto
    { wch: 16 }, // Marca
    { wch: 28 }, // Lojas
    { wch: 22 }, // Unidades — Redução Bruta
    { wch: 20 }, // Redução Bruta
    { wch: 20 }, // Unidades Compensadas
    { wch: 22 }, // Valor Compensado
    { wch: 26 }, // Unidades — Divergência Líquida
    { wch: 24 }, // Divergência Líquida
    { wch: 24 }, // Unidades — Perda Confirmada
    { wch: 22 }, // Perda Confirmada
    { wch: 18 }, // Ajustes de Redução
    { wch: 18 }, // Ajustes de Aumento
    { wch: 22 }, // Classificação Pendente
    { wch: 18 }, // Última Ocorrência
  ];

  aplicarEstilosCabecalho(ws, ws["!cols"].length);
  aplicarEstilosLinhas(ws);
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Divergências de Estoque");

  const timestamp = new Date().toISOString().split("T")[0];

  XLSX.writeFile(wb, `${nomeArquivo}_${timestamp}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}
