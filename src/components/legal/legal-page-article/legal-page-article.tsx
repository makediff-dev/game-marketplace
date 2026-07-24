import styles from "./legal-page-article.module.css";

interface LegalPageArticleProps {
  title: string;
  text: string;
}

export function LegalPageArticle({ title, text }: LegalPageArticleProps) {
  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
    </article>
  );
}
