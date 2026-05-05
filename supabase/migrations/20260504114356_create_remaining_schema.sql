
/*
  # NorthEastKrishimitra - Core Schema (part 2)

  Creates is_admin() helper, all content tables, profiles, trigger, RLS, and seed data.
*/

-- ─────────────────────────────────────────────
-- Helper: is_admin()
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────
-- Admins RLS policies
-- ─────────────────────────────────────────────
CREATE POLICY "Admins can view admins table"
  ON admins FOR SELECT
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL DEFAULT '',
  mobile_number   text NOT NULL DEFAULT '',
  email_address   text NOT NULL DEFAULT '',
  address         text NOT NULL DEFAULT '',
  role            text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'agriculture_student')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- about_content
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS about_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL DEFAULT '',
  body       text NOT NULL DEFAULT '',
  image_url  text NOT NULL DEFAULT '',
  is_active  boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active about content"
  ON about_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert about content"
  ON about_content FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update about content"
  ON about_content FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete about content"
  ON about_content FOR DELETE
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- services
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  icon_name     text NOT NULL DEFAULT 'leaf',
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- trainings
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  duration      text NOT NULL DEFAULT '',
  mode          text NOT NULL DEFAULT 'offline' CHECK (mode IN ('online', 'offline', 'hybrid')),
  image_url     text NOT NULL DEFAULT '',
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trainings"
  ON trainings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert trainings"
  ON trainings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update trainings"
  ON trainings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete trainings"
  ON trainings FOR DELETE
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- shop_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL DEFAULT '',
  description    text NOT NULL DEFAULT '',
  price          numeric(10,2) NOT NULL DEFAULT 0,
  image_url      text NOT NULL DEFAULT '',
  category       text NOT NULL DEFAULT '',
  stock_quantity int NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  display_order  int NOT NULL DEFAULT 0,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop items"
  ON shop_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert shop items"
  ON shop_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update shop items"
  ON shop_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete shop items"
  ON shop_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- contact_info
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_info (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL DEFAULT '',
  value         text NOT NULL DEFAULT '',
  type          text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'email', 'phone', 'address', 'url')),
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contact info"
  ON contact_info FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert contact info"
  ON contact_info FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update contact info"
  ON contact_info FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete contact info"
  ON contact_info FOR DELETE
  TO authenticated
  USING (is_admin());

-- ─────────────────────────────────────────────
-- Trigger: auto-create profile on signup
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- Seed data
-- ─────────────────────────────────────────────
INSERT INTO about_content (title, body, image_url) VALUES
(
  'About NorthEastKrishimitra',
  'NorthEastKrishimitra is a dedicated agri-support platform serving farmers and agriculture students across the North East region of India. Our mission is to bridge the gap between modern agricultural knowledge and traditional farming practices, empowering rural communities through accessible information, training, and quality agri-inputs.',
  'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg'
)
ON CONFLICT DO NOTHING;

INSERT INTO services (title, description, icon_name, display_order) VALUES
  ('Crop Advisory', 'Expert guidance on crop selection, soil health, pest management, and best farming practices tailored to North East India climatic conditions.', 'sprout', 1),
  ('Soil Testing', 'Professional soil analysis to understand nutrient levels and pH balance, helping you make informed decisions about fertilisation.', 'flask-conical', 2),
  ('Weather Updates', 'Localised weather forecasts and agricultural advisories to help you plan planting and harvesting cycles effectively.', 'cloud-sun', 3),
  ('Market Linkage', 'Connecting farmers directly with buyers, mandis, and exporters to ensure fair pricing and reduce middlemen dependency.', 'store', 4),
  ('Subsidies & Schemes', 'Updated information on government subsidies, loan schemes, and welfare programmes available for farmers in the region.', 'landmark', 5),
  ('Community Support', 'A thriving community of farmers and students to share knowledge, experiences, and collaborative problem-solving.', 'users', 6)
ON CONFLICT DO NOTHING;

INSERT INTO trainings (title, description, duration, mode, image_url, display_order) VALUES
  ('Organic Farming Fundamentals', 'Learn the principles of organic farming, composting, natural pest control, and certification pathways.', '3 Days', 'offline', 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg', 1),
  ('Modern Irrigation Techniques', 'Hands-on training on drip irrigation, sprinkler systems, and water conservation methods suitable for hill terrain.', '2 Days', 'hybrid', 'https://images.pexels.com/photos/1483880/pexels-photo-1483880.jpeg', 2),
  ('Agri-Entrepreneurship Program', 'Develop business skills to turn your farm into a profitable enterprise. Covers value addition, branding, and marketing.', '5 Days', 'online', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 3),
  ('Plant Disease Management', 'Identify and manage common plant diseases using integrated pest management and biological controls.', '2 Days', 'offline', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg', 4)
ON CONFLICT DO NOTHING;

INSERT INTO shop_items (name, description, price, image_url, category, stock_quantity, display_order) VALUES
  ('Organic Compost (5 kg)', 'Rich, nutrient-dense organic compost prepared from farm waste. Ideal for vegetable gardens and field crops.', 150.00, 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg', 'Fertilizers', 200, 1),
  ('Neem-based Pesticide (1 L)', 'Natural bio-pesticide derived from neem extract. Safe for beneficial insects and effective against a broad spectrum of pests.', 280.00, 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg', 'Pesticides', 150, 2),
  ('Hybrid Vegetable Seed Kit', 'Curated selection of high-yield hybrid seeds for tomato, brinjal, capsicum, and leafy greens suited for NE climate.', 320.00, 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg', 'Seeds', 100, 3),
  ('Hand Sprayer (16 L)', 'Durable manual knapsack sprayer with adjustable nozzle for uniform application of pesticides and fertilizers.', 950.00, 'https://images.pexels.com/photos/4503735/pexels-photo-4503735.jpeg', 'Equipment', 50, 4)
ON CONFLICT DO NOTHING;

INSERT INTO contact_info (label, value, type, display_order) VALUES
  ('Email', 'support@northeastkrishimitra.com', 'email', 1),
  ('Phone', '+91 94360 XXXXX', 'phone', 2),
  ('Address', 'Krishi Bhavan, Guwahati, Assam - 781001, India', 'address', 3),
  ('Website', 'https://northeastkrishimitra.com', 'url', 4)
ON CONFLICT DO NOTHING;
