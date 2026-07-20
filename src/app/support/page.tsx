import { Navbar } from "@/components/layout/navbar/navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { Footer } from "@/components/footer/footer/footer";
import { supportFaq } from "@/lib/mock/legal";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import styles from "@/components/legal/legal-content/legal-content.module.css";

export default function SupportPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <div className="contentBlock">
          <PageHeader title="Поддержка" backHref="/" />
        </div>
        <div className={styles.legal}>
          <p className={styles.intro}>
            Свяжитесь с нами через чат на сайте или напишите на support@playnox.com. Мы не ведём
            поддержку в Telegram.
          </p>
          <div className={styles.faqList}>
            {supportFaq.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h2 className={styles.faqQuestion}>{item.question}</h2>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </article>
            ))}
          </div>
          <Link href="/chat" className={styles.supportCta}>
            <Button variant="gradient" fullWidth large>
              Открыть чат
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}
