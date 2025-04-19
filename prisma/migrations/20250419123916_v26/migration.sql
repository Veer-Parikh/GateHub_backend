/*
  Warnings:

  - Added the required column `generalCost` to the `Laundry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laundry" DROP COLUMN "generalCost",
ADD COLUMN     "generalCost" DOUBLE PRECISION NOT NULL;
