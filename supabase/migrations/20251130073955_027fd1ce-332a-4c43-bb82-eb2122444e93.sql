-- Create user role enum
CREATE TYPE user_role AS ENUM ('buyer', 'seller');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('rent', 'sale')),
  price DECIMAL(12, 2) NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
  area_sqft INTEGER CHECK (area_sqft > 0),
  available_from DATE,
  available_to DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Sellers can create properties"
  ON properties FOR INSERT
  WITH CHECK (
    seller_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update own properties"
  ON properties FOR UPDATE
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own properties"
  ON properties FOR DELETE
  USING (seller_id = auth.uid());

-- Create property_images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Property images policies
CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage images for own properties"
  ON property_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_id 
      AND properties.seller_id = auth.uid()
    )
  );

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();