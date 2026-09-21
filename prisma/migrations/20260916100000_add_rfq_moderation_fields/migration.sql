ALTER TABLE "rfqs"
ADD COLUMN "moderation_note" TEXT,
ADD COLUMN "moderated_at" TIMESTAMP(3),
ADD COLUMN "moderated_by_email" TEXT;
