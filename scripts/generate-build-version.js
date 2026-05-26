import { writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const version = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const content = JSON.stringify({
  version,
  updatedAt: new Date().toISOString(),
});

const publicDir = join(__dirname, "..", "public");
writeFileSync(join(publicDir, "build-version.json"), content, "utf-8");

console.log("✅ build-version.json generated:", content);
