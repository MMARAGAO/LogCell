import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(path: string) {
  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(__dirname, "..", ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Variáveis de ambiente não encontradas. Verifique o .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const EMAILS_PARA_CLONAR = [
  "mbia532626@gmail.com",        // Bianca Miranda
  "Marcelasilva11082005@gmail.com", // Marcela dos anjos
  "reinersouza@yahoo.com",       // Reiner Matias
  "rennanoliver547@gmail.com",   // Rennan Leonardo
  "Angeldourado291@gmail.com",  // Angel Dourado
];

async function main() {
  console.log("🚀 Iniciando clonagem de permissões...");

  // 1. Buscar ID do Ronald
  const { data: ronald, error: errRonald } = await supabase
    .from("usuarios")
    .select("id, nome, email")
    .eq("email", "ronald.toguro77@gmail.com")
    .single();

  if (errRonald || !ronald) {
    console.error("❌ Ronald não encontrado:", errRonald);
    process.exit(1);
  }

  console.log(`✅ Ronald encontrado: ${ronald.nome} (${ronald.id})`);

  // 2. Buscar permissões do Ronald
  const { data: permissoesRonald, error: errPerms } = await supabase
    .from("permissoes")
    .select("*")
    .eq("usuario_id", ronald.id)
    .single();

  if (errPerms) {
    if (errPerms.code === "PGRST116") {
      console.error("❌ Ronald não tem permissões customizadas. Abra o modal de permissões dele primeiro.");
    } else {
      console.error("❌ Erro ao buscar permissões do Ronald:", errPerms);
    }
    process.exit(1);
  }

  console.log(`✅ Permissões do Ronald carregadas (${Object.keys(permissoesRonald.permissoes).length} módulos)`);

  // 3. Para cada email alvo, buscar ID e clonar permissões
  for (const email of EMAILS_PARA_CLONAR) {
    const { data: usuario, error: errUsuario } = await supabase
      .from("usuarios")
      .select("id, nome, email")
      .ilike("email", email)
      .maybeSingle();

    if (errUsuario || !usuario) {
      console.warn(`⚠️ Usuário não encontrado: ${email}`);
      continue;
    }

    console.log(`📝 Clonando permissões para ${usuario.nome} (${usuario.email})...`);

    const { error: errSalvar } = await supabase
      .from("permissoes")
      .upsert({
        usuario_id: usuario.id,
        permissoes: permissoesRonald.permissoes,
        loja_id: permissoesRonald.loja_id,
        todas_lojas: permissoesRonald.todas_lojas,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: "usuario_id" });

    if (errSalvar) {
      console.error(`❌ Erro ao salvar permissões para ${usuario.nome}:`, errSalvar);
    } else {
      console.log(`✅ Permissões clonadas para ${usuario.nome}`);
    }
  }

  console.log("🎉 Clonagem finalizada!");
}

main().catch(console.error);
