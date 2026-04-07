import fs from "fs";
import path from "path";

import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

function carregarEnv(caminhoEnv) {
  return Object.fromEntries(
    fs
      .readFileSync(caminhoEnv, "utf8")
      .split(/\n/)
      .map((linha) => linha.trim())
      .filter((linha) => linha && !linha.startsWith("#"))
      .map((linha) => {
        const separador = linha.indexOf("=");
        return [linha.slice(0, separador), linha.slice(separador + 1)];
      }),
  );
}

function formatarData(valor) {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function limparNomeArquivo(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function escreverCsv(caminhoArquivo, dados) {
  const colunas = Array.from(
    new Set(dados.flatMap((linha) => Object.keys(linha || {}))),
  );
  const escapar = (valor) => {
    if (valor == null) return "";
    const texto = String(valor);
    if (/[",\n]/.test(texto)) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  };
  const linhas = [
    colunas.map(escapar).join(","),
    ...dados.map((linha) =>
      colunas.map((coluna) => escapar(linha?.[coluna])).join(","),
    ),
  ];
  const csv = linhas.join("\n");
  fs.writeFileSync(caminhoArquivo, csv, "utf8");
}

async function listarVendasPorVendedor(supabase, vendedorId) {
  const pageSize = 200;
  const vendas = [];
  let pagina = 0;

  while (true) {
    const { data, error } = await supabase
      .from("vendas")
      .select(
        `
        id,
        numero_venda,
        cliente_id,
        loja_id,
        vendedor_id,
        status,
        tipo,
        data_prevista_pagamento,
        valor_total,
        valor_pago,
        valor_desconto,
        saldo_devedor,
        criado_em,
        finalizado_em,
        finalizado_por,
        cliente:clientes(id, nome, doc, telefone),
        loja:lojas(id, nome),
        vendedor:usuarios!vendas_vendedor_id_fkey(id, nome),
        itens:itens_venda(
          id,
          produto_id,
          produto_nome,
          produto_codigo,
          quantidade,
          preco_unitario,
          subtotal,
          devolvido,
          desconto_tipo,
          desconto_valor,
          valor_desconto,
          criado_em
        ),
        pagamentos:pagamentos_venda(
          id,
          valor,
          tipo_pagamento,
          data_pagamento,
          criado_em,
          criado_por_usuario:usuarios!pagamentos_venda_criado_por_fkey(nome)
        ),
        devolucoes:devolucoes_venda(
          id,
          tipo,
          valor_total,
          forma_pagamento,
          motivo,
          criado_em
        )
      `,
      )
      .eq("vendedor_id", vendedorId)
      .order("criado_em", { ascending: false })
      .range(pagina * pageSize, (pagina + 1) * pageSize - 1);

    if (error) {
      throw error;
    }

    const lote = data || [];
    vendas.push(...lote);

    if (lote.length < pageSize) {
      break;
    }

    pagina += 1;
  }

  return vendas;
}

async function main() {
  const nomeBusca = process.argv.slice(2).join(" ").trim() || "Ruyter";
  const raizProjeto = process.cwd();
  const env = carregarEnv(path.join(raizProjeto, ".env.local"));
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const { data: usuarios, error: erroUsuarios } = await supabase
    .from("usuarios")
    .select("id, nome, email, telefone, ativo")
    .ilike("nome", `%${nomeBusca}%`)
    .order("nome");

  if (erroUsuarios) {
    throw erroUsuarios;
  }

  if (!usuarios || usuarios.length === 0) {
    throw new Error(`Nenhum usuario encontrado para "${nomeBusca}".`);
  }

  if (usuarios.length > 1) {
    throw new Error(
      `Mais de um usuario encontrado para "${nomeBusca}": ${usuarios
        .map((usuario) => usuario.nome)
        .join(", ")}`,
    );
  }

  const vendedor = usuarios[0];
  const vendas = await listarVendasPorVendedor(supabase, vendedor.id);

  const totalItens = vendas.reduce(
    (acumulado, venda) =>
      acumulado +
      (venda.itens || []).reduce(
        (subtotal, item) =>
          subtotal + Math.max(0, Number(item.quantidade || 0) - Number(item.devolvido || 0)),
        0,
      ),
    0,
  );

  const totalPagamentos = vendas.reduce(
    (acumulado, venda) =>
      acumulado +
      (venda.pagamentos || []).reduce(
        (subtotal, pagamento) => subtotal + Number(pagamento.valor || 0),
        0,
      ),
    0,
  );

  const totalDevolucoes = vendas.reduce(
    (acumulado, venda) =>
      acumulado +
      (venda.devolucoes || []).reduce(
        (subtotal, devolucao) => subtotal + Number(devolucao.valor_total || 0),
        0,
      ),
    0,
  );

  const abaResumo = [
    { Indicador: "Vendedor", Valor: vendedor.nome.trim() },
    { Indicador: "Email", Valor: vendedor.email || "-" },
    { Indicador: "Telefone", Valor: vendedor.telefone || "-" },
    { Indicador: "Ativo", Valor: vendedor.ativo ? "Sim" : "Nao" },
    { Indicador: "Total de vendas", Valor: vendas.length },
    {
      Indicador: "Vendas concluidas",
      Valor: vendas.filter((venda) => venda.status === "concluida").length,
    },
    {
      Indicador: "Vendas canceladas",
      Valor: vendas.filter((venda) => venda.status === "cancelada").length,
    },
    {
      Indicador: "Vendas devolvidas",
      Valor: vendas.filter((venda) => venda.status === "devolvida").length,
    },
    { Indicador: "Valor total vendido", Valor: formatarMoeda(vendas.reduce((soma, venda) => soma + Number(venda.valor_total || 0), 0)) },
    { Indicador: "Valor total pago", Valor: formatarMoeda(vendas.reduce((soma, venda) => soma + Number(venda.valor_pago || 0), 0)) },
    { Indicador: "Saldo devedor total", Valor: formatarMoeda(vendas.reduce((soma, venda) => soma + Number(venda.saldo_devedor || 0), 0)) },
    { Indicador: "Pagamentos registrados", Valor: formatarMoeda(totalPagamentos) },
    { Indicador: "Valor devolvido", Valor: formatarMoeda(totalDevolucoes) },
    { Indicador: "Itens liquidos vendidos", Valor: totalItens },
    { Indicador: "Gerado em", Valor: formatarData(new Date().toISOString()) },
  ];

  const abaVendas = vendas.map((venda) => ({
    "Numero Venda": `V${String(venda.numero_venda || 0).padStart(6, "0")}`,
    Status: venda.status || "-",
    Tipo: venda.tipo || "-",
    "Data Criacao": formatarData(venda.criado_em),
    "Data Finalizacao": formatarData(venda.finalizado_em),
    Cliente: venda.cliente?.nome || "-",
    Documento: venda.cliente?.doc || "-",
    Telefone: venda.cliente?.telefone || "-",
    Loja: venda.loja?.nome || "-",
    "Vendedor da Venda": venda.vendedor?.nome || vendedor.nome.trim(),
    "Qtd Itens": (venda.itens || []).length,
    "Qtd Itens Liquidos": (venda.itens || []).reduce(
      (subtotal, item) =>
        subtotal + Math.max(0, Number(item.quantidade || 0) - Number(item.devolvido || 0)),
      0,
    ),
    "Qtd Pagamentos": (venda.pagamentos || []).length,
    "Qtd Devolucoes": (venda.devolucoes || []).length,
    "Valor Total": Number(venda.valor_total || 0),
    "Valor Pago": Number(venda.valor_pago || 0),
    Desconto: Number(venda.valor_desconto || 0),
    "Saldo Devedor": Number(venda.saldo_devedor || 0),
  }));

  const abaItens = vendas.flatMap((venda) =>
    (venda.itens || []).map((item) => ({
      "Numero Venda": `V${String(venda.numero_venda || 0).padStart(6, "0")}`,
      "Data Venda": formatarData(venda.criado_em),
      Cliente: venda.cliente?.nome || "-",
      Loja: venda.loja?.nome || "-",
      Produto: item.produto_nome || item.produto_id || "-",
      "Cod Produto": item.produto_codigo || "-",
      Quantidade: Number(item.quantidade || 0),
      Devolvido: Number(item.devolvido || 0),
      "Qtd Liquida": Math.max(
        0,
        Number(item.quantidade || 0) - Number(item.devolvido || 0),
      ),
      "Preco Unitario": Number(item.preco_unitario || 0),
      Subtotal: Number(item.subtotal || 0),
      "Desconto Tipo": item.desconto_tipo || "",
      "Desconto Valor": Number(item.desconto_valor || 0),
      "Valor Desconto": Number(item.valor_desconto || 0),
      "Criado Em": formatarData(item.criado_em),
    })),
  );

  const abaPagamentos = vendas.flatMap((venda) =>
    (venda.pagamentos || []).map((pagamento) => ({
      "Numero Venda": `V${String(venda.numero_venda || 0).padStart(6, "0")}`,
      "Data Venda": formatarData(venda.criado_em),
      Cliente: venda.cliente?.nome || "-",
      Loja: venda.loja?.nome || "-",
      "Vendedor da Venda": venda.vendedor?.nome || vendedor.nome.trim(),
      "Tipo Pagamento": pagamento.tipo_pagamento || "-",
      Valor: Number(pagamento.valor || 0),
      "Data Pagamento": formatarData(pagamento.data_pagamento),
      "Criado Em": formatarData(pagamento.criado_em),
      "Usuario que Registrou o Pagamento":
        pagamento.criado_por_usuario?.nome || "-",
    })),
  );

  const abaDevolucoes = vendas.flatMap((venda) =>
    (venda.devolucoes || []).map((devolucao) => ({
      "Numero Venda": `V${String(venda.numero_venda || 0).padStart(6, "0")}`,
      "Data Venda": formatarData(venda.criado_em),
      Cliente: venda.cliente?.nome || "-",
      Loja: venda.loja?.nome || "-",
      Tipo: devolucao.tipo || "-",
      Valor: Number(devolucao.valor_total || 0),
      "Forma Pagamento": devolucao.forma_pagamento || "-",
      Motivo: devolucao.motivo || "",
      "Criado Em": formatarData(devolucao.criado_em),
    })),
  );

  const workbook = XLSX.utils.book_new();
  const planilhas = [
    ["Resumo", abaResumo],
    ["Vendas", abaVendas],
    ["Itens", abaItens],
    ["Pagamentos", abaPagamentos],
    ["Devolucoes", abaDevolucoes],
  ];

  for (const [nome, dados] of planilhas) {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(workbook, worksheet, nome);
  }

  const pastaExports = path.join(raizProjeto, "exports");
  fs.mkdirSync(pastaExports, { recursive: true });

  const dataArquivo = new Date().toISOString().slice(0, 10);
  const baseArquivo = `vendas_${limparNomeArquivo(vendedor.nome)}_${dataArquivo}`;
  const nomeArquivo = `${baseArquivo}.xlsx`;
  const caminhoArquivo = path.join(pastaExports, nomeArquivo);

  XLSX.writeFile(workbook, caminhoArquivo);

  const arquivosCsv = [];

  for (const [nome, dados] of planilhas) {
    const nomeCsv = `${baseArquivo}_${String(nome).toLowerCase()}.csv`;
    const caminhoCsv = path.join(pastaExports, nomeCsv);
    escreverCsv(caminhoCsv, dados);
    arquivosCsv.push(caminhoCsv);
  }

  console.log(
    JSON.stringify(
      {
        vendedor: vendedor.nome.trim(),
        vendas: vendas.length,
        arquivo: caminhoArquivo,
        csvs: arquivosCsv,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
