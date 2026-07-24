"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import {
  defaultNotificationChannels,
  defaultNotificationEvents,
  type NotificationChannel,
  type NotificationEvent,
} from "@/lib/mock/notifications-settings";
import styles from "./notification-settings-content.module.css";

export function NotificationSettingsContent() {
  const [channels, setChannels] = useState<NotificationChannel[]>(defaultNotificationChannels);
  const [events, setEvents] = useState<NotificationEvent[]>(defaultNotificationEvents);

  const toggleChannel = (id: string) => {
    setChannels((current) =>
      current.map((channel) =>
        channel.id === id && !channel.disabled
          ? { ...channel, enabled: !channel.enabled }
          : channel,
      ),
    );
  };

  const toggleEvent = (id: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, enabled: !event.enabled } : event,
      ),
    );
  };

  return (
    <div className={styles.settings}>
      <section className={styles.section} aria-labelledby="notification-channels-title">
        <h2 id="notification-channels-title" className={styles.sectionTitle}>
          Каналы
        </h2>
        <ul className={styles.list}>
          {channels.map((channel) => (
            <li key={channel.id}>
              <button
                type="button"
                className={styles.optionRow}
                onClick={() => toggleChannel(channel.id)}
                disabled={channel.disabled}
                aria-pressed={channel.enabled}
              >
                <span
                  className={[
                    styles.checkbox,
                    channel.enabled ? styles.checkboxChecked : "",
                    channel.disabled ? styles.checkboxDisabled : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  {channel.enabled ? (
                    <Icon
                      src="/assets/checkmark-white.svg"
                      width={12}
                      height={9}
                      className={styles.checkIcon}
                    />
                  ) : null}
                </span>
                <span className={channel.disabled ? styles.labelDisabled : styles.label}>
                  {channel.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="notification-events-title">
        <h2 id="notification-events-title" className={styles.sectionTitle}>
          Типы событий
        </h2>
        <ul className={styles.list}>
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className={styles.optionRow}
                onClick={() => toggleEvent(event.id)}
                aria-pressed={event.enabled}
              >
                <span
                  className={[styles.checkbox, event.enabled ? styles.checkboxChecked : ""]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  {event.enabled ? (
                    <Icon
                      src="/assets/checkmark-white.svg"
                      width={12}
                      height={9}
                      className={styles.checkIcon}
                    />
                  ) : null}
                </span>
                <span className={styles.label}>{event.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
