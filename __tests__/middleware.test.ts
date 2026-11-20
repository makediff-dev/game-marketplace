/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { GET as vkCallback } from "@/app/auth/vk/callback/route";
import { config, middleware } from "@/middleware";

function request(path: string, cookie?: string) {
  return new NextRequest(new URL(path, "https://playnox.test"), {
    headers: cookie ? { cookie } : {},
  });
}

const location = (response: Response) => response.headers.get("location");

describe("middleware", () => {
  it.each(["/profile", "/profile/balance", "/favorites", "/sell/create", "/orders/5", "/chat", "/notifications"])(
    "sends a guest from %s to login and remembers the page",
    (path) => {
      const response = middleware(request(path));

      expect(location(response)).toBe(`https://playnox.test/login?from=${encodeURIComponent(path)}`);
    },
  );

  it("lets a signed-in user through", () => {
    const response = middleware(request("/profile", "access_token=t"));

    expect(location(response)).toBeNull();
  });

  it("does not touch public pages", () => {
    expect(location(middleware(request("/catalog")))).toBeNull();
    expect(location(middleware(request("/profiles")))).toBeNull();
  });

  it("sends a signed-in user away from login to the return url or the profile", () => {
    expect(location(middleware(request("/login?from=/orders/5", "access_token=t")))).toBe("https://playnox.test/orders/5");
    expect(location(middleware(request("/register?returnUrl=//evil.com", "access_token=t")))).toBe("https://playnox.test/profile");
    expect(location(middleware(request("/login", "access_token=t")))).toBe("https://playnox.test/profile");
  });

  it("matches the private routes", () => {
    expect(config.matcher).toEqual(expect.arrayContaining(["/profile/:path*", "/orders/:path*", "/login"]));
  });

  it("covers nested chat routes", () => {
    expect(config.matcher).toContain("/chat/:path*");
  });
});

describe("VK callback route", () => {
  it("returns to the login page", () => {
    const response = vkCallback(request("/auth/vk/callback"));

    expect(location(response)).toBe("https://playnox.test/login");
  });

  it("passes the VK error to the login page", () => {
    const response = vkCallback(request("/auth/vk/callback?error=access_denied"));

    expect(location(response)).toContain("vk=");
  });
});
