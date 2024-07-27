/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Security` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Security_number_key" ON "Security"("number");
