import Link from "next/link";

import { SOCIAL_LINKS } from "@/lib/static-content";
import styles from "@/styles/site-shell.module.scss";

const PAYMENT_ICONS = [
  "/assets/card-ru.svg",
  "/assets/card-foreign.png",
  "/assets/sbp.svg",
  "/assets/card-by.svg",
  "/assets/card-kz.svg",
  "/assets/visa.svg",
  "/assets/mastercard.svg",
  "/assets/mir.svg",
];

const INFO_LINKS = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/terms/sales", label: "Условия продажи" },
  { href: "/contacts", label: "Контакты" },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles["site-shell__footer"]}>
      <div className={styles["site-shell__footer-top"]}>
        <div className={styles["site-shell__payment"]}>
          <div className={styles["site-shell__pay-block"]}>
            <p className={styles["site-shell__footer-title"]}>Способы оплаты</p>
            <div className={styles["site-shell__pay-icons"]}>
              {PAYMENT_ICONS.map((src) => (
                <span key={src} className={styles["site-shell__pay-icon"]}>
                  <img src={src} alt="" width={40} height={40} />
                </span>
              ))}
            </div>
          </div>
          <Link className={styles["site-shell__support"]} href="/support">
            <span className={styles["site-shell__support-label"]}>
              Написать в поддержку
            </span>
          </Link>
        </div>

        <div className={styles["site-shell__info"]}>
          <p className={styles["site-shell__footer-title"]}>Информация</p>
          <div className={styles["site-shell__info-links"]}>
            {INFO_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles["site-shell__social"]}>
          <p className={styles["site-shell__footer-title"]}>Социальные сети</p>
          <div className={styles["site-shell__social-links"]}>
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles["site-shell__divider"]} />

      <p className={styles["site-shell__copyright"]}>
        2026 © Playnox — маркетплейс игровых товаров и услуг. Все права
        защищены.
      </p>
    </footer>
  );
}
