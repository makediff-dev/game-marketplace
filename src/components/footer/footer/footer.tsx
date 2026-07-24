import Link from "next/link";
import { Icon } from "@/components/ui/icon/icon";
import { FooterSupportLink } from "@/components/footer/footer-support-link/footer-support-link";
import styles from "./footer.module.css";

const paymentMethods = [
  { src: "/assets/card-ru.svg", alt: "Банковская карта РФ" },
  { src: "/assets/card-foreign.png", alt: "Зарубежная карта" },
  { src: "/assets/sbp.svg", alt: "СБП" },
  { src: "/assets/card-by.svg", alt: "Карта Беларуси" },
  { src: "/assets/card-kz.svg", alt: "Карта Казахстана" },
  { src: "/assets/visa.svg", alt: "Visa" },
  { src: "/assets/mastercard.svg", alt: "Mastercard" },
  { src: "/assets/mir.svg", alt: "Mir" },
];

const infoLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/terms/sales", label: "Условия продажи" },
  { href: "/contacts", label: "Контакты" },
];

const socialLinks = [
  { href: "#", label: "Telegram" },
  { href: "#", label: "ВКонтакте" },
  { href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className={`contentBlock ${styles.footer}`}>
      <div className={styles.top}>
        <div className={styles.paymentColumn}>
          <div className={styles.paymentOptions}>
            <h3 className={styles.columnTitle}>Способы оплаты</h3>
            <div className={styles.paymentIcons}>
              {paymentMethods.map((method) => (
                <Icon
                  key={method.alt}
                  src={method.src}
                  alt={method.alt}
                  width={40}
                  height={40}
                  className={styles.paymentIcon}
                />
              ))}
            </div>
          </div>
          <p className={styles.copyright}>
            2026 © Playnox — маркетплейс игровых товаров и услуг. Все права защищены.
          </p>
        </div>

        <div className={`${styles.column} ${styles.infoColumn}`}>
          <h3 className={styles.columnTitle}>Информация</h3>
          <nav className={styles.links} aria-label="Информация">
            {infoLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
            <FooterSupportLink className={styles.link} />
          </nav>
        </div>

        <div className={`${styles.column} ${styles.socialColumn}`}>
          <h3 className={styles.columnTitle}>Социальные сети</h3>
          <nav className={`${styles.links} ${styles.socialLinks}`} aria-label="Социальные сети">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
