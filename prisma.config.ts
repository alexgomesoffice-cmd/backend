import "dotenv/config";

export const config = {
  schema: "prisma/schema.prisma",
  datasourceUrl: process.env.DATABASE_URL,
};
