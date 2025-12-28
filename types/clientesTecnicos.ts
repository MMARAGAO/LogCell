// =====================================================
// TIPOS: CLIENTES E TÉCNICOS
// =====================================================

// =====================================================
// INTERFACE: Cliente
// =====================================================
export interface Cliente {
  id: string;

  // Dados Pessoais
  nome: string;
  doc?: string | null; // CPF ou CNPJ
  data_nascimento?: string;

  // Contatos
  telefone?: string | null;
  telefone_secundario?: string;
  email?: string | null;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Informações Adicionais
  observacoes?: string;
  ativo: boolean;

  // Loja
  id_loja?: number;
  loja?: {
    id: number;
    nome: string;
  };

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

// =====================================================
// INTERFACE: Formulário de Cliente
// =====================================================
export interface ClienteFormData {
  // Dados Pessoais
  nome: string;
  doc?: string | null; // CPF ou CNPJ
  data_nascimento?: string;

  // Contatos
  telefone?: string | null;
  telefone_secundario?: string;
  email?: string | null;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Informações Adicionais
  observacoes?: string;
  ativo?: boolean;

  // Loja
  id_loja?: number;
}

// =====================================================
// INTERFACE: Técnico
// =====================================================
export interface Tecnico {
  id: string;

  // Dados Pessoais
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;

  // Contatos
  telefone: string;
  email?: string;

  // Profissionais
  especialidades?: string[];
  registro_profissional?: string;
  data_admissao?: string;
  data_demissao?: string;

  // Configurações
  cor_agenda: string;
  ativo: boolean;

  // Vinculação
  usuario_id?: string;

  // Loja
  id_loja?: number;
  loja?: {
    id: number;
    nome: string;
  };

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

// =====================================================
// INTERFACE: Formulário de Técnico
// =====================================================
export interface TecnicoFormData {
  // Dados Pessoais
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;

  // Contatos
  telefone: string;
  email?: string;

  // Profissionais
  especialidades?: string[];
  registro_profissional?: string;
  data_admissao?: string;
  data_demissao?: string;

  // Configurações
  cor_agenda?: string;
  ativo?: boolean;

  // Vinculação
  usuario_id?: string;

  // Loja
  id_loja?: number;
}

// =====================================================
// CONSTANTS: Estados do Brasil
// =====================================================
export const ESTADOS_BRASIL = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

// =====================================================
// CONSTANTS: Especialidades de Técnicos
// =====================================================
export const ESPECIALIDADES_TECNICO = [
  "Smartphones",
  "Tablets",
  "Notebooks",
  "Desktops",
  "Consoles",
  "Smartwatches",
  "Acessórios",
  "Solda",
  "Recuperação de Dados",
  "Software",
  "Redes",
];

// =====================================================
// UTILS: Formatação
// =====================================================
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  } else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return telefone;
}

export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length === 11) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  return cpf;
}

export function formatarCEP(cep: string): string {
  const numeros = cep.replace(/\D/g, "");

  if (numeros.length === 8) {
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  return cep;
}
