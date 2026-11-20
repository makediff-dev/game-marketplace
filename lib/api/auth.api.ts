import axios, { type AxiosInstance, type AxiosResponse } from "axios";

import type { TCredentials, TUser } from "@/types/auth";

export class AuthApi {
  private static instance: AuthApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): AuthApi {
    if (!AuthApi.instance) {
      AuthApi.instance = new AuthApi();
    }

    return AuthApi.instance;
  }

  public async register(body: TCredentials): Promise<TUser> {
    const res = await this.httpInstance.post<
      TUser,
      AxiosResponse<TUser>,
      TCredentials
    >("auth/register", body);

    return res.data;
  }

  public async login(body: TCredentials): Promise<TUser> {
    const res = await this.httpInstance.post<
      TUser,
      AxiosResponse<TUser>,
      TCredentials
    >("auth/login", body);

    return res.data;
  }

  public async getProfile(): Promise<TUser> {
    const res = await this.httpInstance.get<TUser>("auth/me");

    return res.data;
  }

  public async requestEmailCode(email: string): Promise<{
    retryAfterSeconds: number;
    devCode?: string;
  }> {
    const res = await this.httpInstance.post<{
      retryAfterSeconds: number;
      devCode?: string;
    }>("auth/email/code", { email });

    return res.data;
  }

  public async verifyEmailCode(email: string, code: string): Promise<TUser> {
    const res = await this.httpInstance.post<TUser>("auth/email/verify", {
      email,
      code,
    });

    return res.data;
  }

  public async loginWithVk(accessToken: string): Promise<TUser> {
    const res = await this.httpInstance.post<TUser>("auth/vk", { accessToken });

    return res.data;
  }

  public async updateProfile(username: string): Promise<TUser> {
    const res = await this.httpInstance.post<TUser>("auth/profile", {
      username,
    });

    return res.data;
  }

  public async uploadAvatar(file: File): Promise<TUser> {
    const body = new FormData();
    body.append("file", file);

    const res = await this.httpInstance.post<TUser>("auth/avatar", body);

    return res.data;
  }

  public async logout(): Promise<void> {
    await this.httpInstance.post("auth/logout");
  }
}
