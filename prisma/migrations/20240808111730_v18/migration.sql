/*
  Warnings:

  - You are about to drop the column `plumberId` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_plumberId_fkey";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "plumberId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;
