/*
  Warnings:

  - Added the required column `status` to the `Visitor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "status" BOOLEAN NOT NULL;
