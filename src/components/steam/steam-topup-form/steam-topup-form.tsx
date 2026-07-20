"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Modal, modalStyles } from "@/components/ui/modal/modal";
import {
  currencyIcons,
  currencySymbols,
  getPlatformById,
  platforms,
  type Currency,
  type PlatformFormConfig,
} from "@/lib/mock/platforms";
import { formatPrice } from "@/lib/mock/products";
import { useToastStore } from "@/lib/store/toast-store";
import styles from "./steam-topup-form.module.css";

interface FormValues {
  login: string;
  amount: number;
}

function createFormSchema(config: PlatformFormConfig) {
  return z.object({
    login: z.string().min(3, `Введите ${config.accountLabel.toLowerCase()}`),
    amount: z
      .number({ error: "Введите сумму" })
      .min(config.minAmount, `Минимальная сумма — ${config.minAmount} ₽`),
  });
}

interface TopupFormPanelProps {
  platformId: string;
}

function TopupFormPanel({ platformId }: TopupFormPanelProps) {
  const platform = getPlatformById(platformId);
  const { form: config } = platform;
  const [currency, setCurrency] = useState<Currency>(config.currencies[0]);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const showToast = useToastStore((state) => state.show);

  const formSchema = useMemo(() => createFormSchema(config), [config]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { login: "", amount: config.defaultAmount },
  });

  const amount = watch("amount") || 0;
  const total = useMemo(
    () => Math.round(amount * (1 + config.feePercent / 100)),
    [amount, config.feePercent],
  );

  const onSubmit = (data: FormValues) => {
    showToast(
      `Заявка на пополнение ${platform.name} на ${formatPrice(data.amount)} ${currencySymbols[currency]} отправлена (прототип)`,
    );
  };

  const applyPromo = () => {
    setPromoOpen(false);
    showToast(promoCode ? `Промокод «${promoCode}» применён` : "Промокод не указан");
    setPromoCode("");
  };

  return (
    <>
      <form className={styles.formPanel} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formRow}>
          <div className={styles.headerBlock}>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>{config.title}</h2>
              <span className={styles.discountBadge}>{config.feePercent}%</span>
            </div>
            {config.showPromo ? (
              <button
                type="button"
                className={styles.promoLink}
                onClick={() => setPromoOpen(true)}
              >
                Ввести промокод
                <Icon
                  src="/assets/promo-arrow.svg"
                  width={24}
                  height={25}
                  className={styles.promoIcon}
                />
              </button>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <input
                {...register("login")}
                className={styles.fieldInput}
                placeholder={config.accountPlaceholder}
                aria-label={config.accountLabel}
              />
              <div
                className={styles.infoButton}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Icon src="/assets/info.svg" alt="Подсказка" width={24} height={24} />
                {showTooltip ? (
                  <span className={styles.infoTooltip}>{config.accountTooltip}</span>
                ) : null}
              </div>
            </div>
            {errors.login ? <span role="alert">{errors.login.message}</span> : null}

            <div className={`${styles.field} ${styles.amountField}`}>
              <div className={styles.amountBlock}>
                <span className={styles.amountLabel}>Сумма</span>
                <input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  className={styles.amountInput}
                  aria-label="Сумма пополнения"
                />
              </div>
              <div className={styles.currencyGroup} role="radiogroup" aria-label="Валюта">
                {config.currencies.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.currencyButton} ${
                      currency === key ? styles.currencyActive : ""
                    }`}
                    onClick={() => setCurrency(key)}
                    aria-pressed={currency === key}
                    aria-label={key.toUpperCase()}
                  >
                    <Icon
                      src={currencyIcons[key]}
                      width={24}
                      height={24}
                      className={styles.currencyIcon}
                    />
                  </button>
                ))}
              </div>
            </div>
            {errors.amount ? <span role="alert">{errors.amount.message}</span> : null}
          </div>

          <div className={styles.payButton}>
            <Button variant="gradient" type="submit" className={styles.paySubmit}>
              Оплатить {formatPrice(total)} {currencySymbols[currency]}
            </Button>
          </div>
        </div>
      </form>

      {config.showPromo ? (
        <Modal
          isOpen={promoOpen}
          title="Ввести промокод"
          onClose={() => setPromoOpen(false)}
          actions={
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="outline" onClick={() => setPromoOpen(false)}>
                Отмена
              </Button>
              <Button variant="primary" onClick={applyPromo}>
                Применить
              </Button>
            </div>
          }
        >
          <input
            className={modalStyles.input}
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="Введите промокод"
            aria-label="Промокод"
          />
        </Modal>
      ) : null}
    </>
  );
}

export function SteamTopupForm() {
  const [activePlatform, setActivePlatform] = useState(platforms[0].id);
  const activePlatformData = getPlatformById(activePlatform);

  return (
    <section
      className={styles.section}
      aria-label={`Пополнение ${activePlatformData.name}`}
    >
      <div className={styles.platformPanel}>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            type="button"
            className={`${styles.platformButton} ${
              activePlatform === platform.id
                ? styles.platformActive
                : styles.platformInactive
            }`}
            onClick={() => setActivePlatform(platform.id)}
            aria-label={platform.name}
            aria-pressed={activePlatform === platform.id}
          >
            <Image
              src={platform.image}
              alt=""
              width={32}
              height={32}
              className={styles.platformIcon}
            />
          </button>
        ))}
        <span className={styles.newBadge}>Новое</span>
      </div>

      <TopupFormPanel key={activePlatform} platformId={activePlatform} />
    </section>
  );
}
