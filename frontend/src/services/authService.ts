import { apiClient } from "./api";
import type { AssignedUser } from "../types/user";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AssignedUser;
  token: string;
}

export const authService = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", data);
    return response.data.data;
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/register", data);
    return response.data.data;
  },

  async getCurrentUser(): Promise<AssignedUser> {
    const response = await apiClient.get("/auth/me");
    return response.data.data.user;
  },
};