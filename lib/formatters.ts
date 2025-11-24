/**
 * Utilitários de formatação
 */

/**
 * Formata um número como moeda brasileira (R$ 1.000,00)
 * @param valor - Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formata um número com separadores de milhares (1.000)
 * @param valor - Valor numérico a ser formatado
 * @returns String formatada com separadores
 */
export function formatarNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR").format(valor);
}

/**
 * Formata uma porcentagem (10,5%)
 * @param valor - Valor numérico a ser formatado
 * @param casasDecimais - Número de casas decimais (padrão: 1)
 * @returns String formatada como porcentagem
 */
export function formatarPorcentagem(
  valor: number | null | undefined,
  casasDecimais: number = 1
): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "0%";
  }

  return `${valor.toFixed(casasDecimais).replace(".", ",")}%`;
}

/**
 * Formata uma data no padrão brasileiro (dd/mm/yyyy)
 * @param data - String ou objeto Date
 * @returns String formatada como data brasileira
 */
export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return "-";

  const dataObj = typeof data === "string" ? new Date(data) : data;

  if (isNaN(dataObj.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(dataObj);
}

/**
 * Formata uma data com hora no padrão brasileiro (dd/mm/yyyy HH:mm)
 * @param data - String ou objeto Date
 * @returns String formatada como data e hora brasileira
 */
export function formatarDataHora(
  data: string | Date | null | undefined
): string {
  if (!data) return "-";

  const dataObj = typeof data === "string" ? new Date(data) : data;

  if (isNaN(dataObj.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataObj);
}
