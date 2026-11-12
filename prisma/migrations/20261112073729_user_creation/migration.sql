-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_SERVICE', 'READ_SERVICE', 'UPDATE_SERVICE', 'DELETE_SERVICE', 'CREATE_APPOINTMENT', 'READ_APPOINTMENT', 'UPDATE_APPOINTMENT', 'DELETE_APPOINTMENT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "image" TEXT NOT NULL DEFAULT '/images/default-user.png',
    "permisions" "Permission"[],
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
