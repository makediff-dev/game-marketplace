export interface ContactCard {
  id: string;
  title: string;
  description: string;
  email?: string;
  social?: boolean;
}

export const contactCards: ContactCard[] = [
  {
    id: "support",
    title: "Поддержка",
    description:
      "Если вас заблокировали или не получили помощь в чате на сайте, отправьте ваше обращение на электронную почту – его рассмотрят более опытные сотрудники",
    email: "support@playnox.com",
  },
  {
    id: "ads",
    title: "Реклама",
    description:
      "Если у вас есть целевая аудитория, мы готовы обсудить размещение рекламы. Это предложение для рекламных менеджеров, блогеров и владельцев медиа-продуктов.",
    email: "reklama@playnox.com",
  },
  {
    id: "finance",
    title: "Финансовый отдел",
    description:
      "Обработка платежей/выплаты для продавцов. Запросы на возврат средств и оспаривание транзакций. Вопросы сотрудничества с банками",
    email: "money@playnox.com",
  },
  {
    id: "legal",
    title: "Официальные запросы",
    description:
      "Государственным органам, правоохранительным структурам и правообладателям по юридическим вопросам",
    email: "legal@playnox.com",
  },
  {
    id: "social",
    title: "Социальные сети",
    description: "Подписывайтесь, чтобы быть в курсе всех новостей!",
    social: true,
  },
  {
    id: "partners",
    title: "Деловое сотрудничество",
    description:
      "Мы готовы к деловому сотрудничеству: обсуждаем возможности коллаборации с брендами, бизнес-партнёрства и прямых поставок товаров",
    email: "partners@playnox.com",
  },
];

export const socialLinks = [
  { id: "telegram", href: "#", image: "/assets/social-telegram.svg", label: "Telegram" },
  { id: "vk", href: "#", image: "/assets/social-vk.svg", label: "ВКонтакте" },
  { id: "youtube", href: "#", image: "/assets/social-youtube.svg", label: "YouTube" },
];
