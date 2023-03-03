export type LoginResponseType = {
  email?: string;
  error: boolean;
  accessToken?: string;
  refreshToken?: string;
  fullName?: string;
  userId?: number;
  message: string;
};
