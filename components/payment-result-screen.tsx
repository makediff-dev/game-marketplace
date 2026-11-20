import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/styles/payment-result.module.scss";

export type TPaymentResult = "success" | "fail";

export type TPaymentReturnParams = {
  order?: string | string[];
  type?: string | string[];
};

export const paymentPageMetadata: Metadata = {
  robots: { index: false, follow: false },
};

const ORDER_CODE = /^[A-Za-z0-9_-]{1,64}$/;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// The bank only brings the buyer back. Money is credited by its callback to the API,
// so this page never says the order is paid for sure.
export function paymentReturnLinks(
  result: TPaymentResult,
  params: TPaymentReturnParams,
): Array<{ href: string; label: string }> {
  const order = single(params.order);

  if (order && ORDER_CODE.test(order)) {
    return [
      {
        href: `/orders/${order}`,
        label: result === "success" ? "Перейти к заказу" : "Вернуться к заказу",
      },
    ];
  }

  if (single(params.type) === "topup") {
    return [
      {
        href: "/profile/balance",
        label: result === "success" ? "Перейти к балансу" : "Попробовать снова",
      },
    ];
  }

  return [
    { href: "/profile?tab=purchases", label: "Мои покупки" },
    { href: "/profile/balance", label: "Баланс" },
  ];
}

const TEXT: Record<TPaymentResult, { title: string; text: string }> = {
  success: {
    title: "Оплата прошла",
    text: "Банк подтвердил платёж. Зачисление может занять пару минут, статус заказа и баланс обновятся сами.",
  },
  fail: {
    title: "Оплата не прошла",
    text: "Деньги не списаны. Проверьте данные карты или выберите другой способ оплаты и попробуйте ещё раз.",
  },
};

export function PaymentResultScreen({
  result,
  params,
}: {
  result: TPaymentResult;
  params: TPaymentReturnParams;
}) {
  const [primary, ...rest] = paymentReturnLinks(result, params);

  return (
    <section className={styles["payment-result"]}>
      <span
        className={`${styles["payment-result__icon"]} ${styles[`payment-result__icon--${result}`]}`}
        aria-hidden
      >
        {result === "success" ? "✓" : "!"}
      </span>
      <h1 className={styles["payment-result__title"]}>{TEXT[result].title}</h1>
      <p className={styles["payment-result__text"]}>{TEXT[result].text}</p>
      <div className={styles["payment-result__actions"]}>
        <Link className={styles["payment-result__primary"]} href={primary.href}>
          {primary.label}
        </Link>
        {rest.map((link) => (
          <Link
            key={link.href}
            className={styles["payment-result__secondary"]}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {result === "fail" ? (
        <p className={styles["payment-result__note"]}>
          Если деньги всё же списались, напишите в{" "}
          <Link href="/support">поддержку</Link>.
        </p>
      ) : null}
    </section>
  );
}
