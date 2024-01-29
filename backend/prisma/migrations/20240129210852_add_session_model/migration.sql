/*
  Warnings:

  - You are about to drop the `TestModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TestModel";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
