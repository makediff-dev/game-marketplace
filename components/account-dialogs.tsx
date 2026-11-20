"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { getErrorMessage } from "@/api/error";
import { AvatarPicker } from "@/components/avatar-picker";
import { LineIcon, type TLineIconName } from "@/components/ui/line-icon";
import { useLogout, useUpdateProfile } from "@/hooks/use-auth";
import { cx } from "@/lib/cx";
import accountStyles from "@/styles/account-dialog.module.scss";
import menuStyles from "@/styles/profile-menu-modal.module.scss";
import type { TUser } from "@/types/auth";

const NICKNAME_PATTERN = /^[A-Za-z0-9]{3,16}$/;

const NICKNAME_HINT = "От 3 до 16 символов, латиница и цифры";

function nicknameError(value: string): string | null {
  if (!value) {
    return null;
  }

  return NICKNAME_PATTERN.test(value) ? null : NICKNAME_HINT;
}

export function AccountOnboardingDialog({
  user,
  onSaved,
}: {
  user: TUser;
  onSaved: (user: TUser) => void;
}) {
  const updateProfile = useUpdateProfile();
  const [nickname, setNickname] = useState("");
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const valid = NICKNAME_PATTERN.test(nickname);
  const fieldError = touched || localError ? nicknameError(nickname) : null;
  const errorText =
    fieldError ??
    localError ??
    (updateProfile.isError ? getErrorMessage(updateProfile.error) : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!valid) {
      setLocalError(NICKNAME_HINT);
      return;
    }

    setLocalError(null);
    updateProfile.mutate(nickname, {
      onSuccess: (saved) => onSaved(saved),
    });
  }

  return (
    <div className={accountStyles["account-dialog__overlay"]}>
      <form className={accountStyles["account-dialog"]} onSubmit={handleSubmit}>
        <h2 className={accountStyles["account-dialog__title"]}>Знакомство</h2>
        <div className={accountStyles["account-dialog__avatar-block"]}>
          <AvatarPicker user={user} size={120} />
        </div>
        <label className={accountStyles["account-dialog__field"]}>
          <input
            className={accountStyles["account-dialog__input"]}
            name="nickname"
            value={nickname}
            placeholder="Nickname"
            autoComplete="username"
            aria-label="Nickname"
            aria-invalid={Boolean(errorText)}
            onChange={(event) => {
              setNickname(event.target.value);
              setTouched(true);
              setLocalError(null);
            }}
          />
        </label>
        <p className={accountStyles["account-dialog__hint"]}>{NICKNAME_HINT}</p>
        {errorText ? (
          <p className={accountStyles["account-dialog__error"]} role="alert">
            {errorText}
          </p>
        ) : null}
        <button
          className={accountStyles["account-dialog__save"]}
          type="submit"
          disabled={!valid || updateProfile.isPending}
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}

export function WelcomeDialog({
  name,
  since,
  onClose,
}: {
  name: string;
  since: string;
  onClose: () => void;
}) {
  return (
    <div className={accountStyles["account-dialog__overlay"]}>
      <div
        className={accountStyles["account-dialog"]}
        role="dialog"
        aria-labelledby="welcome-title"
      >
        <button
          className={accountStyles["account-dialog__close"]}
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <img src="/auth/close.svg" alt="" width={24} height={24} />
        </button>
        <p className={accountStyles["account-dialog__wave"]} aria-hidden>
          👋
        </p>
        <h2
          className={accountStyles["account-dialog__welcome-title"]}
          id="welcome-title"
        >
          Добро пожаловать,
          <br />
          {name}!
        </h2>
        <p className={accountStyles["account-dialog__since"]}>
          На Playnox с {since}
        </p>
        <button
          className={accountStyles["account-dialog__save"]}
          type="button"
          onClick={onClose}
        >
          Начать
        </button>
      </div>
    </div>
  );
}

export function NicknameEditDialog({
  user,
  onClose,
  onSaved,
}: {
  user: TUser;
  onClose: () => void;
  onSaved?: (user: TUser) => void;
}) {
  const updateProfile = useUpdateProfile();
  const [nickname, setNickname] = useState(user.username);
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const valid = NICKNAME_PATTERN.test(nickname);
  const fieldError = touched || localError ? nicknameError(nickname) : null;
  const errorText =
    fieldError ??
    localError ??
    (updateProfile.isError ? getErrorMessage(updateProfile.error) : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!valid) {
      setLocalError(NICKNAME_HINT);
      return;
    }

    setLocalError(null);
    updateProfile.mutate(nickname, {
      onSuccess: (saved) => {
        onSaved?.(saved);
        onClose();
      },
    });
  }

  return (
    <div className={accountStyles["account-dialog__overlay"]} onClick={onClose}>
      <form
        className={accountStyles["account-dialog"]}
        role="dialog"
        aria-labelledby="nickname-edit-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button
          className={accountStyles["account-dialog__close"]}
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <img src="/auth/close.svg" alt="" width={24} height={24} />
        </button>
        <h2
          className={accountStyles["account-dialog__title"]}
          id="nickname-edit-title"
        >
          Изменить никнейм
        </h2>
        <label className={accountStyles["account-dialog__field"]}>
          <input
            className={accountStyles["account-dialog__input"]}
            name="nickname"
            value={nickname}
            placeholder="Nickname"
            autoComplete="username"
            aria-label="Nickname"
            aria-invalid={Boolean(errorText)}
            onChange={(event) => {
              setNickname(event.target.value);
              setTouched(true);
              setLocalError(null);
            }}
          />
        </label>
        <p className={accountStyles["account-dialog__hint"]}>{NICKNAME_HINT}</p>
        {errorText ? (
          <p className={accountStyles["account-dialog__error"]} role="alert">
            {errorText}
          </p>
        ) : null}
        <button
          className={accountStyles["account-dialog__save"]}
          type="submit"
          disabled={!valid || updateProfile.isPending}
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}

type TMenuLink = {
  href: string;
  icon: TLineIconName;
  title: string;
  subtitle?: string;
};

const MENU_GROUPS: Array<{ title: string; links: TMenuLink[] }> = [
  {
    title: "Покупки и продажи",
    links: [
      { href: "/profile/balance", icon: "wallet", title: "Баланс и история", subtitle: "Пополнение и вывод" },
      { href: "/favorites", icon: "heart", title: "Понравившиеся товары" },
      { href: "/profile/sales-stats", icon: "chart", title: "Статистика продаж", subtitle: "Выручка и популярные товары" },
    ],
  },
  {
    title: "Настройки",
    links: [
      { href: "/profile/notifications", icon: "bell", title: "Уведомления", subtitle: "Какие письма приходят на почту" },
    ],
  },
];

/** Profile sections and account settings: a sidebar on desktop, a sheet on phones. */
export function ProfileMenu({
  user,
  onNavigate,
}: {
  user: TUser;
  onNavigate?: () => void;
}) {
  const logout = useLogout();
  const [nicknameOpen, setNicknameOpen] = useState(false);
  // VK sign-in without a shared address stores a stand-in one.
  const email = /@example\.com$/i.test(user.email) ? null : user.email;

  return (
    <>
      <nav className={menuStyles["profile-menu"]} aria-label="Меню профиля">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className={menuStyles["profile-menu__group"]}>
            <p className={menuStyles["profile-menu__group-title"]}>
              {group.title}
            </p>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={menuStyles["profile-menu__row"]}
                onClick={onNavigate}
              >
                <span className={menuStyles["profile-menu__icon"]}>
                  <LineIcon name={link.icon} />
                </span>
                <span className={menuStyles["profile-menu__text"]}>
                  <span className={menuStyles["profile-menu__title"]}>
                    {link.title}
                  </span>
                  {link.subtitle ? (
                    <span className={menuStyles["profile-menu__subtitle"]}>
                      {link.subtitle}
                    </span>
                  ) : null}
                </span>
                <LineIcon
                  className={menuStyles["profile-menu__arrow"]}
                  name="chevron"
                />
              </Link>
            ))}
          </div>
        ))}

        <div className={menuStyles["profile-menu__group"]}>
          <p className={menuStyles["profile-menu__group-title"]}>Аккаунт</p>
          <div className={menuStyles["profile-menu__row"]}>
            <span className={menuStyles["profile-menu__icon"]}>
              <LineIcon name="user" />
            </span>
            <span className={menuStyles["profile-menu__text"]}>
              <span className={menuStyles["profile-menu__subtitle"]}>
                Никнейм
              </span>
              <span className={menuStyles["profile-menu__title"]}>
                {user.username}
              </span>
            </span>
            <button
              className={menuStyles["profile-menu__change"]}
              type="button"
              onClick={() => setNicknameOpen(true)}
            >
              Изменить
            </button>
          </div>
          <div className={menuStyles["profile-menu__row"]}>
            <span className={menuStyles["profile-menu__icon"]}>
              <LineIcon name="mail" />
            </span>
            <span className={menuStyles["profile-menu__text"]}>
              <span className={menuStyles["profile-menu__subtitle"]}>
                Почта
              </span>
              <span
                className={cx(
                  menuStyles["profile-menu__title"],
                  menuStyles["profile-menu__title--wrap"],
                )}
              >
                {email ?? "Не указана"}
              </span>
            </span>
          </div>
        </div>

        <div className={menuStyles["profile-menu__actions"]}>
          <Link
            href="/chat?chat=support"
            className={cx(
              menuStyles["profile-menu__action"],
              menuStyles["profile-menu__action--support"],
            )}
            onClick={onNavigate}
          >
            <LineIcon name="chat" />
            Написать в поддержку
          </Link>
          <button
            className={cx(
              menuStyles["profile-menu__action"],
              menuStyles["profile-menu__action--logout"],
            )}
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LineIcon name="logout" />
            Выйти из профиля
          </button>
        </div>
      </nav>

      {nicknameOpen && (
        <NicknameEditDialog
          user={user}
          onClose={() => setNicknameOpen(false)}
        />
      )}
    </>
  );
}

export function AccountMenuDialog({
  user,
  onClose,
}: {
  user: TUser;
  since?: string;
  onClose: () => void;
}) {
  return (
    <div className={menuStyles["profile-menu-modal"]} onClick={onClose}>
      <div
        className={menuStyles["profile-menu-modal__panel"]}
        role="dialog"
        aria-labelledby="account-menu-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={menuStyles["profile-menu-modal__header"]}>
          <h2
            className={menuStyles["profile-menu-modal__title"]}
            id="account-menu-title"
          >
            Меню
          </h2>
          <button
            className={menuStyles["profile-menu-modal__close-button"]}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <img src="/auth/close.svg" alt="" width={24} height={24} />
          </button>
        </div>

        <div className={menuStyles["profile-menu-modal__avatar-section"]}>
          <AvatarPicker user={user} size={88} showUploadButton />
        </div>

        <ProfileMenu user={user} onNavigate={onClose} />
      </div>
    </div>
  );
}
