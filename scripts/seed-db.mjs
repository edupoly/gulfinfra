import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient({ log: ["error"] });
const scrypt = promisify(scryptCallback);
const DEFAULT_ADMIN_EMAIL = "admin@gulfinfrahub.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const CLIENT_ADMIN_EMAIL = "rajesh.puppala@ascentraa.com";

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const categories = [
  {
    slug: "contractors",
    name: "Contractors",
    description:
      "Pre-qualified contractors for civil, MEP, infrastructure, and fit-out projects.",
    icon: "🏗️",
    listingCount: 2458,
  },
  {
    slug: "projects-tenders",
    name: "Projects & Tenders",
    description:
      "Live GCC opportunities, tenders, and public procurement listings.",
    icon: "📋",
    listingCount: 1892,
  },
  {
    slug: "business-opportunities",
    name: "Business Opportunities",
    description: "Trade leads, partnership requests, and growth opportunities.",
    icon: "💼",
    listingCount: 1756,
  },
  {
    slug: "equipment-marketplace",
    name: "Equipment Marketplace",
    description:
      "Heavy equipment, rentals, spare parts, and machinery sourcing.",
    icon: "🚜",
    listingCount: 3215,
  },
  {
    slug: "warehouses",
    name: "Warehouses",
    description:
      "Industrial storage, logistics, and distribution warehouse providers.",
    icon: "📦",
    listingCount: 1256,
  },
  {
    slug: "labour-camps",
    name: "Labour Camps",
    description:
      "Worker accommodation and camp management services across the Gulf.",
    icon: "🏕️",
    listingCount: 892,
  },
  {
    slug: "construction-materials",
    name: "Construction & Industrial Materials",
    description:
      "Concrete, steel, piping, HVAC, and industrial material suppliers.",
    icon: "🧱",
    listingCount: 2754,
  },
];

const contractorTypes = [
  { slug: "civil-contractors", name: "Civil Contractors" },
  { slug: "building-contractors", name: "Building Contractors" },
  { slug: "infrastructure-contractors", name: "Infrastructure Contractors" },
  { slug: "road-contractors", name: "Road Contractors" },
  { slug: "mep-contractors", name: "MEP Contractors" },
  { slug: "electrical-contractors", name: "Electrical Contractors" },
  { slug: "plumbing-contractors", name: "Plumbing Contractors" },
  { slug: "hvac-contractors", name: "HVAC Contractors" },
  {
    slug: "interior-fit-out-contractors",
    name: "Interior Fit-Out Contractors",
  },
  { slug: "steel-fabrication", name: "Steel Fabrication" },
  { slug: "industrial-maintenance", name: "Industrial Maintenance" },
  { slug: "epc-contractors", name: "EPC Contractors" },
  { slug: "oil-gas-contractors", name: "Oil & Gas Contractors" },
  { slug: "engineering-consultants", name: "Engineering Consultants" },
  { slug: "quantity-surveyors", name: "Quantity Surveyors" },
  { slug: "bim-consultants", name: "BIM Consultants" },
  { slug: "cost-estimation-services", name: "Cost Estimation Services" },
];

const projectTenderTypes = [
  { slug: "building-projects", name: "Building Projects" },
  { slug: "infrastructure-projects", name: "Infrastructure Projects" },
  { slug: "government-tenders", name: "Government Tenders" },
  { slug: "industrial-projects", name: "Industrial Projects" },
  { slug: "oil-gas-projects", name: "Oil & Gas Projects" },
  { slug: "mep-projects", name: "MEP Projects" },
  { slug: "interior-fit-out", name: "Interior Fit-Out" },
  { slug: "roads-bridges", name: "Roads & Bridges" },
  { slug: "factory-projects", name: "Factory Projects" },
  { slug: "warehouse-construction", name: "Warehouse Construction" },
  { slug: "maintenance-contracts", name: "Maintenance Contracts" },
];

const countries = [
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "OM", name: "Oman" },
  { code: "BH", name: "Bahrain" },
];

const cities = [
  { slug: "dubai", name: "Dubai", countryCode: "AE" },
  { slug: "abu-dhabi", name: "Abu Dhabi", countryCode: "AE" },
  { slug: "riyadh", name: "Riyadh", countryCode: "SA" },
  { slug: "jeddah", name: "Jeddah", countryCode: "SA" },
  { slug: "doha", name: "Doha", countryCode: "QA" },
  { slug: "muscat", name: "Muscat", countryCode: "OM" },
  { slug: "manama", name: "Manama", countryCode: "BH" },
  { slug: "kuwait-city", name: "Kuwait City", countryCode: "KW" },
];

const projectTenders = [
  {
    slug: "riyadh-commercial-tower-project",
    categorySlug: "projects-tenders",
    title: "Riyadh Commercial Tower Project",
    projectType: "Building Projects",
    status: "Open for bidding",
    summary:
      "High-rise mixed-use commercial tower with premium façade and fit-out package.",
    description:
      "A landmark commercial development in Riyadh seeking experienced contractors for structural works, MEP coordination, and interior fit-out delivery.",
    budget: "SAR 220M",
    deadline: "15 Aug 2026",
    client: "Riyadh Development Authority",
    value: "SAR 220M",
    tenderType: "Open Tender",
    location: "Riyadh, Saudi Arabia",
    posted: "2 days ago",
    featured: true,
    projectTenderTypes: ["building-projects"],
    countryCodes: ["SA"],
    citySlugs: ["riyadh"],
    sectors: ["Commercial", "Mixed Use", "High-rise"],
  },
  {
    slug: "al-rayyan-road-upgrade",
    categorySlug: "projects-tenders",
    title: "Al Rayyan Roads & Bridges Upgrade",
    projectType: "Roads & Bridges",
    status: "Tender closing soon",
    summary:
      "Urban road and bridge enhancement project across high-traffic logistics corridors.",
    description:
      "The project includes bridge decks, road widening, lighting systems, drainage upgrades, and utility relocation across Al Rayyan corridor connections.",
    budget: "QAR 180M",
    deadline: "27 Jul 2026",
    client: "Ashghal",
    value: "QAR 180M",
    tenderType: "Restricted Tender",
    location: "Doha, Qatar",
    posted: "5 days ago",
    featured: true,
    projectTenderTypes: ["roads-bridges"],
    countryCodes: ["QA"],
    citySlugs: ["doha"],
    sectors: ["Infrastructure", "Roads", "Mobility"],
  },
  {
    slug: "duqm-industrial-plant-maintenance",
    categorySlug: "projects-tenders",
    title: "Duqm Industrial Plant Maintenance Contract",
    projectType: "Maintenance Contracts",
    status: "Prequalification in progress",
    summary:
      "Preventive and corrective maintenance for industrial utilities and process equipment.",
    description:
      "Scope includes HVAC servicing, mechanical maintenance, instrumentation, shutdown planning, and reliability improvement across a major industrial site.",
    budget: "OMR 34M",
    deadline: "09 Aug 2026",
    client: "Duqm Industrial City",
    value: "OMR 34M",
    tenderType: "Prequalification",
    location: "Duqm, Oman",
    posted: "1 week ago",
    featured: false,
    projectTenderTypes: ["maintenance-contracts"],
    countryCodes: ["OM"],
    citySlugs: ["muscat"],
    sectors: ["Maintenance", "Industrial", "Utilities"],
  },
  {
    slug: "kuwait-mep-retrofit-programme",
    categorySlug: "projects-tenders",
    title: "Kuwait MEP Retrofit Programme",
    projectType: "MEP Projects",
    status: "Open for bidding",
    summary:
      "MEP upgrade programme for government buildings, including chillers, BMS, and electrical modernization.",
    description:
      "The contract covers energy efficiency upgrades, ventilation retrofits, smart controls, and commissioning for multiple public buildings.",
    budget: "KWD 42M",
    deadline: "03 Sep 2026",
    client: "Public Works Authority",
    value: "KWD 42M",
    tenderType: "Competitive Tender",
    location: "Kuwait City, Kuwait",
    posted: "3 days ago",
    featured: true,
    projectTenderTypes: ["mep-projects"],
    countryCodes: ["KW"],
    citySlugs: ["kuwait-city"],
    sectors: ["Government", "MEP", "Energy Efficiency"],
  },
];

const contractors = [
  {
    slug: "al-rashid-trading-contracting-company",
    name: "Al-Rashid Trading & Contracting Company (RTCC)",
    categorySlug: "contractors",
    companyType: "Construction Company",
    primaryTypeSlug: "civil-contractors",
    countryCode: "SA",
    citySlug: "riyadh",
    yearEstablished: 2004,
    employees: "100 - 250",
    website: "www.alrashidtrading.com",
    email: "info@alrashidtrading.com",
    phone: "+966 11 401 2222",
    whatsapp: "+966 11 401 2222",
    address: "Olaya District, Riyadh, Saudi Arabia",
    description:
      "Leading construction company providing end-to-end building and engineering solutions across residential, commercial, industrial and infrastructure sectors.",
    services: [
      "Infrastructure Development",
      "Commercial High-rise",
      "Civil Works",
      "Water Pipelines",
      "Road Construction",
      "Concrete Works",
      "Steel Structure Works",
      "Fit-Out Works",
      "Renovation Works",
      "Project Management",
    ],
    areasServed: ["Riyadh", "Jeddah", "Dammam", "Dubai", "Doha"],
    rating: 4.8,
    reviewCount: 38,
    verified: true,
    premium: false,
    memberSince: "Jan 2021",
    responseTime: "Within 24 Hours",
    projectsCompleted: 55,
    licenses: ["SA-CC-482910", "ISO 9001", "ASTM Compliance"],
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Residential Building Project",
        location: "Dubai, UAE",
        status: "Completed",
      },
      {
        title: "Commercial Complex",
        location: "Sharjah, UAE",
        status: "Completed",
      },
      {
        title: "Infrastructure Development",
        location: "Abu Dhabi, UAE",
        status: "In Progress",
      },
    ],
    contractorTypes: [
      "civil-contractors",
      "building-contractors",
      "infrastructure-contractors",
    ],
    countryCodes: ["SA"],
    citySlugs: ["riyadh"],
  },
  {
    slug: "arabian-construction-company",
    name: "Arabian Construction Company (ACC)",
    categorySlug: "contractors",
    companyType: "Construction Company",
    primaryTypeSlug: "infrastructure-contractors",
    countryCode: "AE",
    citySlug: "dubai",
    yearEstablished: 1975,
    employees: "500+",
    website: "www.accuae.com",
    email: "contact@accuae.com",
    phone: "+971 4 345 5555",
    whatsapp: "+971 4 345 5555",
    address: "Sheikh Zayed Road, Dubai, UAE",
    description:
      "A leading contracting group specializing in high-rise towers, airport terminals, smart-city infrastructure, and major oil and gas works.",
    services: [
      "High-rise Construction",
      "Oil & Gas Industrial",
      "Marine Works",
      "Piling & Foundations",
      "Roads & Bridges",
      "EPC Delivery",
    ],
    areasServed: ["Dubai", "Abu Dhabi", "Sharjah", "Doha", "Riyadh"],
    rating: 4.9,
    reviewCount: 52,
    verified: true,
    premium: true,
    memberSince: "May 2019",
    responseTime: "Within 12 Hours",
    projectsCompleted: 70,
    licenses: ["DUBAI-CC-9071", "ISO 14001", "ISO 45001"],
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Metro Terminal Upgrade",
        location: "Dubai, UAE",
        status: "In Progress",
      },
      {
        title: "Offshore Refurbishment",
        location: "Abu Dhabi, UAE",
        status: "Completed",
      },
      {
        title: "Smart City Roadworks",
        location: "Doha, Qatar",
        status: "Completed",
      },
    ],
    contractorTypes: [
      "infrastructure-contractors",
      "civil-contractors",
      "building-contractors",
    ],
    countryCodes: ["AE"],
    citySlugs: ["dubai"],
  },
  {
    slug: "qatari-diar-infrastructure-services",
    name: "Qatari Diar Infrastructure Services",
    categorySlug: "contractors",
    companyType: "Construction Company",
    primaryTypeSlug: "infrastructure-contractors",
    countryCode: "QA",
    citySlug: "doha",
    yearEstablished: 2012,
    employees: "200 - 500",
    website: "www.qatari-diar.com",
    email: "projects@qatari-diar.com",
    phone: "+974 44 97 1111",
    whatsapp: "+974 44 97 1111",
    address: "Lusail City, Doha, Qatar",
    description:
      "Committed to sustainable infrastructure development and large-scale urban growth in Qatar through high-quality engineering delivery.",
    services: [
      "Urban Development",
      "Roads & Bridges",
      "Landscaping",
      "Mechanical Services",
      "Utilities",
    ],
    areasServed: ["Doha", "Lusail", "Al Rayyan", "Riyadh"],
    rating: 4.7,
    reviewCount: 29,
    verified: true,
    premium: false,
    memberSince: "Sep 2020",
    responseTime: "Within 48 Hours",
    projectsCompleted: 85,
    licenses: ["QA-CC-1087", "QCS Compliance"],
    gallery: [
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Lusail City Roads",
        location: "Doha, Qatar",
        status: "Completed",
      },
      {
        title: "Qatar Rail Support",
        location: "Doha, Qatar",
        status: "In Progress",
      },
    ],
    contractorTypes: [
      "infrastructure-contractors",
      "civil-contractors",
      "building-contractors",
    ],
    countryCodes: ["QA"],
    citySlugs: ["doha"],
  },
  {
    slug: "galfar-engineering-contracting",
    name: "Galfar Engineering & Contracting",
    categorySlug: "contractors",
    companyType: "Construction Company",
    primaryTypeSlug: "mep-contractors",
    countryCode: "OM",
    citySlug: "muscat",
    yearEstablished: 1998,
    employees: "400+",
    website: "www.galfar.com",
    email: "enquiries@galfar.com",
    phone: "+968 24 525000",
    whatsapp: "+968 24 525000",
    address: "Ghala Industrial Area, Muscat, Oman",
    description:
      "Oman’s leading engineering and contracting company with a strong focus on oil and gas infrastructure, civil structures, and environmental engineering.",
    services: [
      "Oil & Gas Pipelines",
      "Roads & Bridges",
      "Water Treatment",
      "Electrical Transmission",
      "Fabrication",
    ],
    areasServed: ["Muscat", "Salalah", "Duqm", "Riyadh"],
    rating: 4.6,
    reviewCount: 41,
    verified: true,
    premium: true,
    memberSince: "Jun 2018",
    responseTime: "Within 24 Hours",
    projectsCompleted: 100,
    licenses: ["OM-CC-2024", "IEC Compliance"],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Water Treatment Plant",
        location: "Muscat, Oman",
        status: "Completed",
      },
      {
        title: "Pipeline Upgrade",
        location: "Duqm, Oman",
        status: "In Progress",
      },
    ],
    contractorTypes: [
      "mep-contractors",
      "electrical-contractors",
      "plumbing-contractors",
    ],
    countryCodes: ["OM"],
    citySlugs: ["muscat"],
  },
  {
    slug: "kharafi-national",
    name: "Kharafi National",
    categorySlug: "contractors",
    companyType: "Contracting Group",
    primaryTypeSlug: "mep-contractors",
    countryCode: "KW",
    citySlug: "kuwait-city",
    yearEstablished: 2007,
    employees: "350",
    website: "www.kharafi.com",
    email: "operations@kharafi.com",
    phone: "+965 2461 2000",
    whatsapp: "+965 2461 2000",
    address: "Shuaiba Industrial Zone, Kuwait City, Kuwait",
    description:
      "Delivering diversified contracting, MEP, commissioning, and facilities management services for industrial and commercial clients.",
    services: [
      "MEP Contracting",
      "Facilities Management",
      "Fabrication",
      "Instrumentation",
      "Commissioning",
    ],
    areasServed: ["Kuwait City", "Ahmadi", "Jahra", "Dubai"],
    rating: 4.5,
    reviewCount: 34,
    verified: true,
    premium: false,
    memberSince: "Nov 2022",
    responseTime: "Within 36 Hours",
    projectsCompleted: 115,
    licenses: ["KW-CC-7641", "TUV Certified"],
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Industrial MEP Retrofit",
        location: "Ahmadi, Kuwait",
        status: "Completed",
      },
    ],
    contractorTypes: [
      "mep-contractors",
      "electrical-contractors",
      "hvac-contractors",
    ],
    countryCodes: ["KW"],
    citySlugs: ["kuwait-city"],
  },
  {
    slug: "nass-corporation",
    name: "Nass Corporation",
    categorySlug: "contractors",
    companyType: "Heavy Civil & Marine Contractor",
    primaryTypeSlug: "civil-contractors",
    countryCode: "BH",
    citySlug: "manama",
    yearEstablished: 2001,
    employees: "150 - 300",
    website: "www.nassbh.com",
    email: "sales@nassbh.com",
    phone: "+973 1772 5522",
    whatsapp: "+973 1772 5522",
    address: "Mina Salman Industrial Area, Manama, Bahrain",
    description:
      "Marine engineering, piling, precast concrete, works, and heavy machinery procurement specialists across the Gulf.",
    services: [
      "Marine Engineering",
      "Piling",
      "Precast Concrete",
      "Heavy Machinery Supply",
      "Logistics",
    ],
    areasServed: ["Manama", "Mina Salman", "Doha", "Dubai"],
    rating: 4.7,
    reviewCount: 22,
    verified: true,
    premium: false,
    memberSince: "Jan 2023",
    responseTime: "Within 24 Hours",
    projectsCompleted: 130,
    licenses: ["BH-CC-4401", "Marine Safety"],
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    ],
    featuredProjects: [
      {
        title: "Marine Jetty Works",
        location: "Manama, Bahrain",
        status: "Completed",
      },
    ],
    contractorTypes: [
      "civil-contractors",
      "infrastructure-contractors",
      "building-contractors",
    ],
    countryCodes: ["BH"],
    citySlugs: ["manama"],
  },
];

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL },
    select: { passwordHash: true },
  });
  const adminPasswordHash =
    existingAdmin?.passwordHash ?? (await hashPassword(DEFAULT_ADMIN_PASSWORD));

  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      role: "admin",
      fullName: "GulfInfraHub Administrator",
      emailVerifiedAt: new Date(),
      passwordHash: adminPasswordHash,
    },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      role: "admin",
      fullName: "GulfInfraHub Administrator",
      emailVerifiedAt: new Date(),
      passwordHash: adminPasswordHash,
    },
  });

  // Client-testing admins authenticate with an OTP sent to their own address
  // and create their password after the first successful verification.
  await prisma.user.upsert({
    where: { email: CLIENT_ADMIN_EMAIL },
    update: {
      role: "admin",
      fullName: "Rajesh Puppala",
    },
    create: {
      email: CLIENT_ADMIN_EMAIL,
      role: "admin",
      fullName: "Rajesh Puppala",
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const item of contractorTypes) {
    await prisma.contractorType.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  for (const item of projectTenderTypes) {
    await prisma.projectTenderType.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }

  for (const projectTender of projectTenders) {
    const created = await prisma.projectTender.upsert({
      where: { slug: projectTender.slug },
      update: {
        categorySlug: projectTender.categorySlug,
        title: projectTender.title,
        projectType: projectTender.projectType,
        status: projectTender.status,
        summary: projectTender.summary,
        description: projectTender.description,
        budget: projectTender.budget,
        deadline: projectTender.deadline,
        client: projectTender.client,
        value: projectTender.value,
        tenderType: projectTender.tenderType,
        location: projectTender.location,
        posted: projectTender.posted,
        featured: projectTender.featured,
      },
      create: {
        slug: projectTender.slug,
        categorySlug: projectTender.categorySlug,
        title: projectTender.title,
        projectType: projectTender.projectType,
        status: projectTender.status,
        summary: projectTender.summary,
        description: projectTender.description,
        budget: projectTender.budget,
        deadline: projectTender.deadline,
        client: projectTender.client,
        value: projectTender.value,
        tenderType: projectTender.tenderType,
        location: projectTender.location,
        posted: projectTender.posted,
        featured: projectTender.featured,
      },
    });

    await prisma.projectTenderTypeLink.deleteMany({
      where: { projectTenderId: created.id },
    });
    await prisma.projectTenderCountryLink.deleteMany({
      where: { projectTenderId: created.id },
    });
    await prisma.projectTenderCityLink.deleteMany({
      where: { projectTenderId: created.id },
    });
    await prisma.projectTenderSector.deleteMany({
      where: { projectTenderId: created.id },
    });

    await prisma.projectTenderTypeLink.createMany({
      data: projectTender.projectTenderTypes.map((slug) => ({
        projectTenderId: created.id,
        projectTenderTypeSlug: slug,
      })),
    });

    await prisma.projectTenderCountryLink.createMany({
      data: projectTender.countryCodes.map((code) => ({
        projectTenderId: created.id,
        countryCode: code,
      })),
    });

    await prisma.projectTenderCityLink.createMany({
      data: projectTender.citySlugs.map((slug) => ({
        projectTenderId: created.id,
        citySlug: slug,
      })),
    });

    await prisma.projectTenderSector.createMany({
      data: projectTender.sectors.map((sectorName) => ({
        projectTenderId: created.id,
        sectorName,
      })),
    });
  }

  for (const contractor of contractors) {
    const created = await prisma.contractor.upsert({
      where: { slug: contractor.slug },
      update: {
        categorySlug: contractor.categorySlug,
        name: contractor.name,
        companyType: contractor.companyType,
        primaryTypeSlug: contractor.primaryTypeSlug,
        countryCode: contractor.countryCode,
        citySlug: contractor.citySlug,
        yearEstablished: contractor.yearEstablished,
        employees: contractor.employees,
        website: contractor.website,
        email: contractor.email,
        phone: contractor.phone,
        whatsapp: contractor.whatsapp,
        address: contractor.address,
        description: contractor.description,
        rating: contractor.rating,
        reviewCount: contractor.reviewCount,
        verified: contractor.verified,
        premium: contractor.premium,
        memberSince: contractor.memberSince,
        responseTime: contractor.responseTime,
        projectsCompleted: contractor.projectsCompleted,
      },
      create: {
        slug: contractor.slug,
        categorySlug: contractor.categorySlug,
        name: contractor.name,
        companyType: contractor.companyType,
        primaryTypeSlug: contractor.primaryTypeSlug,
        countryCode: contractor.countryCode,
        citySlug: contractor.citySlug,
        yearEstablished: contractor.yearEstablished,
        employees: contractor.employees,
        website: contractor.website,
        email: contractor.email,
        phone: contractor.phone,
        whatsapp: contractor.whatsapp,
        address: contractor.address,
        description: contractor.description,
        rating: contractor.rating,
        reviewCount: contractor.reviewCount,
        verified: contractor.verified,
        premium: contractor.premium,
        memberSince: contractor.memberSince,
        responseTime: contractor.responseTime,
        projectsCompleted: contractor.projectsCompleted,
      },
    });

    await prisma.contractorTypeLink.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorCountryLink.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorCityLink.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorService.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorAreaServed.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorLicense.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorGalleryItem.deleteMany({
      where: { contractorId: created.id },
    });
    await prisma.contractorFeaturedProject.deleteMany({
      where: { contractorId: created.id },
    });

    await prisma.contractorTypeLink.createMany({
      data: contractor.contractorTypes.map((slug) => ({
        contractorId: created.id,
        contractorTypeSlug: slug,
      })),
    });

    await prisma.contractorCountryLink.createMany({
      data: contractor.countryCodes.map((code) => ({
        contractorId: created.id,
        countryCode: code,
      })),
    });

    await prisma.contractorCityLink.createMany({
      data: contractor.citySlugs.map((slug) => ({
        contractorId: created.id,
        citySlug: slug,
      })),
    });

    await prisma.contractorService.createMany({
      data: contractor.services.map((serviceName) => ({
        contractorId: created.id,
        serviceName,
      })),
    });

    await prisma.contractorAreaServed.createMany({
      data: contractor.areasServed.map((areaName) => ({
        contractorId: created.id,
        areaName,
      })),
    });

    await prisma.contractorLicense.createMany({
      data: contractor.licenses.map((licenseName) => ({
        contractorId: created.id,
        licenseName,
      })),
    });

    await prisma.contractorGalleryItem.createMany({
      data: contractor.gallery.map((imageUrl) => ({
        contractorId: created.id,
        imageUrl,
      })),
    });

    await prisma.contractorFeaturedProject.createMany({
      data: contractor.featuredProjects.map((project) => ({
        contractorId: created.id,
        title: project.title,
        location: project.location,
        status: project.status,
      })),
    });
  }

  console.log("Seed completed successfully.");
  console.log(`Default admin: ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`Client admin: ${CLIENT_ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
