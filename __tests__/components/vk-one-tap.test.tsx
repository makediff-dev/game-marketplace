import { render, waitFor } from "@testing-library/react";

import { VkOneTap } from "@/components/vk-one-tap";

type THandler = (payload: unknown) => void;
type TWidget = { render: jest.Mock; on: jest.Mock };

function installSdk(exchange: jest.Mock) {
  const handlers: Record<string, THandler> = {};
  const widget: TWidget = {
    render: jest.fn((): TWidget => widget),
    on: jest.fn((event: string, handler: THandler): TWidget => {
      handlers[event] = handler;
      return widget;
    }),
  };
  const sdk = {
    Config: { init: jest.fn() },
    ConfigResponseMode: { Callback: "callback" },
    ConfigSource: { LOWCODE: "lowcode" },
    OneTap: jest.fn(() => widget),
    WidgetEvents: { ERROR: "error" },
    OneTapInternalEvents: { LOGIN_SUCCESS: "login" },
    Auth: { exchangeCode: exchange },
  };
  (window as unknown as { VKIDSDK: unknown }).VKIDSDK = sdk;
  return { sdk, handlers, widget };
}

async function mount(exchange = jest.fn()) {
  const env = installSdk(exchange);
  const onToken = jest.fn();
  const onError = jest.fn();
  const view = render(<VkOneTap onToken={onToken} onError={onError} />);
  await waitFor(() => expect(env.widget.render).toHaveBeenCalled());
  return { ...env, onToken, onError, view };
}

afterEach(() => {
  delete (window as unknown as { VKIDSDK?: unknown }).VKIDSDK;
});

describe("VkOneTap", () => {
  it("configures the SDK once and renders the widget", async () => {
    const first = await mount();
    expect(first.sdk.Config.init).toHaveBeenCalledWith(expect.objectContaining({ responseMode: "callback" }));
    expect(first.widget.render).toHaveBeenCalledWith(expect.objectContaining({ showAlternativeLogin: true }));
    first.view.unmount();

    const second = await mount();
    expect(second.sdk.Config.init).not.toHaveBeenCalled();
  });

  it("exchanges the code for a token", async () => {
    const exchange = jest.fn().mockResolvedValue({ access_token: "vk-token" });
    const { handlers, onToken } = await mount(exchange);

    handlers.login({ code: "c", device_id: "d" });

    await waitFor(() => expect(onToken).toHaveBeenCalledWith("vk-token"));
    expect(exchange).toHaveBeenCalledWith("c", "d");
  });

  it.each([
    ["an incomplete answer", { code: "c" }, undefined, "VK ID вернул неполный ответ"],
    ["no token", { code: "c", device_id: "d" }, {}, "VK ID не выдал токен"],
  ])("reports %s", async (_name, payload, exchanged, message) => {
    const { handlers, onError } = await mount(jest.fn().mockResolvedValue(exchanged));

    handlers.login(payload);

    await waitFor(() => expect(onError).toHaveBeenCalledWith(message));
  });

  it("passes widget errors through but stays quiet on timeouts", async () => {
    const { handlers, onError } = await mount();

    handlers.error({ text: "timeout" });
    handlers.error({ text: "Окно закрыто" });
    handlers.error(null);

    expect(onError.mock.calls).toEqual([["Окно закрыто"], ["Не удалось войти через VK ID"]]);
  });

  it("reports a failed exchange", async () => {
    const { handlers, onError } = await mount(jest.fn().mockRejectedValue({ text: "Код устарел" }));

    handlers.login({ code: "c", device_id: "d" });

    await waitFor(() => expect(onError).toHaveBeenCalledWith("Код устарел"));
  });

  it("clears the widget on unmount", async () => {
    const { view } = await mount();
    const container = view.container.firstChild as HTMLElement;
    container.appendChild(document.createElement("iframe"));

    view.unmount();

    expect(container.childElementCount).toBe(0);
  });
});
