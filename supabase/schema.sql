-- HomeCare Platform - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'homeowner' CHECK (role IN ('homeowner', 'technician')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- HOMES
-- =============================================
CREATE TABLE IF NOT EXISTS homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  size_sqft INTEGER,
  year_built INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own homes" ON homes USING (auth.uid() = user_id);

-- =============================================
-- APPLIANCES
-- =============================================
CREATE TABLE IF NOT EXISTS appliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  model TEXT,
  installation_date DATE,
  warranty_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Appliance access via home" ON appliances USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = appliances.home_id AND homes.user_id = auth.uid())
);

-- =============================================
-- MAINTENANCE TASKS
-- =============================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  appliance_id UUID REFERENCES appliances(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency_days INTEGER,
  next_due_date DATE,
  last_completed DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Task access via home" ON maintenance_tasks USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = maintenance_tasks.home_id AND homes.user_id = auth.uid())
);

-- =============================================
-- DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  category TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON documents USING (auth.uid() = user_id);

-- =============================================
-- EXPENSES
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON expenses USING (auth.uid() = user_id);

-- =============================================
-- TECHNICIANS
-- =============================================
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  description TEXT,
  hourly_rate NUMERIC(8,2),
  country TEXT,
  state TEXT,
  city TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view technicians" ON technicians FOR SELECT USING (TRUE);
CREATE POLICY "Technicians manage own listing" ON technicians FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SERVICE REQUESTS
-- =============================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id),
  home_id UUID REFERENCES homes(id),
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'rejected')),
  scheduled_date DATE,
  completed_date DATE,
  amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Homeowners manage own requests" ON service_requests USING (auth.uid() = homeowner_id);
CREATE POLICY "Technicians view their requests" ON service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM technicians WHERE technicians.id = service_requests.technician_id AND technicians.user_id = auth.uid())
);
CREATE POLICY "Technicians update request status" ON service_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM technicians WHERE technicians.id = service_requests.technician_id AND technicians.user_id = auth.uid())
);

-- =============================================
-- MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  receiver_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Message participants can read" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Sender can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can mark as read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  homeowner_id UUID NOT NULL REFERENCES profiles(id),
  request_id UUID REFERENCES service_requests(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Homeowners insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = homeowner_id);

-- =============================================
-- AUTO-UPDATE TECHNICIAN RATING FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE technicians
  SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE technician_id = NEW.technician_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE technician_id = NEW.technician_id)
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_technician_rating();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'homeowner')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run in Supabase Storage section or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
