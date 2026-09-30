DO $$
BEGIN
    IF to_regclass('auth.users') IS NOT NULL THEN
        EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
    END IF;
END
$$;

DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- DropForeignKey
ALTER TABLE "passkeys" DROP CONSTRAINT "passkeys_user_id_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email";

-- DropTable
DROP TABLE "passkeys";

-- DropTable
DROP TABLE "auth_challenges";

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voiceprints" (
    "user_id" UUID NOT NULL,
    "print" DOUBLE PRECISION[],
    "samples" INTEGER NOT NULL DEFAULT 1,
    "model_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "voiceprints_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "login_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "client_hash" TEXT NOT NULL,
    "device" TEXT,

    CONSTRAINT "login_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "login_events_client_hash_at_idx" ON "login_events"("client_hash", "at");

-- CreateIndex
CREATE INDEX "login_events_user_id_at_idx" ON "login_events"("user_id", "at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voiceprints" ADD CONSTRAINT "voiceprints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
