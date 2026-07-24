export interface NotificationChannel {
  id: string;
  label: string;
  enabled: boolean;
  disabled?: boolean;
}

export interface NotificationEvent {
  id: string;
  label: string;
  enabled: boolean;
}

export const defaultNotificationChannels: NotificationChannel[] = [
  { id: "in-app", label: "Внутри сервиса", enabled: true },
  { id: "email", label: "Email", enabled: true },
  { id: "telegram", label: "Telegram (будущая интеграция)", enabled: false, disabled: true },
];

export const defaultNotificationEvents: NotificationEvent[] = [
  { id: "order-created", label: "Заказ создан", enabled: true },
  { id: "order-paid", label: "Заказ оплачен", enabled: true },
  { id: "order-completed", label: "Продавец выполнил заказ", enabled: true },
  { id: "confirm-receipt", label: "Нужно подтвердить получение", enabled: true },
  { id: "dispute-opened", label: "Открыт спор", enabled: true },
  { id: "dispute-resolved", label: "Решение по спору", enabled: true },
  { id: "new-message", label: "Новое сообщение", enabled: true },
  { id: "withdrawal", label: "Вывод средств", enabled: true },
];
