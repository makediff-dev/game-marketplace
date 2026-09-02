"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { getGameById } from "@/lib/mock/games";
import { formatPrice } from "@/lib/mock/products";
import {
  getDeliveryMethods,
  getSellCategories,
  productGenres,
  productRegions,
  robloxServers,
  SELL_WIZARD_FEE_PERCENT,
} from "@/lib/mock/sell-wizard";
import {
  calculateVariableUnitTotal,
  isVariableUnitCategory,
  validateVariableUnitAmount,
} from "@/lib/mock/variable-pricing";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";
import { useSellWizardStore } from "@/lib/store/sell-wizard-store";
import { useToastStore } from "@/lib/store/toast-store";
import { SellProductSuccessModal } from "../sell-product-success-modal";
import { SellVariablePricingFields } from "../sell-variable-pricing-fields/sell-variable-pricing-fields";
import variablePricingStyles from "../sell-variable-pricing-fields/sell-variable-pricing-fields.module.css";
import styles from "../sell-wizard.module.css";
import { SellProductInfoBlocks } from "./sell-product-info-blocks";

interface CharacteristicChipsProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

function CharacteristicChips({ label, options, value, onChange }: CharacteristicChipsProps) {
  return (
    <div className={styles.characteristicGroup}>
      <span className={styles.characteristicLabel}>{label}</span>
      <div className={styles.chipsGrid}>
        {options.map((option) => {
          const isActive = value === option;

          return (
            <button
              key={option}
              type="button"
              className={`${styles.characteristicChip} ${
                isActive ? styles.characteristicChipActive : ""
              }`}
              onClick={() => onChange(option)}
              aria-pressed={isActive}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SellStepProductForm() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const addCreatedProduct = useProfileProductsStore((state) => state.addCreatedProduct);
  const gameId = useSellWizardStore((state) => state.gameId);
  const categoryId = useSellWizardStore((state) => state.categoryId);
  const deliveryMethodId = useSellWizardStore((state) => state.deliveryMethodId);
  const listingType = useSellWizardStore((state) => state.listingType);
  const offerType = useSellWizardStore((state) => state.offerType);
  const price = useSellWizardStore((state) => state.price);
  const title = useSellWizardStore((state) => state.title);
  const description = useSellWizardStore((state) => state.description);
  const comment = useSellWizardStore((state) => state.comment);
  const selectedServer = useSellWizardStore((state) => state.selectedServer);
  const selectedGenre = useSellWizardStore((state) => state.selectedGenre);
  const selectedRegion = useSellWizardStore((state) => state.selectedRegion);
  const variablePricing = useSellWizardStore((state) => state.variablePricing);
  const setPrice = useSellWizardStore((state) => state.setPrice);
  const setTitle = useSellWizardStore((state) => state.setTitle);
  const setDescription = useSellWizardStore((state) => state.setDescription);
  const setComment = useSellWizardStore((state) => state.setComment);
  const setSelectedServer = useSellWizardStore((state) => state.setSelectedServer);
  const setSelectedGenre = useSellWizardStore((state) => state.setSelectedGenre);
  const setSelectedRegion = useSellWizardStore((state) => state.setSelectedRegion);
  const setVariablePricing = useSellWizardStore((state) => state.setVariablePricing);
  const selectOfferType = useSellWizardStore((state) => state.selectOfferType);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdSaleOrderId, setCreatedSaleOrderId] = useState<string | null>(null);
  const [savedProductTitle, setSavedProductTitle] = useState("");

  const game = gameId ? getGameById(gameId) : undefined;
  const categories = gameId ? getSellCategories(gameId) : [];
  const category = categories.find((item) => item.id === categoryId);
  const isVariableUnit = isVariableUnitCategory(categoryId, category?.label);

  useEffect(() => {
    if (!isVariableUnit || offerType === "variable-unit") {
      return;
    }

    selectOfferType("variable-unit");
  }, [isVariableUnit, offerType, selectOfferType]);

  if (!gameId || !categoryId || !listingType) {
    return null;
  }

  const incomeBase =
    isVariableUnit && offerType === "variable-unit"
      ? calculateVariableUnitTotal(variablePricing.maxAmount, variablePricing)
      : price;
  const income = Math.round(incomeBase * (1 - SELL_WIZARD_FEE_PERCENT / 100));
  const showServers = gameId === "roblox" && categoryId === "items";

  if (!game || !category) {
    return null;
  }

  const handleSave = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showToast("Укажите название товара");
      return;
    }

    if (isVariableUnit && offerType === "variable-unit") {
      if (!variablePricing.unitSize || !variablePricing.pricePerUnit) {
        showToast("Укажите номинал и цену");
        return;
      }

      if (variablePricing.minAmount >= variablePricing.maxAmount) {
        showToast("Максимальная покупка должна быть больше минимальной");
        return;
      }

      const amountError = validateVariableUnitAmount(variablePricing.minAmount, variablePricing);
      if (amountError) {
        showToast(amountError);
        return;
      }
    }

    const deliveryMethods = getDeliveryMethods(gameId, categoryId);
    const deliveryMethod = deliveryMethods.find((method) => method.id === deliveryMethodId);
    const listingPrice =
      isVariableUnit && offerType === "variable-unit"
        ? calculateVariableUnitTotal(variablePricing.minAmount, variablePricing)
        : price;

    const { saleOrderId } = addCreatedProduct({
      gameId,
      categoryLabel: category.label,
      title: trimmedTitle,
      price: listingPrice,
      description,
      comment,
      deliveryMethodLabel: deliveryMethod?.label,
      listingType,
      offerType,
      variablePricing: isVariableUnit && offerType === "variable-unit" ? variablePricing : undefined,
    });

    setCreatedSaleOrderId(saleOrderId);
    setSavedProductTitle(trimmedTitle);
    setSuccessModalOpen(true);
  };

  const handleGoToSale = () => {
    if (!createdSaleOrderId) {
      return;
    }

    router.push(`/profile/orders/${createdSaleOrderId}`);
  };

  return (
    <>
      <div className={styles.formLayout}>
      <div className={styles.formMain}>
        <h2 className={styles.mobileFormTitle}>Страница товара</h2>

        <div className={styles.uploadBlock}>
          <button type="button" className={styles.uploadArea} aria-label="Загрузить фото">
            <span className={styles.uploadLabel}>+ Загрузить</span>
          </button>
          <p className={styles.uploadHint}>Загрузите фото 4:3 в порядке выбора на устройстве</p>
        </div>

        <div className={styles.productMetaBlock}>
          {isVariableUnit ? (
            <SellVariablePricingFields
              pricing={variablePricing}
              onChange={setVariablePricing}
              variant="full"
              maxIncome={income}
            />
          ) : null}

          {!isVariableUnit ? (
            <div className={styles.calculator}>
              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Цена товара</span>
                <div className={styles.calcValueRow}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.calcInput}
                    value={formatPrice(price)}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/\s/g, "");
                      setPrice(Number(raw) || 0);
                    }}
                    aria-label="Цена товара"
                  />
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>

              <Icon
                src="/assets/arrows-down-up-seller.svg"
                width={32}
                height={32}
                className={styles.calcArrow}
              />

              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Доход</span>
                <div className={styles.calcValueRow}>
                  <span className={styles.calcOutput}>{formatPrice(income)}</span>
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>
            </div>
          ) : null}

          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Название товара"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Название товара"
          />
        </div>

        <section className={styles.characteristicsSection} aria-label="Характеристики">
          <h2 className={styles.sectionTitle}>Характеристики</h2>
          <div className={styles.characteristicsGroups}>
            {showServers ? (
              <CharacteristicChips
                label="Сервер"
                options={robloxServers}
                value={selectedServer}
                onChange={setSelectedServer}
              />
            ) : null}
            <CharacteristicChips
              label="Жанр"
              options={productGenres}
              value={selectedGenre}
              onChange={setSelectedGenre}
            />
            <CharacteristicChips
              label="Регион"
              options={productRegions}
              value={selectedRegion}
              onChange={setSelectedRegion}
            />
          </div>
        </section>

        <section className={styles.formSection} aria-label="Описание">
          <h2 className={styles.sectionTitle}>Описание</h2>
          <textarea
            className={styles.textarea}
            placeholder="Опишите товар подробно"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </section>

        <section className={styles.formSection} aria-label="Комментарий">
          <h2 className={styles.sectionTitle}>Комментарий</h2>
          <textarea
            className={styles.textarea}
            placeholder="Дополнительная информация для покупателя"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </section>

        <SellProductInfoBlocks gameId={gameId} categoryId={categoryId} />

        <div className={styles.formActions}>
          <Button type="button" variant="gradient" fullWidth large onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>

      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Страница товара</h2>

        {!isVariableUnit ? (
          <div className={styles.calculatorBlock}>
            <div className={styles.calculator}>
              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Цена товара</span>
                <div className={styles.calcValueRow}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.calcInput}
                    value={formatPrice(price)}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/\s/g, "");
                      setPrice(Number(raw) || 0);
                    }}
                    aria-label="Цена товара"
                  />
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>

              <Icon
                src="/assets/arrows-down-up-seller.svg"
                width={32}
                height={32}
                className={styles.calcArrow}
              />

              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Доход</span>
                <div className={styles.calcValueRow}>
                  <span className={styles.calcOutput}>{formatPrice(income)}</span>
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isVariableUnit ? (
          <SellVariablePricingFields
            pricing={variablePricing}
            onChange={setVariablePricing}
            variant="sidebar"
          />
        ) : null}

        <div className={styles.sidebarFooter}>
          {isVariableUnit ? (
            <div className={variablePricingStyles.incomeCard}>
              <span className={variablePricingStyles.incomeLabel}>Макс. доход</span>
              <div className={variablePricingStyles.incomeValueRow}>
                <span className={variablePricingStyles.incomeValue}>{formatPrice(income)}</span>
                <span className={variablePricingStyles.incomeCurrency}>₽</span>
              </div>
            </div>
          ) : null}

          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Название товара"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Название товара"
          />

          <Button type="button" variant="gradient" fullWidth large onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </aside>
      </div>

      <SellProductSuccessModal
        isOpen={successModalOpen}
        productTitle={savedProductTitle}
        onClose={() => setSuccessModalOpen(false)}
        onGoToProfile={handleGoToSale}
      />
    </>
  );
}
