/*
  # Create connections table

  1. New Tables
    - `connections`
      - `id` (uuid, primary key)
      - `user_a_id` (uuid) - First user in the connection
      - `user_b_id` (uuid) - Second user in the connection
      - `created_at` (timestamp) - When the connection was created

  2. Security
    - Enable RLS on `connections` table
    - Add policy for users to read connections they are part of
*/

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can read connections they are part of
CREATE POLICY "Users can read own connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Only authenticated users can create connections
CREATE POLICY "Users can create connections"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());