-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customAccentColor" TEXT DEFAULT '#000000',
ADD COLUMN     "customBgColor" TEXT DEFAULT '#ffffff',
ADD COLUMN     "customBgImage" TEXT,
ADD COLUMN     "customFont" TEXT DEFAULT 'Inter';
