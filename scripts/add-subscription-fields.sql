-- Add subscription fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionRenewable" BOOLEAN NOT NULL DEFAULT true;

-- Set existing VIP users to have active subscriptions
UPDATE "User" 
SET 
  "subscriptionStatus" = 'active',
  "subscriptionPlan" = 'monthly',
  "subscriptionStartDate" = NOW(),
  "subscriptionEndDate" = NOW() + INTERVAL '30 days'
WHERE "isVip" = true AND "subscriptionStatus" = 'inactive';
