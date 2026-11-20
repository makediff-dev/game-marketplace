import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export { router, setNavigation } from "./navigation-mock";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

export function renderHookWithClient<T>(hook: () => T, client = createQueryClient()) {
  return { client, ...renderHook(hook, { wrapper: wrapperFor(client) }) };
}

export function renderWithClient(
  ui: ReactElement,
  client = createQueryClient(),
  options?: Omit<RenderOptions, "wrapper">,
) {
  return { client, ...render(ui, { wrapper: wrapperFor(client), ...options }) };
}
