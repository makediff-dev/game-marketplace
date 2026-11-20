import type { TLegalSection } from "@/lib/static-content";
import styles from "@/styles/static-page.module.scss";

export type { TLegalSection };

export function LegalArticle({
  title,
  lead,
  updatedAt,
  sections,
}: {
  title: string;
  lead: string;
  updatedAt?: string;
  sections: TLegalSection[];
}) {
  return (
    <article
      className={`${styles["static-page"]} ${styles["static-page__article"]}`}
    >
      <h1 className={styles["static-page__title"]}>{title}</h1>
      <p className={styles["static-page__lead"]}>{lead}</p>
      {updatedAt ? (
        <p className={styles["static-page__paragraph"]}>
          Дата обновления: {updatedAt}
        </p>
      ) : null}

      {sections.map((section) => (
        <section key={section.heading} className={styles["static-page__block"]}>
          <h2 className={styles["static-page__heading"]}>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className={styles["static-page__paragraph"]}>
              {paragraph}
            </p>
          ))}
          {section.items && section.items.length > 0 ? (
            <ul className={styles["static-page__list"]}>
              {section.items.map((item) => (
                <li key={item} className={styles["static-page__list-item"]}>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
