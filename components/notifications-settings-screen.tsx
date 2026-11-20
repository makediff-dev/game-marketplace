"use client";

import { getErrorMessage } from "@/api/error";
import { BackLink } from "@/components/back-link";
import { ListPageSkeleton } from "@/components/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/use-notifications";
import styles from "@/styles/settings-stub.module.scss";

export function NotificationsSettingsScreen() {
  const settingsQuery = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const types = settingsQuery.data ?? [];

  function toggle(type: string) {
    const muted = types
      .filter((item) => !item.critical)
      .filter((item) => (item.type === type ? item.email : !item.email))
      .map((item) => item.type);

    update.mutate(muted);
  }

  return (
    <section className={styles["settings-stub"]}>
      <div className={styles["settings-stub__header"]}>
        <BackLink href="/profile" />
        <h1 className={styles["settings-stub__title"]}>Уведомления</h1>
      </div>
      <p className={styles["settings-stub__lead"]}>
        Все уведомления приходят в личный кабинет. Здесь можно выбрать, какие
        из них дублировать на почту.
      </p>
      {settingsQuery.isLoading ? (
        <ListPageSkeleton rows={4} />
      ) : (
        <div className={styles["settings-stub__card"]}>
          {types.map((item) => (
            <div key={item.type} className={styles["settings-stub__row"]}>
              <div className={styles["settings-stub__row-text"]}>
                <span className={styles["settings-stub__row-title"]}>
                  {item.label}
                </span>
                {item.critical ? (
                  <span className={styles["settings-stub__row-subtitle"]}>
                    Важное письмо, отключить нельзя
                  </span>
                ) : null}
              </div>
              <Switch
                checked={item.email}
                label={`Письма: ${item.label}`}
                disabled={item.critical}
                onChange={() => toggle(item.type)}
              />
            </div>
          ))}
          {update.error ? (
            <p className={styles["settings-stub__note"]} role="alert">
              {getErrorMessage(update.error)}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
