-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "accounts";

-- CreateEnum
CREATE TYPE "accounts"."role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "accounts"."users" (
    "id" UUID NOT NULL,
    "pseudo" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "accounts"."role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pseudo_key" ON "accounts"."users"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "accounts"."users"("email");
