export type TVkIdWidget = {
  on: (
    event: unknown,
    handler: (payload: { code?: string; device_id?: string } | unknown) => void,
  ) => TVkIdWidget;
};

export type TVkIdToken = {
  access_token?: string;
};

export type TVkIdSdk = {
  Config: {
    init: (config: {
      app: number;
      redirectUrl: string;
      responseMode: unknown;
      source: unknown;
      scope: string;
    }) => void;
  };
  ConfigResponseMode: {
    Callback: unknown;
  };
  ConfigSource: {
    LOWCODE: unknown;
  };
  OneTap: new () => {
    render: (options: {
      container: HTMLElement;
      showAlternativeLogin: boolean;
      styles?: {
        borderRadius?: number;
        height?: number;
      };
    }) => TVkIdWidget;
  };
  WidgetEvents: {
    ERROR: unknown;
  };
  OneTapInternalEvents: {
    LOGIN_SUCCESS: unknown;
  };
  Auth: {
    exchangeCode: (code: string, deviceId: string) => Promise<TVkIdToken>;
  };
};

declare global {
  interface Window {
    VKIDSDK?: TVkIdSdk;
  }
}

export {};
