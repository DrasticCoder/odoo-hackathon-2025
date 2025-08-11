export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  USER = 'USER',
}

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  isActive?: boolean;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type SignUpRequest = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  avatarUrl?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignUpResponse = {
  message: string;
  userId: string;
};

export type OtpRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};
