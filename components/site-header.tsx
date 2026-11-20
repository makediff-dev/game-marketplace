"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";

import { NotificationsMenu } from "@/components/notifications-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { useCurrentUser } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useProfileOverview } from "@/hooks/use-profile";
import { cx } from "@/lib/cx";
import { avatarSrc, formatMoney } from "@/lib/profile";
import styles from "@/styles/site-shell.module.scss";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Stroke icons for the account sections, 24px, currentColor.
const NAV_ICONS = {
  chat: "M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h-1A.5.5 0 0 1 4 15.5v-10Z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4a2 2 0 0 0 4 0",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8a7.5 7.5 0 0 1 15 0",
};

function avatarIcon(src: string | null): ReactElement | "user" {
  return src ? (
    <img
      className={styles["site-shell__nav-avatar"]}
      src={src}
      alt=""
      width={24}
      height={24}
    />
  ) : (
    "user"
  );
}

function NavIcon({ name }: { name: keyof typeof NAV_ICONS }) {
  return (
    <svg
      className={styles["site-shell__nav-icon"]}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      aria-hidden
    >
      <path
        d={NAV_ICONS[name]}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const THEME_KEY = "playnox-theme";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark") {
  // Repaint everything in one frame: element transitions would fade the page
  // while the header switches at once.
  const root = document.documentElement;
  root.classList.add("theme-switching");
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => root.classList.remove("theme-switching")),
  );

  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "light";
  }

  window.localStorage.setItem(THEME_KEY, theme);
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { data: user, isPending: userPending } = useCurrentUser();
  const unread = useNotifications(Boolean(user)).data?.unread ?? 0;
  const balance = useProfileOverview(Boolean(user)).data?.balance;
  const avatar = user ? avatarSrc(user) : null;
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  function submitSearch() {
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  const sectionLink = (
    href: string,
    label: string,
    icon: keyof typeof NAV_ICONS | ReactElement,
    badge = 0,
    ariaLabel?: string,
  ) => (
    <Link
      className={cx(
        styles["site-shell__nav-item"],
        isActivePath(pathname, href) && styles["site-shell__nav-item--active"],
      )}
      href={href}
      aria-current={isActivePath(pathname, href) ? "page" : undefined}
      aria-label={
        ariaLabel ??
        (badge > 0 ? `${label}, непрочитанных: ${badge}` : undefined)
      }
      onClick={() => setMenuOpen(false)}
    >
      <span className={styles["site-shell__nav-icon-wrap"]}>
        {typeof icon === "string" ? <NavIcon name={icon} /> : icon}
        {badge > 0 ? (
          <span className={styles["site-shell__badge"]} aria-hidden>
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className={styles["site-shell__nav-caption"]}>{label}</span>
    </Link>
  );

  const accountNav = (inMenu = false) => user ? (
    <>
      <Link
        className={cx(
          styles["site-shell__sell-button"],
          isActivePath(pathname, "/sell") &&
            styles["site-shell__sell-button--active"],
        )}
        href="/sell"
        aria-current={isActivePath(pathname, "/sell") ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        <span aria-hidden>+</span>
        Продать
      </Link>
      <div className={styles["site-shell__sections"]}>
        {sectionLink("/chat", "Чаты", "chat")}
        <NotificationsMenu
          buttonClassName={styles["site-shell__nav-item"]}
          label="Уведомления"
          inline={inMenu}
          onNavigate={() => setMenuOpen(false)}
        >
          <span className={styles["site-shell__nav-icon-wrap"]}>
            <NavIcon name="bell" />
            {unread > 0 ? (
              <span className={styles["site-shell__badge"]} aria-hidden>
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </span>
          <span className={styles["site-shell__nav-caption"]}>Уведомления</span>
        </NotificationsMenu>
        {balance === undefined
          ? sectionLink("/profile", "Профиль", avatarIcon(avatar))
          : sectionLink(
              "/profile",
              formatMoney(balance),
              avatarIcon(avatar),
              0,
              `Профиль, баланс ${formatMoney(balance)}`,
            )}
      </div>
    </>
  ) : userPending ? null : (
    <>
      <Link
        className={cx(
          styles["site-shell__nav-link"],
          isActivePath(pathname, "/sell") &&
            styles["site-shell__nav-link--active"],
        )}
        href="/sell"
        aria-current={isActivePath(pathname, "/sell") ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        Продать
      </Link>
      <div className={styles["site-shell__auth-actions"]}>
        <Link
          className={styles["site-shell__login-button"]}
          href="/login"
          onClick={() => setMenuOpen(false)}
        >
          Вход
        </Link>
        <Link
          className={styles["site-shell__register-button"]}
          href="/login"
          onClick={() => setMenuOpen(false)}
        >
          Регистрация
        </Link>
      </div>
    </>
  );

  return (
    <>
      <header className={styles["site-shell__navbar"]}>
        <div className={styles["site-shell__navbar-inner"]}>
          <div className={styles["site-shell__brand-group"]}>
            <Link className={styles["site-shell__logo"]} href="/">
              Playnox
            </Link>
            <button
              className={styles["site-shell__theme-toggle"]}
              type="button"
              aria-label={
                theme === "dark"
                  ? "Включить светлую тему"
                  : "Включить тёмную тему"
              }
              aria-checked={theme === "dark"}
              role="switch"
              title={theme === "dark" ? "Тёмная тема" : "Светлая тема"}
              onClick={toggleTheme}
            >
              <span className={styles["site-shell__theme-track"]}>
                <span className={styles["site-shell__theme-thumb"]}>
                  {theme === "dark" ? (
                    <svg
                      className={styles["site-shell__theme-icon"]}
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M9.2 7.6A4.2 4.2 0 0 1 4.4 2.8c0-.2 0-.4.03-.6A4.6 4.6 0 1 0 9.8 7.57c-.2.02-.4.03-.6.03Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={styles["site-shell__theme-icon"]}
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M6 1v1.2M6 9.8V11M1 6h1.2M9.8 6H11M2.4 2.4l.85.85M8.75 8.75l.85.85M2.4 9.6l.85-.85M8.75 3.25l.85-.85"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
            </button>
          </div>

          <div className={styles["site-shell__search-group"]} ref={searchRef}>
            <label className={styles["site-shell__search"]}>
              <input
                className={styles["site-shell__search-input"]}
                type="search"
                placeholder="Поиск товаров..."
                aria-label="Поиск товаров"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  setSearchOpen(true);
                  window.dispatchEvent(
                    new CustomEvent("playnox-catalog-search", {
                      detail: value,
                    }),
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitSearch();
                  }
                }}
              />
              <button
                className={styles["site-shell__search-icon"]}
                type="button"
                aria-label="Открыть поиск"
                onClick={submitSearch}
              >
                <img
                  src="/auth/magnifying-glass.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </label>
            {searchOpen && (
              <SearchOverlay
                query={query}
                onClose={() => setSearchOpen(false)}
              />
            )}
          </div>

          {user ? (
            <nav
              className={styles["site-shell__auth-buttons"]}
              aria-label="Аккаунт"
            >
              {accountNav()}
            </nav>
          ) : userPending ? (
            <div
              className={styles["site-shell__auth-buttons"]}
              aria-busy="true"
              aria-hidden
            />
          ) : (
            <nav
              className={styles["site-shell__auth-buttons"]}
              aria-label="Авторизация"
            >
              {accountNav()}
            </nav>
          )}

          <button
            className={styles["site-shell__menu-toggle"]}
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Outside header: backdrop-filter on .navbar creates a containing block and clips fixed children */}
      {menuOpen ? (
        <div
          className={styles["site-shell__mobile-menu"]}
          id="mobile-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className={styles["site-shell__mobile-menu-inner"]}>
            <label className={styles["site-shell__mobile-search"]}>
              <input
                className={styles["site-shell__search-input"]}
                type="search"
                placeholder="Поиск товаров..."
                aria-label="Поиск товаров"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitSearch();
                  }
                }}
              />
              <button
                className={styles["site-shell__search-icon"]}
                type="button"
                aria-label="Искать"
                onClick={submitSearch}
              >
                <img
                  src="/auth/magnifying-glass.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </label>

            <nav
              className={styles["site-shell__mobile-nav"]}
              aria-label="Мобильная навигация"
            >
              {accountNav(true)}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
