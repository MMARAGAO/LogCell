import type jsPDF from "jspdf";

export const abrirPreviewPDF = (doc: jsPDF, nomeArquivo?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const novaJanela = window.open(url, "_blank");

  if (!novaJanela) {
    alert(
      "Bloqueador de pop-up ativado. Permita pop-ups para visualizar o PDF.",
    );

    return;
  }

  if (nomeArquivo) {
    novaJanela.document.title = nomeArquivo;
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 300000);
};
