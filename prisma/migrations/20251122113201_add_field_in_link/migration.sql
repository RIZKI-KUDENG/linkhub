-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "isSensitive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT;
