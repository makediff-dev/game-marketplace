import Link from "next/link";
import legalStyles from "@/components/legal/legal-page-article/legal-page-article.module.css";
import {
  premiumBenefits,
  premiumPrices10,
  premiumPrices20,
  premiumStatusIntro,
  salesTermsIntro,
  salesTermsNotes,
  salesTermsSteps,
  type PremiumPriceRow,
} from "@/lib/mock/sales-terms";
import styles from "./sales-terms-content.module.css";

function PremiumTable({ rows }: { rows: PremiumPriceRow[] }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeaderCell}>Цена товара</th>
            <th className={styles.tableHeaderCell}>Выставление</th>
            <th className={styles.tableHeaderCell}>Поднятие вверх</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.priceRange}>
              <td className={styles.tableCell}>{row.priceRange}</td>
              <td className={styles.tableCell}>{row.listing}</td>
              <td className={styles.tableCell}>{row.bump}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.block}>
      <p className={styles.paragraph}>{children}</p>
    </div>
  );
}

function HeadingBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.block}>
      <p className={styles.heading}>{children}</p>
    </div>
  );
}

function ListBlock({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item} className={styles.listItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function SalesTermsContent() {
  return (
    <article className={styles.content}>
      <h1 className={legalStyles.title}>Условия продажи</h1>
      {salesTermsIntro.map((paragraph) => (
        <TextBlock key={paragraph}>{paragraph}</TextBlock>
      ))}

      <HeadingBlock>🏁 Чтобы начать:</HeadingBlock>

      <ul className={styles.list}>
        {salesTermsSteps.map((step) => {
          if (typeof step === "string") {
            return (
              <li key={step} className={styles.listItem}>
                {step}
              </li>
            );
          }

          return (
            <li key={step.link.label} className={styles.listItem}>
              {step.before}
              <Link href={step.link.href} className={styles.link}>
                {step.link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {salesTermsNotes.map((paragraph) => (
        <TextBlock key={paragraph}>{paragraph}</TextBlock>
      ))}

      <HeadingBlock>🚀 Премиум статус</HeadingBlock>
      <ListBlock items={premiumStatusIntro} />

      <HeadingBlock>Преимущества:</HeadingBlock>
      <ListBlock items={premiumBenefits} />

      <HeadingBlock>Цены премиум статуса для товаров с платежами 10%</HeadingBlock>
      <PremiumTable rows={premiumPrices10} />

      <HeadingBlock>Цены премиум статуса для товаров с платежами 20%</HeadingBlock>
      <PremiumTable rows={premiumPrices20} />
    </article>
  );
}
