-- STEP 1: Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- STEP 2: Create is_admin() helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
$$;

-- Admins RLS
DROP POLICY IF EXISTS "Admins can view admins table" ON admins;
CREATE POLICY "Admins can view admins table"
  ON admins FOR SELECT
  TO authenticated
  USING (is_admin());

-- STEP 3: profiles table (linked to auth.users)
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

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT TO authenticated USING (is_admin());

-- STEP 4: about_content
CREATE TABLE IF NOT EXISTS about_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL DEFAULT '',
  body       text NOT NULL DEFAULT '',
  image_url  text NOT NULL DEFAULT '',
  is_active  boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active about content" ON about_content;
CREATE POLICY "Anyone can view active about content"
  ON about_content FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert about content" ON about_content;
CREATE POLICY "Admins can insert about content"
  ON about_content FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update about content" ON about_content;
CREATE POLICY "Admins can update about content"
  ON about_content FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete about content" ON about_content;
CREATE POLICY "Admins can delete about content"
  ON about_content FOR DELETE TO authenticated USING (is_admin());

-- STEP 5: services
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

DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert services" ON services;
CREATE POLICY "Admins can insert services"
  ON services FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update services" ON services;
CREATE POLICY "Admins can update services"
  ON services FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete services" ON services;
CREATE POLICY "Admins can delete services"
  ON services FOR DELETE TO authenticated USING (is_admin());

-- STEP 6: trainings
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

DROP POLICY IF EXISTS "Anyone can view active trainings" ON trainings;
CREATE POLICY "Anyone can view active trainings"
  ON trainings FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert trainings" ON trainings;
CREATE POLICY "Admins can insert trainings"
  ON trainings FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update trainings" ON trainings;
CREATE POLICY "Admins can update trainings"
  ON trainings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete trainings" ON trainings;
CREATE POLICY "Admins can delete trainings"
  ON trainings FOR DELETE TO authenticated USING (is_admin());

-- STEP 7: shop_items
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

DROP POLICY IF EXISTS "Anyone can view active shop items" ON shop_items;
CREATE POLICY "Anyone can view active shop items"
  ON shop_items FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert shop items" ON shop_items;
CREATE POLICY "Admins can insert shop items"
  ON shop_items FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update shop items" ON shop_items;
CREATE POLICY "Admins can update shop items"
  ON shop_items FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete shop items" ON shop_items;
CREATE POLICY "Admins can delete shop items"
  ON shop_items FOR DELETE TO authenticated USING (is_admin());

-- STEP 8: contact_info
CREATE TABLE IF NOT EXISTS contact_info (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL DEFAULT '',
  value         text NOT NULL DEFAULT '',
  type          text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'email', 'phone', 'address', 'url')),
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active contact info" ON contact_info;
CREATE POLICY "Anyone can view active contact info"
  ON contact_info FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert contact info" ON contact_info;
CREATE POLICY "Admins can insert contact info"
  ON contact_info FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update contact info" ON contact_info;
CREATE POLICY "Admins can update contact info"
  ON contact_info FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete contact info" ON contact_info;
CREATE POLICY "Admins can delete contact info"
  ON contact_info FOR DELETE TO authenticated USING (is_admin());

-- STEP 9: Auto-create profile on user signup trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
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