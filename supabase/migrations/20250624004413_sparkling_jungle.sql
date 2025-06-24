/*
  # Create database functions and triggers

  1. Functions
    - Function to handle user signup and profile creation
    - Function to connect partners
    - Function to generate invite codes

  2. Triggers
    - Trigger to create user profile on auth signup
*/

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'SAFE-';
  i integer;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, invite_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    generate_invite_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to connect partners
CREATE OR REPLACE FUNCTION connect_partners(partner_invite_code text)
RETURNS json AS $$
DECLARE
  current_user_id uuid;
  partner_user users%ROWTYPE;
  connection_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find partner by invite code
  SELECT * INTO partner_user
  FROM users
  WHERE invite_code = partner_invite_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Check if already connected
  IF partner_user.partner_id = current_user_id THEN
    RAISE EXCEPTION 'Already connected to this partner';
  END IF;

  -- Check if current user is already connected to someone else
  IF EXISTS (SELECT 1 FROM users WHERE id = current_user_id AND partner_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Already connected to another partner';
  END IF;

  -- Check if partner is already connected to someone else
  IF partner_user.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'Partner is already connected to someone else';
  END IF;

  -- Update both users to connect them
  UPDATE users SET partner_id = partner_user.id WHERE id = current_user_id;
  UPDATE users SET partner_id = current_user_id WHERE id = partner_user.id;

  -- Create connection record
  INSERT INTO connections (user_a_id, user_b_id)
  VALUES (current_user_id, partner_user.id)
  RETURNING id INTO connection_id;

  RETURN json_build_object(
    'success', true,
    'partner_id', partner_user.id,
    'partner_name', partner_user.full_name,
    'connection_id', connection_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;