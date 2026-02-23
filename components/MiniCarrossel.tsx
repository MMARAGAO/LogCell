import { useState } from "react";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface MiniCarrosselProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  showControls?: boolean;
  autoHeight?: boolean;
}

export default function MiniCarrossel({
  images,
  alt = "Imagem",
  className = "",
  aspectRatio = "square",
  showControls = true,
  autoHeight = false,
}: MiniCarrosselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-default-100 rounded-lg ${className}`}
        style={{
          aspectRatio:
            aspectRatio === "auto"
              ? undefined
              : aspectRatio === "video"
                ? "16/9"
                : "1/1",
        }}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-default-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <p className="text-sm text-default-400">Sem fotos</p>
        </div>
      </div>
    );
  }

  const aspectRatioStyle =
    aspectRatio === "auto"
      ? {}
      : { aspectRatio: aspectRatio === "video" ? "16/9" : "1/1" };

  return (
    <div className={`relative group ${className}`}>
      {/* Imagem Principal */}
      <div
        className="relative overflow-hidden rounded-t-lg bg-default-100"
        style={autoHeight ? {} : aspectRatioStyle}
      >
        <Image
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          classNames={{
            wrapper: "w-full h-full !max-w-full",
            img: "w-full h-full object-cover",
          }}
          removeWrapper={false}
          src={images[currentIndex]}
        />

        {/* Overlay com número da foto */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      {showControls && images.length > 1 && (
        <>
          {/* Botão Anterior */}
          <Button
            isIconOnly
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-default-900 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm"
            size="sm"
            variant="solid"
            onPress={handlePrevious}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>

          {/* Botão Próximo */}
          <Button
            isIconOnly
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-default-900 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm"
            size="sm"
            variant="solid"
            onPress={handleNext}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Indicadores (dots) - Redesenhados */}
      {images.length > 1 && images.length <= 5 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
          {images.map((_, index) => (
            <button
              key={index}
              aria-label={`Ir para foto ${index + 1}`}
              className={`rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-6 h-2"
                  : "bg-white/60 hover:bg-white/80 w-2 h-2"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
