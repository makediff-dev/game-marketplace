"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AccountMenuDialog,
  AccountOnboardingDialog,
  ProfileMenu,
  WelcomeDialog,
} from "@/components/account-dialogs";
import { AvatarPicker } from "@/components/avatar-picker";
import {
  formatPromotedShort,
  formatPromotedUntil,
  PromoteDialog,
} from "@/components/promote-dialog";
import { ProfilePageSkeleton } from "@/components/skeleton";
import { LineIcon } from "@/components/ui/line-icon";
import { useCurrentUser } from "@/hooks/use-auth";
import { useProfileItems, useProfileOverview } from "@/hooks/use-profile";
import { cx } from "@/lib/cx";
import { formatMoney, isPlaceholderUsername, memberSince } from "@/lib/profile";
import {
  normalizeProfileStatus,
  parseProfileFilter,
  parseProfileTab,
  PROFILE_EMPTY_STATE,
  PROFILE_STATUS_CONFIG,
  type TProfileFilter,
  type TProfileItemStatus,
  type TProfileStatusTone,
  type TProfileTab,
  type TProfileItem,
} from "@/lib/profile-data";
import styles from "@/styles/profile.module.scss";
import type { TUser } from "@/types/auth";

const SECTIONS: Array<{ id: TProfileTab; label: string }> = [
  { id: "goods", label: "Мои товары" },
  { id: "purchases", label: "Покупки" },
  { id: "sales", label: "Продажи" },
];

const EDITABLE_LISTING_STATUSES: TProfileItemStatus[] = [
  "active",
  "moderation",
  "rejected",
  "out_of_stock",
];

const FILTERS: Array<{ id: TProfileFilter; label: string }> = [
  { id: "active", label: "Активные" },
  { id: "completed", label: "Завершённые" },
  { id: "disputed", label: "Спорные" },
];

function badgeClass(tone: TProfileStatusTone): string {
  switch (tone) {
    case "archived":
      return styles["profile__badge--archived"];
    case "warning":
      return styles["profile__badge--warning"];
    case "success":
      return styles["profile__badge--success"];
    case "dispute":
      return styles["profile__badge--dispute"];
    default:
      return styles["profile__badge--brand"];
  }
}

export function ProfileScreen({
  initialUser,
}: {
  initialUser?: TUser | null;
} = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading: userLoading } = useCurrentUser(initialUser);
  const user = data ?? initialUser ?? null;
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [promoting, setPromoting] = useState<TProfileItem | null>(null);
  const [section, setSection] = useState<TProfileTab>(() =>
    parseProfileTab(searchParams.get("tab")),
  );
  const [filter, setFilter] = useState<TProfileFilter>(() =>
    parseProfileFilter(searchParams.get("filter")),
  );
  const overviewQuery = useProfileOverview();
  const itemsQuery = useProfileItems(section, filter);

  const balance = overviewQuery.data?.balance ?? 0;
  const rating = overviewQuery.data?.rating ?? 0;
  const items = itemsQuery.data ?? [];
  const empty = PROFILE_EMPTY_STATE[section];
  const shellLoading =
    (!user && userLoading) ||
    (overviewQuery.isLoading && !overviewQuery.data);
  const listLoading = itemsQuery.isFetching && items.length === 0;

  useEffect(() => {
    setSection(parseProfileTab(searchParams.get("tab")));
    setFilter(parseProfileFilter(searchParams.get("filter")));
  }, [searchParams]);

  function updateQuery(next: { tab?: TProfileTab; filter?: TProfileFilter }) {
    const nextTab = next.tab ?? section;
    const nextFilter = next.filter ?? filter;

    if (next.tab) {
      setSection(next.tab);
    }
    if (next.filter || next.tab) {
      setFilter(nextFilter);
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "goods") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }

    if (nextFilter === "active") {
      params.delete("filter");
    } else {
      params.set("filter", nextFilter);
    }

    // Only the address changes: the page is dynamic, a router call would
    // ask the server for the whole page on every tab click.
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  if (shellLoading || !user) {
    return <ProfilePageSkeleton />;
  }

  const since = memberSince(user.createdAt);
  const needsNickname = isPlaceholderUsername(user);
  const displayName = needsNickname ? user.email : user.username;

  return (
    <section className={styles["profile"]}>
      <aside className={styles["profile__side"]}>
        <div className={styles["profile__card"]}>
          <AvatarPicker user={user} size={72} showUploadButton={false} />
          <div className={styles["profile__person-text"]}>
            <h1 className={styles["profile__name"]}>{displayName}</h1>
            <div
              className={styles["profile__stars"]}
              aria-label={`Рейтинг ${rating} из 5`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={index}
                  className={styles["profile__star"]}
                  src={
                    index < Math.round(rating)
                      ? "/assets/star-filled.svg"
                      : "/assets/star-empty.svg"
                  }
                  alt=""
                  width={16}
                  height={16}
                />
              ))}
            </div>
            <p className={styles["profile__since"]}>на Playnox с {since}</p>
          </div>
          <button
            className={styles["profile__menu-button"]}
            type="button"
            aria-label="Открыть меню профиля"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.7 7.7 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.7 7.7 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <Link className={styles["profile__balance"]} href="/profile/balance">
          <span className={styles["profile__balance-text"]}>
            <span className={styles["profile__balance-label"]}>Баланс</span>
            <span className={styles["profile__balance-amount"]}>
              {formatMoney(balance)}
            </span>
          </span>
          <span className={styles["profile__balance-arrow"]} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M5 9h8m-3.5-3.5L13 9l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>

        {needsNickname ? null : (
          <div className={styles["profile__side-menu"]}>
            <ProfileMenu user={user} />
          </div>
        )}
      </aside>

      <div className={styles["profile__main"]}>
        <div className={styles["profile__main-head"]}>
          <div className={styles["profile__tabs"]} role="tablist">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                className={`${styles["profile__tab"]} ${section === item.id ? styles["profile__tab--on"] : styles["profile__tab--off"]}`}
                type="button"
                role="tab"
                aria-selected={section === item.id}
                onClick={() => updateQuery({ tab: item.id, filter: "active" })}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles["profile__toolbar"]}>
            <div className={styles["profile__filters"]}>
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  className={`${styles["profile__filter"]} ${filter === item.id ? styles["profile__filter--on"] : styles["profile__filter--off"]}`}
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => updateQuery({ filter: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {section === "goods" && !listLoading && items.length > 0 ? (
              <Link className={styles["profile__add-button"]} href="/sell">
                + Добавить товар
              </Link>
            ) : null}
          </div>
        </div>

      {listLoading ? (
        <div
          className={styles["profile__list-loading"]}
          aria-busy="true"
          aria-live="polite"
        >
          <span className={styles["profile__list-loading-bar"]} />
          <span className={styles["profile__list-loading-bar"]} />
          <span className={styles["profile__list-loading-bar"]} />
        </div>
      ) : items.length > 0 ? (
        <ul
          className={styles["profile__list"]}
          data-fetching={itemsQuery.isFetching ? "true" : undefined}
        >
          {items.map((item) => {
            const status =
              PROFILE_STATUS_CONFIG[normalizeProfileStatus(item.status)];
            const content = (
              <>
                {item.image ? (
                  <img
                    className={styles["profile__item-photo"]}
                    src={item.image}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={cx(
                      styles["profile__item-photo"],
                      styles["profile__item-photo--empty"],
                    )}
                    aria-hidden
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3.5"
                        y="4.5"
                        width="17"
                        height="15"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle cx="9" cy="10" r="1.8" fill="currentColor" />
                      <path
                        d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                <p className={styles["profile__item-title"]}>{item.title}</p>
                {item.description ? (
                  <p className={styles["profile__item-description"]}>
                    {item.description}
                  </p>
                ) : null}
                <div className={styles["profile__item-meta"]}>
                  <span
                    className={`${styles["profile__badge"]} ${badgeClass(status.tone)}`}
                  >
                    {status.label}
                  </span>
                  <span className={styles["profile__item-price"]}>
                    {formatMoney(item.price)}
                  </span>
                </div>
                {item.note ? (
                  <p className={styles["profile__item-note"]}>
                    Причина: {item.note}
                  </p>
                ) : null}
              </>
            );

            const editable =
              item.tab === "goods" &&
              EDITABLE_LISTING_STATUSES.includes(item.status);
            const promotable = item.tab === "goods" && item.status === "active";
            const lifted =
              item.promotedUntil && Date.parse(item.promotedUntil) > Date.now()
                ? item.promotedUntil
                : null;
            const cardClass = cx(
              styles[item.href ? "profile__item-link" : "profile__item-card"],
              promotable && styles["profile__item-card--promote"],
            );

            return (
              <li key={item.id} className={styles["profile__item-row"]}>
                {item.href ? (
                  <Link className={cardClass} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
                {promotable ? (
                  <button
                    className={cx(
                      styles["profile__item-promote"],
                      lifted && styles["profile__item-promote--on"],
                    )}
                    type="button"
                    aria-label={
                      lifted
                        ? `«${item.title}» в топе до ${formatPromotedUntil(lifted)}, продлить`
                        : `Поднять «${item.title}» в топ`
                    }
                    title={lifted ? `В топе до ${formatPromotedUntil(lifted)}` : undefined}
                    onClick={() => setPromoting(item)}
                  >
                    <LineIcon name="trend" size={24} />
                    <span>
                      {lifted ? `до ${formatPromotedShort(lifted)}` : "В топ"}
                    </span>
                  </button>
                ) : null}
                {/* A sibling over the card corner: a link cannot sit inside the card link. */}
                {editable ? (
                  <Link
                    className={styles["profile__item-edit"]}
                    href={`/sell/edit/${item.id}`}
                    aria-label={`Изменить «${item.title}»`}
                    title="Изменить"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M4 20h4L18.5 9.5a2.83 2.83 0 0 0-4-4L4 16v4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m13.5 6.5 4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles["profile__empty"]}>
          <p className={styles["profile__empty-title"]}>{empty.title}</p>
          <p className={styles["profile__empty-text"]}>{empty.text}</p>
          {empty.showSellButton && (
            <Link className={styles["profile__sell-button"]} href="/sell">
              Выставить товар
            </Link>
          )}
        </div>
      )}
      </div>

      {promoting ? (
        <PromoteDialog
          listingId={promoting.id}
          title={promoting.title}
          promotedUntil={promoting.promotedUntil}
          onClose={() => setPromoting(null)}
        />
      ) : null}

      {needsNickname && (
        <AccountOnboardingDialog
          user={user}
          onSaved={(saved) => setWelcomeName(saved.username)}
        />
      )}
      {welcomeName && (
        <WelcomeDialog
          name={welcomeName}
          since={since}
          onClose={() => setWelcomeName(null)}
        />
      )}
      {menuOpen && !needsNickname && (
        <AccountMenuDialog
          user={user}
          since={since}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </section>
  );
}
