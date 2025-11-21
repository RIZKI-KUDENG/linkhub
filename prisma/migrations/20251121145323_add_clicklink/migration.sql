-- CreateTable
CREATE TABLE "LinkClicks" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,

    CONSTRAINT "LinkClicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkClicks_linkId_idx" ON "LinkClicks"("linkId");

-- CreateIndex
CREATE INDEX "LinkClicks_createdAt_idx" ON "LinkClicks"("createdAt");

-- AddForeignKey
ALTER TABLE "LinkClicks" ADD CONSTRAINT "LinkClicks_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
