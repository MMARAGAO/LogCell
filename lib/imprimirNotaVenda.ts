import jsPDF from "jspdf";
import type { VendaCompleta } from "@/types/vendas";

// Função principal que gera o PDF
function gerarPDFNota(venda: VendaCompleta): jsPDF {
  const doc = new jsPDF({
    format: [80, 297], // 80mm de largura (padrão de impressora térmica)
  });

  const pageWidth = 80;
  let yPosition = 10;
  const lineHeight = 5;

  // Função auxiliar para centralizar texto
  const centerText = (text: string, y: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Função auxiliar para texto à esquerda
  const leftText = (text: string, y: number, fontSize = 8) => {
    doc.setFontSize(fontSize);
    doc.text(text, 5, y);
  };

  // Função auxiliar para texto à direita
  const rightText = (text: string, y: number, fontSize = 8) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, pageWidth - textWidth - 5, y);
  };

  // Função para adicionar linha separadora
  const addLine = (y: number) => {
    doc.line(5, y, pageWidth - 5, y);
  };

  // Nome da loja
  centerText(venda.loja?.nome || "LOJA", yPosition, 12);
  yPosition += lineHeight + 2;

  // Linha separadora
  addLine(yPosition);
  yPosition += lineHeight;

  // Informações da venda
  leftText(`VENDA #${venda.numero_venda}`, yPosition, 10);
  yPosition += lineHeight;

  leftText(`Data: ${new Date(venda.criado_em).toLocaleString("pt-BR")}`, yPosition);
  yPosition += lineHeight;

  if (venda.cliente) {
    leftText(`Cliente: ${venda.cliente.nome}`, yPosition);
    yPosition += lineHeight;
    if (venda.cliente.cpf) {
      leftText(`CPF: ${venda.cliente.cpf}`, yPosition);
      yPosition += lineHeight;
    }
  }

  if (venda.vendedor) {
    leftText(`Vendedor: ${venda.vendedor.nome}`, yPosition);
    yPosition += lineHeight;
  }

  // Linha separadora
  yPosition += 2;
  addLine(yPosition);
  yPosition += lineHeight;

  // Cabeçalho dos itens
  leftText("PRODUTO", yPosition, 9);
  rightText("VALOR", yPosition, 9);
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  // Itens da venda
  venda.itens?.forEach((item) => {
    // Nome do produto
    const nomeMaxWidth = 60;
    const nomeProduto = item.produto_nome || "Produto";
    const nomeSplitted = doc.splitTextToSize(nomeProduto, nomeMaxWidth);
    
    nomeSplitted.forEach((linha: string, index: number) => {
      leftText(linha, yPosition, 8);
      if (index === nomeSplitted.length - 1) {
        rightText(
          formatarMoeda(item.preco_unitario),
          yPosition,
          8
        );
      }
      yPosition += lineHeight - 1;
    });

    // Quantidade e subtotal
    leftText(`  ${item.quantidade}x ${formatarMoeda(item.preco_unitario)}`, yPosition, 8);
    rightText(formatarMoeda(item.subtotal), yPosition, 8);
    yPosition += lineHeight;

    // Desconto do item, se houver
    if (item.valor_desconto && item.valor_desconto > 0) {
      leftText(`  Desconto`, yPosition, 8);
      rightText(`-${formatarMoeda(item.valor_desconto)}`, yPosition, 8);
      yPosition += lineHeight;
    }

    yPosition += 1;
  });

  // Linha separadora
  addLine(yPosition);
  yPosition += lineHeight;

  // Totais
  if (venda.valor_desconto && venda.valor_desconto > 0) {
    leftText("Subtotal:", yPosition, 9);
    rightText(formatarMoeda(venda.valor_total + venda.valor_desconto), yPosition, 9);
    yPosition += lineHeight;

    leftText("Desconto:", yPosition, 9);
    rightText(`-${formatarMoeda(venda.valor_desconto)}`, yPosition, 9);
    yPosition += lineHeight;
  }

  doc.setFont("helvetica", "bold");
  leftText("TOTAL:", yPosition, 11);
  rightText(formatarMoeda(venda.valor_total), yPosition, 11);
  doc.setFont("helvetica", "normal");
  yPosition += lineHeight + 2;

  // Linha separadora
  addLine(yPosition);
  yPosition += lineHeight;

  // Pagamentos
  leftText("PAGAMENTOS:", yPosition, 9);
  yPosition += lineHeight;

  const pagamentos = venda.pagamentos || [];
  pagamentos.forEach((pag: any) => {
    const formaPagamento = formatarFormaPagamento(pag.tipo_pagamento);
    leftText(`  ${formaPagamento}`, yPosition, 8);
    rightText(formatarMoeda(pag.valor), yPosition, 8);
    yPosition += lineHeight;
  });

  yPosition += 2;
  leftText("Valor Pago:", yPosition, 9);
  rightText(formatarMoeda(venda.valor_pago), yPosition, 9);
  yPosition += lineHeight;

  if (venda.saldo_devedor > 0) {
    doc.setFont("helvetica", "bold");
    leftText("Saldo Devedor:", yPosition, 9);
    rightText(formatarMoeda(venda.saldo_devedor), yPosition, 9);
    doc.setFont("helvetica", "normal");
    yPosition += lineHeight;
  }

  // Linha separadora final
  yPosition += 2;
  addLine(yPosition);
  yPosition += lineHeight + 2;

  // Mensagem final
  centerText("Obrigado pela preferência!", yPosition, 9);
  yPosition += lineHeight;
  centerText("Volte sempre!", yPosition, 8);

  // Retornar o documento PDF gerado
  return doc;
}

// Função para salvar PDF
export function salvarPDFNota(venda: VendaCompleta) {
  const doc = gerarPDFNota(venda);
  doc.save(`venda_${venda.numero_venda}.pdf`);
}

// Função para imprimir PDF
export function imprimirNotaVenda(venda: VendaCompleta) {
  const doc = gerarPDFNota(venda);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarFormaPagamento(forma: string): string {
  const formas: { [key: string]: string } = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
    transferencia: "Transferência",
    boleto: "Boleto",
    credito_cliente: "Crédito do Cliente",
  };
  return formas[forma] || forma;
}
