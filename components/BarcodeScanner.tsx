"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/outline";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
}

// Função para enviar logs para o terminal do servidor
const logToTerminal = async (
  message: string,
  type: "info" | "error" | "success" = "info",
  data?: any
) => {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type, data }),
    });
  } catch (err) {
    // Fallback para console se a API falhar
    console.log(message, data);
  }
};

export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  title = "Escanear Código de Barras",
}: BarcodeScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<BrowserMultiFormatReader | null>(null);
  const animationRef = useRef<number>();
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Configurar hints para formatos comuns de código de barras
      const hints = new Map();
      const formats = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
      ];
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      hints.set(DecodeHintType.TRY_HARDER, true);

      scannerRef.current = new BrowserMultiFormatReader(hints);
      setScanning(true);
      isScanningRef.current = true;
      setError(null);

      logToTerminal("Scanner inicializado", "info");

      // Aguardar mais tempo para a câmera iniciar
      setTimeout(() => {
        logToTerminal("Tentando iniciar scan automático", "info");
        startScanning();
      }, 1000);
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = () => {
    if (!isScanningRef.current) {
      logToTerminal("startScanning: não está escaneando", "info");
      return;
    }

    logToTerminal("Iniciando loop de scan", "info");

    const scan = async () => {
      if (
        webcamRef.current?.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;

        try {
          if (scannerRef.current) {
            // Criar canvas e recortar apenas a área do retângulo
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              ctx.drawImage(video, 0, 0);

              // Recortar apenas a área do retângulo de scan
              // Proporções do retângulo visual: 85% largura, 12vh altura (centralizado)
              const scanWidthPercent = 0.85;

              // Calcular altura baseada em 12vh (aproximadamente 12% da altura da viewport)
              const viewportHeight = window.innerHeight;
              const scanHeightVh = viewportHeight * 0.12; // 12vh em pixels

              // Garantir min e max height
              const minHeight = 80;
              const maxHeight = 150;
              const scanHeightPx = Math.max(
                minHeight,
                Math.min(maxHeight, scanHeightVh)
              );

              // Calcular em relação ao vídeo real
              const scanWidth = video.videoWidth * scanWidthPercent;
              const scanHeight =
                scanHeightPx * (video.videoHeight / viewportHeight);
              const scanX = (video.videoWidth - scanWidth) / 2;
              const scanY = (video.videoHeight - scanHeight) / 2;

              const imageData = ctx.getImageData(
                scanX,
                scanY,
                scanWidth,
                scanHeight
              );
              const scanCanvas = document.createElement("canvas");
              scanCanvas.width = scanWidth;
              scanCanvas.height = scanHeight;
              const scanCtx = scanCanvas.getContext("2d");

              if (scanCtx) {
                scanCtx.putImageData(imageData, 0, 0);

                // Melhorar contraste
                const imgData = scanCtx.getImageData(
                  0,
                  0,
                  scanWidth,
                  scanHeight
                );
                const data = imgData.data;
                const contrast = 1.5;
                const factor =
                  (259 * (contrast + 255)) / (255 * (259 - contrast));

                for (let i = 0; i < data.length; i += 4) {
                  data[i] = factor * (data[i] - 128) + 128;
                  data[i + 1] = factor * (data[i + 1] - 128) + 128;
                  data[i + 2] = factor * (data[i + 2] - 128) + 128;
                }

                scanCtx.putImageData(imgData, 0, 0);

                try {
                  const imageUrl = scanCanvas.toDataURL("image/png");
                  const img = new Image();
                  img.src = imageUrl;

                  await new Promise((resolve) => {
                    img.onload = async () => {
                      try {
                        if (scannerRef.current) {
                          const result =
                            await scannerRef.current.decodeFromImageElement(
                              img
                            );
                          if (result) {
                            const code = result.getText();

                            // Validar se é um IMEI válido (15 dígitos numéricos)
                            const apenasNumeros = code.replace(/\D/g, "");

                            await logToTerminal("Código detectado", "info", {
                              original: code,
                              numeros: apenasNumeros,
                              tamanho: apenasNumeros.length,
                            });

                            if (apenasNumeros.length === 15) {
                              await logToTerminal(
                                "IMEI válido detectado",
                                "success",
                                apenasNumeros
                              );
                              onScan(apenasNumeros);
                              setScanning(false);
                              isScanningRef.current = false;
                              onClose();
                              resolve(true);
                              return;
                            } else {
                              await logToTerminal(
                                "Código inválido - IMEI deve ter 15 dígitos",
                                "info",
                                {
                                  encontrado: apenasNumeros.length,
                                }
                              );
                            }
                          }
                        }
                      } catch (err) {
                        if (!(err instanceof NotFoundException)) {
                          await logToTerminal(
                            "Erro ao decodificar",
                            "error",
                            String(err)
                          );
                        }
                      }
                      resolve(false);
                    };
                  });
                } catch (err) {
                  // Ignora erros de conversão
                }
              }
            }
          }
        } catch (err) {
          // Ignora erros gerais
        }
      }

      if (isScanningRef.current) {
        animationRef.current = requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const stopScanning = () => {
    setScanning(false);
    isScanningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    // Não fazer reset do scanner para não interferir com a câmera
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const videoConstraints = {
    facingMode: "environment", // Câmera traseira em dispositivos móveis
    width: { min: 640, ideal: 1920, max: 3840 },
    height: { min: 480, ideal: 1080, max: 2160 },
    aspectRatio: { ideal: 16 / 9 },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      placement="center"
      hideCloseButton
      classNames={{
        base: "bg-black",
        backdrop: "bg-black/90",
      }}
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center text-white px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <CameraIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-xs text-white/60">
                Leitura automática ativada
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={handleClose}
            className="text-white hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </ModalHeader>
        <ModalBody className="p-0 relative overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center h-full text-danger">
              <p>{error}</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                onUserMediaError={(err) => {
                  logToTerminal("Erro ao acessar câmera", "error", err);
                  setError(
                    "Não foi possível acessar a câmera. Verifique as permissões."
                  );
                }}
              />

              {/* Overlay com retângulo de scan */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Overlay escuro com recorte para o retângulo */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/50" />

                {/* Recorte transparente onde fica o retângulo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[500px] h-[12vh] min-h-[80px] max-h-[150px]">
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
                    }}
                  />
                </div>

                {/* Retângulo central transparente */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[500px] h-[12vh] min-h-[80px] max-h-[150px] transition-all duration-300 z-10">
                  {/* Container para borda e elementos visuais */}
                  <div className="absolute inset-0 rounded-xl">
                    {/* Borda principal com glow */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 border-primary"
                      style={{
                        boxShadow:
                          "0 0 15px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.1)",
                      }}
                    />

                    {/* Cantos decorativos */}
                    <div className="absolute -top-0.5 -left-0.5 w-10 h-10">
                      <div className="w-full h-full border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-10 h-10">
                      <div className="w-full h-full border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    </div>
                    <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10">
                      <div className="w-full h-full border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10">
                      <div className="w-full h-full border-b-4 border-r-4 border-primary rounded-br-xl" />
                    </div>

                    {/* Linha de scan animada aprimorada */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <div
                        className="absolute left-0 right-0 h-1"
                        style={{
                          animation:
                            "scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 blur-sm" />
                        <div className="absolute inset-0 shadow-lg shadow-primary/80" />
                      </div>
                    </div>

                    {/* Indicador de detecção */}
                    <div className="absolute -top-10 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full backdrop-border animate-pulse-border">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-fast" />
                      <span className="text-white text-xs font-medium">
                        Detectando
                      </span>
                    </div>
                  </div>

                  {/* Instrução aprimorada */}
                  <div className="absolute -bottom-20 sm:-bottom-24 left-1/2 transform -translate-x-1/2 text-center w-full px-4">
                    <div className="inline-flex flex-col items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-br from-black/80 to-black/60 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
                      <p className="text-white text-sm sm:text-base font-semibold">
                        Posicione o código de barras
                      </p>
                      <div className="flex items-center gap-2 text-white/70 text-xs">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        <span>Leitura automática em progresso</span>
                        <div
                          className="w-1 h-1 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>

      <style jsx global>{`
        @keyframes scanLine {
          0% {
            top: -2%;
            opacity: 0;
            transform: scaleY(0.8);
          }
          5% {
            opacity: 0.5;
          }
          15% {
            opacity: 1;
            transform: scaleY(1);
          }
          85% {
            opacity: 1;
            transform: scaleY(1);
          }
          95% {
            opacity: 0.5;
          }
          100% {
            top: 102%;
            opacity: 0;
            transform: scaleY(0.8);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(250px);
            opacity: 0;
          }
        }

        @keyframes pulse-border {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.01);
          }
        }

        @keyframes corner-glow {
          0%,
          100% {
            opacity: 0.8;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.3);
          }
        }

        @keyframes pulse-fast {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .animate-scan {
          animation: scan 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }

        .animate-corner-glow {
          animation: corner-glow 1.5s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animation-delay-75 {
          animation-delay: 0.075s;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-225 {
          animation-delay: 0.225s;
        }
      `}</style>
    </Modal>
  );
}
