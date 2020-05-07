export interface UserAuthData {
  username: string;
  userId?: number | string;
  extra: any;
  thirdAuth: {
    appId: string;
  };
  createdAt: Date;
}
