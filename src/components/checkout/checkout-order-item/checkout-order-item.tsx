import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import type { CheckoutCartItem } from "@/lib/mock/checkout";
import { formatPrice } from "@/lib/mock/products";
import styles from "./checkout-order-item.module.css";

interface CheckoutOrderItemProps {
  item: CheckoutCartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CheckoutOrderItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CheckoutOrderItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <article className={styles.item}>
      <div className={styles.topRow}>
        <div className={styles.imageWrap}>
          <Image
            src={item.image}
            alt=""
            fill
            className={styles.image}
            sizes="72px"
          />
        </div>

        <div className={styles.info}>
          <span className={styles.category}>{item.category}</span>
          <p className={styles.title}>{item.title}</p>
          {item.subtitle ? <p className={styles.subtitle}>{item.subtitle}</p> : null}
        </div>

        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Удалить ${item.title} из заказа`}
        >
          <Icon
            src="/assets/modal-close.svg"
            width={24}
            height={24}
            className={styles.removeIcon}
          />
        </button>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.quantityControl}>
          <button
            type="button"
            className={styles.quantityButton}
            onClick={onDecrease}
            disabled={item.quantity <= 1}
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button
            type="button"
            className={styles.quantityButton}
            onClick={onIncrease}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
        <span className={styles.price}>{formatPrice(lineTotal)} ₽</span>
      </div>
    </article>
  );
}
