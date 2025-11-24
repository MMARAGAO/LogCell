/**
 * Sistema de Logging Configurável
 * Descomente a linha abaixo para DESABILITAR todos os logs no console
 */

// CONTROLE DE LOGS - Descomente para OCULTAR logs em desenvolvimento
// const DISABLE_LOGS = true;

const DISABLE_LOGS = false; // ← Mude para true para desabilitar logs

/**
 * Logger que pode ser desabilitado facilmente
 */
export const logger = {
  log: (...args: any[]) => {
    if (!DISABLE_LOGS) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    if (!DISABLE_LOGS) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    if (!DISABLE_LOGS) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Errors sempre aparecem, mesmo com logs desabilitados
    console.error(...args);
  },

  debug: (...args: any[]) => {
    if (!DISABLE_LOGS && process.env.NODE_ENV === "development") {
      console.log("🐛 [DEBUG]", ...args);
    }
  },
};

// Aliases para compatibilidade
export const log = logger.log;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;
export const debug = logger.debug;
