import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import XLSX from "xlsx";

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

function excelDateToJS(serial: any): string | null {
  if (!serial || typeof serial !== "number") return null;
  const date = new Date((serial - 25569) * 86400 * 1000);
  return date.toISOString().split("T")[0];
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const wb = XLSX.readFile("aparelhos.xlsx");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const planilha = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];

  // Build lookup from planilha: normalize IMEI/Serial and clean
  const porCodigo = new Map<string, any>();
  planilha.forEach((r: any) => {
    const raw = String(r.IMEI || "").trim();
    if (!raw) return;
    const clean = raw.replace(/\s+/g, "");
    porCodigo.set(clean, { ...r, dataPlanilha: excelDateToJS(r.DATA), rawImei: raw });
  });

  console.log("Total na planilha com código:", porCodigo.size);

  // Fetch ALL aparelhos from DB (status=vendido) to build lookup
  let dbPorImei = new Map<string, any>();
  let dbPorSerial = new Map<string, any>();

  const batchSize = 200;
  for (let page = 0; ; page++) {
    const from = page * batchSize;
    const to = from + batchSize - 1;
    const { data } = await supabase
      .from("aparelhos")
      .select("id, imei, numero_serie, modelo, data_venda, venda_id, status, valor_venda")
      .eq("status", "vendido")
      .range(from, to);
    if (!data || data.length === 0) break;
    for (const a of data) {
      if (a.imei) dbPorImei.set(a.imei, a);
      if (a.numero_serie) dbPorSerial.set(a.numero_serie, a);
    }
    if (data.length < batchSize) break;
  }

  console.log("DB vendidos com IMEI:", dbPorImei.size);
  console.log("DB vendidos com numero_serie:", dbPorSerial.size);

  let match = 0, bySerial = 0, mismatch = 0, noDB = 0;
  const inconsistencias: any[] = [];
  const naoEncontrados: any[] = [];

  Array.from(porCodigo.entries()).forEach(([codigo, p]) => {
    let db = dbPorImei.get(codigo);

    if (!db) {
      db = dbPorSerial.get(codigo);
    }

    if (!db) {
      const ehNumerico = /^\d+$/.test(codigo);
      noDB++;
      naoEncontrados.push({
        codigo,
        modelo: p.MODELO,
        valor: p["VALOR DE VENDA"],
        tipo: ehNumerico ? "IMEI não encontrado" : "Serial não encontrado",
      });
      return;
    }

    if (dbPorImei.has(codigo)) {
      match++;
    } else {
      bySerial++;
    }

    const dbDate = db.data_venda ? db.data_venda.split("T")[0] : null;
    const planilhaDate = p.dataPlanilha;

    if (dbDate && planilhaDate && dbDate !== planilhaDate) {
      mismatch++;
      inconsistencias.push({
        codigo,
        modelo: p.MODELO,
        planilhaDate,
        dbDate,
        dbStatus: db.status,
      });
    }
  });

  console.log("\n=== RESULTADO ===");
  console.log("Total:", porCodigo.size);
  console.log("Match por IMEI:", match);
  console.log("Match por numero_serie:", bySerial);
  console.log("Total encontrados:", match + bySerial);
  console.log("Inconsistências de data:", mismatch);
  console.log("Não encontrados no DB:", naoEncontrados.length);

  if (inconsistencias.length > 0) {
    console.log("\n=== INCONSISTÊNCIAS DE DATA ===");
    inconsistencias.forEach((d) =>
      console.log(`${d.codigo} | ${d.modelo} | Planilha: ${d.planilhaDate} | DB: ${d.dbDate}`),
    );
  }

  if (naoEncontrados.length > 0) {
    console.log("\n=== NÃO ENCONTRADOS NO DB ===");
    naoEncontrados.sort((a, b) => a.modelo.localeCompare(b.modelo));
    naoEncontrados.forEach((d) =>
      console.log(`${d.codigo} | ${d.modelo} | ${d.valor} | ${d.tipo}`),
    );
  }
}

main().catch(console.error);
