/*
  Warnings:

  - You are about to drop the column `email` on the `Security` table. All the data in the column will be lost.
  - You are about to drop the column `profileUrl` on the `Security` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Visitor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Security" DROP COLUMN "email",
DROP COLUMN "profileUrl";

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
