/*
  # Create red_flags table

  1. New Tables
    - `red_flags`
      - `id` (uuid, primary key)
      - `question_id` (uuid) - Reference to the question
      - `trigger_phrase` (text) - The phrase that triggered the flag
      - `who_triggered` (enum) - Whether asker or partner triggered it
      - `timestamp` (timestamp) - When the flag was triggered
      - `action_taken` (text) - What action was taken

  2. Security
    - Enable RLS on `red_flags` table
    - Restrict access to admin/system level only
*/

-- Create enum for trigger source
CREATE TYPE trigger_source AS ENUM ('asker', 'partner');

CREATE TABLE IF NOT EXISTS red_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  trigger_phrase text NOT NULL,
  who_triggered trigger_source NOT NULL,
  timestamp timestamptz DEFAULT now(),
  action_taken text NOT NULL
);

-- Enable RLS
ALTER TABLE red_flags ENABLE ROW LEVEL SECURITY;

-- Red flags are only accessible by system/admin (no public policies)
-- This ensures red flag data is kept private and secure

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_red_flags_question_id ON red_flags(question_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_timestamp ON red_flags(timestamp);