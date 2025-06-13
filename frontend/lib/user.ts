// lib/types/user.ts

export type UserRole = "admin" | "customer" | "property_owner";

export interface UserResponse {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  id_card_url: string | null; // Admins can see this for property owners
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_approved: boolean;
  is_active: boolean; // Soft delete / ban status
}

export interface UserCreate {
  name: string;
  email: string;
  phone?: string | null;
  password?: string; // Optional if using Google login primarily
  role: UserRole;
  id_card_url?: string | null; // Required for property_owner role for approval
  profile_picture_url?: string | null;
}

export interface UserUpdate {
  name?: string;
  phone?: string | null;
  password?: string;
  profile_picture_url?: string | null;
  id_card_url?: string | null; // For admins updating property owner info
  is_active?: boolean; // Only for admins to ban/unban
  is_approved?: boolean; // Only for admins to approve/reject explicitly (though separate endpoints exist)
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // "Bearer"
}

export interface GoogleAuthUrlResponse {
  auth_url: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  code: string;
  new_password: string;
}

export interface TokenRevokeRequest {
  token: string;
  expires_at: string; // ISO 8601 datetime string
}

export interface SuccessMessageResponse {
  message: string;
}

export interface SearchUsersParams {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
  is_approved?: boolean;
  skip?: number;
  limit?: number;
}

export interface ListUsersParams {
  skip?: number;
  limit?: number;
}