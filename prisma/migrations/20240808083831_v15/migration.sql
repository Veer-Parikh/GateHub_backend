/*
  Warnings:

  - Added the required column `number` to the `Plumber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plumber" ADD COLUMN     "number" INTEGER NOT NULL;
