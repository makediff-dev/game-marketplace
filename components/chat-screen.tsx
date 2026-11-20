"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getErrorMessage } from "@/api/error";
import { ListPageSkeleton } from "@/components/skeleton";
import { SupportPane, supportReadKey } from "@/components/support-pane";
import {
  useMyOrders,
  useOrderMessages,
  usePostOrderMessage,
} from "@/hooks/use-orders";
import { useSupportTickets } from "@/hooks/use-support-chat";
import {
  canWriteInDeal,
  counterpartyLabel,
  dealSideLabel,
  formatMessageTime,
  formatSystemStamp,
  initialsOf,
  chatRuns,
  isChatOrderOpen,
  isFundsFrozen,
  ORDER_STATUS_LABEL,
  type TChatRun,
} from "@/lib/chat";
import { isChatUnread, markChatRead } from "@/lib/chat-unread";
import { cx } from "@/lib/cx";
import { useUserStore } from "@/store/user.store";
import styles from "@/styles/chat-page.module.scss";
import type { TOrder, TOrderChatMessage } from "@/types/orders";

export const SUPPORT_CHAT_ID = "support";

export function ChatScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);
  const ordersQuery = useMyOrders();
  const supportTicketsQuery = useSupportTickets();
  const [, setReadTick] = useState(0);

  const threads = useMemo(() => {
    const list = (ordersQuery.data ?? []).filter(isChatOrderOpen);
    return [...list].sort((a, b) => {
      const aAt = a.lastMessageAt ?? a.updatedAt ?? a.createdAt;
      const bAt = b.lastMessageAt ?? b.updatedAt ?? b.createdAt;
      return new Date(bAt).getTime() - new Date(aAt).getTime();
    });
  }, [ordersQuery.data]);

  const chatFromUrl = searchParams.get("chat") ?? searchParams.get("order");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (chatFromUrl === SUPPORT_CHAT_ID) {
      setSelectedId(SUPPORT_CHAT_ID);
      return;
    }

    if (chatFromUrl && threads.some((item) => item.id === chatFromUrl)) {
      setSelectedId(chatFromUrl);
      return;
    }

    if (!selectedId) {
      // Wait for the deals, or support wins over the latest deal.
      if (ordersQuery.isLoading) {
        return;
      }

      setSelectedId(threads[0]?.id ?? SUPPORT_CHAT_ID);
      return;
    }

    if (
      selectedId !== SUPPORT_CHAT_ID &&
      threads.length > 0 &&
      !threads.some((item) => item.id === selectedId)
    ) {
      setSelectedId(threads[0]?.id ?? SUPPORT_CHAT_ID);
    }
  }, [chatFromUrl, threads, selectedId, ordersQuery.isLoading]);

  const activeOrder =
    selectedId && selectedId !== SUPPORT_CHAT_ID
      ? (threads.find((item) => item.id === selectedId) ?? null)
      : null;
  const supportSelected = selectedId === SUPPORT_CHAT_ID;
  const supportTickets = supportTicketsQuery.data ?? [];

  function selectThread(chatId: string) {
    setSelectedId(chatId);
    markChatRead(chatId);
    setReadTick((value) => value + 1);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("order");
    params.set("chat", chatId);
    // Only the address changes; a router call would reload the dynamic page.
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  if (ordersQuery.isLoading) {
    return (
      <section className={styles["chat-page"]} aria-label="Чаты">
        <ListPageSkeleton rows={6} />
      </section>
    );
  }

  if (ordersQuery.isError) {
    return (
      <section className={styles["chat-page"]} aria-label="Чаты">
        <p className={styles["chat-page__empty-pane"]}>
          Не удалось загрузить сделки
        </p>
      </section>
    );
  }

  // Only a support reply the user has not opened yet counts.
  const supportUnread =
    !supportSelected &&
    supportTickets.some(
      (ticket) =>
        ticket.status === "answered" &&
        isChatUnread(supportReadKey(ticket.id), ticket.lastMessageAt),
    );

  return (
    <section className={styles["chat-page"]} aria-label="Чаты">
      <div className={styles["chat-page__layout"]}>
        <aside className={styles["chat-page__sidebar"]}>
          <h1 className={styles["chat-page__sidebar-title"]}>Чаты</h1>
          {threads.length === 0 ? (
            <p className={styles["chat-page__empty-list"]}>
              Пока нет сделок для переписки. Можно написать в поддержку ниже.
            </p>
          ) : null}
          <ul className={styles["chat-page__thread-list"]}>
            {threads.map((order) => {
              const name = counterpartyLabel(order);
              const side = dealSideLabel(order);
              const unread =
                order.id !== selectedId &&
                isChatUnread(order.id, order.lastMessageAt);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    className={cx(
                      styles["chat-page__thread"],
                      order.id === selectedId &&
                        styles["chat-page__thread--active"],
                    )}
                    onClick={() => selectThread(order.id)}
                    aria-current={
                      order.id === selectedId ? "true" : undefined
                    }
                  >
                    <span className={styles["chat-page__avatar-wrap"]}>
                      <span className={styles["chat-page__avatar"]} aria-hidden>
                        {initialsOf(name)}
                      </span>
                    </span>
                    <span className={styles["chat-page__thread-body"]}>
                      <span className={styles["chat-page__thread-top"]}>
                        <span className={styles["chat-page__thread-name"]}>
                          {name}
                        </span>
                        <span
                          className={
                            side === "Продажа"
                              ? styles.sideSale
                              : styles.sideBuy
                          }
                        >
                          {side}
                        </span>
                        {unread ? (
                          <span className={styles["chat-page__unread"]}>!</span>
                        ) : null}
                      </span>
                      <span className={styles["chat-page__thread-product"]}>
                        {order.title}
                      </span>
                      <span className={styles["chat-page__thread-deal"]}>
                        {order.lastMessageText?.trim() ||
                          `Сделка #${order.code || order.id}`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className={cx(
              styles["chat-page__support-link"],
              supportSelected && styles["chat-page__support-link--active"],
            )}
            onClick={() => selectThread(SUPPORT_CHAT_ID)}
            aria-current={supportSelected ? "true" : undefined}
          >
            <span className={styles["chat-page__avatar-wrap"]}>
              <span
                className={`${styles["chat-page__avatar"]} ${styles["chat-page__avatar-support"]}`}
                aria-hidden
              >
                <img src="/profile/chat.svg" alt="" width={22} height={22} />
              </span>
              <span className={styles["chat-page__presence"]} aria-hidden />
            </span>
            <span className={styles["chat-page__thread-body"]}>
              <span className={styles["chat-page__thread-top"]}>
                <span className={styles["chat-page__thread-name"]}>
                  Поддержка
                </span>
                <img
                  className={styles["chat-page__verified"]}
                  src="/assets/seal-check.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                {supportUnread ? (
                  <span className={styles["chat-page__unread"]}>!</span>
                ) : null}
              </span>
              <span className={styles["chat-page__thread-product"]}>
                {supportTickets[0]?.lastMessagePreview?.trim() ||
                  "Задать вопрос"}
              </span>
            </span>
          </button>
        </aside>

        <div className={styles["chat-page__conversation"]}>
          {supportSelected && user ? (
            <SupportPane orders={ordersQuery.data ?? []} />
          ) : activeOrder && user ? (
            <OrderConversationPane order={activeOrder} userId={user.id} />
          ) : (
            <p className={styles["chat-page__empty-pane"]}>Выберите чат</p>
          )}
        </div>
      </div>
    </section>
  );
}

function OrderConversationPane({
  order,
  userId,
}: {
  order: TOrder;
  userId: number;
}) {
  const messagesQuery = useOrderMessages(order.id);
  const postMessage = usePostOrderMessage(order.id);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messages = messagesQuery.data ?? [];
  const runs = chatRuns(messages);
  const canSend = canWriteInDeal(order.status);
  const counterpart = counterpartyLabel(order);

  useEffect(() => {
    markChatRead(order.id);
  }, [order.id, messages.length]);

  function onSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !canSend || postMessage.isPending) {
      return;
    }

    setError(null);
    postMessage.mutate(text, {
      onSuccess: () => {
        setDraft("");
        markChatRead(order.id, new Date().toISOString());
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  return (
    <>
      <div className={styles["chat-page__conversation-head"]}>
        {isFundsFrozen(order.status) ? (
          <span className={styles["chat-page__frozen"]}>
            Средства заморожены
          </span>
        ) : (
          <span className={styles["chat-page__frozen"]}>
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        )}
        <p className={styles["chat-page__deal-title"]}>
          {order.title} #{order.code || order.id}
        </p>
        <Link
          className={styles["chat-page__open-deal"]}
          href={`/orders/${order.id}`}
        >
          Открыть сделку
        </Link>
      </div>

      <div
        className={styles["chat-page__messages"]}
        role="log"
        aria-live="polite"
      >
        <p className={styles["chat-page__safety"]}>
          Playnox никогда не просит войти по ссылке из чата и не ведёт сделки в
          мессенджерах. Данные товара приходят только в эту сделку.
        </p>
        {messagesQuery.isLoading && messages.length === 0 ? (
          <p className={styles["chat-page__system"]}>Загрузка сообщений…</p>
        ) : messages.length === 0 ? (
          <p className={styles["chat-page__system"]}>Сообщений пока нет</p>
        ) : (
          messages.map((message, index) => (
            <OrderMessageBubble
              key={message.id}
              message={message}
              run={runs[index]}
              userId={userId}
              counterpart={counterpart}
            />
          ))
        )}
      </div>

      {canSend ? (
        <form className={styles["chat-page__composer"]} onSubmit={onSend}>
          <input
            className={styles["chat-page__input"]}
            type="text"
            value={draft}
            placeholder="Введите сообщение..."
            aria-label="Сообщение"
            disabled={postMessage.isPending}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            className={styles["chat-page__send"]}
            type="submit"
            disabled={postMessage.isPending || !draft.trim()}
          >
            {postMessage.isPending ? "…" : "Отправить"}
          </button>
        </form>
      ) : (
        <p className={styles["chat-page__note"]}>
          Сделка закрыта — переписка только для чтения
        </p>
      )}
      {error ? (
        <p className={styles["chat-page__error"]} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

function OrderMessageBubble({
  message,
  run,
  userId,
  counterpart,
}: {
  message: TOrderChatMessage;
  run: TChatRun;
  userId: number;
  counterpart: string;
}) {
  if (message.authorRole === "system") {
    return (
      <p className={styles["chat-page__system"]}>
        {message.text}
        {message.createdAt
          ? ` — ${formatSystemStamp(message.createdAt)}`
          : ""}
      </p>
    );
  }

  const mine = message.authorId === userId;
  const author = mine ? "Вы" : counterpart;

  return (
    <div
      className={cx(
        mine ? styles["chat-page__row-right"] : styles["chat-page__row-left"],
        !run.first && styles["chat-page__row--follow"],
        !run.last && styles["chat-page__row--more"],
      )}
    >
      {run.first ? (
        <p className={styles["chat-page__author"]}>{author}</p>
      ) : null}
      <p className={styles["chat-page__bubble"]}>{message.text}</p>
      {message.externalLink ? (
        <p className={styles["chat-page__link-warning"]} role="note">
          Внешняя ссылка. Не вводите там логин, пароль и данные карты
        </p>
      ) : null}
      {run.last ? (
        <p className={styles["chat-page__time"]}>
          {formatMessageTime(message.createdAt)}
        </p>
      ) : null}
    </div>
  );
}
