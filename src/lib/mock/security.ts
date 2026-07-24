export interface SecurityInfo {
  twoFactorStatus: string;
  activeSessions: string;
  lastLogin: string;
}

export const mockSecurityInfo: SecurityInfo = {
  twoFactorStatus: "не подключена (mock)",
  activeSessions: "1 устройство",
  lastLogin: "сегодня",
};
