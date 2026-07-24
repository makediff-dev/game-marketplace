import type { OrderDetail } from "@/lib/mock/orders";
import styles from "./order-deal-chat.module.css";

interface OrderDealChatProps {
  order: OrderDetail;
}

export function OrderDealChat({ order }: OrderDealChatProps) {
  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <span className={styles.dealBadge}>{order.dealStatusLabel}</span>
          <span className={styles.productTitle}>{order.title}</span>
        </div>
      </header>

      <div className={styles.messages}>
        {order.chat.systemMessages.map((message) => (
          <p key={message.id} className={styles.systemMessage}>
            {message.text}
          </p>
        ))}
        {order.chat.messages.map((message) => (
          <article
            key={message.id}
            className={message.isOwn ? styles.messageOwn : styles.message}
          >
            <p className={styles.author}>{message.author}</p>
            <div className={message.isOwn ? styles.bubbleOwn : styles.bubble}>
              {message.text}
            </div>
            <p className={styles.time}>{message.time}</p>
          </article>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="Введите сообщение..."
          aria-label="Сообщение"
          disabled
        />
        <button type="button" className={styles.sendButton} disabled>
          Отправить
        </button>
      </div>
      <p className={styles.note}>Prototype: отправка сообщений отключена</p>
    </div>
  );
}
