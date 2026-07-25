import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

const equipmentTypes = [
  ["excavators", "Excavators"],
  ["cranes", "Cranes"],
  ["forklifts", "Forklifts"],
  ["boom-lifts", "Boom Lifts"],
  ["loaders", "Loaders"],
  ["trucks", "Trucks"],
  ["rollers", "Rollers"],
  ["scaffolding", "Scaffolding"],
  ["generators", "Generators"],
  ["compressors", "Compressors"],
].map(([slug, name]) => ({ slug, name }));

const equipment = [
  {
    slug: "cat-320-gc-excavator", title: "CAT 320 GC Hydraulic Excavator",
    equipmentTypeSlug: "excavators", listingType: "For Sale", condition: "Excellent",
    countryCode: "AE", citySlug: "dubai", brand: "Caterpillar", model: "320 GC",
    year: 2022, operatingHours: 2840, price: "AED 365,000",
    priceNote: "Ex-yard, excluding VAT", availability: "Ready for inspection",
    location: "Dubai Industrial City, Dubai",
    description: "GCC-spec hydraulic excavator maintained under a dealer service plan. Clean undercarriage, cold air conditioning, and complete maintenance history.",
    specifications: [{ label: "Operating weight", value: "21,900 kg" }, { label: "Engine power", value: "146 hp" }, { label: "Bucket capacity", value: "1.0 m³" }, { label: "Maximum digging depth", value: "6.7 m" }],
    sellerName: "Gulf Heavy Machines LLC", sellerType: "Verified equipment dealer",
    phone: "+971 4 555 0182", whatsapp: "+971 50 555 0182",
    email: "sales@gulfheavymachines.example", verified: true, featured: true,
    images: [], posted: "2 days ago",
  },
  {
    slug: "liebherr-ltm-1100-mobile-crane", title: "Liebherr LTM 1100 Mobile Crane",
    equipmentTypeSlug: "cranes", listingType: "For Rent", condition: "Excellent",
    countryCode: "SA", citySlug: "riyadh", brand: "Liebherr", model: "LTM 1100-4.2",
    year: 2021, operatingHours: 3900, price: "SAR 3,800 / day",
    priceNote: "Operator and standard rigging included", availability: "Available from 05 Aug 2026",
    location: "Second Industrial City, Riyadh",
    description: "100-ton all-terrain mobile crane available with certified operator, lifting accessories, and current third-party inspection.",
    specifications: [{ label: "Maximum capacity", value: "100 t" }, { label: "Telescopic boom", value: "60 m" }, { label: "Axles", value: "4" }, { label: "Drive", value: "8 × 6 × 8" }],
    sellerName: "Najd Lifting Solutions", sellerType: "Verified rental company",
    phone: "+966 11 555 0410", whatsapp: "+966 55 555 0410",
    email: "hire@najdlifting.example", verified: true, featured: true,
    images: [], posted: "Today",
  },
  {
    slug: "toyota-8fd30-forklift", title: "Toyota 8FD30 Diesel Forklift",
    equipmentTypeSlug: "forklifts", listingType: "For Sale", condition: "Good",
    countryCode: "QA", citySlug: "doha", brand: "Toyota", model: "8FD30",
    year: 2019, operatingHours: 6120, price: "QAR 78,000",
    priceNote: "Negotiable after inspection", availability: "Available now",
    location: "Industrial Area, Doha",
    description: "Reliable 3-ton diesel forklift with side shift, solid tyres, and recently serviced mast assembly.",
    specifications: [{ label: "Rated capacity", value: "3,000 kg" }, { label: "Lift height", value: "4.5 m" }, { label: "Fuel", value: "Diesel" }, { label: "Mast", value: "Triplex" }],
    sellerName: "Doha Material Handling", sellerType: "Equipment dealer",
    phone: "+974 4455 2090", whatsapp: "+974 3355 2090",
    email: "equipment@dmh.example", verified: true, featured: false,
    images: [], posted: "4 days ago",
  },
  {
    slug: "genie-s65-boom-lift", title: "Genie S-65 Telescopic Boom Lift",
    equipmentTypeSlug: "boom-lifts", listingType: "For Rent", condition: "Good",
    countryCode: "AE", citySlug: "abu-dhabi", brand: "Genie", model: "S-65",
    year: 2020, operatingHours: 3550, price: "AED 9,500 / month",
    priceNote: "Delivery charged by location", availability: "Available now",
    location: "Mussafah, Abu Dhabi",
    description: "Diesel telescopic boom lift suitable for steel erection, façade, and MEP access work.",
    specifications: [{ label: "Working height", value: "21.8 m" }, { label: "Horizontal reach", value: "17.1 m" }, { label: "Platform capacity", value: "227 kg" }, { label: "Drive", value: "4WD" }],
    sellerName: "Access Gulf Rentals", sellerType: "Verified rental company",
    phone: "+971 2 555 7731", whatsapp: "+971 56 555 7731",
    email: "rentals@accessgulf.example", verified: true, featured: false,
    images: [], posted: "1 day ago",
  },
  {
    slug: "wanted-komatsu-wheel-loader", title: "Wanted: Komatsu WA470 Wheel Loader",
    equipmentTypeSlug: "loaders", listingType: "Wanted", condition: "Used",
    countryCode: "OM", citySlug: "muscat", brand: "Komatsu", model: "WA470",
    year: 2018, operatingHours: null, price: "Budget: OMR 48,000",
    priceNote: "Depending on year and hours", availability: "Required within 30 days",
    location: "Muscat, Oman",
    description: "Buyer seeking a GCC-spec Komatsu WA470 or equivalent wheel loader with service records and sound drivetrain.",
    specifications: [{ label: "Preferred year", value: "2018 or newer" }, { label: "Maximum hours", value: "8,000 h" }, { label: "Bucket", value: "3.8–4.2 m³" }, { label: "Inspection", value: "Required before purchase" }],
    sellerName: "Al Batinah Earthworks", sellerType: "Verified buyer",
    phone: "+968 2455 1880", whatsapp: "+968 9555 1880",
    email: "procurement@batinahearthworks.example", verified: true, featured: false,
    images: [], posted: "3 days ago",
  },
  {
    slug: "mercedes-actros-tipper", title: "Mercedes-Benz Actros 4140 Tipper",
    equipmentTypeSlug: "trucks", listingType: "For Sale", condition: "Good",
    countryCode: "KW", citySlug: "kuwait-city", brand: "Mercedes-Benz", model: "Actros 4140",
    year: 2020, operatingHours: null, price: "KWD 28,500",
    priceNote: "Mileage: 186,000 km", availability: "Available now",
    location: "Shuwaikh Industrial Area, Kuwait City",
    description: "8×4 construction tipper with 20 m³ steel body, fleet maintained and ready for registration transfer.",
    specifications: [{ label: "Configuration", value: "8 × 4" }, { label: "Engine output", value: "400 hp" }, { label: "Body capacity", value: "20 m³" }, { label: "Mileage", value: "186,000 km" }],
    sellerName: "Kuwait Fleet Trading", sellerType: "Commercial vehicle dealer",
    phone: "+965 2455 9002", whatsapp: "+965 6555 9002",
    email: "sales@kuwaitfleet.example", verified: false, featured: false,
    images: [], posted: "6 days ago",
  },
  {
    slug: "bomag-bw211-road-roller", title: "BOMAG BW 211 D-5 Soil Compactor",
    equipmentTypeSlug: "rollers", listingType: "For Rent", condition: "Excellent",
    countryCode: "BH", citySlug: "manama", brand: "BOMAG", model: "BW 211 D-5",
    year: 2022, operatingHours: 1780, price: "BHD 1,950 / month",
    priceNote: "Minimum one-month hire", availability: "Available now",
    location: "Sitra Industrial Area, Bahrain",
    description: "Single-drum soil compactor with smooth drum, air-conditioned cab, and valid safety certification.",
    specifications: [{ label: "Operating weight", value: "10,700 kg" }, { label: "Drum width", value: "2,130 mm" }, { label: "Engine power", value: "128 hp" }, { label: "Vibration", value: "2 amplitudes" }],
    sellerName: "Bahrain Plant Hire", sellerType: "Rental company",
    phone: "+973 1755 0875", whatsapp: "+973 3655 0875",
    email: "hire@bahrainplant.example", verified: true, featured: false,
    images: [], posted: "Yesterday",
  },
  {
    slug: "ringlock-scaffolding-package", title: "Ringlock Scaffolding Package — 5,000 m²",
    equipmentTypeSlug: "scaffolding", listingType: "For Sale", condition: "New",
    countryCode: "AE", citySlug: "dubai", brand: "GulfForm", model: "GF-Ringlock",
    year: 2026, operatingHours: null, price: "AED 410,000",
    priceNote: "Complete package with accessories", availability: "In stock",
    location: "Jebel Ali, Dubai",
    description: "Hot-dip galvanized ringlock scaffolding package supplied with standards, ledgers, decks, braces, base jacks, and access ladders.",
    specifications: [{ label: "Coverage", value: "5,000 m²" }, { label: "Finish", value: "Hot-dip galvanized" }, { label: "Standard", value: "EN 12810 / EN 12811" }, { label: "Delivery", value: "7–10 working days" }],
    sellerName: "GulfForm Systems FZE", sellerType: "Verified manufacturer",
    phone: "+971 4 555 7100", whatsapp: "+971 52 555 7100",
    email: "sales@gulfform.example", verified: true, featured: true,
    images: [], posted: "Today",
  },
  {
    slug: "cummins-c500-generator", title: "Cummins C500D5 Diesel Generator",
    equipmentTypeSlug: "generators", listingType: "For Rent", condition: "Excellent",
    countryCode: "SA", citySlug: "jeddah", brand: "Cummins", model: "C500D5",
    year: 2023, operatingHours: 920, price: "SAR 18,000 / month",
    priceNote: "Fuel excluded; cables included", availability: "Available now",
    location: "Al Khumrah, Jeddah",
    description: "Silent-type 500 kVA generator for construction sites and temporary industrial power, supplied with distribution accessories.",
    specifications: [{ label: "Standby power", value: "500 kVA" }, { label: "Frequency", value: "50 Hz" }, { label: "Voltage", value: "400 / 230 V" }, { label: "Fuel tank", value: "990 L" }],
    sellerName: "Red Sea Temporary Power", sellerType: "Verified rental company",
    phone: "+966 12 555 3900", whatsapp: "+966 54 555 3900",
    email: "power@redsearentals.example", verified: true, featured: false,
    images: [], posted: "2 days ago",
  },
  {
    slug: "atlas-copco-xas-88-compressor", title: "Atlas Copco XAS 88 Air Compressor",
    equipmentTypeSlug: "compressors", listingType: "Wanted", condition: "Good",
    countryCode: "QA", citySlug: "doha", brand: "Atlas Copco", model: "XAS 88",
    year: 2020, operatingHours: null, price: "Budget: QAR 62,000",
    priceNote: "Open to equivalent 7-bar models", availability: "Required urgently",
    location: "Doha, Qatar",
    description: "Contractor seeking a towable air compressor in serviceable condition for pipeline and civil works.",
    specifications: [{ label: "Free air delivery", value: "5.0 m³/min" }, { label: "Working pressure", value: "7 bar" }, { label: "Preferred hours", value: "Below 5,000 h" }, { label: "Documentation", value: "Service records required" }],
    sellerName: "Qatar Utility Contractors", sellerType: "Verified buyer",
    phone: "+974 4455 6810", whatsapp: "+974 6655 6810",
    email: "buying@qatarutility.example", verified: true, featured: false,
    images: [], posted: "5 hours ago",
  },
];

async function main() {
  for (const type of equipmentTypes) {
    await prisma.equipmentType.upsert({
      where: { slug: type.slug },
      update: { name: type.name },
      create: type,
    });
  }

  for (const item of equipment) {
    await prisma.equipment.upsert({
      where: { slug: item.slug },
      update: item,
      create: { ...item, categorySlug: "equipment-marketplace" },
    });
  }

  console.log(`Seeded ${equipmentTypes.length} equipment types and ${equipment.length} listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
