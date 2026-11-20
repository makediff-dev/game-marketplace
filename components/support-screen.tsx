import { SUPPORT_FAQ, SUPPORT_INTRO } from "@/lib/static-content";
import styles from "@/styles/static-page.module.scss";

export function SupportScreen() {
  return (
    <div className={styles["static-page"]}>
      <div>
        <h1 className={styles["static-page__title"]}>Поддержка</h1>
        <p className={styles["static-page__lead"]}>{SUPPORT_INTRO}</p>
      </div>
      <div className={styles["static-page__faq-list"]}>
        {SUPPORT_FAQ.map((item) => (
          <article
            key={item.question}
            className={styles["static-page__faq-item"]}
          >
            <h2 className={styles["static-page__faq-question"]}>
              {item.question}
            </h2>
            <p className={styles["static-page__faq-answer"]}>{item.answer}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
