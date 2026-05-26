"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const CHECK_INTERVAL = 60_000;

export function NewVersionToast() {
  const [version, setVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchVersion = useCallback(async () => {
    try {
      const res = await fetch(`/build-version.json?t=${Date.now()}`);
      const data = await res.json();

      if (!version) {
        setVersion(data.version);
        return;
      }

      if (data.version !== version) {
        setNewVersion(data.version);
        setVisible(true);
      }
    } catch {
      // ignore
    }
  }, [version]);

  useEffect(() => {
    fetchVersion();
    const interval = setInterval(fetchVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVersion]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg border border-primary-600">
        <p className="text-sm font-medium">Nova versão disponível</p>
        <Button
          className="bg-white/20 text-white hover:bg-white/30 min-w-0 h-8 px-3 text-xs font-semibold"
          size="sm"
          startContent={<ArrowPathIcon className="w-3.5 h-3.5" />}
          onPress={() => window.location.reload()}
        >
          Atualizar
        </Button>
        <button
          className="text-white/60 hover:text-white ml-1"
          onClick={() => setVisible(false)}
          type="button"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
