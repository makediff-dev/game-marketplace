export type TUser = {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUpdatedAt?: number;
};

export type TCredentials = {
  email: string;
  password: string;
};
