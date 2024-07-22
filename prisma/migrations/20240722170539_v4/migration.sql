/*
  Warnings:

  - You are about to drop the column `adminAdminId` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userUserId` to the `Meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meetings" DROP CONSTRAINT "Meetings_adminAdminId_fkey";

-- AlterTable
ALTER TABLE "Meetings" DROP COLUMN "adminAdminId",
ADD COLUMN     "userUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Admin";

-- AddForeignKey
ALTER TABLE "Meetings" ADD CONSTRAINT "Meetings_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
