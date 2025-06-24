/*
  # Fix user signup constraints

  1. Schema Changes
    - Make `full_name` nullable to allow signup without requiring it upfront
    - Make `invite_code` nullable to allow signup without requiring it upfront
    - Add default empty string for `full_name` to maintain data consistency
    - Keep `email` as NOT NULL since Supabase Auth provides this

  2. Security
    - Maintain existing RLS policies
    - No changes to authentication flow

  3. Notes
    - Users can update their full_name and invite_code after signup
    - This allows the standard Supabase Auth flow to work properly
*/

-- Make full_name nullable with a default empty string
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'full_name' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
    ALTER TABLE users ALTER COLUMN full_name SET DEFAULT '';
  END IF;
END $$;

-- Make invite_code nullable 
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'invite_code' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN invite_code DROP NOT NULL;
  END IF;
END $$;

-- Update the trigger function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, invite_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'invite_code', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();