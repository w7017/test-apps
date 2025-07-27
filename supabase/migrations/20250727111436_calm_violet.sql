/*
  # Create levels and locals tables

  1. New Tables
    - `levels`
      - `id` (uuid, primary key)
      - `building_id` (uuid, foreign key to buildings)
      - `name` (text)
      - `number` (integer)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `locals`
      - `id` (uuid, primary key)
      - `level_id` (uuid, foreign key to levels)
      - `name` (text)
      - `type` (text)
      - `surface` (numeric)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
  3. Changes
    - Update equipment table to reference locals
    - Add indexes for performance
*/

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) ON DELETE CASCADE,
  name text NOT NULL,
  number integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locals table
CREATE TABLE IF NOT EXISTS locals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid REFERENCES levels(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Bureau',
  surface numeric DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add local_id to equipment table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment' AND column_name = 'local_id'
  ) THEN
    ALTER TABLE equipment ADD COLUMN local_id uuid REFERENCES locals(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE locals ENABLE ROW LEVEL SECURITY;

-- Create policies for levels
CREATE POLICY "Users can read levels"
  ON levels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert levels"
  ON levels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update levels"
  ON levels
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete levels"
  ON levels
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for locals
CREATE POLICY "Users can read locals"
  ON locals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert locals"
  ON locals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update locals"
  ON locals
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete locals"
  ON locals
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_levels_building ON levels(building_id);
CREATE INDEX IF NOT EXISTS idx_locals_level ON locals(level_id);
CREATE INDEX IF NOT EXISTS idx_equipment_local ON equipment(local_id);

-- Create triggers for updated_at
CREATE TRIGGER update_levels_updated_at 
  BEFORE UPDATE ON levels 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locals_updated_at 
  BEFORE UPDATE ON locals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();