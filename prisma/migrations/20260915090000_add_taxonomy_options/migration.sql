CREATE TABLE "material_type_options" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_type_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_category_options" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_category_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "material_type_options_slug_key" ON "material_type_options"("slug");
CREATE INDEX "material_type_options_group_name_idx" ON "material_type_options"("group_name");
CREATE UNIQUE INDEX "business_category_options_slug_key" ON "business_category_options"("slug");
CREATE UNIQUE INDEX "business_category_options_name_key" ON "business_category_options"("name");
