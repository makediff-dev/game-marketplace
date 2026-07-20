export interface GameSubcategory {
  id: string;
  label: string;
}

export const cs2Subcategories: GameSubcategory[] = [
  { id: "accounts", label: "Аккаунты" },
  { id: "skins", label: "Скины" },
  { id: "prime", label: "Prime Status" },
  { id: "faceit", label: "Аккаунты FACEIT" },
  { id: "rent", label: "Аренда" },
  { id: "services", label: "Услуги" },
  { id: "boost", label: "Буст" },
  { id: "other", label: "Другое" },
  { id: "design", label: "Дизайн" },
  { id: "pass", label: "Пропуск" },
];

export const cs2CatalogMeta = {
  slug: "counter-strike-2",
  title: "Counter-Strike 2",
  heroImage: "/assets/cs2-hero-bg.png",
  logo: "/assets/cs2-logo.png",
  totalProducts: 3,
};

export const cs2SubcategoryToCategory: Record<string, string | undefined> = {
  accounts: "Аккаунты",
  skins: "Скины",
  prime: "Prime Status",
  faceit: "Аккаунты",
  boost: "Буст",
};
