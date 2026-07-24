export const NICKNAME_STORAGE_KEY = "playnox-nickname";
export const WELCOME_PENDING_KEY = "playnox-show-welcome";
export const WELCOME_RETURN_URL_KEY = "playnox-welcome-return-url";

export function shouldShowWelcomeModal(welcomeParam: string | null): boolean {
  if (welcomeParam === "1") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.sessionStorage.getItem(WELCOME_PENDING_KEY));
}

export function readWelcomeNickname(welcomeParam: string | null): string | null {
  if (welcomeParam) {
    return welcomeParam;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(WELCOME_PENDING_KEY) ||
    window.localStorage.getItem(NICKNAME_STORAGE_KEY)
  );
}

export function markWelcomePending(nickname: string, returnUrl?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NICKNAME_STORAGE_KEY, nickname);
  window.sessionStorage.setItem(WELCOME_PENDING_KEY, nickname);

  if (returnUrl) {
    window.sessionStorage.setItem(WELCOME_RETURN_URL_KEY, returnUrl);
    return;
  }

  window.sessionStorage.removeItem(WELCOME_RETURN_URL_KEY);
}

export function clearWelcomePending() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(WELCOME_PENDING_KEY);
  window.sessionStorage.removeItem(WELCOME_RETURN_URL_KEY);
}

export function readWelcomeReturnUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(WELCOME_RETURN_URL_KEY);
}
