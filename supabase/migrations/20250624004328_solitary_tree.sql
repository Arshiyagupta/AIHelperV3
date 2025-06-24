/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Supabase user ID
      - `email` (text, unique) - Email used for login
      - `full_name` (text) - User's display name
      - `invite_code` (text, unique) - Auto-generated code used to link with a partner
      - `partner_id` (uuid, nullable) - The ID of the connected partner
      - `created_at` (timestamp) - When the user was created
      - `updated_at` (timestamp) - When the user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read and update their own data
    - Add policy for users to read their partner's basic info
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  partner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can read their partner's basic information
CREATE POLICY "Users can read partner data"
  ON users
  FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid());

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();