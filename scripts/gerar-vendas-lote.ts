import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import XLSX from "xlsx";

// Load .env.local
const envContent = readFileSync(resolve(".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  )
    value = value.slice(1, -1);
  if (!process.env[key]) process.env[key] = value;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Mapeamento: nome do vendedor na planilha → usuario_id
const VENDEDOR_MAP: Record<string, string> = {
  BIANCA: "b4269e60-eea2-4eba-a34d-db9591e0ec83",
  CAMILA: "1d12d555-68e9-45f8-bfc0-a35a1d8d7920",
  GUILHERME: "25e2da5b-9e76-4388-9890-7e22efd6940d",
  "Higor Guedes": "85e3aa42-b9af-49b8-a72a-64e9c337aa53",
  "LUIZ HENRIQUE": "0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb",
  MARCELA: "a3626643-4749-4e56-83bc-b4a8ffd53659",
  RAISSA: "0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb",
  RAYSSA: "0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb",
  RENAN: "a50f1e24-aabb-41c1-b817-b4a4950bb1e4",
  RENATA: "9451cd9f-6770-4e32-aae8-c75fa675e818",
  RENNAN: "a50f1e24-aabb-41c1-b817-b4a4950bb1e4",
  RONALD: "97f12885-87ad-426a-8bbb-656889d82e10",
  RUYTER: "85743f3e-1b32-49c0-9d9e-c16afd690f7d",
  YASMIN: "e07d4d35-1381-4d4d-914d-8382a7456fdd",
  Yasmin: "e07d4d35-1381-4d4d-914d-8382a7456fdd",
};

// Mapeamento: nome da loja na planilha → loja_id
const LOJA_MAP: Record<string, number> = {
  "CELL-FEIRA": 1,
  "CELL - FEIRA": 1,
  ONLINE: 4,
  CASES: 19,
  "BLOCO B": 20,
};

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  // 1. Ler planilha
  console.log("📖 Lendo aparelhos.xlsx...");
  const wb = XLSX.readFile("aparelhos.xlsx");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(ws) as any[];

  // 2. Buscar aparelhos órfãos
  console.log("🔍 Buscando aparelhos órfãos...");
  const { data: orfaos, error } = await supabaseAdmin
    .from("aparelhos")
    .select("id, modelo, imei, loja_id, valor_venda, valor_compra, data_venda")
    .eq("status", "vendido")
    .is("venda_id", null);

  if (error) {
    console.error("Erro ao buscar aparelhos:", error);
    process.exit(1);
  }

  console.log(`📊 ${orfaos.length} aparelhos órfãos encontrados`);

  // 3. Indexar planilha por (modelo_normalizado, imei_sem_espacos)
  const planilhaIndex: Record<string, any[]> = {};
  const planilhaPorModelo: Record<string, any[]> = {};
  for (const linha of linhas) {
    const modelo = normalizar(linha.MODELO || "");
    const imei = (linha.IMEI ? String(linha.IMEI).trim() : "").replace(/\s+/g, "");

    if (modelo) {
      if (!planilhaPorModelo[modelo]) planilhaPorModelo[modelo] = [];
      planilhaPorModelo[modelo].push(linha);
    }

    if (imei) {
      const chave = `${modelo}|${imei}`;
      if (!planilhaIndex[chave]) planilhaIndex[chave] = [];
      planilhaIndex[chave].push(linha);
    }
  }

  // 4. Gerar SQL
  let sql = "";
  let encontrados = 0;
  let semMatch = 0;
  let semVendedor = 0;
  let jaUsados = new Set<string>();

  for (const ap of orfaos) {
    const modelo = normalizar(ap.modelo || "");
    const imei = (ap.imei ? String(ap.imei).trim() : "").replace(/\s+/g, "");
    const chaveExata = imei ? `${modelo}|${imei}` : "";

    let linha = null;

    // Tenta match por IMEI + modelo (se tiver IMEI)
    if (chaveExata) {
      const candidatos = planilhaIndex[chaveExata]?.filter(
        (l) => !jaUsados.has(l.IMEI ? String(l.IMEI).trim().replace(/\s+/g, "") : l.MODELO),
      );
      if (candidatos?.length) linha = candidatos[0];
    }

    // Fallback: match por modelo apenas
    if (!linha && modelo) {
      const candidatos = planilhaPorModelo[modelo]?.filter(
        (l) => !jaUsados.has(l.IMEI ? String(l.IMEI).trim().replace(/\s+/g, "") : l.MODELO + Math.random()),
      );
      if (candidatos?.length) linha = candidatos[0];
    }

    if (!linha) {
      semMatch++;
      continue;
    }

    encontrados++;
    const chaveUnica = linha.IMEI
      ? String(linha.IMEI).trim().replace(/\s+/g, "")
      : linha.MODELO + "-" + Math.random();
    jaUsados.add(chaveUnica);

    encontrados++;

    const vendedorNome = linha.VENDEDOR ? String(linha.VENDEDOR).trim() : "";
    const vendedorId = vendedorNome ? VENDEDOR_MAP[vendedorNome] : null;
    const lojaId = ap.loja_id || LOJA_MAP[String(linha.lOJA).trim()] || 1;
    const valor = ap.valor_venda || 0;

    if (!vendedorId) {
      semVendedor++;
      console.warn(`⚠️  Vendedor não mapeado: "${vendedorNome}" para ${ap.modelo}`);
    }

    sql += `WITH v AS (`;
    sql += `\n  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)`;
    sql += `\n  VALUES (${lojaId}, ${vendedorId ? `'${vendedorId}'` : "NULL"}, 'em_andamento', 'normal', ${valor}, 0, 0, ${valor}, '${ap.data_venda || new Date().toISOString()}')`;
    sql += `\n  RETURNING id`;
    sql += `\n)`;
    sql += `\nUPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '${ap.id}';`;
    sql += `\n`;
  }

  const resultado = `
-- ============================================
-- Script gerado automaticamente
-- Total aparelhos órfãos: ${orfaos.length}
-- Encontrados na planilha: ${encontrados}
-- Sem match na planilha: ${semMatch}
-- Vendedores não mapeados: ${semVendedor}
-- ============================================

BEGIN;

${sql}

COMMIT;
`;

  writeFileSync(resolve("scripts/vendas-lote.sql"), resultado, "utf-8");

  console.log(`\n✅ SQL gerado: scripts/vendas-lote.sql`);
  console.log(`   Total: ${orfaos.length}`);
  console.log(`   Encontrados: ${encontrados}`);
  console.log(`   Sem match: ${semMatch}`);
  console.log(`   Vendedores não mapeados: ${semVendedor}`);
  console.log(`   Vendedores sem ID: 0`);
}

main().catch(console.error);
