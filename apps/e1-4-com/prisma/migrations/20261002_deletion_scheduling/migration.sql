-- Add deletion scheduling fields to users table
ALTER TABLE "users" ADD COLUMN "deletion_scheduled_at" TIMESTAMPTZ,
ADD COLUMN "deletion_scheduled_for" TIMESTAMPTZ;

-- Create index for efficient deletion polling
CREATE INDEX "users_deletion_scheduled_for_idx" ON "users"("deletion_scheduled_for") WHERE "deletion_scheduled_for" IS NOT NULL;
