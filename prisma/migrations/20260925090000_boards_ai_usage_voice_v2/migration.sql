-- Drop v1 RLS objects that reference columns removed below (only present if the
-- Supabase 20260924000000 hardening was applied). Replacements live in
-- supabase/migrations/20260925090000_rls_v2_boards_ai.sql.
DO $$ BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "voice_read" ON storage.objects';
  END IF;
END $$;
DROP POLICY IF EXISTS "voice_streams_select" ON "voice_streams";
DROP POLICY IF EXISTS "voice_streams_insert_own" ON "voice_streams";
DROP POLICY IF EXISTS "voice_streams_update_own" ON "voice_streams";
DROP POLICY IF EXISTS "voice_streams_delete_own" ON "voice_streams";
DROP POLICY IF EXISTS "voice_segments_select" ON "voice_segments";
DROP POLICY IF EXISTS "voice_segments_write_owner" ON "voice_segments";
DROP POLICY IF EXISTS "shares_select" ON "shares";
DROP POLICY IF EXISTS "shares_write_owner" ON "shares";
DROP FUNCTION IF EXISTS public.can_read_stream(uuid);

-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('PENDING', 'DONE', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AiTier" AS ENUM ('EVERYDAY', 'HEAVY');

-- DropForeignKey
ALTER TABLE "shares" DROP CONSTRAINT "shares_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "shares" DROP CONSTRAINT "shares_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "shares" DROP CONSTRAINT "shares_stream_id_fkey";

-- DropForeignKey
ALTER TABLE "voice_streams" DROP CONSTRAINT "voice_streams_owner_id_fkey";

-- DropIndex
DROP INDEX "shares_recipient_id_idx";

-- DropIndex
DROP INDEX "shares_stream_id_idx";

-- DropIndex
DROP INDEX "voice_segments_stream_id_sequence_key";

-- DropIndex
DROP INDEX "voice_streams_owner_id_idx";

-- AlterTable
ALTER TABLE "shares" DROP COLUMN "expires_at",
DROP COLUMN "owner_id",
DROP COLUMN "recipient_id",
DROP COLUMN "scope",
DROP COLUMN "stream_id",
ADD COLUMN     "include_audio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "include_transcript" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "revoked_at" TIMESTAMPTZ,
ADD COLUMN     "segment_id" UUID,
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "token" SET NOT NULL;

-- AlterTable
ALTER TABLE "voice_segments" DROP COLUMN "sequence",
DROP COLUMN "transcript",
ADD COLUMN     "ended_at" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "size_bytes" INTEGER NOT NULL,
ADD COLUMN     "started_at" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "transcription" TEXT,
ADD COLUMN     "transcription_error" TEXT,
ADD COLUMN     "transcription_status" "TranscriptionStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "duration_ms" SET NOT NULL;

-- AlterTable
ALTER TABLE "voice_streams" DROP COLUMN "ended_at",
DROP COLUMN "owner_id",
DROP COLUMN "started_at",
DROP COLUMN "title",
ADD COLUMN     "user_id" UUID NOT NULL;

-- DropEnum
DROP TYPE "ShareScope";

-- CreateTable
CREATE TABLE "boards" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled board',
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "feature" TEXT NOT NULL,
    "tier" "AiTier" NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "cost_micros" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_budget_alerts" (
    "month" TEXT NOT NULL,
    "threshold_percent" INTEGER NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_budget_alerts_pkey" PRIMARY KEY ("month","threshold_percent")
);

-- CreateIndex
CREATE INDEX "boards_user_id_updated_at_idx" ON "boards"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "ai_usage_events_user_id_created_at_idx" ON "ai_usage_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_events_created_at_idx" ON "ai_usage_events"("created_at");

-- CreateIndex
CREATE INDEX "shares_user_id_idx" ON "shares"("user_id");

-- CreateIndex
CREATE INDEX "voice_segments_stream_id_started_at_idx" ON "voice_segments"("stream_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "voice_segments_stream_id_index_key" ON "voice_segments"("stream_id", "index");

-- CreateIndex
CREATE UNIQUE INDEX "voice_streams_user_id_key" ON "voice_streams"("user_id");

-- AddForeignKey
ALTER TABLE "voice_streams" ADD CONSTRAINT "voice_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "voice_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

