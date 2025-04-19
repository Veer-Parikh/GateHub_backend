/*
  Warnings:

  - You are about to drop the column `zoomJoinUrl` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the column `zoomMeetingId` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the column `zoomPassword` on the `Meetings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meetings" DROP COLUMN "zoomJoinUrl",
DROP COLUMN "zoomMeetingId",
DROP COLUMN "zoomPassword",
ADD COLUMN     "meetId" TEXT,
ADD COLUMN     "meetLink" TEXT;
