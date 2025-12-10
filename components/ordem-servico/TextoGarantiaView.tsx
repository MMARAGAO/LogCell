import React from "react";
import { TextoGarantia } from "@/types/garantia";

interface TextoGarantiaViewProps {
  textoGarantia: TextoGarantia;
  className?: string;
}

export const TextoGarantiaView: React.FC<TextoGarantiaViewProps> = ({
  textoGarantia,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-bold text-lg">{textoGarantia.titulo}</h3>

      <div className="space-y-3">
        {textoGarantia.clausulas.map((clausula) => (
          <div key={clausula.numero} className="flex gap-3">
            <span className="font-semibold min-w-[30px]">
              ({clausula.numero})
            </span>
            <p className="text-sm">{clausula.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TextoGarantiaPrintProps {
  textoGarantia: TextoGarantia;
}

export const TextoGarantiaPrint: React.FC<TextoGarantiaPrintProps> = ({
  textoGarantia,
}) => {
  return (
    <div
      style={{
        fontSize: "10px",
        lineHeight: "1.4",
        marginTop: "20px",
        padding: "10px",
        border: "1px solid #ddd",
      }}
    >
      <div
        style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "11px" }}
      >
        {textoGarantia.titulo}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {textoGarantia.clausulas.map((clausula) => (
          <div key={clausula.numero} style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontWeight: "bold", minWidth: "25px" }}>
              ({clausula.numero})
            </span>
            <span style={{ flex: 1 }}>{clausula.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
