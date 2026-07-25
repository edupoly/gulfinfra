CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  listing_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country_code text NOT NULL REFERENCES countries(code),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category_slug text NOT NULL REFERENCES categories(slug),
  name text NOT NULL,
  company_type text NOT NULL,
  primary_type_slug text REFERENCES contractor_types(slug),
  country_code text REFERENCES countries(code),
  city_slug text REFERENCES cities(slug),
  year_established integer,
  employees text,
  website text,
  email text,
  phone text,
  whatsapp text,
  address text,
  description text,
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  premium boolean NOT NULL DEFAULT false,
  member_since text,
  response_time text,
  projects_completed integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_type_links (
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  contractor_type_slug text NOT NULL REFERENCES contractor_types(slug),
  PRIMARY KEY (contractor_id, contractor_type_slug)
);

CREATE TABLE contractor_country_links (
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES countries(code),
  PRIMARY KEY (contractor_id, country_code)
);

CREATE TABLE contractor_city_links (
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  city_slug text NOT NULL REFERENCES cities(slug),
  PRIMARY KEY (contractor_id, city_slug)
);

CREATE TABLE contractor_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_areas_served (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  area_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  license_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contractor_featured_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  title text NOT NULL,
  location text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractors_category ON contractors(category_slug);
CREATE INDEX idx_contractors_country ON contractors(country_code);
CREATE INDEX idx_contractors_city ON contractors(city_slug);
CREATE INDEX idx_contractors_year_established ON contractors(year_established);
CREATE INDEX idx_contractors_name_trgm ON contractors USING gin (to_tsvector('english', name));
CREATE INDEX idx_contractors_description_trgm ON contractors USING gin (to_tsvector('english', description));
