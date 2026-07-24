import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { supportFaq } from "@/lib/mock/legal";
import legalStyles from "@/components/legal/legal-page-article/legal-page-article.module.css";
import styles from "./page.module.css";

export default function SupportPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="layoutBlock">
          <div className={styles.page}>
            <h1 className={legalStyles.title}>Поддержка</h1>
            <div className={styles.content}>
              <p className={styles.intro}>
                Свяжитесь с нами через чат на сайте или напишите на support@playnox.com. Мы не
                ведём поддержку в Telegram.
              </p>
              <div className={styles.faqList}>
                {supportFaq.map((item) => (
                  <article key={item.question} className={styles.faqItem}>
                    <h2 className={styles.faqQuestion}>{item.question}</h2>
                    <p className={styles.faqAnswer}>{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
