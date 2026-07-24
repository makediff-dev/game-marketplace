"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary/checkout-order-summary";
import { ProductCard } from "@/components/products/product-card/product-card";
import {
  buildCheckoutCartItems,
  CHECKOUT_COMMENT_MAX_LENGTH,
  checkoutPaymentMethods,
  getCheckoutCartTotal,
  type CheckoutCartItem,
} from "@/lib/mock/checkout";
import type { ProductDetail } from "@/lib/mock/product-details";
import { formatPrice, type Product } from "@/lib/mock/products";
import styles from "./checkout-form.module.css";

interface CheckoutFormProps {
  product: ProductDetail;
  viewedProducts: Product[];
}

export function CheckoutForm({ product, viewedProducts }: CheckoutFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card-ru");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>(() =>
    buildCheckoutCartItems(product),
  );

  const totalPrice = getCheckoutCartTotal(cartItems);
  const commentLength = comment.length;
  const isCommentTooLong = commentLength > CHECKOUT_COMMENT_MAX_LENGTH;
  const canPay = cartItems.length > 0 && termsAccepted && !isCommentTooLong;

  const counterClassName = useMemo(() => {
    return `${styles.counter} ${isCommentTooLong ? styles.counterError : ""}`;
  }, [isCommentTooLong]);

  const handlePay = () => {
    if (!canPay) {
      return;
    }

    router.push(
      `/product/${product.id}/checkout/success?method=${encodeURIComponent(selectedMethod)}`,
    );
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity + delta),
        };
      }),
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((items) => {
      const nextItems = items.filter((item) => item.id !== itemId);

      if (nextItems.length === 0) {
        router.push(`/product/${product.id}`);
      }

      return nextItems;
    });
  };

  return (
    <section className={styles.page} aria-label="Оформление заказа">
      <h1 className={styles.title}>Оформление заказа</h1>

      <div className={styles.layout}>
        <div className={styles.form}>
          <section className={styles.section} aria-label="Способ оплаты">
            <h2 className={styles.sectionTitle}>Способ оплаты</h2>
            <div className={styles.methodGrid}>
              {checkoutPaymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`${styles.methodCard} ${
                    selectedMethod === method.id ? styles.methodCardActive : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                  aria-pressed={selectedMethod === method.id}
                >
                  <Icon
                    src={method.icon}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.methodIcon}
                  />
                  <span className={styles.methodLabel}>{method.shortLabel}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-label="Комментарий / контакт">
            <label htmlFor="checkout-comment" className={styles.sectionTitle}>
              Комментарий / контакт
            </label>
            <div className={styles.textareaWrap}>
              <textarea
                id="checkout-comment"
                className={`${styles.textarea} ${isCommentTooLong ? styles.textareaError : ""}`}
                placeholder="Дополнительные данные для продавца"
                value={comment}
                maxLength={CHECKOUT_COMMENT_MAX_LENGTH}
                onChange={(event) => setComment(event.target.value)}
                aria-invalid={isCommentTooLong}
                aria-describedby="checkout-comment-counter"
              />
              <span id="checkout-comment-counter" className={counterClassName}>
                {commentLength}/{CHECKOUT_COMMENT_MAX_LENGTH}
              </span>
            </div>
            {isCommentTooLong ? (
              <span className={styles.error} role="alert">
                Максимум {CHECKOUT_COMMENT_MAX_LENGTH} символов
              </span>
            ) : null}
          </section>

          <div className={styles.termsRow}>
            <button
              type="button"
              className={`${styles.checkbox} ${termsAccepted ? styles.checkboxChecked : ""}`}
              onClick={() => setTermsAccepted((current) => !current)}
              aria-pressed={termsAccepted}
              aria-label="Согласие с условиями"
            >
              {termsAccepted ? (
                <Icon
                  src="/assets/checkmark-white.svg"
                  width={12}
                  height={9}
                  className={styles.checkIcon}
                />
              ) : null}
            </button>
            <p className={styles.termsText}>
              Согласен с{" "}
              <Link href="/terms/sales">условиями безопасной сделки</Link> и{" "}
              <Link href="/terms">правилами сервиса</Link>
            </p>
          </div>

          <Button
            type="button"
            variant="gradient"
            fullWidth
            large
            className={styles.payButton}
            disabled={!canPay}
            onClick={handlePay}
          >
            Оплатить {formatPrice(totalPrice)} ₽
          </Button>
        </div>

        {cartItems.length > 0 ? (
          <CheckoutOrderSummary
            items={cartItems}
            totalPrice={totalPrice}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        ) : null}
      </div>

      {viewedProducts.length > 0 ? (
        <section className={styles.viewedSection} aria-label="Вы также смотрели">
          <div className={styles.viewedHeader}>
            <h2 className={styles.viewedTitle}>👀 Вы также смотрели</h2>
          </div>
          <div className={styles.viewedGrid}>
            {viewedProducts.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
