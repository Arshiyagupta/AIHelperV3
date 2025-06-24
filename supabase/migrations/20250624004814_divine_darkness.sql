/*
  # Fix signup error by updating trigger function

  1. Database Changes
    - Update handle_new_user function to properly generate invite codes
    - Ensure the trigger uses the database function for invite code generation
    - Fix the trigger to handle user metadata properly

  2. Security
    - Maintain existing RLS policies
    - Ensure proper error handling in trigger function
*/

-- Update the trigger function to properly generate invite codes and handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, invite_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    generate_invite_code()
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