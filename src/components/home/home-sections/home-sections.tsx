import { AppIconGrid } from "@/components/catalog/app-icon-grid/app-icon-grid";
import { CatalogHeader } from "@/components/catalog/catalog-header/catalog-header";
import { SteamTopupForm } from "@/components/steam/steam-topup-form/steam-topup-form";

export function HomeSections() {
  return (
    <>
      <SteamTopupForm />
      <AppIconGrid />
      <CatalogHeader />
    </>
  );
}
