/*
  # Create push_tokens table

  1. New Tables
    - `push_tokens`
      - `user_id` (uuid) - Reference to the user
      - `device_token` (text) - FCM device token
      - `created_at` (timestamp) - When the token was created
      - `updated_at` (timestamp) - When the token was last updated

  2. Security
    - Enable RLS on `push_tokens` table
    - Add policy for users to manage their own tokens
*/

CREATE TABLE IF NOT EXISTS push_tokens (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, device_token)
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can manage own push tokens"
  ON push_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);