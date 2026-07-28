import { prisma } from "@/lib/prisma";

export async function ensureSampleRfqs() {
  const count = await prisma.rfq.count();
  if (count === 0) {
    await prisma.rfq.create({
      data: {
      reference: "RFQ-0003",
      title: "300,000 Liters Premium Grade Bitumen MC-30",
      projectName: "Salwa Expressway Expansion",
      category: "Materials Sourcing",
      status: "draft",
      country: "Qatar",
      city: "Doha",
      address: "Salwa Road Expansion Site, Zone 55",
      quantity: "300,000 Liters",
      budget: "QAR 750,000",
      urgency: "High Urgency",
      expirationDate: new Date("2026-08-07T12:00:00.000Z"),
      deliveryTerms: "Delivery to Salwa Road Expansion Site, Zone 55",
      description:
        "Supply of liquid road-coating MC-30 Bitumen. Delivery to site at Salwa Road expansion. Supplier must provide certificate of compliance with Qatar Construction Specifications.",
      phone: "+974 4400 1020",
      email: "procurement@salwaexpressway.example",
      postedAt: new Date("2026-07-11T09:00:00.000Z"),
      quotations: {
        create: {
          vendorName: "Jubail Bitumen Products",
          offerAmount: "QAR 680,000",
          deliveryLeadtime: "8 Days",
          technicalSpecification: "Premium MC-30 Liquid Bitumen. 200L drums.",
          vendorNotes:
            "Temperature controlled shipping container. Delivery to Salwa site.",
          status: "pending",
        },
      },
      },
    });

    await prisma.rfq.createMany({
      data: [
      {
        reference: "RFQ-0002",
        title: "Rental of 6 Crawler Excavators — 35 Ton",
        projectName: "Riyadh Northern Infrastructure Package",
        category: "Equipment Rentals",
        status: "published",
        country: "Saudi Arabia",
        city: "Riyadh",
        address: "Northern Riyadh construction corridor",
        quantity: "6 Units for 9 Months",
        budget: "SAR 1,350,000",
        urgency: "Medium Urgency",
        expirationDate: new Date("2026-08-18T12:00:00.000Z"),
        deliveryTerms: "Mobilization to project site within 14 days",
        description:
          "Rental requirement for six maintained 35-ton crawler excavators with qualified operators, service support, insurance, and replacement coverage.",
        phone: "+966 11 440 2323",
        email: "rfq@riyadhinfra.example",
      },
      {
        reference: "RFQ-0001",
        title: "Purchase of Tower Crane Safety Monitoring Systems",
        projectName: "Dubai Creek Residential Towers",
        category: "Equipment Purchases",
        status: "closed",
        country: "United Arab Emirates",
        city: "Dubai",
        address: "Dubai Creek Harbour",
        quantity: "12 Complete Systems",
        budget: "AED 420,000",
        urgency: "Low Urgency",
        expirationDate: new Date("2026-07-20T12:00:00.000Z"),
        deliveryTerms: "Supply, installation, calibration and training",
        description:
          "Supply and commissioning of tower crane anti-collision and load-monitoring systems for twelve cranes operating across three adjacent tower plots.",
        phone: "+971 4 555 0198",
        email: "buying@creektowers.example",
      },
      ],
    });
  }

  const seededQuotations = [
    {
      rfqReference: "RFQ-0003",
      vendorName: "Gulf Road Materials W.L.L.",
      offerAmount: "QAR 705,000",
      deliveryLeadtime: "6 Days",
      technicalSpecification:
        "MC-30 cutback bitumen supplied in sealed 200L drums with batch certificates.",
      vendorNotes:
        "Price includes delivery, unloading and third-party laboratory documentation.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0003",
      vendorName: "Al Jazeera Asphalt Supplies",
      offerAmount: "QAR 724,500",
      deliveryLeadtime: "5 Days",
      technicalSpecification:
        "QCS-compliant MC-30 road primer supplied by temperature-controlled tankers.",
      vendorNotes:
        "Two scheduled deliveries are proposed to match the paving programme.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0002",
      vendorName: "Najd Heavy Equipment Rental",
      offerAmount: "SAR 1,185,000",
      deliveryLeadtime: "10 Days",
      technicalSpecification:
        "Six 2023 crawler excavators, 35-ton operating weight, supplied with operators.",
      vendorNotes:
        "Monthly preventive maintenance and one standby replacement unit included.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0002",
      vendorName: "Arabian Plant Hire Co.",
      offerAmount: "SAR 1,260,000",
      deliveryLeadtime: "7 Days",
      technicalSpecification:
        "Six low-hour excavators with hydraulic breakers, GPS tracking and certified operators.",
      vendorNotes:
        "Mobilization and demobilization are included. Fuel is excluded.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0002",
      vendorName: "Riyadh Machinery Solutions",
      offerAmount: "SAR 1,310,000",
      deliveryLeadtime: "12 Days",
      technicalSpecification:
        "Mixed Caterpillar and Komatsu fleet with full service history and insurance.",
      vendorNotes:
        "Offer includes 24-hour breakdown support throughout the rental period.",
      status: "declined",
    },
    {
      rfqReference: "RFQ-0001",
      vendorName: "Emirates Crane Technologies",
      offerAmount: "AED 398,000",
      deliveryLeadtime: "21 Days",
      technicalSpecification:
        "Twelve anti-collision systems with load indicators, zoning and remote monitoring.",
      vendorNotes:
        "Installation, calibration, operator training and two-year warranty included.",
      status: "accepted",
    },
    {
      rfqReference: "RFQ-0001",
      vendorName: "SafeLift Automation LLC",
      offerAmount: "AED 412,500",
      deliveryLeadtime: "18 Days",
      technicalSpecification:
        "Wireless tower-crane safety suite compliant with EN 14439 requirements.",
      vendorNotes:
        "Includes commissioning reports and annual cloud-monitoring subscription.",
      status: "declined",
    },
    {
      rfqReference: "RFQ-0003",
      vendorName: "Doha Petrochemical Trading",
      offerAmount: "QAR 692,000",
      deliveryLeadtime: "9 Days",
      technicalSpecification:
        "Locally stocked MC-30 cutback bitumen supplied in certified bulk tankers.",
      vendorNotes:
        "Offer includes staged site delivery, compliance certificates and unloading supervision.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0002",
      vendorName: "Desert Fleet Services",
      offerAmount: "SAR 1,225,000",
      deliveryLeadtime: "8 Days",
      technicalSpecification:
        "Six 35-ton excavators with operators, telematics and scheduled on-site servicing.",
      vendorNotes:
        "Standby equipment can be mobilized within 24 hours in case of breakdown.",
      status: "pending",
    },
    {
      rfqReference: "RFQ-0001",
      vendorName: "Middle East Lifting Controls",
      offerAmount: "AED 405,000",
      deliveryLeadtime: "16 Days",
      technicalSpecification:
        "Integrated anti-collision, load-moment and wind-speed monitoring package for twelve cranes.",
      vendorNotes:
        "Includes installation, multilingual operator training and 18 months of technical support.",
      status: "declined",
    },
  ];

  for (const quotation of seededQuotations) {
    const rfq = await prisma.rfq.findUnique({
      where: { reference: quotation.rfqReference },
      select: { id: true },
    });
    if (!rfq) continue;

    const exists = await prisma.vendorQuotation.findFirst({
      where: { rfqId: rfq.id, vendorName: quotation.vendorName },
      select: { id: true },
    });
    if (exists) continue;

    await prisma.vendorQuotation.create({
      data: {
        rfqId: rfq.id,
        vendorName: quotation.vendorName,
        offerAmount: quotation.offerAmount,
        deliveryLeadtime: quotation.deliveryLeadtime,
        technicalSpecification: quotation.technicalSpecification,
        vendorNotes: quotation.vendorNotes,
        status: quotation.status,
      },
    });
  }
}

export async function getRfqs() {
  await ensureSampleRfqs();
  return prisma.rfq.findMany({
    include: {
      quotations: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { postedAt: "desc" },
  });
}
