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

-- Create RLS policies
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
