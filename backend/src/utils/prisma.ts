import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across the app instead of creating one per controller
const prisma = new PrismaClient();

export default prisma;
