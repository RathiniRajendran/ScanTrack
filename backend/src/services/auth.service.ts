import { Role } from "@prisma/client";
import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import type { AuthResult, LoginInput, RegisterInput, SanitizedUser } from "../types/auth.types";

function sanitizeUser(user: { id: string; name: string; email: string; role: Role }): SanitizedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(409, "A user with this email already exists");

  const passwordHash = await hashPassword(input.password);

  // Public registration always defaults to VIEWER; ADMIN can never be self-assigned here
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: Role.VIEWER,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Use the same error for unknown email and wrong password to avoid leaking account existence
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  const token = generateToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function getCurrentUser(userId: string): Promise<SanitizedUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(401, "User no longer exists");
  return sanitizeUser(user);
}
