import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./footer.module.css";

const paymentMethods = [
  { src: "/assets/card-ru.svg", alt: "Банковская карта РФ" },
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
  { href: "/terms#sales", label: "Условия продажи" },
  { href: "/contacts", label: "Контакты" },
];

const socialLinks = [
  { href: "#", label: "Telegram" },
  { href: "#", label: "ВКонтакте" },
  { href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.paymentColumn}>
          <div>
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
          <Link href="/support" className={styles.supportLink}>
            <Button variant="gradient" fullWidth large>
              Написать в поддержку
            </Button>
          </Link>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Информация</h3>
          <nav className={styles.links} aria-label="Информация">
            {infoLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Социальные сети</h3>
          <nav className={styles.links} aria-label="Социальные сети">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.divider} />

      <p className={styles.copyright}>
        2026 © Playnox — маркетплейс игровых товаров и услуг. Все права защищены.
      </p>
    </footer>
  );
}
