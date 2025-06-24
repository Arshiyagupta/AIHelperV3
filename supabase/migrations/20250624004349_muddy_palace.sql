/*
  # Create reflections table

  1. New Tables
    - `reflections`
      - `id` (uuid, primary key)
      - `question_id` (uuid) - Reference to the question
      - `type` (enum) - Whether this is from asker or partner
      - `content` (jsonb) - Structured representation of the conversation
      - `created_at` (timestamp) - When the reflection was created

  2. Security
    - Enable RLS on `reflections` table
    - Add policy for users involved in the question to access reflections
*/

-- Create enum for reflection type
CREATE TYPE reflection_type AS ENUM ('asker', 'partner');

CREATE TABLE IF NOT EXISTS reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  type reflection_type NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Users can access reflections for questions they are involved in
CREATE POLICY "Users can access reflections for own questions"
  ON reflections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = reflections.question_id 
      AND (questions.asker_id = auth.uid() OR questions.partner_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = reflections.question_id 
      AND (questions.asker_id = auth.uid() OR questions.partner_id = auth.uid())
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_question_id ON reflections(question_id);
CREATE INDEX IF NOT EXISTS idx_reflections_type ON reflections(type);