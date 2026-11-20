"use client";

import { useEffect, useRef } from "react";

import styles from "@/styles/auth-screen.module.scss";

const VK_APP_ID = Number(process.env.NEXT_PUBLIC_VK_APP_ID ?? "54795770");
const VK_REDIRECT_URL =
  process.env.NEXT_PUBLIC_VK_REDIRECT_URL ??
  "https://gaming-marketplace-front.makediff.dev/auth/vk/callback";
const VK_SDK_SRC = "/vk/vkid-sdk.js";

let sdkConfigReady = false;
let vkFetchNoiseFiltered = false;

function isVkConfigFetchNoise(value: unknown): boolean {
  const details =
    value instanceof Error
      ? `${value.message}\n${value.stack ?? ""}`
      : String(value);

  if (!details.includes("Failed to fetch")) {
    return false;
  }

  return (
    details.includes("id.vk.ru") ||
    details.includes("@vkid/sdk") ||
    details.includes("vk-one-tap") ||
    details.includes("VKIDSDK") ||
    details.includes("vkid")
  );
}

// VK ID SDK throws a CORS "Failed to fetch" for its config request.
// One Tap still works; suppress the noise so Next.js does not show a runtime overlay.
function ignoreVkConfigFetchError() {
  if (vkFetchNoiseFiltered) {
    return;
  }

  vkFetchNoiseFiltered = true;
  const originalConsoleError = console.error;

  console.error = (...args: unknown[]) => {
    if (args.some((item) => isVkConfigFetchNoise(item))) {
      return;
    }

    const details = args
      .map((item) =>
        item instanceof Error
          ? `${item.message}\n${item.stack ?? ""}`
          : String(item),
      )
      .join("\n");

    if (isVkConfigFetchNoise(details)) {
      return;
    }

    originalConsoleError(...args);
  };

  window.addEventListener("unhandledrejection", (event) => {
    if (isVkConfigFetchNoise(event.reason)) {
      event.preventDefault();
    }
  });
}

function loadVkSdk(): Promise<void> {
  if (window.VKIDSDK) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${VK_SDK_SRC}"]`,
  );

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("sdk")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => reject(new Error("sdk")), 8000);

    script.src = VK_SDK_SRC;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("sdk"));
    };
    document.head.appendChild(script);
  });
}

function readVkMessage(error: unknown): string | null {
  if (typeof error === "object" && error && "text" in error) {
    const text = error.text;

    if (text === "timeout") {
      return null;
    }

    if (typeof text === "string" && text.trim()) {
      return text;
    }
  }

  return "Не удалось войти через VK ID";
}

export function VkOneTap({
  onToken,
  onError,
}: {
  onToken: (accessToken: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);

  onTokenRef.current = onToken;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    if (!container) {
      return;
    }

    ignoreVkConfigFetchError();

    loadVkSdk()
      .then(() => {
        if (cancelled || !container) {
          return;
        }

        const VKID = window.VKIDSDK;

        if (!VKID) {
          onErrorRef.current("Не удалось загрузить VK ID");
          return;
        }

        try {
          if (!sdkConfigReady) {
            VKID.Config.init({
              app: VK_APP_ID,
              redirectUrl: VK_REDIRECT_URL,
              responseMode: VKID.ConfigResponseMode.Callback,
              source: VKID.ConfigSource.LOWCODE,
              scope: "",
            });
            sdkConfigReady = true;
          }

          container.replaceChildren();

          const oneTap = new VKID.OneTap();

          oneTap
            .render({
              container,
              showAlternativeLogin: true,
              styles: {
                borderRadius: 20,
                height: 56,
              },
            })
          .on(VKID.WidgetEvents.ERROR, (error) => {
            const message = readVkMessage(error);

            if (message) {
              onErrorRef.current(message);
            }
          })
          .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, (payload) => {
            const code =
              typeof payload === "object" && payload && "code" in payload
                ? payload.code
                : undefined;
            const deviceId =
              typeof payload === "object" && payload && "device_id" in payload
                ? payload.device_id
                : undefined;

            if (typeof code !== "string" || typeof deviceId !== "string") {
              onErrorRef.current("VK ID вернул неполный ответ");
              return;
            }

            VKID.Auth.exchangeCode(code, deviceId)
              .then((data) => {
                if (!data.access_token) {
                  onErrorRef.current("VK ID не выдал токен");
                  return;
                }

                onTokenRef.current(data.access_token);
              })
              .catch((error: unknown) => {
                const message = readVkMessage(error);

                if (message) {
                  onErrorRef.current(message);
                }
              });
            });
        } catch (error) {
          const message = readVkMessage(error);

          if (message) {
            onErrorRef.current(message);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          onErrorRef.current("Не удалось загрузить VK ID");
        }
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles["auth-screen__vk-one-tap"]} />
  );
}
