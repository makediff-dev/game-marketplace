import { CONTACT_CARDS, SOCIAL_LINKS } from "@/lib/static-content";
import styles from "@/styles/static-page.module.scss";

export function ContactsScreen() {
  return (
    <div className={styles["static-page__contacts"]}>
      <h1 className={styles["static-page__title"]}>Контакты</h1>
      <div className={styles["static-page__grid"]}>
        {CONTACT_CARDS.map((card) => (
          <section key={card.title} className={styles["static-page__card"]}>
            <h2 className={styles["static-page__card-title"]}>{card.title}</h2>
            <div className={styles["static-page__card-body"]}>
              <p className={styles["static-page__card-text"]}>{card.text}</p>
              {card.email ? (
                <a
                  className={styles["static-page__card-email"]}
                  href={`mailto:${card.email}`}
                >
                  {card.email}
                </a>
              ) : null}
              {card.social ? (
                <div className={styles["static-page__social-row"]}>
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.name}
                      className={styles["static-page__social-link"]}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.name}
                    >
                      <img
                        className={styles["static-page__social-icon"]}
                        src={item.icon}
                        alt=""
                        width={40}
                        height={40}
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
