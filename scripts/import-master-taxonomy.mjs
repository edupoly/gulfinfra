import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slugify = (name) => name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const locations = {
  SA: ["Riyadh", "Jeddah", "Dammam", "Al Khobar", "Jubail", "Yanbu", "Makkah", "Madinah", "Taif", "Tabuk", "Abha", "Khamis Mushait", "Jizan", "Najran", "Hail", "Al Ahsa", "Turaif", "Ras Tanura", "Arar", "Sakaka", "Al Baha", "Buraidah", "Umluj", "Al Kharj", "Rabigh", "NEOM / Tabuk Region", "Ras Al Khair", "Jafurah", "Fadhili", "Khafji", "Shuaibah", "AlUla"],
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Kalba", "Jebel Ali", "Ruwais", "Madinat Zayed", "Mussafah"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal", "Dukhan", "Mesaieed", "Ras Laffan", "Al Shamal", "Al Daayen"],
  KW: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya", "Ahmadi", "Mahboula", "Fahaheel", "Shuwaikh", "Shuaiba", "Jahra", "Mubarak Al-Kabeer", "Sabah Al-Salem", "Mangaf"],
  BH: ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town", "Sitra", "Budaiya", "Jidhafs", "A'ali", "Saar", "Hidd", "Zallaq", "Durrat Al Bahrain"],
  OM: ["Muscat", "Seeb", "Salalah", "Sohar", "Nizwa", "Sur", "Rustaq", "Barka", "Ibri", "Al Buraimi", "Khasab", "Duqm", "Adam", "Bahla", "Quriyat", "Shinas", "Liwa", "Saham", "Samail", "Raysut"],
};

const countryNames = { SA: "Saudi Arabia", AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman" };
const contractors = ["Manpower", "EPC (Engineering, Procurement & Construction)", "Construction & Civil", "Roads, Bridges & Earthworks", "MEP (Mechanical, Electrical & Plumbing)", "Electrical & Power Systems", "Fire Protection & Safety Systems", "Low Current & Security Systems", "Instrumentation & Control", "Finishing & Interiors", "External & Site Works", "Landscaping & Irrigation", "Industrial Plants - Inside Works", "Oil & Gas and Energy", "Petrochemical & Chemical Plants", "Steel & Metal Works", "Maintenance, Shutdown & Plant O&M", "Specialized Industrial Services", "Water & Sewage Works", "Marine & Port Works", "Telecommunications & ICT", "Engineering, Testing, Consultancy & Project Management", "Facility Management & Building Maintenance", "Trading & Material Trading", "Equipment, Machinery & Logistics", "Cleaning & Janitorial Services", "Labour Camps & Warehouses", "Scrap", "Procurement & Sourcing", "Industrial Supplies & Services"];
const projects = ["Residential & Villas", "Commercial & Mixed-Use", "High-Rise & Towers", "Hotels & Hospitality", "Healthcare & Education", "Retail & Shopping Malls", "Industrial & Manufacturing", "Factories & Industrial Plants", "Warehouses & Logistics", "Oil & Gas & Petrochemical", "Power & Energy", "Water, Desalination & Sewage", "Roads & Highways", "Bridges & Tunnels", "Railways & Metro", "Airports & Aviation", "Ports & Marine", "Infrastructure & Utilities", "EPC & Major Projects", "Renovation, Fit-Out & Maintenance"];
const equipment = ["Earthmoving", "Cranes & Lifting", "Access & Aerial", "Material Handling", "Road Construction", "Concrete", "Drilling & Foundation", "Transportation", "Compaction", "Generators & Power", "Compressors & Air", "Pumps & Water", "Welding & Fabrication", "Industrial Cleaning", "Surface Preparation & Painting", "Crushing & Screening", "Oil & Gas", "HVAC & Cooling", "Electrical & Testing", "Scaffolding & Formwork", "Surveying & Measuring", "Mining & Quarrying"];
const materials = [
  ["Steel & Metal", "Industrial Materials", "structural-steel"], ["Pipes, Fittings & Flanges", "Industrial Materials", "pipes-valves"], ["Valves & Flow Control", "Industrial Materials"], ["Cement, Concrete & Aggregates", "Construction Materials", "cement-concrete"], ["Bricks, Blocks & Masonry", "Construction Materials", "blocks-masonry"], ["Electrical Materials", "Construction Materials", "electrical-supplies"], ["MEP Materials", "Construction Materials"], ["HVAC & Cooling", "Construction Materials", "hvac-components"], ["Plumbing & Sanitary", "Construction Materials"], ["Firefighting & Fire Protection", "Construction Materials"], ["Waterproofing & Insulation", "Construction Materials", "waterproofing"], ["Construction Chemicals", "Construction Materials"], ["Finishing & Flooring", "Construction Materials", "finishing-materials"], ["Doors, Windows, Glass & Façade", "Construction Materials"], ["Roofing & Cladding", "Construction Materials"], ["Oil & Gas Materials", "Industrial Materials"], ["Electrical, Instrumentation & Automation", "Industrial Materials"], ["Welding, Tools & Consumables", "Industrial Materials"], ["Safety & PPE", "Industrial Materials", "safety-products"], ["Scaffolding, Formwork & Temporary Works", "Construction Materials"],
];
const businesses = ["Restaurants", "Cafes & Coffee Shops", "Bakeries, Catering & Food Businesses", "Hotels & Hospitality", "Car Washes & Auto Services", "Auto Workshops & Garages", "Automotive Spare Parts", "Factories & Manufacturing", "Trading & Distribution Companies", "Retail Shops", "Supermarkets & Grocery Stores", "Construction & Contracting Companies", "Equipment Rental Businesses", "Transport & Logistics Companies", "Warehousing & Storage Businesses", "Manpower & Recruitment Businesses", "Cleaning & Facility Management", "Engineering & Consultancy Firms", "Oil & Gas Services", "Industrial Businesses", "Import, Export & Trading", "Beauty Salons & Barbershops", "IT & Technology Businesses", "Franchise Businesses", "Other Business Opportunities"];

async function upsertNamed(model, names) {
  for (const name of names) {
    const slug = slugify(name);
    await model.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  }
}

async function main() {
  for (const [code, name] of Object.entries(countryNames)) {
    await prisma.country.upsert({ where: { code }, update: { name }, create: { code, name } });
    for (const city of locations[code]) {
      const slug = slugify(city);
      await prisma.city.upsert({ where: { slug }, update: { name: city, countryCode: code }, create: { slug, name: city, countryCode: code } });
    }
  }
  await upsertNamed(prisma.contractorType, contractors);
  await upsertNamed(prisma.projectTenderType, projects);
  await upsertNamed(prisma.equipmentType, equipment);
  for (const [name, groupName, preferredSlug] of materials) {
    const slug = preferredSlug || slugify(name);
    await prisma.materialTypeOption.upsert({ where: { slug }, update: { name, groupName }, create: { slug, name, groupName } });
  }
  const replacedMaterialSlugs = materials.filter((item) => item[2]).map(([name]) => slugify(name));
  await prisma.materialTypeOption.deleteMany({ where: { slug: { in: replacedMaterialSlugs }, name: { in: materials.map(([name]) => name) } } });
  await prisma.materialTypeOption.upsert({ where: { slug: "industrial-chemicals" }, update: { name: "Industrial Chemicals", groupName: "Industrial Materials" }, create: { slug: "industrial-chemicals", name: "Industrial Chemicals", groupName: "Industrial Materials" } });
  await upsertNamed(prisma.businessCategoryOption, businesses);
  console.log(`Imported ${Object.values(locations).flat().length} locations and ${contractors.length + projects.length + equipment.length + materials.length + businesses.length} taxonomy options.`);
}

main().finally(() => prisma.$disconnect());
