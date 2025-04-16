/*
  Warnings:

  - You are about to drop the column `userId` on the `Maintenance` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Maintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_userId_fkey";

-- AlterTable
ALTER TABLE "Maintenance" DROP COLUMN "userId",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;
