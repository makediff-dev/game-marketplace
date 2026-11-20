// One stroke set for the account and seller pages, instead of emoji.
// Drawn on a 24 grid: at 24px the 2-unit stroke lands on whole pixels,
// smaller sizes give fractional lines that blur on 1x screens.
const PATHS = {
  wallet:
    "M19 8.5V6.5A1.5 1.5 0 0 0 17.5 5h-11A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-1.5M4 7.5A2.5 2.5 0 0 0 6.5 10h12a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H16a2 2 0 0 1 0-4h4",
  heart:
    "M12 19s-7-4.3-7-9.4A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 2.1C19 14.7 12 19 12 19Z",
  chart: "M5 19v-7M12 19V5M19 19v-5",
  bell: "M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4",
  shield: "M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Zm-3 9 2 2 4-4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  mail: "M4 6.5h16v11H4v-11Zm.5.5 7.5 6 7.5-6",
  chat: "M5 19V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5L5 19Z",
  logout: "M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h9",
  chevron: "m9 6 6 6-6 6",
  percent:
    "M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  bolt: "M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z",
  trend: "M4 17 10 11l4 4 6-7m0 0h-5m5 0v5",
  note: "M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 5h6m-6 4h6m-6 4h3",
} as const;

export type TLineIconName = keyof typeof PATHS;

export function LineIcon({
  name,
  size = 24,
  className,
}: {
  name: TLineIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d={PATHS[name]}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
