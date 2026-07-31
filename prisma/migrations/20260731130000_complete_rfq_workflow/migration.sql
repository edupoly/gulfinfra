ALTER TABLE "rfqs"
ADD COLUMN "buyer_id" TEXT,
ADD COLUMN "awarded_at" TIMESTAMP(3);

ALTER TABLE "vendor_quotations"
ADD COLUMN "supplier_id" TEXT,
ADD COLUMN "company_name" TEXT,
ADD COLUMN "contact_person" TEXT,
ADD COLUMN "contact_email" TEXT,
ADD COLUMN "contact_phone" TEXT,
ADD COLUMN "unit_price" TEXT,
ADD COLUMN "total_price" TEXT,
ADD COLUMN "currency" TEXT,
ADD COLUMN "warranty" TEXT,
ADD COLUMN "payment_terms" TEXT,
ADD COLUMN "valid_until" TIMESTAMP(3),
ADD COLUMN "submitted_at" TIMESTAMP(3),
ADD COLUMN "withdrawn_at" TIMESTAMP(3);

UPDATE "vendor_quotations"
SET
  "company_name" = "vendor_name",
  "total_price" = "offer_amount",
  "submitted_at" = "created_at",
  "status" = CASE
    WHEN "status" = 'pending' THEN 'submitted'
    WHEN "status" = 'accepted' THEN 'awarded'
    WHEN "status" = 'declined' THEN 'rejected'
    ELSE "status"
  END;

CREATE TABLE "quotation_messages" (
  "id" TEXT NOT NULL,
  "quotation_id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "attachment_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quotation_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quotation_events" (
  "id" TEXT NOT NULL,
  "quotation_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quotation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rfqs_buyer_id_status_idx" ON "rfqs"("buyer_id", "status");
CREATE INDEX "vendor_quotations_supplier_id_status_idx" ON "vendor_quotations"("supplier_id", "status");
CREATE UNIQUE INDEX "vendor_quotations_rfq_id_supplier_id_key" ON "vendor_quotations"("rfq_id", "supplier_id");
CREATE INDEX "quotation_messages_quotation_id_created_at_idx" ON "quotation_messages"("quotation_id", "created_at");
CREATE INDEX "quotation_events_quotation_id_created_at_idx" ON "quotation_events"("quotation_id", "created_at");

ALTER TABLE "rfqs"
ADD CONSTRAINT "rfqs_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vendor_quotations"
ADD CONSTRAINT "vendor_quotations_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotation_messages"
ADD CONSTRAINT "quotation_messages_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "vendor_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_messages"
ADD CONSTRAINT "quotation_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_events"
ADD CONSTRAINT "quotation_events_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "vendor_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_events"
ADD CONSTRAINT "quotation_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
