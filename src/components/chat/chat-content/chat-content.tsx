"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import { chatThreads, quickReplies, supportMessages } from "@/lib/mock/chat";
import styles from "./chat-content.module.css";

export function ChatContent() {
  const [activeThread, setActiveThread] = useState("support");

  return (
    <div className={styles.chatLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Чаты</h2>
        {chatThreads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={`${styles.thread} ${activeThread === thread.id ? styles.threadActive : ""}`}
            onClick={() => setActiveThread(thread.id)}
          >
            <div className={styles.threadIcon}>
              <span aria-hidden>{thread.icon}</span>
              {thread.online ? <span className={styles.onlineDot} aria-label="Онлайн" /> : null}
            </div>
            <div className={styles.threadContent}>
              <div className={styles.threadHeader}>
                <span className={styles.threadTitle}>
                  {thread.title}
                  {thread.verified ? (
                    <Icon
                      src="/assets/verified-icon.svg"
                      alt="Верифицирован"
                      width={16}
                      height={16}
                      className={styles.verifiedIcon}
                    />
                  ) : null}
                </span>
                {thread.time ? <span className={styles.threadTime}>{thread.time}</span> : null}
                {thread.unread ? (
                  <span className={styles.unreadBadge}>{thread.unread}</span>
                ) : null}
              </div>
              <p className={styles.threadSubtitle}>{thread.subtitle}</p>
            </div>
          </button>
        ))}
      </aside>

      <section className={styles.main} aria-label="Окно чата">
        <header className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatHeaderTitle}>
              Поддержка
              <Icon
                src="/assets/verified-icon.svg"
                alt="Верифицирован"
                width={16}
                height={16}
                className={styles.verifiedIcon}
              />
            </div>
            <div className={styles.chatStatus}>
              <span className={styles.onlineDot} style={{ position: "static" }} aria-hidden />
              Работаем 24/7
            </div>
          </div>
          <button type="button" className={styles.notifyLink}>
            Включить уведомления
          </button>
        </header>

        <div className={styles.messages}>
          {supportMessages.map((message) => (
            <article key={message.id} className={styles.message}>
              <p className={styles.messageAuthor}>{message.author}</p>
              <div className={styles.messageBubble}>{message.text}</div>
              <p className={styles.messageTime}>{message.time}</p>
            </article>
          ))}
        </div>

        <div className={styles.quickReplies}>
          {quickReplies.map((reply) => (
            <button key={reply.id} type="button" className={styles.quickReply}>
              {reply.label}
            </button>
          ))}
        </div>

        <div className={styles.inputRow}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Выберите вопрос"
            aria-label="Сообщение"
          />
          <button type="button" className={styles.attachButton} aria-label="Прикрепить файл">
            📎
          </button>
        </div>
      </section>
    </div>
  );
}
