/*
  Warnings:

  - You are about to drop the column `date` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Meetings` table. All the data in the column will be lost.
  - You are about to drop the column `userUserId` on the `Meetings` table. All the data in the column will be lost.
  - Added the required column `timing` to the `Meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meetings" DROP CONSTRAINT "Meetings_userUserId_fkey";

-- AlterTable
ALTER TABLE "Meetings" DROP COLUMN "date",
DROP COLUMN "time",
DROP COLUMN "userUserId",
ADD COLUMN     "timing" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Meetings" ADD CONSTRAINT "Meetings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
