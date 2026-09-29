-- Voice identity: users are recognised by voice, not email. Drops the email column
-- and adds the enrolled voice print. RLS for voice_prints lives in
-- supabase/migrations/20260925120000_voice_identity.sql.

-- DropIndex
DROP INDEX IF EXISTS "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";

-- CreateTable
CREATE TABLE "voice_prints" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phrase" TEXT NOT NULL,
    "phrase_hash" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "sample_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "voice_prints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voice_prints_user_id_key" ON "voice_prints"("user_id");

-- CreateIndex
CREATE INDEX "voice_prints_phrase_hash_idx" ON "voice_prints"("phrase_hash");

-- AddForeignKey
ALTER TABLE "voice_prints" ADD CONSTRAINT "voice_prints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
