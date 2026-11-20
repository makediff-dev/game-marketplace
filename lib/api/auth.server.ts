import axios from "axios";
import { cookies } from "next/headers";

import { COOKIE_ACCESS_TOKEN } from "@/constants/cookie";
import type { TUser } from "@/types/auth";

export async function fetchCurrentUser(): Promise<TUser | null> {
  const token = (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await axios.get<TUser>("auth/me", {
      baseURL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,
      headers: { Cookie: `${COOKIE_ACCESS_TOKEN}=${token}` },
    });

    return res.data;
  } catch {
    return null;
  }
}
