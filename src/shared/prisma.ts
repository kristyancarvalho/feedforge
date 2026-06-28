import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (client) {
    await client.$disconnect();
    client = null;
  }
};
