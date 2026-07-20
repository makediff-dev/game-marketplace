import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import styles from "./seller-start-content.module.css";

const steps = [
  {
    title: "Выберите игру или категорию",
    text: "Найдите подходящую категорию среди игр и приложений на Playnox.",
  },
  {
    title: "Опишите товар",
    text: "Укажите название, цену и условия передачи товара покупателю.",
  },
  {
    title: "Получайте оплату",
    text: "После подтверждения сделки средства поступят на ваш баланс.",
  },
];

export function SellerStartContent() {
  return (
    <section className={styles.start}>
      <Icon
        src="/assets/shopping-bag.svg"
        width={80}
        height={80}
        className={styles.icon}
      />
      <h1 className={styles.title}>Начать продажу</h1>
      <p className={styles.description}>
        Выставьте свой первый товар на Playnox и начните зарабатывать уже сегодня.
      </p>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href="/categories">
          <Button variant="gradient" fullWidth large>
            Выбрать категорию
          </Button>
        </Link>
        <Link href="/terms#sales">
          <Button variant="outline" fullWidth large>
            Условия продажи
          </Button>
        </Link>
      </div>
    </section>
  );
}
