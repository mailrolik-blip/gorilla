-- CreateEnum
CREATE TYPE "CrmRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CONTACTED', 'BOOKED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "crmStatus" "CrmRequestStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TeamApplication" ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "crmStatus" "CrmRequestStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "managerNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TrainingBooking" ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "crmStatus" "CrmRequestStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "managerNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RentalBooking_crmStatus_idx" ON "RentalBooking"("crmStatus");

-- CreateIndex
CREATE INDEX "TeamApplication_crmStatus_idx" ON "TeamApplication"("crmStatus");

-- CreateIndex
CREATE INDEX "TrainingBooking_crmStatus_idx" ON "TrainingBooking"("crmStatus");
