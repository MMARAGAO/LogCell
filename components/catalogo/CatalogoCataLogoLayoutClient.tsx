"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { CatalogoFooter } from "./CatalogoFooter";

interface CatalogoCataLogoLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Componente Client para o layout do catálogo
 * Layout público sem sidebar (diferente do sistema administrativo)
 */
export function CatalogoCataLogoLayoutClient({
  children,
}: CatalogoCataLogoLayoutClientProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <CatalogoFooter />
    </div>
  );
}
