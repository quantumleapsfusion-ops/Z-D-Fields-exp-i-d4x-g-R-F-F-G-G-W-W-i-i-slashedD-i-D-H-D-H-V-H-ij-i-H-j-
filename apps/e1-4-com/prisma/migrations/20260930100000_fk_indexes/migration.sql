-- CreateIndex
CREATE INDEX "shares_segment_id_idx" ON "shares"("segment_id");

-- CreateIndex
CREATE INDEX "conversations_created_by_id_idx" ON "conversations"("created_by_id");
