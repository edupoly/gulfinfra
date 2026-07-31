ALTER TABLE "users"
ADD COLUMN "blocked_at" TIMESTAMP(3),
ADD COLUMN "blocked_reason" VARCHAR(500);
