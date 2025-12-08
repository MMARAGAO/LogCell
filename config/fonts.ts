import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Otimiza carregamento
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap", // Otimiza carregamento
  preload: true,
  fallback: ["monospace"],
});
