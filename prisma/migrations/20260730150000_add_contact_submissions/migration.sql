CREATE TABLE "contact_submissions" (
  "id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "phone_or_whatsapp" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_submissions_created_at_idx"
ON "contact_submissions"("created_at");
