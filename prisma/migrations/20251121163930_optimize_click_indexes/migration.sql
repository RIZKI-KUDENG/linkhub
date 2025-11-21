-- DropIndex
DROP INDEX "LinkClicks_linkId_idx";

-- CreateIndex
CREATE INDEX "LinkClicks_linkId_createdAt_idx" ON "LinkClicks"("linkId", "createdAt");
