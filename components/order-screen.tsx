"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { ListPageSkeleton } from "@/components/skeleton";
import {
  useCancelOrder,
  useConfirmOrder,
  useDisputeOrder,
  useFulfillOrder,
  useOrder,
  useOrderMessages,
  usePostOrderMessage,
} from "@/hooks/use-orders";
import { useOrderReview } from "@/hooks/use-reviews";
import { KeyIcon, OrderDataModal } from "@/components/order-data-modal";
import { OrderReview, ReviewModal } from "@/components/reviews";
import { LineIcon } from "@/components/ui/line-icon";
import { formatMoney } from "@/lib/catalog";
import { chatRuns } from "@/lib/chat";
import { cx } from "@/lib/cx";
import { disputeGroundsFor, type TDisputeGround } from "@/lib/dispute";
import {
  buildDealSteps,
  formatDealStamp,
  isDealActive,
  isFundsFrozenStatus,
} from "@/lib/deal-progress";
import { orderDataFor } from "@/lib/order-data";
import { useUserStore } from "@/store/user.store";
import styles from "@/styles/order-page.module.scss";
import { parseFulfillmentFormat } from "@/types/fulfillment";
import type { TOrderStatus } from "@/types/orders";

// The server cancels an unpaid order after this and puts the item back.
const UNPAID_TTL_MINUTES = 30;

function payByOf(createdAt: string): string | null {
  const at = new Date(new Date(createdAt).getTime() + UNPAID_TTL_MINUTES * 60_000);
  return Number.isNaN(at.getTime())
    ? null
    : at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function deadlineOf(
  paidAt: string | null | undefined,
  hours: number | null | undefined,
): { text: string; overdue: boolean } | null {
  if (!paidAt || !hours) {
    return null;
  }

  const at = new Date(new Date(paidAt).getTime() + hours * 3600 * 1000);

  if (Number.isNaN(at.getTime())) {
    return null;
  }

  return {
    text: at.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    overdue: at.getTime() < Date.now(),
  };
}

const STATUS_LABEL: Record<TOrderStatus, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  awaiting_fulfillment: "Средства заморожены",
  awaiting_confirm: "Средства заморожены",
  completed: "Завершена",
  disputed: "Спор",
  cancelled: "Отменена",
  refunded: "Возврат",
};

type TModal =
  | null
  | "cancel"
  | "dispute-confirm"
  | "dispute-reason"
  | "data"
  | "review"
  | "instruction";

const REVIEW_ASKED_KEY = "playnox-review-asked";

function wasReviewAsked(orderId: string): boolean {
  try {
    return localStorage.getItem(`${REVIEW_ASKED_KEY}:${orderId}`) === "1";
  } catch {
    return false;
  }
}

function markReviewAsked(orderId: string) {
  try {
    localStorage.setItem(`${REVIEW_ASKED_KEY}:${orderId}`, "1");
  } catch {
    // Private mode: the modal may show again, nothing breaks.
  }
}

const INSTRUCTION_SEEN_KEY = "playnox-instruction-seen";

function wasInstructionSeen(orderId: string): boolean {
  try {
    return localStorage.getItem(`${INSTRUCTION_SEEN_KEY}:${orderId}`) === "1";
  } catch {
    return false;
  }
}

function markInstructionSeen(orderId: string) {
  try {
    localStorage.setItem(`${INSTRUCTION_SEEN_KEY}:${orderId}`, "1");
  } catch {
    // Private mode: the instruction opens again on the next visit.
  }
}

export function OrderScreen({ orderId }: { orderId: string }) {
  const orderQuery = useOrder(orderId);
  const messagesQuery = useOrderMessages(orderId);
  const postMessage = usePostOrderMessage(orderId);
  const fulfill = useFulfillOrder();
  const confirm = useConfirmOrder();
  const cancel = useCancelOrder();
  const dispute = useDisputeOrder();
  const user = useUserStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [modal, setModal] = useState<TModal>(null);
  const [disputeGround, setDisputeGround] = useState<TDisputeGround | null>(
    null,
  );
  const [disputeComment, setDisputeComment] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const order = orderQuery.data;
  const messages = messagesQuery.data ?? [];
  const runs = chatRuns(messages);
  const isSeller = Boolean(user && order && order.sellerId === user.id);
  const isBuyer =
    Boolean(user && order && order.buyerId === user.id) && !isSeller;

  const canReview = Boolean(
    isBuyer && order?.status === "completed" && order.sellerId,
  );
  const reviewQuery = useOrderReview(orderId, canReview);

  // Ask once per deal. After that the buyer finds the button in the panel.
  useEffect(() => {
    if (
      canReview &&
      reviewQuery.isSuccess &&
      !reviewQuery.data &&
      !wasReviewAsked(orderId)
    ) {
      markReviewAsked(orderId);
      setModal("review");
    }
  }, [canReview, reviewQuery.isSuccess, reviewQuery.data, orderId]);

  // The buyer gets the seller's instruction until they press «Понятно».
  const instruction = order?.deliveryInstruction?.trim() || null;
  const showInstruction = Boolean(
    isBuyer && instruction && order && isDealActive(order.status),
  );
  useEffect(() => {
    if (showInstruction && !wasInstructionSeen(orderId)) {
      setModal((current) => current ?? "instruction");
    }
  }, [showInstruction, orderId]);

  const format = useMemo(
    () => parseFulfillmentFormat(order?.fulfillmentFormat),
    [order?.fulfillmentFormat],
  );

  const steps = useMemo(
    () => (order ? buildDealSteps(order) : []),
    [order],
  );

  const pending =
    fulfill.isPending ||
    confirm.isPending ||
    cancel.isPending ||
    dispute.isPending ||
    postMessage.isPending;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (orderQuery.isLoading) {
    return (
      <section className={styles["order-page"]}>
        <ListPageSkeleton rows={5} />
      </section>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <section className={styles["order-page"]}>
        <p className={styles["order-page__empty"]}>Заказ не найден</p>
        <Link href="/profile?tab=purchases">К покупкам</Link>
      </section>
    );
  }

  const backHref = isSeller ? "/profile?tab=sales" : "/profile?tab=purchases";
  const counterpart = order.counterpartyUsername?.trim() || "Контрагент";
  const closed =
    order.status === "completed" ||
    order.status === "cancelled" ||
    order.status === "refunded";
  const chatLocked = closed;
  const showFrozenBadge = isFundsFrozenStatus(order.status);
  const handoverDeadline = deadlineOf(
    order.status === "awaiting_fulfillment" || order.status === "paid"
      ? order.paidAt
      : null,
    format?.deadlineHours,
  );
  const orderData =
    isBuyer || isSeller
      ? orderDataFor(order, isSeller ? "seller" : "buyer")
      : null;

  function onSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || chatLocked || postMessage.isPending) {
      return;
    }

    setError(null);
    postMessage.mutate(text, {
      onSuccess: () => setDraft(""),
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  function onConfirm() {
    if (!order) {
      return;
    }
    setError(null);
    confirm.mutate(order.id, {
      onSuccess: () => {
        markReviewAsked(order.id);
        setModal("review");
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  function onFulfill() {
    if (!order) {
      return;
    }
    setError(null);
    fulfill.mutate(
      { id: order.id },
      { onError: (err) => setError(getErrorMessage(err)) },
    );
  }

  function onCancelConfirm() {
    if (!order) {
      return;
    }
    setError(null);
    cancel.mutate(order.id, {
      onSuccess: () => {
        setModal(null);
        setToast("Заказ отменён.");
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  function onDisputeSubmit() {
    if (!order) {
      return;
    }
    if (!disputeGround) {
      setError("Выберите основание спора");
      return;
    }

    setError(null);
    dispute.mutate(
      {
        id: order.id,
        ground: disputeGround,
        comment: disputeComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setModal(null);
          setDisputeGround(null);
          setDisputeComment("");
          setToast("Спор открыт. Обращение ушло в поддержку.");
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  return (
    <section className={styles["order-page"]}>
      <p className={styles["order-page__crumbs"]}>
        <Link href="/">Главная</Link>
        {" / "}
        <Link href={backHref}>{isSeller ? "Продажи" : "Покупки"}</Link>
        {" / "}
        Сделка #{order.code}
      </p>

      <div className={styles["order-page__title-row"]}>
        <h1 className={styles["order-page__title"]}>Сделка #{order.code}</h1>
        <span className={styles["order-page__badge"]}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {isDealActive(order.status) && order.status !== "pending_payment" ? (
        <div className={styles["order-page__timer-card"]}>
          <div>
            <p className={styles["order-page__timer-label"]}>Статус сделки</p>
            <p className={styles["order-page__timer-value"]}>
              {STATUS_LABEL[order.status]}
            </p>
          </div>
          <div className={styles["order-page__timer-meta"]}>
            <span className={styles["order-page__online"]}>
              {isSeller ? "Покупатель" : "Продавец"}: {counterpart}
            </span>
            {handoverDeadline ? (
              <span
                className={cx(
                  styles["order-page__deadline"],
                  handoverDeadline.overdue &&
                    styles["order-page__deadline--overdue"],
                )}
              >
                {handoverDeadline.overdue
                  ? "Срок передачи истёк"
                  : `${isSeller ? "Передайте товар" : "Продавец передаст товар"} до ${handoverDeadline.text}`}
              </span>
            ) : null}
            {isBuyer ? (
              <button
                type="button"
                className={styles["order-page__primary-btn"]}
                disabled={pending}
                onClick={onConfirm}
              >
                Завершить сделку
              </button>
            ) : null}
            {isSeller &&
            order.fulfillmentMode !== "instant" &&
            (order.status === "awaiting_fulfillment" ||
              order.status === "paid") ? (
              <button
                type="button"
                className={styles["order-page__primary-btn"]}
                disabled={pending}
                onClick={onFulfill}
              >
                Я выполнил
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles["order-page__product-card"]}>
        {order.image ? (
          <img
            className={styles["order-page__product-image"]}
            src={order.image}
            alt=""
            width={72}
            height={54}
          />
        ) : (
          <span
            className={styles["order-page__product-image"]}
            aria-hidden
          />
        )}
        <div>
          <p className={styles["order-page__product-price"]}>
            {formatMoney(order.price)}
          </p>
          <p className={styles["order-page__product-title"]}>{order.title}</p>
          <div className={styles["order-page__product-meta"]}>
            <span>
              {isSeller ? "Покупатель" : "Продавец"}: {counterpart}
            </span>
            <span>
              {order.fulfillmentMode === "instant"
                ? "Мгновенная выдача"
                : "Передача данных"}
            </span>
          </div>
        </div>
        <div className={styles["order-page__product-actions"]}>
          {instruction ? (
            <button
              type="button"
              className={styles["order-page__data-btn"]}
              onClick={() => setModal("instruction")}
            >
              <LineIcon name="note" />
              Инструкция
            </button>
          ) : null}
          {orderData ? (
            <button
              type="button"
              className={styles["order-page__data-btn"]}
              onClick={() => setModal("data")}
            >
              <KeyIcon />
              {orderData.title}
            </button>
          ) : null}
          {order.productSlug ? (
            <Link
              className={styles["order-page__secondary-btn"]}
              href={`/product/${order.productSlug}`}
            >
              Открыть товар
            </Link>
          ) : null}
        </div>
      </div>

      <div className={styles["order-page__grid"]}>
        <aside className={styles["order-page__panel"]}>
          <h2 className={styles["order-page__panel-title"]}>
            Прогресс безопасной сделки
          </h2>

          {order.status === "cancelled" || order.status === "refunded" ? (
            <div className={styles["order-page__status-box"]}>
              <p className={styles["order-page__status-box-label"]}>
                Статус сделки
              </p>
              <p className={styles["order-page__status-box-text"]}>
                Сделка завершена со статусом:{" "}
                {order.status === "cancelled"
                  ? "Отменена покупателем"
                  : "Возврат"}
              </p>
            </div>
          ) : order.status === "disputed" ? (
            <div className={styles["order-page__status-box"]}>
              <p className={styles["order-page__status-box-label"]}>
                Статус сделки
              </p>
              <p className={styles["order-page__status-box-text"]}>
                Открыт спор
                {order.disputeReason ? `: ${order.disputeReason}` : ""}
              </p>
            </div>
          ) : (
            <ol className={styles["order-page__steps"]}>
              {steps.map((step) => (
                <li
                  key={step.key}
                  className={`${styles["order-page__step"]} ${
                    step.state === "done"
                      ? styles["order-page__step-done"]
                      : step.state === "current"
                        ? styles["order-page__step--current"]
                        : styles["order-page__step--todo"]
                  }`}
                >
                  <span className={styles["order-page__step-rail"]} aria-hidden>
                    <span className={styles["order-page__step-dot"]} />
                  </span>
                  <div>
                    <p className={styles["order-page__step-label"]}>
                      {step.label}
                    </p>
                    {step.at ? (
                      <p className={styles["order-page__step-time"]}>
                        {formatDealStamp(step.at)}
                      </p>
                    ) : null}
                    {step.state === "current" && step.description ? (
                      <p className={styles["order-page__step-desc"]}>
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {isBuyer && order.status === "pending_payment" ? (
            <div className={styles["order-page__panel-actions"]}>
              {payByOf(order.createdAt) ? (
                <p className={styles["order-page__pay-hint"]}>
                  Оплатите до {payByOf(order.createdAt)}. Потом заказ
                  отменится, а товар вернётся в продажу.
                </p>
              ) : null}
              <button
                type="button"
                className={styles["order-page__danger-link"]}
                disabled={pending}
                onClick={() => setModal("cancel")}
              >
                Отменить заказ
              </button>
            </div>
          ) : null}

          {isDealActive(order.status) && order.status !== "pending_payment" ? (
            <div className={styles["order-page__panel-actions"]}>
              <button
                type="button"
                className={`${styles["order-page__secondary-btn"]} ${styles["order-page__dispute-btn"]}`}
                disabled={pending}
                onClick={() => setModal("dispute-confirm")}
              >
                Открыть спор
              </button>
            </div>
          ) : null}

          {isBuyer && order.status === "completed" && order.sellerId ? (
            <OrderReview
              orderId={order.id}
              onWrite={() => setModal("review")}
            />
          ) : null}
        </aside>

        <div className={styles["order-page__panel"]}>
          <h2 className={styles["order-page__panel-title"]}>Чат сделки</h2>
          <div className={styles["order-page__chat-head"]}>
            <span className={styles["order-page__badge"]}>
              {showFrozenBadge
                ? "Средства заморожены"
                : STATUS_LABEL[order.status]}
            </span>
            <p className={styles["order-page__chat-head-title"]}>
              {order.title}
            </p>
          </div>

          <div
            className={styles["order-page__messages"]}
            role="log"
            aria-live="polite"
          >
            {messagesQuery.isLoading && messages.length === 0 ? (
              <p className={styles["order-page__system"]}>Загрузка…</p>
            ) : messages.length === 0 ? (
              <p className={styles["order-page__system"]}>Сообщений пока нет</p>
            ) : (
              messages.map((message, index) => {
                const { first, last } = runs[index];

                if (message.authorRole === "system") {
                  return (
                    <p
                      key={message.id}
                      className={styles["order-page__system"]}
                    >
                      {message.text}
                      {message.createdAt
                        ? ` — ${formatDealStamp(message.createdAt)}`
                        : ""}
                    </p>
                  );
                }

                const mine = message.authorId === user?.id;
                const name = mine
                  ? "Вы"
                  : message.authorRole === "seller"
                    ? isSeller
                      ? "Вы"
                      : counterpart
                    : isBuyer
                      ? "Вы"
                      : counterpart;

                return (
                  <div
                    key={message.id}
                    className={cx(
                      mine
                        ? styles["order-page__row-right"]
                        : styles["order-page__row-left"],
                      !first && styles["order-page__row--follow"],
                      !last && styles["order-page__row--more"],
                    )}
                  >
                    {first ? (
                      <p className={styles["order-page__author"]}>{name}</p>
                    ) : null}
                    <p className={styles["order-page__bubble"]}>
                      {message.text}
                    </p>
                    {last ? (
                      <p className={styles["order-page__time"]}>
                        {new Date(message.createdAt).toLocaleTimeString(
                          "ru-RU",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {!chatLocked ? (
            <form className={styles["order-page__composer"]} onSubmit={onSend}>
              <input
                className={styles["order-page__input"]}
                value={draft}
                placeholder="Введите сообщение..."
                aria-label="Сообщение"
                disabled={postMessage.isPending}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button
                type="submit"
                className={styles["order-page__primary-btn"]}
                disabled={pending || !draft.trim()}
              >
                Отправить
              </button>
            </form>
          ) : (
            <p className={styles["order-page__system"]}>
              Переписка только для чтения
            </p>
          )}
        </div>
      </div>

      {error ? (
        <p className={styles["order-page__error"]} role="alert">
          {error}
        </p>
      ) : null}

      {modal === "review" && order.sellerId ? (
        <ReviewModal
          orderId={order.id}
          sellerName={order.counterpartyUsername}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal === "instruction" && instruction ? (
        <div
          className={styles["order-page__overlay"]}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="instruction-title"
          aria-describedby="instruction-text"
        >
          <div
            className={cx(
              styles["order-page__modal"],
              styles["order-page__modal--data"],
            )}
          >
            <h2
              id="instruction-title"
              className={styles["order-page__modal-title"]}
            >
              {isSeller ? "Ваша инструкция покупателю" : "Как получить товар"}
            </h2>
            <p className={styles["order-page__modal-text"]}>
              {isSeller
                ? "Покупатель видит её на странице сделки."
                : "Инструкция от продавца. Если что-то не получается, напишите ему в чат сделки. Не платите и не передавайте данные вне Playnox."}
            </p>
            <p
              id="instruction-text"
              className={styles["order-page__instruction"]}
            >
              {instruction}
            </p>
            <div className={styles["order-page__modal-actions"]}>
              <button
                type="button"
                className={styles["order-page__primary-btn"]}
                autoFocus
                onClick={() => {
                  if (isBuyer) {
                    markInstructionSeen(orderId);
                  }
                  setModal(null);
                }}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === "data" && orderData ? (
        <OrderDataModal
          data={orderData}
          onClose={() => setModal(null)}
          onCopied={(ok) => setToast(ok ? "Скопировано" : "Не удалось скопировать")}
        />
      ) : null}

      {modal === "cancel" ? (
        <DealModal
          title="Отменить заказ"
          text="Заказ ещё не оплачен. Отменить его?"
          onClose={() => setModal(null)}
          secondaryLabel="Назад"
          onSecondary={() => setModal(null)}
          primaryLabel="Отменить заказ"
          onPrimary={onCancelConfirm}
          primaryPending={cancel.isPending}
        />
      ) : null}

      {modal === "dispute-confirm" ? (
        <DealModal
          title="Открыть спор"
          text="Вы уверены, что хотите открыть спор по этой сделке? Модератор рассмотрит обращение и примет решение."
          onClose={() => setModal(null)}
          secondaryLabel="Отмена"
          onSecondary={() => setModal(null)}
          primaryLabel="Открыть спор"
          onPrimary={() => {
            setError(null);
            setModal("dispute-reason");
          }}
        />
      ) : null}

      {modal === "dispute-reason" ? (
        <div
          className={styles["order-page__overlay"]}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles["order-page__modal"]}>
            <button
              type="button"
              className={styles["order-page__modal-close"]}
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              ×
            </button>
            <h2 className={styles["order-page__modal-title"]}>Причина спора</h2>
            <p className={styles["order-page__modal-text"]}>
              Выберите основание. Модератор рассмотрит спор и вернёт деньги
              покупателю или выплатит продавцу.
            </p>
            <fieldset className={styles["order-page__grounds"]}>
              <legend className={styles["order-page__grounds-legend"]}>
                Основание спора
              </legend>
              {disputeGroundsFor(isBuyer ? "buyer" : "seller").map((ground) => (
                <label key={ground.id} className={styles["order-page__ground"]}>
                  <input
                    type="radio"
                    name="dispute-ground"
                    value={ground.id}
                    checked={disputeGround === ground.id}
                    onChange={() => setDisputeGround(ground.id)}
                  />
                  {ground.label}
                </label>
              ))}
            </fieldset>
            <textarea
              className={styles["order-page__textarea"]}
              value={disputeComment}
              aria-label="Комментарий к спору"
              placeholder="Комментарий для модератора, необязательно"
              maxLength={2000}
              onChange={(event) => setDisputeComment(event.target.value)}
            />
            <div className={styles["order-page__modal-actions"]}>
              <button
                type="button"
                className={styles["order-page__ghost-btn"]}
                onClick={() => setModal("dispute-confirm")}
              >
                Назад
              </button>
              <button
                type="button"
                className={styles["order-page__primary-btn"]}
                disabled={dispute.isPending || !disputeGround}
                onClick={onDisputeSubmit}
              >
                {dispute.isPending ? "Отправляем…" : "Отправить спор"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={styles["order-page__toast"]} role="status">
          {toast}
        </div>
      ) : null}
    </section>
  );
}

function DealModal({
  title,
  text,
  onClose,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryPending,
}: {
  title: string;
  text: string;
  onClose: () => void;
  secondaryLabel: string;
  secondaryHref?: string;
  onSecondary?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryPending?: boolean;
}) {
  return (
    <div
      className={styles["order-page__overlay"]}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles["order-page__modal"]}>
        <button
          type="button"
          className={styles["order-page__modal-close"]}
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className={styles["order-page__modal-title"]}>{title}</h2>
        <p className={styles["order-page__modal-text"]}>{text}</p>
        <div className={styles["order-page__modal-actions"]}>
          {secondaryHref ? (
            <Link
              className={styles["order-page__ghost-btn"]}
              href={secondaryHref}
            >
              {secondaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={styles["order-page__ghost-btn"]}
              onClick={onSecondary ?? onClose}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            className={styles["order-page__primary-btn"]}
            disabled={primaryPending}
            onClick={onPrimary}
          >
            {primaryPending ? "…" : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
