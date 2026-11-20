"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { cx } from "@/lib/cx";
import styles from "@/styles/notifications-menu.module.scss";

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const minutes = Math.round((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} ч назад`;

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Bell with a dropdown list. In the phone menu it opens in place. */
export function NotificationsMenu({
  buttonClassName,
  label,
  inline = false,
  onNavigate,
  children,
}: {
  buttonClassName: string;
  label: string;
  inline?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Unread at the moment of opening: they stay highlighted while the list is open.
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const notificationsQuery = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();
  const items = notificationsQuery.data?.items ?? [];
  const unread = notificationsQuery.data?.unread ?? 0;

  useEffect(() => {
    if (!open || inline) {
      return undefined;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, inline]);

  function toggle() {
    if (!open) {
      setFresh(new Set(items.filter((item) => !item.read).map((item) => item.id)));

      if (unread > 0) {
        markRead(undefined);
      }
    }

    setOpen(!open);
  }

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div
      ref={rootRef}
      className={cx(
        styles["notifications-menu"],
        inline && styles["notifications-menu--inline"],
      )}
    >
      <button
        className={buttonClassName}
        type="button"
        aria-label={unread > 0 ? `${label}, непрочитанных: ${unread}` : label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        {children}
      </button>

      {open ? (
        <div
          id={panelId}
          className={styles["notifications-menu__panel"]}
          role="region"
          aria-label="Уведомления"
        >
          <div className={styles["notifications-menu__head"]}>
            <p className={styles["notifications-menu__title"]}>Уведомления</p>
            <Link
              className={styles["notifications-menu__settings"]}
              href="/profile/notifications"
              onClick={close}
            >
              Настройки писем
            </Link>
          </div>

          {notificationsQuery.isLoading ? (
            <p className={styles["notifications-menu__empty"]}>Загрузка…</p>
          ) : items.length === 0 ? (
            <p className={styles["notifications-menu__empty"]}>
              Уведомлений пока нет
            </p>
          ) : (
            <ul className={styles["notifications-menu__list"]}>
              {items.map((item) => {
                const isNew = !item.read || fresh.has(item.id);
                const body = (
                  <>
                    <span
                      className={styles["notifications-menu__dot"]}
                      aria-hidden
                    />
                    <span className={styles["notifications-menu__text"]}>
                      <span className={styles["notifications-menu__item-title"]}>
                        {isNew ? (
                          <span className={styles["notifications-menu__sr"]}>
                            Новое:{" "}
                          </span>
                        ) : null}
                        {item.title}
                      </span>
                      {item.text ? (
                        <span
                          className={styles["notifications-menu__item-text"]}
                        >
                          {item.text}
                        </span>
                      ) : null}
                      <span className={styles["notifications-menu__time"]}>
                        {formatTime(item.createdAt)}
                      </span>
                    </span>
                  </>
                );
                const rowClass = cx(
                  styles["notifications-menu__item"],
                  isNew && styles["notifications-menu__item--new"],
                );

                return (
                  <li key={item.id}>
                    {item.link ? (
                      <Link className={rowClass} href={item.link} onClick={close}>
                        {body}
                      </Link>
                    ) : (
                      <div className={rowClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
