# 🎛️ Sistema de Controle de Logs

## Como usar

### ✅ Para OCULTAR todos os logs em desenvolvimento:

Abra o arquivo `lib/logger.ts` e mude:

```typescript
const DISABLE_LOGS = false; // ← Logs VISÍVEIS
```

Para:

```typescript
const DISABLE_LOGS = true; // ← Logs OCULTOS
```

### ✅ Para MOSTRAR logs novamente:

Volte para `false`:

```typescript
const DISABLE_LOGS = false;
```

---

## 🔄 Migração de código existente

Para que seus logs respeitem essa configuração, substitua:

### ❌ Antes:

```typescript
console.log("Mensagem");
console.info("Info");
console.warn("Aviso");
console.error("Erro");
```

### ✅ Depois:

```typescript
import { logger } from "@/lib/logger";

logger.log("Mensagem"); // Oculta se DISABLE_LOGS = true
logger.info("Info"); // Oculta se DISABLE_LOGS = true
logger.warn("Aviso"); // Oculta se DISABLE_LOGS = true
logger.error("Erro"); // SEMPRE aparece (importante!)
logger.debug("Debug"); // Só em desenvolvimento
```

---

## 📦 Arquivos já convertidos:

- ✅ `components/NotificacoesDebug.tsx`

---

## 💡 Dica:

Para converter rapidamente outros arquivos, use Find & Replace no VS Code:

**Buscar:** `console\.log\(`  
**Substituir:** `logger.log(`

Depois adicione o import no topo:

```typescript
import { logger } from "@/lib/logger";
```
