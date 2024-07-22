-- CreateTable
CREATE TABLE "Otp" (
    "otpId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("otpId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Security" (
    "securityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("securityId")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "visitorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("visitorId")
);

-- CreateTable
CREATE TABLE "Meetings" (
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agenda" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "adminAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meetings_pkey" PRIMARY KEY ("meetingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_name_key" ON "Admin"("name");

-- AddForeignKey
ALTER TABLE "Meetings" ADD CONSTRAINT "Meetings_adminAdminId_fkey" FOREIGN KEY ("adminAdminId") REFERENCES "Admin"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;
