/*
  # Create questions table

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `asker_id` (uuid) - The user who asked the question
      - `partner_id` (uuid) - The intended recipient of the exploration
      - `question_text` (text) - The actual question
      - `created_at` (timestamp) - When the question was created
      - `status` (enum) - Current status of the question
      - `red_flag_detected` (boolean) - True if a safety issue was flagged

  2. Security
    - Enable RLS on `questions` table
    - Add policy for asker and partner to access questions
*/

-- Create enum for question status
CREATE TYPE question_status AS ENUM ('pending', 'processing', 'answered', 'rejected', 'red_flag');

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status question_status DEFAULT 'pending',
  red_flag_detected boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Asker and partner can access questions
CREATE POLICY "Users can access own questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (asker_id = auth.uid() OR partner_id = auth.uid())
  WITH CHECK (asker_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_questions_asker_id ON questions(asker_id);
CREATE INDEX IF NOT EXISTS idx_questions_partner_id ON questions(partner_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);