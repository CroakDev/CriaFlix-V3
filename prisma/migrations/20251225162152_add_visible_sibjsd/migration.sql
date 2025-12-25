-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionRenewable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive';
