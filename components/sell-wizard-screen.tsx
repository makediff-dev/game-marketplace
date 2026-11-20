"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { SellProductSuccessModal } from "@/components/sell-product-success-modal";
import { SellWizardTermsModal } from "@/components/sell-wizard-terms-modal";
import {
  useCatalogCategories,
  useCategoryPage,
} from "@/hooks/use-catalog";
import { useCreateListing } from "@/hooks/use-listings";
import { cx } from "@/lib/cx";
import {
  INSTRUCTION_MAX,
  INSTRUCTION_MIN,
  SELL_AFTER_SALE_INSTRUCTIONS,
  SELL_LISTING_TYPES,
  SELL_WIZARD_TOTAL_STEPS,
  STEP_TITLES,
  calcIncome,
  catalogCategoryToSellApp,
  formatPrice,
  getCategoryTerms,
  getSellCategories,
  offerTypesToSellCategories,
  readListingTermsAccepted,
  readSellerTermsAccepted,
  sellCharacteristicGroups,
  writeListingTermsAccepted,
} from "@/lib/sell-wizard";
import {
  useSellWizardHydrated,
  useSellWizardStore,
} from "@/store/sell-wizard.store";
import styles from "@/styles/sell-wizard.module.scss";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";

function WizardHeader({
  title,
  showBack,
  onBack,
}: {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <div className={styles["sell-wizard__header"]}>
      {showBack ? (
        <button
          type="button"
          className={styles["sell-wizard__back-button"]}
          onClick={onBack}
          aria-label="Назад"
        >
          <img
            className={styles["sell-wizard__back-icon"]}
            src="/assets/arrow.svg"
            alt=""
            width={16}
            height={13}
          />
        </button>
      ) : null}
      {title ? <h1 className={styles["sell-wizard__title"]}>{title}</h1> : null}
    </div>
  );
}

function WizardProgress({ currentStep }: { currentStep: number }) {
  const width = (currentStep / SELL_WIZARD_TOTAL_STEPS) * 100;

  return (
    <div
      className={styles["sell-wizard__progress"]}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={SELL_WIZARD_TOTAL_STEPS}
      aria-valuenow={currentStep}
      aria-label={`Шаг ${currentStep} из ${SELL_WIZARD_TOTAL_STEPS}`}
    >
      <div
        className={styles["sell-wizard__progress-fill"]}
        style={{ transform: `scaleX(${width / 100})` }}
      />
    </div>
  );
}

function SelectionList({
  items,
  selectedId,
  onSelect,
}: {
  items: Array<{
    id: string;
    label: string;
    description?: string;
    hasDiscount?: boolean;
    disabled?: boolean;
  }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles["sell-wizard__list"]}>
      {items.map((item) => {
        const active = selectedId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={styles["sell-wizard__list-item"]}
            disabled={item.disabled}
            onClick={() => onSelect(item.id)}
          >
            <span className={styles["sell-wizard__list-item-content"]}>
              <span className={styles["sell-wizard__list-item-title-row"]}>
                <span className={styles["sell-wizard__list-item-title"]}>
                  {item.label}
                </span>
                {item.hasDiscount ? (
                  <span className={styles["sell-wizard__discount-badge"]}>
                    %
                  </span>
                ) : null}
              </span>
              {item.description ? (
                <span className={styles["sell-wizard__list-item-description"]}>
                  {item.description}
                </span>
              ) : null}
            </span>
            <span
              className={`${styles["sell-wizard__list-item-indicator"]} ${
                active ? styles["sell-wizard__list-item-indicator--active"] : ""
              }`}
            >
              {active ? (
                <img
                  className={styles["sell-wizard__check-icon"]}
                  src="/assets/checkmark-white.svg"
                  alt=""
                  width={14}
                  height={10}
                />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles["sell-wizard__characteristic-group"]}>
      <span className={styles["sell-wizard__characteristic-label"]}>
        {label}
      </span>
      <div className={styles["sell-wizard__chips-grid"]}>
        {options.map((option) => {
          const active = value === option;

          return (
            <button
              key={option}
              type="button"
              className={`${styles["sell-wizard__characteristic-chip"]} ${
                active ? styles["sell-wizard__characteristic-chip--active"] : ""
              }`}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductFormStep() {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

  const gameId = useSellWizardStore((state) => state.gameId)!;
  const categoryId = useSellWizardStore((state) => state.categoryId)!;
  const listingType = useSellWizardStore((state) => state.listingType)!;
  const price = useSellWizardStore((state) => state.price);
  const title = useSellWizardStore((state) => state.title);
  const description = useSellWizardStore((state) => state.description);
  const comment = useSellWizardStore((state) => state.comment);
  const deliveryInstruction = useSellWizardStore(
    (state) => state.deliveryInstruction,
  );
  const selectedServer = useSellWizardStore((state) => state.selectedServer);
  const selectedGenre = useSellWizardStore((state) => state.selectedGenre);
  const selectedRegion = useSellWizardStore((state) => state.selectedRegion);
  const images = useSellWizardStore((state) => state.images);
  const setPrice = useSellWizardStore((state) => state.setPrice);
  const setTitle = useSellWizardStore((state) => state.setTitle);
  const setDescription = useSellWizardStore((state) => state.setDescription);
  const setComment = useSellWizardStore((state) => state.setComment);
  const setDeliveryInstruction = useSellWizardStore(
    (state) => state.setDeliveryInstruction,
  );
  const setSelectedServer = useSellWizardStore(
    (state) => state.setSelectedServer,
  );
  const setSelectedGenre = useSellWizardStore(
    (state) => state.setSelectedGenre,
  );
  const setSelectedRegion = useSellWizardStore(
    (state) => state.setSelectedRegion,
  );
  const addImages = useSellWizardStore((state) => state.addImages);
  const removeImage = useSellWizardStore((state) => state.removeImage);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Товар");
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [instructionError, setInstructionError] = useState<string | null>(
    null,
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const reset = useSellWizardStore((state) => state.reset);

  const categoriesQuery = useCatalogCategories();
  const categoryPageQuery = useCategoryPage(gameId);
  const gameCategory = categoriesQuery.data?.find(
    (item) => item.slug === gameId,
  );
  const game = gameCategory ? catalogCategoryToSellApp(gameCategory) : undefined;
  const sellCategories = useMemo(() => {
    const fromStrapi = offerTypesToSellCategories(
      categoryPageQuery.data?.offerTypes ?? [],
    );
    if (categoryPageQuery.data?.offerTypes?.length) {
      return fromStrapi;
    }
    return getSellCategories(gameId);
  }, [categoryPageQuery.data?.offerTypes, gameId]);
  const category = sellCategories.find((item) => item.id === categoryId);

  const income = calcIncome(price, categoryPageQuery.data?.feePercent);
  const characteristicGroups = useMemo(
    () =>
      sellCharacteristicGroups({
        filters: categoryPageQuery.data?.filters,
        offerTypeSlug: categoryId,
        includeServerFallback: gameId === "roblox" && categoryId === "items",
      }),
    [categoryPageQuery.data?.filters, categoryId, gameId],
  );

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [images]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const accepted: File[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPT_IMAGES.split(",").includes(file.type)) {
        setError("Можно загрузить JPEG, PNG или WebP");
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        setError("Файл больше 10 МБ");
        return;
      }

      accepted.push(file);
    }

    setError(null);
    addImages(accepted);
  }

  function handleSave() {
    const nextTitleError = !title.trim() ? "Укажите название товара" : null;
    const nextPriceError =
      !price || price <= 0 ? "Укажите цену товара" : null;
    const nextInstructionError =
      deliveryInstruction.trim().length < INSTRUCTION_MIN
        ? "Напишите, как покупатель получит товар, хотя бы пару предложений"
        : null;

    setTitleError(nextTitleError);
    setPriceError(nextPriceError);
    setInstructionError(nextInstructionError);

    if (nextTitleError || nextPriceError || nextInstructionError) {
      setError(null);
      return;
    }

    if (!game || !category || !listingType) {
      setError("Заполните предыдущие шаги визарда");
      return;
    }

    if (images.length === 0) {
      setError("Добавьте хотя бы одно фото");
      return;
    }


    setError(null);
    setTitleError(null);
    setPriceError(null);
    createListing.mutate(
      {
        gameId,
        gameName: game.name,
        categoryId,
        categoryLabel: category.label,
        listingType,
        title: title.trim(),
        description: description.trim(),
        comment: comment.trim(),
        deliveryInstruction: deliveryInstruction.trim(),
        price,
        server: selectedServer,
        genre: selectedGenre,
        region: selectedRegion,
        images,
      },
      {
        onSuccess: (listing) => {
          setSuccessTitle(listing.title || title.trim() || "Товар");
          setSuccessOpen(true);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  function handleSuccessClose() {
    setSuccessOpen(false);
    reset();
    router.push("/sell");
  }

  function handleGoToListings() {
    setSuccessOpen(false);
    reset();
    router.push("/profile?tab=goods");
  }

  function characteristicValue(key: string): string | null {
    if (key === "server") {
      return selectedServer;
    }
    if (key === "genre") {
      return selectedGenre;
    }
    if (key === "region") {
      return selectedRegion;
    }
    return null;
  }

  function setCharacteristicValue(key: string, value: string) {
    if (key === "server") {
      setSelectedServer(value);
      return;
    }
    if (key === "genre") {
      setSelectedGenre(value);
      return;
    }
    if (key === "region") {
      setSelectedRegion(value);
    }
  }

  const priceSection = (
    <div className={styles["sell-wizard__price-section"]} aria-label="Цена">
      <div className={styles["sell-wizard__price-summary"]}>
        {formatPrice(price)} ₽
        {category?.label ? ` / ${category.label}` : ""}
      </div>
      <div className={styles["sell-wizard__calculator-wrap"]}>
        <div className={styles["sell-wizard__calculator"]}>
          <div className={styles["sell-wizard__calc-field"]}>
            <span className={styles["sell-wizard__calc-label"]}>
              Цена товара
            </span>
            <div className={styles["sell-wizard__calc-value-row"]}>
              <input
                type="text"
                inputMode="numeric"
                className={`${styles["sell-wizard__calc-input"]} ${priceError ? styles["sell-wizard__calc-input--invalid"] : ""}`}
                value={formatPrice(price)}
                aria-label="Цена товара"
                aria-invalid={Boolean(priceError)}
                onChange={(event) => {
                  setPrice(Number(event.target.value.replace(/\s/g, "")) || 0);
                  if (priceError) {
                    setPriceError(null);
                  }
                }}
              />
              <span className={styles["sell-wizard__calc-currency"]}>₽</span>
            </div>
          </div>
          <img
            className={styles["sell-wizard__calc-arrow"]}
            src="/assets/arrows-down-up-seller.svg"
            alt=""
            width={32}
            height={32}
          />
          <div className={styles["sell-wizard__calc-field"]}>
            <span className={styles["sell-wizard__calc-label"]}>Доход</span>
            <div className={styles["sell-wizard__calc-value-row"]}>
              <span className={styles["sell-wizard__calc-output"]}>
                {formatPrice(income)}
              </span>
              <span className={styles["sell-wizard__calc-currency"]}>₽</span>
            </div>
          </div>
        </div>
        {priceError ? (
          <p className={styles["sell-wizard__field-error"]}>{priceError}</p>
        ) : null}
      </div>
      <div className={styles["sell-wizard__income-card"]}>
        <span className={styles["sell-wizard__income-card-label"]}>
          Макс. доход
        </span>
        <span className={styles["sell-wizard__income-card-value"]}>
          {formatPrice(income)} ₽
        </span>
      </div>
    </div>
  );

  const titleField = (
    <div className={styles["sell-wizard__field-block"]}>
      <input
        className={`${styles["sell-wizard__field-input"]} ${titleError ? styles["sell-wizard__field-input--invalid"] : ""}`}
        placeholder="Название товара"
        value={title}
        aria-label="Название товара"
        aria-invalid={Boolean(titleError)}
        onChange={(event) => {
          setTitle(event.target.value);
          if (titleError) {
            setTitleError(null);
          }
        }}
      />
      {titleError ? (
        <p className={styles["sell-wizard__field-error"]}>{titleError}</p>
      ) : null}
    </div>
  );

  return (
    <>
      <div className={styles["sell-wizard__form-layout"]}>
        <div className={styles["sell-wizard__form-main"]}>
          <h2 className={styles["sell-wizard__form-page-title"]}>
            Страница товара
          </h2>

          <div className={styles["sell-wizard__upload-block"]}>
            <input
              ref={inputRef}
              id={inputId}
              className={styles["sell-wizard__file-input"]}
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            {previews.length > 0 ? (
              <div className={styles["sell-wizard__upload-preview-grid"]}>
                {previews.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className={styles["sell-wizard__upload-preview"]}
                  >
                    <img
                      src={src}
                      alt=""
                      className={styles["sell-wizard__upload-preview-image"]}
                    />
                    <button
                      type="button"
                      className={styles["sell-wizard__upload-remove"]}
                      aria-label="Удалить фото"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 8 ? (
                  <button
                    type="button"
                    className={styles["sell-wizard__upload-area-compact"]}
                    aria-label="Добавить фото"
                    onClick={() => inputRef.current?.click()}
                  >
                    <span className={styles["sell-wizard__upload-label"]}>
                      +
                    </span>
                  </button>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className={styles["sell-wizard__upload-area"]}
                aria-label="Загрузить фото"
                onClick={() => inputRef.current?.click()}
              >
                <span className={styles["sell-wizard__upload-label"]}>
                  + Загрузить
                </span>
              </button>
            )}
            <p className={styles["sell-wizard__upload-hint"]}>
              Загрузите фото 4:3 в порядке выбора на устройстве
            </p>
          </div>

          <div className={styles["sell-wizard__product-meta-block"]}>
            <div className={styles["sell-wizard__calculator-block"]}>
              {priceSection}
            </div>
            {titleField}
          </div>

          <section className={styles["sell-wizard__form-section"]}>
            <h2 className={styles["sell-wizard__section-title"]}>
              Характеристики
            </h2>
            <div className={styles["sell-wizard__characteristics-groups"]}>
              {characteristicGroups.map((group) => (
                <ChipGroup
                  key={group.key}
                  label={group.label}
                  options={group.options}
                  value={characteristicValue(group.key)}
                  onChange={(value) => setCharacteristicValue(group.key, value)}
                />
              ))}
            </div>
          </section>

          <section className={styles["sell-wizard__form-section"]}>
            <h2 className={styles["sell-wizard__section-title"]}>Описание</h2>
            <textarea
              id="sell-description"
              className={styles["sell-wizard__textarea"]}
              placeholder="Опишите товар подробно"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </section>

          <section className={styles["sell-wizard__form-section"]}>
            <h2 className={styles["sell-wizard__section-title"]}>
              Комментарий
            </h2>
            <textarea
              id="sell-comment"
              className={styles["sell-wizard__textarea"]}
              placeholder="Дополнительная информация для покупателя"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </section>

          <section className={styles["sell-wizard__form-section"]}>
            <h2
              id="sell-instruction-title"
              className={styles["sell-wizard__section-title"]}
            >
              Инструкция для покупателя
            </h2>
            <p
              id="sell-instruction-hint"
              className={styles["sell-wizard__section-hint"]}
            >
              Покупатель увидит её сразу после оплаты на странице сделки.
              Напишите по шагам, как он получит товар: что прислать вам в чат,
              куда зайти, сколько ждать.
            </p>
            <textarea
              id="sell-instruction"
              className={cx(
                styles["sell-wizard__textarea"],
                instructionError && styles["sell-wizard__textarea--invalid"],
              )}
              placeholder="Например: пришлите в чат ссылку на обмен Steam. Отправлю предмет в течение 15 минут, потом подтвердите получение."
              maxLength={INSTRUCTION_MAX}
              value={deliveryInstruction}
              aria-labelledby="sell-instruction-title"
              aria-describedby="sell-instruction-hint"
              aria-invalid={Boolean(instructionError)}
              onChange={(event) => {
                setDeliveryInstruction(event.target.value);
                if (instructionError) {
                  setInstructionError(null);
                }
              }}
            />
            {instructionError ? (
              <p className={styles["sell-wizard__field-error"]}>
                {instructionError}
              </p>
            ) : null}
          </section>

          <div className={styles["sell-wizard__info-blocks"]}>
            <section
              className={styles["sell-wizard__info-block"]}
              aria-label="Как проходит сделка"
            >
              <div className={styles["sell-wizard__info-block-header"]}>
                <span
                  className={styles["sell-wizard__info-block-emoji"]}
                  aria-hidden
                >
                  ℹ️
                </span>
                <h2 className={styles["sell-wizard__info-block-title"]}>
                  Как проходит сделка
                </h2>
              </div>
              <ul className={styles["sell-wizard__info-list"]}>
                {SELL_AFTER_SALE_INSTRUCTIONS.map((item) => (
                  <li
                    key={item.id}
                    className={styles["sell-wizard__info-list-item"]}
                  >
                    <strong className={styles["sell-wizard__info-list-term"]}>
                      {item.term}
                    </strong>
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {error ? (
            <p className={styles["sell-wizard__form-error"]}>{error}</p>
          ) : null}

          <div className={styles["sell-wizard__form-actions"]}>
            <button
              type="button"
              className={styles["sell-wizard__primary-button"]}
              disabled={createListing.isPending}
              onClick={handleSave}
            >
              {createListing.isPending ? "Публикуем…" : "Сохранить"}
            </button>
          </div>
        </div>

        <aside
          className={styles["sell-wizard__sidebar"]}
          aria-label="Страница товара"
        >
          <h2 className={styles["sell-wizard__sidebar-title"]}>
            Страница товара
          </h2>
          <div className={styles["sell-wizard__calculator-block"]}>
            {priceSection}
          </div>
          <div className={styles["sell-wizard__sidebar-footer"]}>
            {titleField}
            <button
              type="button"
              className={`${styles["sell-wizard__primary-button"]} ${styles.sidebarSave}`}
              disabled={createListing.isPending}
              onClick={handleSave}
            >
              {createListing.isPending ? "Публикуем…" : "Сохранить"}
            </button>
          </div>
        </aside>
      </div>

      <SellProductSuccessModal
        isOpen={successOpen}
        productTitle={successTitle}
        onClose={handleSuccessClose}
        onGoToListings={handleGoToListings}
      />
    </>
  );
}

export function SellWizardScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get("game");
  const hydrated = useSellWizardHydrated();
  const categoriesQuery = useCatalogCategories();
  const catalogReady = Boolean(categoriesQuery.data);
  const [termsOpen, setTermsOpen] = useState(false);

  const step = useSellWizardStore((state) => state.step);
  const progressStep = useSellWizardStore((state) => state.progressStep);
  const gameId = useSellWizardStore((state) => state.gameId);
  const categoryId = useSellWizardStore((state) => state.categoryId);
  const listingType = useSellWizardStore((state) => state.listingType);
  const initGame = useSellWizardStore((state) => state.initGame);
  const selectCategory = useSellWizardStore((state) => state.selectCategory);
  const proceedFromCategory = useSellWizardStore(
    (state) => state.proceedFromCategory,
  );
  const selectListingType = useSellWizardStore(
    (state) => state.selectListingType,
  );
  const proceedFromListingType = useSellWizardStore(
    (state) => state.proceedFromListingType,
  );
  const goBack = useSellWizardStore((state) => state.goBack);

  const categoryPageQuery = useCategoryPage(gameId ?? gameParam ?? "");

  useEffect(() => {
    if (!hydrated || !catalogReady) {
      return;
    }

    if (!readSellerTermsAccepted()) {
      router.replace("/sell");
      return;
    }

    if (!gameParam) {
      router.replace("/sell");
      return;
    }

    const exists = categoriesQuery.data?.some(
      (item) => item.slug === gameParam,
    );

    if (!exists) {
      router.replace("/sell");
      return;
    }

    if (gameId !== gameParam) {
      initGame(gameParam);
    }
  }, [
    hydrated,
    catalogReady,
    gameParam,
    gameId,
    initGame,
    router,
    categoriesQuery.data,
  ]);

  const gameCategory = categoriesQuery.data?.find(
    (item) => item.slug === (gameId ?? gameParam ?? ""),
  );
  const game = gameCategory ? catalogCategoryToSellApp(gameCategory) : undefined;
  const categories = useMemo(() => {
    if (!gameId) {
      return [];
    }

    return categoryPageQuery.data?.offerTypes?.length
      ? offerTypesToSellCategories(categoryPageQuery.data.offerTypes)
      : getSellCategories(gameId);
  }, [gameId, categoryPageQuery.data?.offerTypes]);
  // Wait for offer types, otherwise the fallback list flashes first.
  if (
    !hydrated ||
    !catalogReady ||
    !gameId ||
    !game ||
    categoryPageQuery.isLoading
  ) {
    return null;
  }

  const title = step === 6 ? undefined : STEP_TITLES[step];
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const listingTerms =
    termsOpen && gameId && categoryId
      ? getCategoryTerms(gameId, categoryId)
      : null;

  function handleCategoryNext() {
    if (!categoryId) {
      return;
    }

    if (readListingTermsAccepted(gameId, categoryId)) {
      proceedFromCategory();
      return;
    }

    setTermsOpen(true);
  }

  function handleBack() {
    if (step === 2) {
      router.push("/sell");
      return;
    }

    goBack();
  }

  return (
    <div className={styles["sell-wizard"]}>
      <WizardHeader title={title} showBack onBack={handleBack} />
      <WizardProgress currentStep={progressStep} />

      <div
        className={`${styles["sell-wizard__content"]} ${step === 6 ? styles["sell-wizard__content--wide"] : ""}`}
      >
        {step === 2 ? (
          <>
            <div className={styles["sell-wizard__context-header"]}>
              <img
                className={styles["sell-wizard__context-icon"]}
                src={game.image}
                alt=""
                width={40}
                height={40}
              />
              <div className={styles["sell-wizard__context-info"]}>
                <span className={styles["sell-wizard__context-game"]}>
                  {game.name}
                </span>
              </div>
            </div>
            <SelectionList
              items={categories}
              selectedId={categoryId}
              onSelect={selectCategory}
            />
            <div className={styles["sell-wizard__footer-action"]}>
              <button
                type="button"
                className={styles["sell-wizard__primary-button"]}
                disabled={!categoryId}
                onClick={handleCategoryNext}
              >
                Далее
              </button>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <div className={styles["sell-wizard__context-header"]}>
              <img
                className={styles["sell-wizard__context-icon"]}
                src={game.image}
                alt=""
                width={40}
                height={40}
              />
              <div className={styles["sell-wizard__context-info"]}>
                <span className={styles["sell-wizard__context-game"]}>
                  {game.name}
                </span>
                {selectedCategory ? (
                  <span className={styles["sell-wizard__context-category"]}>
                    {selectedCategory.label}
                  </span>
                ) : null}
              </div>
            </div>
            <SelectionList
              items={SELL_LISTING_TYPES}
              selectedId={listingType}
              onSelect={(id) =>
                selectListingType(id as "one-time" | "permanent")
              }
            />
            <div className={styles["sell-wizard__footer-action"]}>
              <button
                type="button"
                className={styles["sell-wizard__primary-button"]}
                disabled={!listingType}
                onClick={proceedFromListingType}
              >
                Далее
              </button>
            </div>
          </>
        ) : null}

        {step === 6 ? <ProductFormStep /> : null}
      </div>

      {listingTerms ? (
        <SellWizardTermsModal
          isOpen
          title="Условия категории"
          blockTitle={listingTerms.title}
          items={listingTerms.items}
          onClose={() => setTermsOpen(false)}
          onAccept={() => {
            writeListingTermsAccepted(gameId, categoryId);
            setTermsOpen(false);
            proceedFromCategory();
          }}
        />
      ) : null}
    </div>
  );
}
