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
  casasDecimais: number = 1,
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
  data: string | Date | null | undefined,
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

/**
 * Formata um CPF no padrão brasileiro (000.000.000-00)
 * @param cpf - String com o CPF
 * @returns String formatada como CPF
 */
export function formatarCPF(cpf: string | null | undefined): string {
  if (!cpf) return "-";

  // Remove caracteres não numéricos
  const apenasNumeros = cpf.replace(/\D/g, "");

  // Aplica a máscara
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }

  return cpf;
}

/**
 * Formata um telefone no padrão brasileiro
 * @param telefone - String com o telefone
 * @returns String formatada como telefone
 */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return "-";

  // Remove caracteres não numéricos
  const apenasNumeros = telefone.replace(/\D/g, "");

  // Celular com 11 dígitos: (00) 00000-0000
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Telefone fixo com 10 dígitos: (00) 0000-0000
  if (apenasNumeros.length === 10) {
    return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

/**
 * Formata um CNPJ no padrão brasileiro (00.000.000/0000-00)
 * @param cnpj - String com o CNPJ
 * @returns String formatada como CNPJ
 */
export function formatarCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "-";

  // Remove caracteres não numéricos
  const apenasNumeros = cnpj.replace(/\D/g, "");

  // Aplica a máscara
  if (apenasNumeros.length === 14) {
    return apenasNumeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return cnpj;
}
