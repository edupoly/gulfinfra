CREATE TABLE "saved_listings" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "listing_type" TEXT NOT NULL,
  "listing_slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_listings_user_id_listing_type_listing_slug_key"
ON "saved_listings"("user_id", "listing_type", "listing_slug");

CREATE INDEX "saved_listings_user_id_created_at_idx"
ON "saved_listings"("user_id", "created_at");

ALTER TABLE "saved_listings"
ADD CONSTRAINT "saved_listings_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
