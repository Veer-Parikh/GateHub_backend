/*
  Warnings:

  - You are about to drop the column `plumberPlumberId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userUserId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `plumberPlumberId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `userUserId` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `plumberId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plumberId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_plumberPlumberId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userUserId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_plumberPlumberId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userUserId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "plumberPlumberId",
DROP COLUMN "userUserId",
ADD COLUMN     "plumberId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "plumberPlumberId",
DROP COLUMN "userUserId",
ADD COLUMN     "plumberId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_plumberId_fkey" FOREIGN KEY ("plumberId") REFERENCES "Plumber"("plumberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_plumberId_fkey" FOREIGN KEY ("plumberId") REFERENCES "Plumber"("plumberId") ON DELETE RESTRICT ON UPDATE CASCADE;
