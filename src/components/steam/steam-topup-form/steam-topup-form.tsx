"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PromoCodeModal } from "@/components/steam/promo-code-modal/promo-code-modal";
import { BalancePaymentModal } from "@/components/profile/balance-payment-modal/balance-payment-modal";
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
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const showToast = useToastStore((state) => state.show);

  const formSchema = useMemo(() => createFormSchema(config), [config]);

  const {
    register,
    handleSubmit,
    watch,
    control,
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

  const openPaymentModal = handleSubmit(() => {
    setPaymentOpen(true);
  });

  const handleProceedToPayment = () => {
    setPaymentOpen(false);
    showToast(
      `Переход к оплате ${formatPrice(total)} ${currencySymbols[currency]} через выбранный способ (прототип)`,
    );
  };

  const applyPromo = () => {
    setPromoOpen(false);
    showToast(promoCode ? `Промокод «${promoCode}» применён` : "Промокод не указан");
    setPromoCode("");
  };

  const parseAmountValue = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  };

  const getCurrencyIconClassName = (key: Currency) => {
    const classNames = [styles.currencyIcon];

    if (currency === key) {
      if (key !== "rub") {
        classNames.push(styles.currencyIconActiveDark);
      }
    } else if (key === "rub") {
      classNames.push(styles.currencyIconRubInactive);
    }

    return classNames.join(" ");
  };

  return (
    <>
      <form className={styles.formPanel} onSubmit={(event) => event.preventDefault()}>
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

          <div className={styles.fieldsContainer}>
            <div className={styles.fieldGroup}>
              <div className={`${styles.fieldWrap} ${styles.loginFieldWrap}`}>
                <div className={`${styles.field} ${styles.loginField}`}>
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
              </div>

              <div className={`${styles.fieldWrap} ${styles.amountFieldWrap}`}>
                <div className={`${styles.field} ${styles.amountField}`}>
                  <div className={styles.amountBlock}>
                    <span className={styles.amountLabel}>Сумма</span>
                    <div className={styles.amountValueGroup}>
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            inputMode="numeric"
                            className={styles.amountValue}
                            value={formatPrice(field.value || 0)}
                            size={Math.max(formatPrice(field.value || 0).length, 1)}
                            onChange={(event) => {
                              field.onChange(parseAmountValue(event.target.value));
                            }}
                            aria-label="Сумма пополнения"
                          />
                        )}
                      />
                      <span className={styles.amountSymbol}>{currencySymbols[currency]}</span>
                    </div>
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
                        className={getCurrencyIconClassName(key)}
                      />
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </div>

            <div className={styles.payButton}>
              <button type="button" className={styles.paySubmit} onClick={openPaymentModal}>
                Оплатить {formatPrice(total)} {currencySymbols[currency]}
              </button>
            </div>
          </div>
        </div>
        {errors.login ? <span role="alert">{errors.login.message}</span> : null}
        {errors.amount ? <span role="alert">{errors.amount.message}</span> : null}
      </form>

      {config.showPromo ? (
        <PromoCodeModal
          isOpen={promoOpen}
          value={promoCode}
          onChange={setPromoCode}
          onClose={() => setPromoOpen(false)}
          onActivate={applyPromo}
        />
      ) : null}

      <BalancePaymentModal
        isOpen={paymentOpen}
        amount={String(total)}
        operation="deposit"
        onClose={() => setPaymentOpen(false)}
        onProceed={handleProceedToPayment}
      />
    </>
  );
}

export function SteamTopupForm() {
  const [activePlatform, setActivePlatform] = useState(platforms[0].id);
  const activePlatformData = getPlatformById(activePlatform);

  return (
    <section
      className={`contentBlock ${styles.section}`}
      aria-label={`Пополнение ${activePlatformData.name}`}
    >
      <div className={styles.platformSide}>
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
      </div>

      <div className={styles.formSide}>
        <TopupFormPanel key={activePlatform} platformId={activePlatform} />
      </div>
    </section>
  );
}
