import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

const materials = [
  ["cem-i-portland-cement", "CEM I Portland Cement — Bulk & Bagged", "Construction Materials", "Cement & Concrete", "cement-concrete", "Supplier", "SA", "riyadh", "Yamama Cement Company", "SAR 180–220 / Ton", "50 Tons", "In stock", "3–5 working days", ["ASTM C150", "EN 197-1", "ISO 9001"], "Factory-direct cement for major building and infrastructure projects. Bulk tanker and bagged delivery available across Saudi Arabia.", "+966 50 123 4567", "sales@yamama-materials.example", true, true],
  ["structural-steel-beams", "Structural Steel H-Beams & I-Beams", "Construction Materials", "Structural Steel", "structural-steel", "For Sale", "QA", "doha", "Qatar Steel Trading", "QAR 2,400–2,650 / Ton", "20 Tons", "Ready stock", "2–4 working days", ["ASTM A36", "EN 10025", "Mill Test Certificate"], "High-tensile structural steel sections, universal columns, channels, and angle bars with mill certificates and project-site delivery.", "+974 55 345 6789", "sales@qatarsteeltrading.example", true, true],
  ["aac-blocks-project-supply", "AAC Blocks for Project Supply", "Construction Materials", "Blocks & Masonry", "blocks-masonry", "Buyer", "AE", "abu-dhabi", "Capital Build Procurement", "Budget: AED 310,000", "12,000 Blocks", "Required within 21 days", "Urgent", ["BS EN 771-4", "Civil Defence approved"], "Main contractor seeking approved AAC blocks for a residential development, including delivery to the Abu Dhabi project site.", "+971 2 555 4010", "buying@capitalbuild.example", true, false],
  ["hdpe-water-pipes", "HDPE Drainage & Water Pipes", "Industrial Materials", "Pipes & Valves", "pipes-valves", "Supplier", "AE", "dubai", "Al Wasl Piping Systems", "AED 45–120 / Meter", "1,000 Meters", "In stock", "5–7 working days", ["ISO 4427", "DIN 8074", "WRAS"], "Pressure and non-pressure HDPE pipes for municipal water, sewer drainage, and industrial chemical transport.", "+971 50 987 6543", "sales@alwaslpiping.example", true, true],
  ["galvanized-cable-trays", "Galvanized Cable Trays & Raceways", "Industrial Materials", "Electrical Supplies", "electrical-supplies", "For Sale", "BH", "manama", "Bahrain Electro-Galvanizers", "BHD 6–14 / Piece", "100 Units", "Made to order", "7–10 working days", ["NEMA VE-1", "IEC 61537"], "Heavy-duty hot-dip galvanized cable trays, ladder racks, and custom raceways for commercial and industrial electrical routing.", "+973 39 123 456", "sales@beg.example", false, false],
  ["industrial-air-filters", "Industrial HVAC Air Filters", "Industrial Materials", "HVAC Components", "hvac-components", "Buyer", "OM", "muscat", "Muscat Facilities Procurement", "Budget: OMR 18,000", "600 Units", "Required monthly", "Framework contract", ["EN 779", "ISO 16890"], "Facilities operator seeking a recurring supplier for pleated and bag filters for commercial and industrial HVAC systems.", "+968 24 555 812", "procurement@muscatfacilities.example", true, false],
].map(([slug, name, materialGroup, materialType, materialTypeSlug, listingType, countryCode, citySlug, supplier, priceRange, minimumOrder, availability, leadTime, compliance, description, phone, email, verified, featured]) => ({
  slug, name, materialGroup, materialType, materialTypeSlug, listingType, countryCode, citySlug,
  supplier, priceRange, minimumOrder, availability, leadTime, compliance, description, phone, email,
  verified, featured, categorySlug: "construction-materials", listingStatus: "published",
  specifications: [], whatsapp: phone, galleryImages: [],
}));

async function main() {
  for (const material of materials) {
    await prisma.material.upsert({
      where: { slug: material.slug },
      update: material,
      create: material,
    });
  }
  console.log(`Seeded ${materials.length} material listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
