-- CreateTable
CREATE TABLE "Plumber" (
    "plumberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "generalCost" DOUBLE PRECISION NOT NULL,
    "serviceHours" TEXT NOT NULL,

    CONSTRAINT "Plumber_pkey" PRIMARY KEY ("plumberId")
);

-- CreateTable
CREATE TABLE "Rating" (
    "ratingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plumberPlumberId" TEXT NOT NULL,
    "userUserId" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("ratingId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userUserId" TEXT NOT NULL,
    "plumberPlumberId" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_plumberPlumberId_fkey" FOREIGN KEY ("plumberPlumberId") REFERENCES "Plumber"("plumberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_plumberPlumberId_fkey" FOREIGN KEY ("plumberPlumberId") REFERENCES "Plumber"("plumberId") ON DELETE RESTRICT ON UPDATE CASCADE;
