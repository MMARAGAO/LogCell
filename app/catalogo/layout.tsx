import { CatalogoCataLogoLayoutClient } from "@/components/catalogo/CatalogoCataLogoLayoutClient";

/**
 * Layout do Catálogo (Server Component)
 * Layout público para o catálogo de produtos
 */
export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CatalogoCataLogoLayoutClient>{children}</CatalogoCataLogoLayoutClient>
  );
}
