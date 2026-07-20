import Image from "next/image";
import styles from "./game-catalog-hero.module.css";

interface GameCatalogHeroProps {
  title: string;
  heroImage: string;
  logo: string;
}

export function GameCatalogHero({ title, heroImage, logo }: GameCatalogHeroProps) {
  return (
    <section className={styles.hero} aria-label={title}>
      <Image src={heroImage} alt="" fill className={styles.background} sizes="1136px" priority />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Image src={logo} alt="" width={56} height={56} className={styles.logo} />
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  );
}
