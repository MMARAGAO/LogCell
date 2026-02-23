import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "produto" | "cliente" | "os" | "venda" | "tecnico";
  href: string;
}

// Funções de formatação
const formatTelefone = (telefone: string) => {
  if (!telefone) return "";
  const numbers = telefone.replace(/\D/g, "");

  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return telefone;
};

const formatCPF = (cpf: string) => {
  if (!cpf) return "";
  const numbers = cpf.replace(/\D/g, "");

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }

  return cpf;
};

const formatMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

export async function GET(request: NextRequest) {
  try {
    console.log("API /api/busca chamada");
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    console.log("Query recebida:", query);

    if (!query || query.trim().length === 0) {
      console.log("Query vazia, retornando array vazio");

      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();

    console.log("Cliente Supabase criado");

    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Usuário:", user?.email, "Erro auth:", authError);

    if (authError || !user) {
      console.error("Usuário não autenticado");

      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar em paralelo em diferentes tabelas
    const searchTerm = `%${query}%`;

    const [produtos, clientes, ordensServico, vendas, tecnicos] =
      await Promise.all([
        // Buscar produtos
        supabase
          .from("produtos")
          .select(
            `
            id,
            descricao,
            marca,
            modelos,
            preco_venda,
            estoque_lojas!inner(quantidade, id_loja, lojas(nome))
          `,
          )
          .or(
            `descricao.ilike.${searchTerm},marca.ilike.${searchTerm},modelos.ilike.${searchTerm}`,
          )
          .eq("ativo", true)
          .limit(5),

        // Buscar clientes
        supabase
          .from("clientes")
          .select("id, nome, email, telefone, cpf")
          .or(
            `nome.ilike.${searchTerm},email.ilike.${searchTerm},telefone.ilike.${searchTerm},cpf.ilike.${searchTerm}`,
          )
          .eq("ativo", true)
          .limit(5),

        // Buscar ordens de serviço
        supabase
          .from("ordem_servico")
          .select(
            `
            id,
            numero_os,
            cliente_nome,
            status,
            equipamento_tipo,
            equipamento_marca,
            equipamento_modelo,
            criado_em,
            lojas(nome)
          `,
          )
          .or(
            `numero_os.eq.${parseInt(query) || 0},cliente_nome.ilike.${searchTerm},equipamento_marca.ilike.${searchTerm},equipamento_modelo.ilike.${searchTerm}`,
          )
          .order("criado_em", { ascending: false })
          .limit(5),

        // Buscar vendas
        supabase
          .from("vendas")
          .select(
            `
            id,
            numero_venda,
            valor_total,
            status,
            criado_em,
            clientes(nome),
            lojas(nome)
          `,
          )
          .or(`numero_venda.ilike.${searchTerm}`)
          .order("criado_em", { ascending: false })
          .limit(5),

        // Buscar técnicos
        supabase
          .from("tecnicos")
          .select("id, nome, especialidade, telefone, lojas(nome)")
          .or(`nome.ilike.${searchTerm},especialidade.ilike.${searchTerm}`)
          .eq("ativo", true)
          .limit(3),
      ]);

    // Formatar resultados
    const results: SearchResult[] = [];

    // Adicionar produtos
    if (produtos.data) {
      produtos.data.forEach((produto: any) => {
        const estoqueTotal = produto.estoque_lojas?.reduce(
          (acc: number, est: any) => acc + (est.quantidade || 0),
          0,
        );
        const lojas = produto.estoque_lojas
          ?.map((est: any) => est.lojas?.nome)
          .filter(Boolean)
          .join(", ");

        results.push({
          id: `produto-${produto.id}`,
          title: produto.descricao,
          subtitle: `${produto.marca || ""} ${produto.modelos || ""} • ${formatMoeda(produto.preco_venda || 0)} • ${estoqueTotal || 0} em estoque`,
          category: "produto" as const,
          href: `/sistema/estoque/${produto.id}`,
        });
      });
    }

    // Adicionar clientes
    if (clientes.data) {
      clientes.data.forEach((cliente: any) => {
        const parts = [];

        if (cliente.email) parts.push(cliente.email);
        if (cliente.telefone) parts.push(formatTelefone(cliente.telefone));
        if (cliente.cpf) parts.push(`CPF: ${formatCPF(cliente.cpf)}`);

        results.push({
          id: `cliente-${cliente.id}`,
          title: cliente.nome,
          subtitle: parts.join(" • "),
          category: "cliente" as const,
          href: `/sistema/clientes/${cliente.id}`,
        });
      });
    }

    // Adicionar ordens de serviço
    if (ordensServico.data) {
      ordensServico.data.forEach((os: any) => {
        const statusLabels: Record<string, string> = {
          aguardando: "Aguardando",
          em_andamento: "Em Andamento",
          concluido: "Concluído",
          entregue: "Entregue",
          cancelado: "Cancelado",
        };

        results.push({
          id: `os-${os.id}`,
          title: `OS #${os.numero_os} - ${os.cliente_nome}`,
          subtitle: `${os.equipamento_marca || ""} ${os.equipamento_modelo || ""} • ${statusLabels[os.status] || os.status} • ${new Date(os.criado_em).toLocaleDateString("pt-BR")}`,
          category: "os" as const,
          href: `/sistema/ordem-servico/${os.id}`,
        });
      });
    }

    // Adicionar vendas
    if (vendas.data) {
      vendas.data.forEach((venda: any) => {
        const statusLabels: Record<string, string> = {
          aberta: "Aberta",
          finalizada: "Finalizada",
          cancelada: "Cancelada",
        };

        results.push({
          id: `venda-${venda.id}`,
          title: `Venda #${venda.numero_venda}${venda.clientes ? ` - ${venda.clientes.nome}` : ""}`,
          subtitle: `${formatMoeda(venda.valor_total || 0)} • ${statusLabels[venda.status] || venda.status} • ${new Date(venda.criado_em).toLocaleDateString("pt-BR")}`,
          category: "venda" as const,
          href: `/sistema/vendas/${venda.id}`,
        });
      });
    }

    // Adicionar técnicos
    if (tecnicos.data) {
      tecnicos.data.forEach((tecnico: any) => {
        const parts = [tecnico.especialidade || "Técnico"];

        if (tecnico.telefone) parts.push(formatTelefone(tecnico.telefone));
        if (tecnico.lojas?.nome) parts.push(tecnico.lojas.nome);

        results.push({
          id: `tecnico-${tecnico.id}`,
          title: tecnico.nome,
          subtitle: parts.join(" • "),
          category: "tecnico" as const,
          href: `/sistema/tecnicos/${tecnico.id}`,
        });
      });
    }

    console.log(`Total de resultados encontrados: ${results.length}`);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erro na busca:", error);

    return NextResponse.json(
      { error: "Erro ao realizar a busca", results: [] },
      { status: 500 },
    );
  }
}
