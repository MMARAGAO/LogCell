const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://qyzjvkthuuclsyjeweek.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjU3NTcsImV4cCI6MjA0ODc0MTc1N30.VqJtoqLjAVQQAB3vdczYWaVHNOPqR8xxP2xQVD8RL58";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendas() {
  console.log("Consultando últimas vendas do banco...\n");

  const { data: vendas, error } = await supabase
    .from("vendas")
    .select(
      `
      id,
      numero_venda,
      status,
      tipo,
      valor_total,
      valor_pago,
      saldo_devedor,
      criado_em,
      cliente:clientes(nome),
      loja:lojas(nome),
      usuario:usuarios(nome)
    `
    )
    .order("criado_em", { ascending: false })
    .limit(15);

  if (error) {
    console.error("Erro ao buscar vendas:", error);
    return;
  }

  console.log(`Total de vendas encontradas: ${vendas.length}\n`);
  console.log("=".repeat(80));

  vendas.forEach((venda, index) => {
    const dataVenda = new Date(venda.criado_em);
    const dataLocal = dataVenda.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Extração da data local para comparação
    const ano = dataVenda.getFullYear();
    const mes = String(dataVenda.getMonth() + 1).padStart(2, "0");
    const dia = String(dataVenda.getDate()).padStart(2, "0");
    const dataComparacao = `${ano}-${mes}-${dia}`;

    // Data UTC para comparação
    const dataUTC = dataVenda.toISOString().split("T")[0];

    console.log(`\n${index + 1}. ${venda.cliente?.nome || "Sem cliente"}`);
    console.log(`   Número: ${venda.numero_venda}`);
    console.log(`   Status: ${venda.status}`);
    console.log(`   Loja: ${venda.loja?.nome || "Sem loja"}`);
    console.log(`   Vendedor: ${venda.usuario?.nome || "Sem vendedor"}`);
    console.log(`   Tipo: ${venda.tipo || "avista"}`);
    console.log(`   Data (Local): ${dataLocal}`);
    console.log(`   Data (Timestamp): ${venda.criado_em}`);
    console.log(`   Data (Comparação Local): ${dataComparacao}`);
    console.log(`   Data (UTC): ${dataUTC}`);
    console.log(`   Total: R$ ${venda.valor_total.toFixed(2)}`);
    console.log(`   Pago: R$ ${venda.valor_pago.toFixed(2)}`);
    console.log(`   Saldo: R$ ${venda.saldo_devedor.toFixed(2)}`);
    console.log("-".repeat(80));
  });

  // Análise específica das vendas mencionadas
  console.log("\n\n" + "=".repeat(80));
  console.log("ANÁLISE DAS VENDAS ESPECÍFICAS MENCIONADAS:");
  console.log("=".repeat(80));

  const vendasEspecificas = [
    "V000399",
    "V000398",
    "V000397",
    "V000396",
    "V000395",
    "V000394",
    "V000393",
    "V000392",
    "V000391",
    "V000390",
    "V000389",
    "V000388",
  ];

  for (const numeroVenda of vendasEspecificas) {
    const venda = vendas.find((v) => v.numero_venda === numeroVenda);
    if (venda) {
      const dataVenda = new Date(venda.criado_em);
      const ano = dataVenda.getFullYear();
      const mes = String(dataVenda.getMonth() + 1).padStart(2, "0");
      const dia = String(dataVenda.getDate()).padStart(2, "0");
      const dataLocal = `${ano}-${mes}-${dia}`;
      const dataUTC = dataVenda.toISOString().split("T")[0];

      console.log(`\n${numeroVenda}:`);
      console.log(`  Cliente: ${venda.cliente?.nome}`);
      console.log(`  Data Local: ${dataLocal} (${dia}/${mes}/${ano})`);
      console.log(`  Data UTC: ${dataUTC}`);
      console.log(
        `  Hora completa: ${dataVenda.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
      );
      console.log(
        `  Filtro 10/12/2025 passaria? ${dataLocal === "2025-12-10" ? "SIM" : "NÃO"}`
      );
    } else {
      console.log(`\n${numeroVenda}: NÃO ENCONTRADA`);
    }
  }
}

checkVendas().catch(console.error);
