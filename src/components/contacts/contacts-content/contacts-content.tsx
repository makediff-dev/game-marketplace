import { Icon } from "@/components/ui/icon/icon";
import { contactCards, socialLinks } from "@/lib/mock/contacts";
import legalStyles from "@/components/legal/legal-page-article/legal-page-article.module.css";
import styles from "./contacts-content.module.css";

export function ContactsContent() {
  return (
    <article className={styles.contacts}>
      <h1 className={legalStyles.title}>Контакты</h1>

      <div className={styles.grid}>
        {contactCards.map((card) => (
          <article key={card.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <div className={styles.cardBody}>
              <p className={styles.cardText}>{card.description}</p>
              {card.email ? (
                <a href={`mailto:${card.email}`} className={styles.cardEmail}>
                  {card.email}
                </a>
              ) : null}
              {card.social ? (
                <div className={styles.socialRow}>
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      className={styles.socialLink}
                      aria-label={link.label}
                    >
                      <Icon
                        src={link.image}
                        alt={link.label}
                        width={40}
                        height={40}
                        className={styles.socialIcon}
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}
