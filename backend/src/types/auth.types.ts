import type { Role } from "@prisma/client";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: SanitizedUser;
  token: string;
}
