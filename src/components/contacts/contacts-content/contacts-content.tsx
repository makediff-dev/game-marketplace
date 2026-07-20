import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { contactCards, socialLinks } from "@/lib/mock/contacts";
import styles from "./contacts-content.module.css";

export function ContactsContent() {
  return (
    <div className={styles.contacts}>
      <section className={styles.hero}>
        <span className={styles.heroEmoji} aria-hidden>
          ℹ️
        </span>
        <h2 className={styles.heroTitle}>Проверяйте контактные данные</h2>
        <p className={styles.heroText}>
          Остерегайтесь мошенников! У нас нет поддержки в Telegram, и, как правило, мы не пишем
          первыми
        </p>
        <Link href="/support" className={styles.supportButton}>
          <Button variant="primary" fullWidth large>
            Написать в поддержку
          </Button>
        </Link>
      </section>

      <div className={styles.grid}>
        {contactCards.map((card) => (
          <article key={card.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardText}>{card.description}</p>
            {card.email ? (
              <a href={`mailto:${card.email}`} className={styles.cardEmail}>
                {card.email}
              </a>
            ) : null}
            {card.social ? (
              <div className={styles.socialRow}>
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.href} className={styles.socialLink} aria-label={link.label}>
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
          </article>
        ))}
      </div>
    </div>
  );
}
