ALTER TABLE "email_otps"
ADD COLUMN "used_at" TIMESTAMP(3);

CREATE INDEX "email_otps_user_id_purpose_used_at_idx"
ON "email_otps"("user_id", "purpose", "used_at");
