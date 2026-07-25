export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  listingCount: number;
};

export type ContractorType = {
  slug: string;
  name: string;
};

export type ProjectTenderType = {
  slug: string;
  name: string;
};

export type EquipmentType = {
  slug: string;
  name: string;
};

export type Country = {
  code: string;
  name: string;
};

export type City = {
  slug: string;
  name: string;
  countryCode: string;
};

export type ContractorProfile = {
  slug: string;
  name: string;
  category: string;
  companyType: string;
  primaryType: string;
  contractorTypes: string[];
  country: string;
  countries: string[];
  city: string;
  cities: string[];
  yearEstablished: number;
  employees: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  description: string;
  services: string[];
  areasServed: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  premium: boolean;
  memberSince: string;
  responseTime: string;
  projectsCompleted: number;
  licenses: string[];
  gallery: string[];
  featuredProjects: Array<{
    title: string;
    location: string;
    status: string;
  }>;
};

export type ProjectTenderProfile = {
  slug: string;
  title: string;
  category: string;
  projectType: string;
  projectTypes: string[];
  country: string;
  countries: string[];
  city: string;
  cities: string[];
  status: string;
  summary: string;
  description: string;
  budget: string;
  deadline: string;
  client: string;
  sectors: string[];
  value: string;
  tenderType: string;
  location: string;
  posted: string;
  featured: boolean;
};

export type EquipmentProfile = {
  slug: string;
  title: string;
  equipmentType: string;
  equipmentTypeSlug: string;
  listingType: "For Sale" | "For Rent" | "Wanted";
  condition: "New" | "Excellent" | "Good" | "Used";
  country: string;
  countryCode: string;
  city: string;
  citySlug: string;
  brand: string;
  model: string;
  year: number;
  operatingHours: number | null;
  price: string;
  priceNote: string;
  availability: string;
  location: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  sellerName: string;
  sellerType: string;
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
  featured: boolean;
  images: string[];
  posted: string;
};

export type MaterialProfile = {
  slug: string;
  name: string;
  materialGroup: "Construction Materials" | "Industrial Materials";
  materialType: string;
  materialTypeSlug: string;
  listingType: "For Sale" | "Supplier" | "Buyer";
  country: string;
  countryCode: string;
  city: string;
  citySlug: string;
  supplier: string;
  priceRange: string;
  minimumOrder: string;
  availability: string;
  leadTime: string;
  compliance: string[];
  description: string;
  specifications: Array<{ label: string; value: string }>;
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
  image: string;
  posted: string;
};

export type BusinessOpportunity = {
  slug: string;
  title: string;
  section: "Businesses for Sale" | "Businesses Wanted" | "Investment Opportunities";
  category: string;
  investment: string;
  country: string;
  countryCode: string;
  city: string;
  postedDate: string;
  contact: string;
  phone: string;
  whatsapp: string;
  description: string;
  image: string;
};
