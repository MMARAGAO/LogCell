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

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const wb = XLSX.readFile("aparelhos.xlsx");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const planilha = XLSX.utils.sheet_to_json(ws) as any[];

  const { data: orfaos } = await supabase
    .from("aparelhos")
    .select("id, modelo, imei, loja_id, valor_venda")
    .eq("status", "vendido")
    .is("venda_id", null);

  console.log("=== 10 APARELHOS DO BANCO ===");
  orfaos!.slice(0, 10).forEach((o: any) => {
    console.log(`[DB] ${o.modelo} | IMEI: ${o.imei || "(vazio)"} | Loja: ${o.loja_id} | R$ ${o.valor_venda}`);
  });

  console.log("\n=== 10 PRIMEIROS DA PLANILHA ===");
  planilha.slice(0, 10).forEach((r: any) => {
    console.log(`[XLS] ${r.MODELO} | IMEI: ${r.IMEI || "(vazio)"} | Loja: ${r.lOJA} | R$ ${r["VALOR DE VENDA"]}`);
  });

  // Check some specific mismatches
  console.log("\n=== BUSCANDO 'BOOMBOX 4 PRETA SEMINOVO' NA PLANILHA ===");
  const busca = planilha.filter((r: any) => String(r.MODELO).toLowerCase().includes("boombox"));
  busca.forEach((r: any) => console.log(`[XLS] ${r.MODELO} | IMEI: ${r.IMEI || "(vazio)"}`));
}

main().catch(console.error);
