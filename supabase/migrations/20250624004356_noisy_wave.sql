/*
  # Create insights table

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `question_id` (uuid) - Reference to the question
      - `emotional_summary` (text) - Summary of the partner's emotional state
      - `contextual_summary` (text) - Background and contributing factors
      - `suggested_action` (text) - Specific advice for the asker
      - `created_at` (timestamp) - When the insight was created

  2. Security
    - Enable RLS on `insights` table
    - Add policy for only the asker to access insights
*/

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  emotional_summary text NOT NULL,
  contextual_summary text NOT NULL,
  suggested_action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id)
);

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Only the asker can access insights
CREATE POLICY "Askers can access insights for own questions"
  ON insights
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = insights.question_id 
      AND questions.asker_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = insights.question_id 
      AND questions.asker_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_insights_question_id ON insights(question_id);