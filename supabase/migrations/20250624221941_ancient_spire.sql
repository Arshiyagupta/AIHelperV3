/*
  # Fix user signup database trigger

  1. Database Functions
    - Create or replace the `handle_new_user()` function to properly handle new user creation
    - Extract user metadata (full_name, invite_code) from auth.users and insert into public.users

  2. Triggers
    - Create trigger to automatically call handle_new_user() when a new user signs up
    - Ensures public.users table is populated with user profile data

  3. Security
    - Function runs with SECURITY DEFINER to have proper permissions
    - Handles potential null values gracefully
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, invite_code, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'invite_code',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();