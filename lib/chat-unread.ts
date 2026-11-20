const STORAGE_KEY = "playnox-chat-read-at";

type TReadMap = Record<string, string>;

function readMap(): TReadMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as TReadMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: TReadMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function markChatRead(orderId: string, at = new Date().toISOString()) {
  const map = readMap();
  map[orderId] = at;
  writeMap(map);
}

export function isChatUnread(
  orderId: string,
  lastMessageAt: string | null | undefined,
): boolean {
  if (!lastMessageAt) {
    return false;
  }

  const lastRead = readMap()[orderId];
  if (!lastRead) {
    return true;
  }

  return new Date(lastMessageAt).getTime() > new Date(lastRead).getTime();
}
