-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS "public"."users" ENABLE ROW LEVEL SECURITY;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."users" (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  phone_number TEXT,
  email TEXT,
  username TEXT,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create services table for listings
CREATE TABLE IF NOT EXISTS "public"."services" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  rating DECIMAL(3, 2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "public"."orders" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) NOT NULL,
  buyer_id UUID REFERENCES public.users(id) NOT NULL,
  seller_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS "public"."reviews" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  reviewer_id UUID REFERENCES public.users(id) NOT NULL,
  reviewee_id UUID REFERENCES public.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create RLS policies

-- Users table policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON "public"."users"
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON "public"."users"
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON "public"."users"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON "public"."users"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Services table policies
-- Allow all users to view active services
CREATE POLICY "Anyone can view active services"
  ON "public"."services"
  FOR SELECT
  USING (active = true);

-- Allow users to manage their own services
CREATE POLICY "Users can manage own services"
  ON "public"."services"
  FOR ALL
  USING (auth.uid() = user_id);

-- Allow admins to manage all services
CREATE POLICY "Admins can manage all services"
  ON "public"."services"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Orders table policies
-- Allow users to view their own orders (as buyer or seller)
CREATE POLICY "Users can view own orders"
  ON "public"."orders"
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow users to create orders
CREATE POLICY "Users can create orders"
  ON "public"."orders"
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Allow users to update their own orders
CREATE POLICY "Users can update own orders"
  ON "public"."orders"
  FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow admins to manage all orders
CREATE POLICY "Admins can manage all orders"
  ON "public"."orders"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Reviews table policies
-- Allow all to view reviews
CREATE POLICY "Anyone can view reviews"
  ON "public"."reviews"
  FOR SELECT
  USING (true);

-- Allow users to create reviews for completed orders they're part of
CREATE POLICY "Users can create reviews for completed orders"
  ON "public"."reviews"
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.status = 'completed'
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Function to create a user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, email, role)
  VALUES (new.id, new.phone, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to add an admin user
CREATE OR REPLACE FUNCTION public.add_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create the user in the auth schema
  user_id := (SELECT id FROM auth.users WHERE email = admin_email LIMIT 1);

  IF user_id IS NULL THEN
    -- User doesn't exist, create new user
    user_id := (
      WITH inserted_user AS (
        INSERT INTO auth.users (email, password)
        VALUES (admin_email, admin_password)
        RETURNING id
      )
      SELECT id FROM inserted_user
    );
  END IF;

  -- Update or insert the user record with admin role
  INSERT INTO public.users (id, email, role)
  VALUES (user_id, admin_email, 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update service ratings
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
DECLARE
  service_id UUID;
  avg_rating DECIMAL(3, 2);
BEGIN
  -- Get the service_id from the order associated with the review
  SELECT orders.service_id INTO service_id
  FROM orders
  WHERE orders.id = NEW.order_id;

  -- Calculate the average rating for this service
  SELECT AVG(rating)::DECIMAL(3, 2) INTO avg_rating
  FROM reviews
  JOIN orders ON reviews.order_id = orders.id
  WHERE orders.service_id = service_id;

  -- Update the service with the new average rating
  UPDATE services
  SET rating = avg_rating
  WHERE id = service_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update service rating when a review is added
CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_service_rating();

-- Create trigger to update service rating when a review is updated
CREATE TRIGGER after_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_service_rating();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_services_timestamp
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Create function to set completed_at when order is marked as completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for completed_at
CREATE TRIGGER set_order_completed_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();
