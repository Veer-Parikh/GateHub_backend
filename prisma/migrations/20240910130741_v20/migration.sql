-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_plumberId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "laundryId" TEXT,
ALTER COLUMN "plumberId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Laundry" (
    "laundryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "generalCost" TEXT,
    "serviceHours" TEXT,
    "number" TEXT NOT NULL,

    CONSTRAINT "Laundry_pkey" PRIMARY KEY ("laundryId")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_plumberId_fkey" FOREIGN KEY ("plumberId") REFERENCES "Plumber"("plumberId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_laundryId_fkey" FOREIGN KEY ("laundryId") REFERENCES "Laundry"("laundryId") ON DELETE SET NULL ON UPDATE CASCADE;
