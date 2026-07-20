import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import type { LegalSection } from "@/lib/mock/legal";
import styles from "./legal-content.module.css";

interface LegalContentProps {
  intro?: string;
  sections: LegalSection[];
  showSupport?: boolean;
}

export function LegalContent({ intro, sections, showSupport = false }: LegalContentProps) {
  return (
    <div className={styles.legal}>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      {showSupport ? (
        <Link href="/chat" className={styles.supportCta}>
          <Button variant="gradient" fullWidth large>
            Написать в поддержку
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
