"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export interface CarrosselFoto {
  id: number;
  url: string;
  legenda?: string;
}

interface CarrosselFotosProps {
  fotos: CarrosselFoto[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
  showLegendas?: boolean;
  height?: string;
  className?: string;
}

export function CarrosselFotos({
  fotos,
  autoPlay = false,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showLegendas = true,
  height = "400px",
  className = "",
}: CarrosselFotosProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || fotos.length === 0) return;

    const interval = setInterval(() => {
      proximaFoto();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, indiceAtual, fotos.length]);

  const proximaFoto = () => {
    setIndiceAtual((prev) => (prev + 1) % fotos.length);
  };

  const fotoAnterior = () => {
    setIndiceAtual((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  const irParaFoto = (indice: number) => {
    setIndiceAtual(indice);
    setIsPlaying(false);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") fotoAnterior();
      if (e.key === "ArrowRight") proximaFoto();
      if (e.key === "Escape") setIsPlaying(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (fotos.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Nenhuma foto disponível</p>
        </div>
      </div>
    );
  }

  const fotoAtual = fotos[indiceAtual];

  return (
    <div className={`relative ${className}`}>
      {/* Imagem Principal */}
      <div
        className="relative rounded-lg overflow-hidden bg-black"
        style={{ height }}
      >
        <Image
          src={fotoAtual.url}
          alt={fotoAtual.legenda || `Foto ${indiceAtual + 1}`}
          fill
          className="object-contain"
          priority
        />

        {/* Contador de fotos */}
        {fotos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {indiceAtual + 1} / {fotos.length}
          </div>
        )}

        {/* Botões de navegação */}
        {fotos.length > 1 && (
          <>
            <Button
              isIconOnly
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white"
              onPress={fotoAnterior}
              size="lg"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
            <Button
              isIconOnly
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white"
              onPress={proximaFoto}
              size="lg"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Legenda */}
        {showLegendas && fotoAtual.legenda && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm">{fotoAtual.legenda}</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && fotos.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {fotos.map((foto, index) => (
            <button
              key={foto.id}
              onClick={() => irParaFoto(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === indiceAtual
                  ? "border-primary scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={foto.url}
                alt={foto.legenda || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores (dots) - alternativa aos thumbnails */}
      {!showThumbnails && fotos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {fotos.map((_, index) => (
            <button
              key={index}
              onClick={() => irParaFoto(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === indiceAtual
                  ? "bg-primary w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
