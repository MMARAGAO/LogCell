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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface UsuarioImport {
  nome: string;
  email: string;
  senha: string;
}

const usuarios: UsuarioImport[] = [
  { nome: "Ronald Ribeiro", email: "ronald.toguro77@gmail.com", senha: "123456" },
  { nome: "Bianca Miranda", email: "mbia532626@gmail.com", senha: "123456" },
  { nome: "Marcela dos Anjos", email: "Marcelasilva11082005@gmail.com", senha: "123456" },
  { nome: "Rêiner Matias de Souza", email: "reinersouza@yahoo.com", senha: "123456" },
  { nome: "Rennan Leonardo", email: "rennanoliver547@gmail.com", senha: "123456" },
  { nome: "Angel Dourado", email: "Angeldourado291@gmail.com", senha: "123456" },
];

async function importarUsuarios() {
  console.log("🚀 Iniciando importação de", usuarios.length, "usuários...\n");

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < usuarios.length; i++) {
    const user = usuarios[i];
    const prefix = `[${i + 1}/${usuarios.length}]`;

    try {
      // 1. Verifica se email já existe
      const { data: existente } = await supabaseAdmin
        .from("usuarios")
        .select("id")
        .eq("email", user.email.toLowerCase().trim())
        .single();

      if (existente) {
        console.log(`${prefix} ⏭️  ${user.nome} (${user.email}) — Email já cadastrado, pulando`);
        continue;
      }

      // 2. Cria no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.senha,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        console.log(`${prefix} ❌ ${user.nome} (${user.email}) — Erro Auth: ${authError?.message}`);
        errorCount++;
        continue;
      }

      // 3. Cria na tabela usuarios
      const { error: usuarioError } = await supabaseAdmin.from("usuarios").insert({
        id: authData.user.id,
        nome: user.nome,
        email: user.email.toLowerCase().trim(),
        ativo: false,
        is_tecnico: false,
      });

      if (usuarioError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log(`${prefix} ❌ ${user.nome} (${user.email}) — Erro ao criar perfil: ${usuarioError.message}`);
        errorCount++;
        continue;
      }

      // 4. Cria permissões padrão
      await supabaseAdmin.from("permissoes").insert({
        usuario_id: authData.user.id,
        permissoes: {
          visualizar_estoque: true,
          visualizar_lojas: true,
        },
      });

      console.log(`${prefix} ✅ ${user.nome} (${user.email}) — Cadastrado com sucesso (inativo)`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.log(`${prefix} ❌ ${user.nome} (${user.email}) — Erro: ${message}`);
      errorCount++;
    }
  }

  console.log("\n📊 Resumo:");
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   ⏭️  Total processados: ${usuarios.length}`);
  console.log("\n💡 Usuários foram criados como INATIVOS. Ative-os no sistema em Sistema > Usuários.");
}

importarUsuarios().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
