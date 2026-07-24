"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import {
  sellerTermsProhibited,
  sellerTermsRequirements,
  type SellerTermItem,
} from "@/lib/mock/seller";
import styles from "./seller-terms-modal.module.css";

interface SellerTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

function createCheckedState(items: SellerTermItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, false])) as Record<string, boolean>;
}

function TermRow({
  item,
  checked,
  onToggle,
}: {
  item: SellerTermItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.item}>
      <div className={styles.itemContent}>
        <Icon
          src={item.dotIcon}
          width={8}
          height={8}
          className={styles.dot}
          aria-hidden
        />
        <p className={styles.itemText}>{item.label}</p>
      </div>
      <button
        type="button"
        className={`${styles.checkbox} ${checked ? styles.checkboxChecked : styles.checkboxUnchecked}`}
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={item.label}
      >
        {checked ? (
          <Icon
            src="/assets/checkmark-white.svg"
            width={12}
            height={9}
            className={styles.checkIcon}
          />
        ) : null}
      </button>
    </div>
  );
}

export function SellerTermsModal({ isOpen, onClose, onAccept }: SellerTermsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const allItems = [...sellerTermsRequirements, ...sellerTermsProhibited];
  const allChecked = allItems.every((item) => checkedItems[item.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCheckedItems(createCheckedState(allItems));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-terms-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="seller-terms-title" className={styles.title}>
            Условия продажи
          </h2>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className={styles.body}>
          <section className={styles.block} aria-label="Требования">
            <h3 className={styles.blockTitle}>Требования</h3>
            <div className={styles.items}>
              {sellerTermsRequirements.map((item) => (
                <TermRow
                  key={item.id}
                  item={item}
                  checked={checkedItems[item.id]}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </section>

          <section className={styles.block} aria-label="Запрещено">
            <h3 className={styles.blockTitle}>Запрещено</h3>
            <div className={styles.items}>
              {sellerTermsProhibited.map((item) => (
                <TermRow
                  key={item.id}
                  item={item}
                  checked={checkedItems[item.id]}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </section>
        </div>

        <p className={styles.agreement}>
          Продолжая, вы принимаете{" "}
          <Link href="/terms/sales" className={styles.agreementLink} onClick={onClose}>
            Условия продажи
          </Link>
        </p>

        <div className={styles.footer}>
          <Button
            type="button"
            variant="gradient"
            fullWidth
            large
            className={styles.acceptButton}
            disabled={!allChecked}
            onClick={onAccept}
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
