-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE';
