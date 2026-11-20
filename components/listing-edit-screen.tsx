"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { getErrorMessage } from "@/api/error";
import {
  ACCEPT_IMAGES,
  ChipGroup,
  MAX_IMAGE_BYTES,
} from "@/components/sell-wizard-screen";
import { ListPageSkeleton } from "@/components/skeleton";
import { StockEditor } from "@/components/stock-editor";
import { useCategoryPage } from "@/hooks/use-catalog";
import { useMyListing, useUpdateListing } from "@/hooks/use-listings";
import { cleanPayload, payloadErrors } from "@/lib/fulfillment-check";
import {
  INSTRUCTION_MAX,
  INSTRUCTION_MIN,
  calcIncome,
  formatPrice,
  sellCharacteristicGroups,
} from "@/lib/sell-wizard";
import editStyles from "@/styles/listing-edit.module.scss";
import styles from "@/styles/sell-wizard.module.scss";
import { parseFulfillmentFormat, sellerFieldsOf } from "@/types/fulfillment";
import type { TListingPhoto, TSellerListing } from "@/types/listings";

const MAX_PHOTOS = 8;

type TPhoto = { key: string; value: TListingPhoto; src: string };

type TCharacteristicKey = "server" | "genre" | "region";

function isCharacteristicKey(key: string): key is TCharacteristicKey {
  return key === "server" || key === "genre" || key === "region";
}

export function ListingEditScreen({ listingId }: { listingId: string }) {
  const listingQuery = useMyListing(listingId);

  if (listingQuery.isLoading) {
    return <ListPageSkeleton rows={4} />;
  }

  if (listingQuery.isError || !listingQuery.data) {
    return (
      <div className={styles["sell-wizard"]}>
        <h1 className={styles["sell-wizard__title"]}>Объявление не найдено</h1>
        <Link href="/profile?tab=goods">К моим товарам</Link>
      </div>
    );
  }

  return <ListingEditForm listing={listingQuery.data} />;
}

function ListingEditForm({ listing }: { listing: TSellerListing }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useUpdateListing(listing.id);
  const categoryPageQuery = useCategoryPage(listing.gameId);

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(listing.price);
  const [description, setDescription] = useState(listing.description);
  const [comment, setComment] = useState(listing.comment);
  const [instruction, setInstruction] = useState(
    listing.deliveryInstruction ?? "",
  );
  const [characteristics, setCharacteristics] = useState<
    Record<TCharacteristicKey, string | null>
  >({
    server: listing.server,
    genre: listing.genre,
    region: listing.region,
  });
  const [newStock, setNewStock] = useState<Record<string, string>[]>([]);
  const [stockErrors, setStockErrors] = useState<
    Array<Record<string, string>>
  >([]);
  const [photos, setPhotos] = useState<TPhoto[]>(() =>
    listing.imageIds.map((id, index) => ({
      key: `old-${id}`,
      value: id,
      src: listing.images[index] ?? "",
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<TSellerListing | null>(null);
  const [restocked, setRestocked] = useState(false);

  // Object URLs of new photos are released when they leave the form.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () => {
      for (const photo of photosRef.current) {
        if (typeof photo.value !== "number") {
          URL.revokeObjectURL(photo.src);
        }
      }
    },
    [],
  );

  const format = useMemo(
    () =>
      parseFulfillmentFormat(
        listing.fulfillmentFormat ??
          categoryPageQuery.data?.fulfillmentFormats?.find(
            (item) => item.slug === listing.deliveryMethodId,
          ),
      ),
    [
      listing.fulfillmentFormat,
      listing.deliveryMethodId,
      categoryPageQuery.data?.fulfillmentFormats,
    ],
  );
  const sellerFields = useMemo(() => sellerFieldsOf(format), [format]);
  const isStock = format?.kind === "stock";
  const canRestock = isStock && listing.listingType === "permanent";
  const characteristicGroups = useMemo(
    () =>
      sellCharacteristicGroups({
        filters: categoryPageQuery.data?.filters,
        offerTypeSlug: listing.categoryId,
        includeServerFallback:
          listing.gameId === "roblox" && listing.categoryId === "items",
      }),
    [categoryPageQuery.data?.filters, listing.categoryId, listing.gameId],
  );
  const income = calcIncome(price, categoryPageQuery.data?.feePercent);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const added: TPhoto[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPT_IMAGES.split(",").includes(file.type)) {
        setError("Можно загрузить JPEG, PNG или WebP");
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        setError("Файл больше 10 МБ");
        return;
      }

      added.push({
        key: `new-${file.name}-${file.size}-${Math.random()}`,
        value: file,
        src: URL.createObjectURL(file),
      });
    }

    setError(null);
    setPhotos((current) => [...current, ...added].slice(0, MAX_PHOTOS));
  }

  function removePhoto(key: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.key === key);
      if (photo && typeof photo.value !== "number") {
        URL.revokeObjectURL(photo.src);
      }
      return current.filter((item) => item.key !== key);
    });
  }

  function handleSave() {
    if (title.trim().length < 3) {
      setError("Укажите название товара");
      return;
    }

    if (!price || price <= 0) {
      setError("Укажите цену товара");
      return;
    }

    // Listings from before instructions may keep none.
    const nextInstruction = instruction.trim();
    const instructionChanged =
      nextInstruction !== (listing.deliveryInstruction ?? "").trim();

    if (
      (listing.deliveryInstruction || nextInstruction) &&
      nextInstruction.length < INSTRUCTION_MIN
    ) {
      setError("Напишите, как покупатель получит товар, хотя бы пару предложений");
      return;
    }

    const errors = newStock.map((item) => payloadErrors(sellerFields, item));
    const firstError = errors.flatMap((item) => Object.values(item))[0];
    setStockErrors(errors);

    if (firstError) {
      setError(firstError);
      return;
    }

    if (photos.length === 0) {
      setError("Добавьте хотя бы одно фото");
      return;
    }

    setError(null);
    update.mutate(
      {
        title: title.trim(),
        price,
        description,
        comment,
        deliveryInstruction: instructionChanged ? nextInstruction : undefined,
        server: characteristics.server ?? "",
        genre: characteristics.genre ?? "",
        region: characteristics.region ?? "",
        stockItems: newStock.length
          ? newStock.map((item) => cleanPayload(sellerFields, item))
          : undefined,
        photos: photos.map((photo) => photo.value),
      },
      {
        onSuccess: (result) => setSaved(result),
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  // Sold out: only new units, the rest of the listing stays as approved.
  const restockItems = newStock.length > 0 ? newStock : [{}];

  function handleRestock() {
    const errors = restockItems.map((item) => payloadErrors(sellerFields, item));
    const firstError = errors.flatMap((item) => Object.values(item))[0];
    setStockErrors(errors);

    if (firstError) {
      setError(firstError);
      return;
    }

    setError(null);
    update.mutate(
      {
        stockItems: restockItems.map((item) => cleanPayload(sellerFields, item)),
      },
      {
        onSuccess: (result) => {
          setRestocked(true);
          setSaved(result);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  if (saved) {
    const message = restocked
      ? "Позиции добавлены, товар снова в продаже."
      : saved.status !== "moderation"
        ? "Новые цена и данные уже действуют."
        : listing.status === "moderation"
          ? "Объявление ждёт проверки модератора. Мы пришлём уведомление с результатом."
          : "Объявление снова на модерации. После проверки оно вернётся в каталог, мы пришлём уведомление.";

    return (
      <div className={styles["sell-wizard"]}>
        <h1 className={styles["sell-wizard__title"]}>Изменения сохранены</h1>
        <p className={styles["sell-wizard__upload-hint"]} role="status">
          {message}
        </p>
        <div className={editStyles["listing-edit__actions"]}>
          <button
            type="button"
            className={styles["sell-wizard__primary-button"]}
            onClick={() => router.push("/profile?tab=goods")}
          >
            Мои товары
          </button>
        </div>
      </div>
    );
  }

  if (listing.status === "sold") {
    return (
      <div className={styles["sell-wizard"]}>
        <div className={styles["sell-wizard__header"]}>
          <h1 className={styles["sell-wizard__title"]}>{listing.title}</h1>
        </div>
        <p className={styles["sell-wizard__upload-hint"]}>
          {canRestock
            ? `Товар закончился: продано ${listing.stock?.sold ?? 0}. Добавьте позиции, и он сразу вернётся в каталог.`
            : "Товар продан, изменить его нельзя."}
        </p>
        {canRestock && sellerFields.length > 0 ? (
          <StockEditor
            fields={sellerFields}
            items={restockItems}
            errors={stockErrors}
            max={100}
            onChange={(items) => {
              setNewStock(items);
              setStockErrors([]);
            }}
          />
        ) : null}
        {error ? (
          <p className={styles["sell-wizard__form-error"]} role="alert">
            {error}
          </p>
        ) : null}
        <div className={editStyles["listing-edit__actions"]}>
          {canRestock ? (
            <button
              type="button"
              className={styles["sell-wizard__primary-button"]}
              disabled={update.isPending}
              onClick={handleRestock}
            >
              {update.isPending ? "Сохраняем…" : "Вернуть в продажу"}
            </button>
          ) : null}
          <Link className={editStyles["listing-edit__cancel"]} href="/profile?tab=goods">
            Назад
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["sell-wizard"]}>
      <div className={styles["sell-wizard__header"]}>
        <h1 className={styles["sell-wizard__title"]}>Изменить объявление</h1>
      </div>
      <p className={styles["sell-wizard__upload-hint"]}>
        {listing.gameName} · {listing.categoryLabel} ·{" "}
        {listing.deliveryMethodLabel}. Цена, характеристики и склад
        меняются сразу. Новое название, описание, комментарий или фото
        отправят объявление на повторную модерацию.
      </p>
      {listing.status === "rejected" && listing.rejectReason ? (
        <p className={styles["sell-wizard__form-error"]}>
          Причина отказа: {listing.rejectReason}
        </p>
      ) : null}

      <div
        className={`${styles["sell-wizard__content"]} ${styles["sell-wizard__content--wide"]}`}
      >
        <div className={editStyles["listing-edit__form"]}>
          <div className={styles["sell-wizard__upload-block"]}>
            <input
              ref={inputRef}
              id={inputId}
              className={styles["sell-wizard__file-input"]}
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <div className={styles["sell-wizard__upload-preview-grid"]}>
              {photos.map((photo) => (
                <div
                  key={photo.key}
                  className={styles["sell-wizard__upload-preview"]}
                >
                  <img
                    src={photo.src}
                    alt=""
                    className={styles["sell-wizard__upload-preview-image"]}
                  />
                  <button
                    type="button"
                    className={styles["sell-wizard__upload-remove"]}
                    aria-label="Удалить фото"
                    onClick={() => removePhoto(photo.key)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  className={styles["sell-wizard__upload-area-compact"]}
                  aria-label="Добавить фото"
                  onClick={() => inputRef.current?.click()}
                >
                  <span className={styles["sell-wizard__upload-label"]}>+</span>
                </button>
              ) : null}
            </div>
            <p className={styles["sell-wizard__upload-hint"]}>
              Первое фото станет обложкой в каталоге
            </p>
          </div>

          <div className={styles["sell-wizard__calculator"]}>
            <label className={styles["sell-wizard__calc-field"]}>
              <span className={styles["sell-wizard__calc-label"]}>
                Цена товара
              </span>
              <span className={styles["sell-wizard__calc-value-row"]}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles["sell-wizard__calc-input"]}
                  value={formatPrice(price)}
                  onChange={(event) =>
                    setPrice(Number(event.target.value.replace(/\s/g, "")) || 0)
                  }
                />
                <span className={styles["sell-wizard__calc-currency"]}>₽</span>
              </span>
            </label>
            <div className={styles["sell-wizard__calc-field"]}>
              <span className={styles["sell-wizard__calc-label"]}>Доход</span>
              <span className={styles["sell-wizard__calc-value-row"]}>
                <span className={styles["sell-wizard__calc-output"]}>
                  {formatPrice(income)}
                </span>
                <span className={styles["sell-wizard__calc-currency"]}>₽</span>
              </span>
            </div>
          </div>

          <label className={styles["sell-wizard__field-block"]}>
            <span className={styles["sell-wizard__field-label"]}>Название</span>
            <input
              className={styles["sell-wizard__field-input"]}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          {characteristicGroups.length > 0 ? (
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
                    value={
                      isCharacteristicKey(group.key)
                        ? characteristics[group.key]
                        : null
                    }
                    onChange={(value) => {
                      if (isCharacteristicKey(group.key)) {
                        const key = group.key;
                        setCharacteristics((current) => ({
                          ...current,
                          [key]: value,
                        }));
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles["sell-wizard__form-section"]}>
            <h2 className={styles["sell-wizard__section-title"]}>Описание</h2>
            <textarea
              className={styles["sell-wizard__textarea"]}
              aria-label="Описание"
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
              className={styles["sell-wizard__textarea"]}
              aria-label="Комментарий"
              placeholder="Дополнительная информация для покупателя"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </section>

          <section className={styles["sell-wizard__form-section"]}>
            <h2 className={styles["sell-wizard__section-title"]}>
              Инструкция для покупателя
            </h2>
            <p className={styles["sell-wizard__section-hint"]}>
              Покупатель увидит её сразу после оплаты на странице сделки.
              После правки объявление снова пройдёт модерацию, новая
              инструкция действует для новых покупок.
            </p>
            <textarea
              className={styles["sell-wizard__textarea"]}
              aria-label="Инструкция для покупателя"
              placeholder="Например: пришлите в чат ссылку на обмен Steam. Отправлю предмет в течение 15 минут."
              maxLength={INSTRUCTION_MAX}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
            />
          </section>

          {isStock && sellerFields.length > 0 ? (
            <section className={styles["sell-wizard__form-section"]}>
              <h2 className={styles["sell-wizard__section-title"]}>
                Склад автовыдачи
              </h2>
              <p className={styles["sell-wizard__upload-hint"]}>
                Осталось: {listing.stock?.free ?? 0} · Продано:{" "}
                {listing.stock?.sold ?? 0}
                {canRestock
                  ? ". Новые позиции появятся в продаже сразу, без модерации."
                  : ". У разового товара одна позиция."}
              </p>
              {canRestock ? (
                <StockEditor
                  fields={sellerFields}
                  items={newStock}
                  errors={stockErrors}
                  max={100}
                  onChange={(items) => {
                    setNewStock(items);
                    setStockErrors([]);
                  }}
                />
              ) : null}
            </section>
          ) : null}

          {error ? (
            <p className={styles["sell-wizard__form-error"]} role="alert">
              {error}
            </p>
          ) : null}

          <div className={editStyles["listing-edit__actions"]}>
            <button
              type="button"
              className={styles["sell-wizard__primary-button"]}
              disabled={update.isPending}
              onClick={handleSave}
            >
              {update.isPending ? "Сохраняем…" : "Сохранить"}
            </button>
            <Link className={editStyles["listing-edit__cancel"]} href="/profile?tab=goods">
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
