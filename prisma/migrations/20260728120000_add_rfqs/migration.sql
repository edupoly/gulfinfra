CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "quantity" TEXT NOT NULL,
    "budget" TEXT,
    "urgency" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "delivery_terms" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_quotations" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "offer_amount" TEXT NOT NULL,
    "delivery_leadtime" TEXT NOT NULL,
    "technical_specification" TEXT NOT NULL,
    "vendor_notes" TEXT,
    "pdf_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendor_quotations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rfqs_reference_key" ON "rfqs"("reference");
CREATE INDEX "rfqs_status_idx" ON "rfqs"("status");
CREATE INDEX "rfqs_category_idx" ON "rfqs"("category");
CREATE INDEX "rfqs_expiration_date_idx" ON "rfqs"("expiration_date");
CREATE INDEX "vendor_quotations_rfq_id_idx" ON "vendor_quotations"("rfq_id");
CREATE INDEX "vendor_quotations_status_idx" ON "vendor_quotations"("status");

ALTER TABLE "vendor_quotations"
ADD CONSTRAINT "vendor_quotations_rfq_id_fkey"
FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
