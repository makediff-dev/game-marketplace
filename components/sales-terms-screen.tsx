import Link from "next/link";

import { SALES_TERMS } from "@/lib/static-content";
import styles from "@/styles/static-page.module.scss";

export function SalesTermsScreen() {
  return (
    <article
      className={`${styles["static-page"]} ${styles["static-page__article"]}`}
    >
      <h1 className={styles["static-page__title"]}>Условия продажи</h1>

      <div className={styles["static-page__block"]}>
        {SALES_TERMS.intro.map((paragraph) => (
          <p key={paragraph} className={styles["static-page__paragraph"]}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className={styles["static-page__block"]}>
        <p className={styles["static-page__heading"]}>
          {SALES_TERMS.startHeading}
        </p>
        <ol className={styles["static-page__list"]}>
          {SALES_TERMS.startSteps.map((step, index) => (
            <li key={step} className={styles["static-page__list-item"]}>
              {step}
              {index === 1 ? (
                <>
                  {" "}
                  <Link className={styles["static-page__link"]} href="/terms">
                    {SALES_TERMS.agreementLinkLabel}
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles["static-page__block"]}>
        <p className={styles["static-page__paragraph"]}>
          {SALES_TERMS.blocked}
        </p>
        <p className={styles["static-page__paragraph"]}>
          {SALES_TERMS.fixHint}
        </p>
      </div>

      <div className={styles["static-page__block"]}>
        <p className={styles["static-page__heading"]}>
          {SALES_TERMS.premiumHeading}
        </p>
        <ul className={styles["static-page__list"]}>
          {SALES_TERMS.premiumPoints.map((item) => (
            <li key={item} className={styles["static-page__list-item"]}>
              {item}
            </li>
          ))}
        </ul>
        <p className={styles["static-page__heading"]}>Преимущества:</p>
        <ul className={styles["static-page__list"]}>
          {SALES_TERMS.premiumBenefits.map((item) => (
            <li key={item} className={styles["static-page__list-item"]}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {SALES_TERMS.tables.map((table) => (
        <div key={table.title} className={styles["static-page__block"]}>
          <p className={styles["static-page__heading"]}>{table.title}</p>
          <div className={styles["static-page__table-scroll"]}>
            <table className={styles["static-page__table"]}>
              <thead>
                <tr>
                  <th className={styles["static-page__th"]}>Цена товара</th>
                  <th className={styles["static-page__th"]}>Выставление</th>
                  <th className={styles["static-page__th"]}>Поднятие вверх</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.join("-")}>
                    {row.map((cell) => (
                      <td key={cell} className={styles["static-page__td"]}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </article>
  );
}
