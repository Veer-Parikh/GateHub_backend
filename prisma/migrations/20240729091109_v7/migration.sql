-- DropForeignKey
ALTER TABLE "Visitor" DROP CONSTRAINT "Visitor_userId_fkey";

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "securityId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_securityId_fkey" FOREIGN KEY ("securityId") REFERENCES "Security"("securityId") ON DELETE SET NULL ON UPDATE CASCADE;
