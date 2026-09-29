-- CreateTable
CREATE TABLE "voice_profiles" (
    "user_id" UUID NOT NULL,
    "engine" TEXT NOT NULL,
    "profile" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "voice_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "voice_challenges" (
    "id" UUID NOT NULL,
    "phrase" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "voice_challenges_expires_at_idx" ON "voice_challenges"("expires_at");

-- AddForeignKey
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

