CREATE TABLE "rfq_category_options" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rfq_category_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rfq_category_options_slug_key" ON "rfq_category_options"("slug");
CREATE UNIQUE INDEX "rfq_category_options_name_key" ON "rfq_category_options"("name");

CREATE TABLE "rfq_sequences" (
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "rfq_sequences_pkey" PRIMARY KEY ("year")
);
