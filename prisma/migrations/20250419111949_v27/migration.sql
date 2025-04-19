/*
  Warnings:

  - You are about to drop the column `meetId` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the column `meetLink` on the `Meetings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meetings" DROP COLUMN "meetId",
DROP COLUMN "meetLink",
ADD COLUMN     "jitsiId" TEXT,
ADD COLUMN     "jitsiLink" TEXT;
