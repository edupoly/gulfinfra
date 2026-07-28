ALTER TABLE "rfqs"
ADD COLUMN "material_service" TEXT,
ADD COLUMN "unit" TEXT,
ADD COLUMN "specifications" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "delivery_date" TIMESTAMP(3),
ADD COLUMN "boq_url" TEXT,
ADD COLUMN "drawings_url" TEXT,
ADD COLUMN "specification_document_url" TEXT,
ADD COLUMN "other_document_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
