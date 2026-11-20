"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getErrorMessage } from "@/api/error";
import { PromosApi } from "@/api/promos.api";
import { useCreateOrder } from "@/hooks/use-orders";
import { useProfileOverview } from "@/hooks/use-profile";
import { formatMoney } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import { isOwnCatalogProduct } from "@/lib/is-own-product";
import { useUserStore } from "@/store/user.store";
import styles from "@/styles/checkout-modal.module.scss";
import type { TCatalogProduct } from "@/types/catalog";
import { parseFulfillmentFormat } from "@/types/fulfillment";
import type { TPaymentMethod } from "@/types/orders";
import type { TPromoQuote } from "@/types/promos";

export function CheckoutModal({
  product,
  onClose,
}: {
  product: TCatalogProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const promoInputRef = useRef<HTMLInputElement>(null);
  const promoRequestRef = useRef(0);
  const createOrder = useCreateOrder();
  const overviewQuery = useProfileOverview();
  const user = useUserStore((state) => state.user);
  const balance = overviewQuery.data?.balance ?? 0;
  const ownProduct = isOwnCatalogProduct(product, user?.id);

  const fulfillmentFormat = useMemo(
    () => parseFulfillmentFormat(product.attributes?.fulfillmentFormat),
    [product.attributes?.fulfillmentFormat],
  );

  const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>("card");
  const [error, setError] = useState<string | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoQuote, setPromoQuote] = useState<TPromoQuote | null>(null);
  const [promoNotice, setPromoNotice] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const payable =
    promoQuote?.valid === true ? promoQuote.payable : product.price;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const code = promo.trim();

    if (!promoOpen || !code) {
      setPromoQuote(null);
      if (!code) {
        setPromoNotice(null);
      }
      return;
    }

    const requestId = ++promoRequestRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const quote = await PromosApi.getInstance().validate({
          code,
          context: "marketplace",
          amount: product.price,
        });

        if (requestId !== promoRequestRef.current) {
          return;
        }

        setPromoQuote(quote.valid ? quote : null);
        setPromoNotice({
          text: quote.message,
          error: !quote.valid,
        });
      } catch (err) {
        if (requestId !== promoRequestRef.current) {
          return;
        }

        setPromoQuote(null);
        setPromoNotice({
          text: getErrorMessage(err),
          error: true,
        });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [promo, promoOpen, product.price]);

  function openPromo() {
    setPromoOpen(true);
    requestAnimationFrame(() => promoInputRef.current?.focus());
  }

  function closePromo() {
    promoRequestRef.current += 1;
    setPromoOpen(false);
    setPromo("");
    setPromoQuote(null);
    setPromoNotice(null);
  }

  function submit() {
    if (ownProduct) {
      setError("Нельзя купить собственный товар");
      return;
    }

    if (paymentMethod === "balance" && balance < payable) {
      setError("Недостаточно средств на балансе");
      return;
    }

    if (promo.trim() && promoQuote?.valid !== true) {
      setError(promoNotice?.text || "Проверьте промокод");
      return;
    }

    setError(null);
    createOrder.mutate(
      {
        productId: product.id,
        paymentMethod,
        ...(promoQuote?.valid && promoQuote.code
          ? { promoCode: promoQuote.code }
          : {}),
      },
      {
        onSuccess: (order) => {
          onClose();
          router.push(`/orders/${order.id}`);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  return (
    <div
      ref={overlayRef}
      className={styles["checkout-modal__overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={styles["checkout-modal"]}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="checkout-title" className={styles["checkout-modal__title"]}>
          Оформление заказа
        </h2>

        <div className={styles["checkout-modal__product"]}>
          <img
            className={styles["checkout-modal__product-image"]}
            src={product.image}
            alt=""
            width={72}
            height={54}
          />
          <div className={styles["checkout-modal__product-meta"]}>
            <p className={styles["checkout-modal__product-title"]}>
              {product.title}
            </p>
            <span className={styles["checkout-modal__product-price"]}>
              {promoQuote?.valid && promoQuote.discountAmount > 0 ? (
                <>
                  <span className={styles["checkout-modal__price-was"]}>
                    {formatMoney(product.price)}
                  </span>{" "}
                  {formatMoney(payable)}
                </>
              ) : (
                formatMoney(payable)
              )}
            </span>
          </div>
        </div>

        <p className={styles["checkout-modal__section-label"]}>Промокод</p>
        {promoOpen ? (
          <div className={styles["checkout-modal__promo-field-wrap"]}>
            <div className={styles["checkout-modal__promo-field"]}>
              <input
                ref={promoInputRef}
                className={styles["checkout-modal__promo-input"]}
                value={promo}
                placeholder="PLAYNOX"
                aria-label="Промокод"
                aria-invalid={promoNotice?.error === true}
                onChange={(event) => setPromo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closePromo();
                  }
                }}
              />
              <button
                className={styles["checkout-modal__promo-clear"]}
                type="button"
                aria-label="Закрыть промокод"
                onClick={closePromo}
              >
                <img src="/auth/close.svg" alt="" width={20} height={20} />
              </button>
            </div>
            {promoNotice ? (
              <p
                className={
                  promoNotice.error
                    ? styles["checkout-modal__promo-error"]
                    : styles["checkout-modal__promo-hint"]
                }
                role="status"
              >
                {promoNotice.text}
              </p>
            ) : null}
          </div>
        ) : (
          <button
            className={styles["checkout-modal__promo-link"]}
            type="button"
            onClick={openPromo}
          >
            Ввести промокод
          </button>
        )}

        <p className={styles["checkout-modal__section-label"]}>Способ оплаты</p>
        <div className={styles["checkout-modal__methods"]}>
          <button
            type="button"
            className={cx(
              styles["checkout-modal__method"],
              paymentMethod === "card" && styles["checkout-modal__method--on"],
            )}
            onClick={() => setPaymentMethod("card")}
          >
            <span className={styles["checkout-modal__method-title"]}>
              Карта / СБП
            </span>
            <span className={styles["checkout-modal__method-hint"]}>
              Демо-оплата сразу
            </span>
          </button>
          <button
            type="button"
            className={cx(
              styles["checkout-modal__method"],
              paymentMethod === "balance" &&
                styles["checkout-modal__method--on"],
            )}
            onClick={() => setPaymentMethod("balance")}
          >
            <span className={styles["checkout-modal__method-title"]}>
              Баланс
            </span>
            <span className={styles["checkout-modal__method-hint"]}>
              Доступно {formatMoney(balance)}
            </span>
          </button>
        </div>

        <p className={styles["checkout-modal__note"]}>
          {typeof product.attributes?.listingId === "number" ||
          typeof product.attributes?.listingId === "string"
            ? fulfillmentFormat?.mode === "instant"
              ? "После оплаты данные выдачи появятся в сделке. Подтвердите получение, когда всё будет у вас."
              : "Средства на эскроу до подтверждения. После оплаты откроется сделка: там инструкция продавца и чат."
            : "Каталожный товар: после оплаты сразу откроется сделка — подтвердите получение, когда данные будут у вас."}
        </p>

        {error ? (
          <p className={styles["checkout-modal__error"]} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles["checkout-modal__actions"]}>
          <button
            type="button"
            className={styles["checkout-modal__confirm"]}
            disabled={createOrder.isPending || ownProduct}
            onClick={submit}
          >
            {createOrder.isPending
              ? "Оплачиваем…"
              : ownProduct
                ? "Свой товар"
                : `Оплатить ${formatMoney(payable)}`}
          </button>
          <button
            type="button"
            className={styles["checkout-modal__cancel"]}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
