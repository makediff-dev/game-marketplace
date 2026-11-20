"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { SelectField } from "@/components/select-field";
import {
  useCloseSupportTicket,
  useCreateSupportTicket,
  usePostSupportMessage,
  useSupportMessages,
  useSupportTickets,
  useSupportTopics,
} from "@/hooks/use-support-chat";
import {
  chatRuns,
  formatMessageTime,
  formatSystemStamp,
  type TChatRun,
} from "@/lib/chat";
import { markChatRead } from "@/lib/chat-unread";
import { cx } from "@/lib/cx";
import chat from "@/styles/chat-page.module.scss";
import fields from "@/styles/fulfillment-fields.module.scss";
import styles from "@/styles/support-pane.module.scss";
import type { TOrder } from "@/types/orders";
import type {
  TSupportChatMessage,
  TSupportTicket,
  TSupportTicketStatus,
} from "@/types/support";

export const STATUS_LABEL: Record<TSupportTicketStatus, string> = {
  open: "Ждёт ответа",
  answered: "Есть ответ",
  closed: "Закрыто",
};

/** Read marks are kept per ticket, next to the deal chats. */
export const supportReadKey = (ticketId: number) => `support-${ticketId}`;

const orderLabel = (order: TOrder) => `${order.code} · ${order.title}`;

type TView = { kind: "list" } | { kind: "new" } | { kind: "ticket"; id: number };

export function SupportPane({ orders }: { orders: TOrder[] }) {
  const ticketsQuery = useSupportTickets(true, true);
  const [view, setView] = useState<TView>({ kind: "list" });
  // The ticket just created, until the list catches up.
  const [created, setCreated] = useState<TSupportTicket | null>(null);
  const tickets = ticketsQuery.data ?? [];

  if (view.kind === "new") {
    return (
      <NewTicketForm
        orders={orders}
        onCancel={() => setView({ kind: "list" })}
        onCreated={(ticket) => {
          setCreated(ticket);
          setView({ kind: "ticket", id: ticket.id });
        }}
      />
    );
  }

  if (view.kind === "ticket") {
    const ticket =
      tickets.find((item) => item.id === view.id) ??
      (created?.id === view.id ? created : null);

    if (ticket) {
      return (
        <TicketView
          ticket={ticket}
          orders={orders}
          onBack={() => setView({ kind: "list" })}
          onNew={() => setView({ kind: "new" })}
        />
      );
    }
  }

  return (
    <>
      <div className={chat["chat-page__conversation-head"]}>
        <p className={chat["chat-page__deal-title"]}>Поддержка Playnox</p>
        <Link className={chat["chat-page__open-deal"]} href="/support">
          FAQ
        </Link>
      </div>

      <div className={styles["support-pane__body"]}>
        <button
          type="button"
          className={styles["support-pane__new"]}
          onClick={() => setView({ kind: "new" })}
        >
          Новое обращение
        </button>

        {ticketsQuery.isLoading ? (
          <p className={chat["chat-page__system"]}>Загрузка обращений…</p>
        ) : ticketsQuery.isError ? (
          <p className={chat["chat-page__system"]}>
            Не удалось загрузить обращения
          </p>
        ) : tickets.length === 0 ? (
          <p className={styles["support-pane__empty"]}>
            Обращений пока нет. Опишите вопрос — поддержка ответит здесь, а
            каждое новое обращение будет отдельной перепиской.
          </p>
        ) : (
          <ul className={styles["support-pane__list"]}>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  className={styles["support-pane__ticket"]}
                  onClick={() => setView({ kind: "ticket", id: ticket.id })}
                >
                  <span className={styles["support-pane__ticket-top"]}>
                    <span className={styles["support-pane__ticket-title"]}>
                      №{ticket.id} · {ticket.topicName || "Обращение"}
                    </span>
                    <StatusChip status={ticket.status} />
                  </span>
                  {ticket.orderCode ? (
                    <span className={styles["support-pane__ticket-order"]}>
                      Заказ {ticket.orderCode}
                    </span>
                  ) : null}
                  <span className={styles["support-pane__ticket-preview"]}>
                    {ticket.lastMessagePreview || "—"}
                  </span>
                  {ticket.lastMessageAt ? (
                    <span className={styles["support-pane__ticket-time"]}>
                      {formatSystemStamp(ticket.lastMessageAt)}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function StatusChip({ status }: { status: TSupportTicketStatus }) {
  return (
    <span
      className={cx(
        styles["support-pane__status"],
        styles[`support-pane__status--${status}`],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function NewTicketForm({
  orders,
  onCancel,
  onCreated,
}: {
  orders: TOrder[];
  onCancel: () => void;
  onCreated: (ticket: TSupportTicket) => void;
}) {
  const topicsQuery = useSupportTopics();
  const create = useCreateSupportTicket();
  const topics = topicsQuery.data ?? [];
  const [topicName, setTopicName] = useState("");
  const [orderName, setOrderName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const topic = topics.find((item) => item.name === topicName) ?? null;
  const orderOptions = useMemo(() => orders.map(orderLabel), [orders]);
  const order = orders.find((item) => orderLabel(item) === orderName) ?? null;
  const needsOrder = Boolean(topic?.needsOrder);

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!topic) {
      setError("Выберите тему обращения");
      return;
    }
    if (needsOrder && !order) {
      setError("Выберите заказ, по которому вопрос");
      return;
    }
    if (!text.trim()) {
      setError("Опишите вопрос");
      return;
    }

    setError(null);
    create.mutate(
      { topicId: topic.id, orderCode: order?.code, text: text.trim() },
      {
        onSuccess: (ticket) => {
          markChatRead(supportReadKey(ticket.id));
          onCreated(ticket);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  return (
    <>
      <div className={chat["chat-page__conversation-head"]}>
        <button
          type="button"
          className={styles["support-pane__back"]}
          onClick={onCancel}
        >
          ← Обращения
        </button>
        <p className={chat["chat-page__deal-title"]}>Новое обращение</p>
      </div>

      <form
        className={cx(
          fields["fulfillment-fields"],
          fields["fulfillment-fields--raised"],
          styles["support-pane__form"],
        )}
        onSubmit={onSubmit}
        noValidate
      >
        <div className={fields["fulfillment-fields__field"]}>
          <label
            className={fields["fulfillment-fields__label"]}
            htmlFor="support-topic"
          >
            Тема
          </label>
          <SelectField
            id="support-topic"
            value={topicName}
            options={topics.map((item) => item.name)}
            placeholder={topicsQuery.isLoading ? "Загрузка…" : "Выберите тему"}
            required
            invalid={false}
            onChange={setTopicName}
          />
        </div>

        <div className={fields["fulfillment-fields__field"]}>
          <label
            className={fields["fulfillment-fields__label"]}
            htmlFor="support-order"
          >
            Заказ{" "}
            {needsOrder ? null : (
              <span className={fields["fulfillment-fields__optional"]}>
                (необязательно)
              </span>
            )}
          </label>
          {orders.length > 0 ? (
            <SelectField
              id="support-order"
              value={orderName}
              options={orderOptions}
              placeholder={needsOrder ? "Выберите заказ" : "Без заказа"}
              required={needsOrder}
              invalid={false}
              onChange={setOrderName}
            />
          ) : (
            <p className={fields["fulfillment-fields__hint"]}>
              {needsOrder
                ? "У вас пока нет заказов. Выберите другую тему."
                : "У вас пока нет заказов."}
            </p>
          )}
        </div>

        <div className={fields["fulfillment-fields__field"]}>
          <label
            className={fields["fulfillment-fields__label"]}
            htmlFor="support-text"
          >
            Вопрос
          </label>
          <textarea
            id="support-text"
            className={cx(
              fields["fulfillment-fields__input"],
              fields["fulfillment-fields__input--area"],
            )}
            rows={5}
            maxLength={2000}
            value={text}
            placeholder="Опишите, что случилось. Если есть номер транзакции или скриншот — укажите, где его найти."
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        {error ? (
          <p className={fields["fulfillment-fields__error"]} role="alert">
            {error}
          </p>
        ) : null}

        <button
          className={cx(chat["chat-page__send"], styles["support-pane__submit"])}
          type="submit"
          disabled={create.isPending}
        >
          {create.isPending ? "Отправляем…" : "Отправить"}
        </button>
      </form>
    </>
  );
}

function TicketView({
  ticket,
  orders,
  onBack,
  onNew,
}: {
  ticket: TSupportTicket;
  orders: TOrder[];
  onBack: () => void;
  onNew: () => void;
}) {
  const messagesQuery = useSupportMessages(ticket.id);
  const postMessage = usePostSupportMessage(ticket.id);
  const close = useCloseSupportTicket(ticket.id);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messages = messagesQuery.data ?? [];
  const runs = chatRuns(messages);
  const closed = ticket.status === "closed";
  const order = ticket.orderCode
    ? orders.find((item) => item.code === ticket.orderCode)
    : undefined;

  useEffect(() => {
    markChatRead(supportReadKey(ticket.id));
  }, [ticket.id, messages.length]);

  function onSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || postMessage.isPending) {
      return;
    }

    setError(null);
    postMessage.mutate(text, {
      onSuccess: () => {
        setDraft("");
        markChatRead(supportReadKey(ticket.id));
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  function onClose() {
    setError(null);
    close.mutate(undefined, {
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  return (
    <>
      <div className={chat["chat-page__conversation-head"]}>
        <button
          type="button"
          className={styles["support-pane__back"]}
          onClick={onBack}
        >
          ← Обращения
        </button>
        <p className={chat["chat-page__deal-title"]}>
          №{ticket.id} · {ticket.topicName || "Обращение"}
          {ticket.orderCode ? (
            <>
              {" · "}
              {order ? (
                <Link href={`/orders/${order.id}`}>{ticket.orderCode}</Link>
              ) : (
                ticket.orderCode
              )}
            </>
          ) : null}
        </p>
        <span className={styles["support-pane__head-status"]}>
          <StatusChip status={ticket.status} />
        </span>
      </div>

      <div className={chat["chat-page__messages"]} role="log" aria-live="polite">
        {messagesQuery.isLoading && messages.length === 0 ? (
          <p className={chat["chat-page__system"]}>Загрузка сообщений…</p>
        ) : (
          messages.map((message, index) => (
            <SupportMessageBubble
              key={message.id}
              message={message}
              run={runs[index]}
            />
          ))
        )}
        {closed ? (
          <p className={chat["chat-page__closed-banner"]} role="status">
            Обращение №{ticket.id} закрыто
          </p>
        ) : null}
      </div>

      {closed ? (
        <div className={chat["chat-page__note"]}>
          <button
            type="button"
            className={styles["support-pane__link"]}
            onClick={onNew}
          >
            Создать новое обращение
          </button>
        </div>
      ) : (
        <>
          <form className={chat["chat-page__composer"]} onSubmit={onSend}>
            <input
              className={chat["chat-page__input"]}
              type="text"
              value={draft}
              placeholder="Введите сообщение..."
              aria-label="Сообщение"
              maxLength={2000}
              disabled={postMessage.isPending}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              className={chat["chat-page__send"]}
              type="submit"
              disabled={postMessage.isPending || !draft.trim()}
            >
              {postMessage.isPending ? "…" : "Отправить"}
            </button>
          </form>
          <button
            type="button"
            className={styles["support-pane__resolve"]}
            onClick={onClose}
            disabled={close.isPending}
          >
            Вопрос решён — закрыть обращение
          </button>
        </>
      )}
      {error ? (
        <p className={chat["chat-page__error"]} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

function SupportMessageBubble({
  message,
  run,
}: {
  message: TSupportChatMessage;
  run: TChatRun;
}) {
  if (message.authorRole === "system") {
    return (
      <p className={chat["chat-page__system"]}>
        {message.text}
        {message.createdAt ? ` — ${formatSystemStamp(message.createdAt)}` : ""}
      </p>
    );
  }

  const mine = message.authorRole === "user";

  return (
    <div
      className={cx(
        mine ? chat["chat-page__row-right"] : chat["chat-page__row-left"],
        !run.first && chat["chat-page__row--follow"],
        !run.last && chat["chat-page__row--more"],
      )}
    >
      {run.first ? (
        <p className={chat["chat-page__author"]}>{mine ? "Вы" : "Поддержка"}</p>
      ) : null}
      <p className={chat["chat-page__bubble"]}>{message.text}</p>
      {run.last ? (
        <p className={chat["chat-page__time"]}>
          {formatMessageTime(message.createdAt)}
        </p>
      ) : null}
    </div>
  );
}
