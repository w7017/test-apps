/*
  # Add image support for sites and buildings

  1. New Tables
    - `site_images`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to sites)
      - `file_path` (text)
      - `original_name` (text)
      - `file_size` (integer)
      - `mime_type` (text)
      - `is_primary` (boolean)
      - `description` (text)
      - `uploaded_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
    - `building_images`
      - `id` (uuid, primary key)
      - `building_id` (uuid, foreign key to buildings)
      - `file_path` (text)
      - `original_name` (text)
      - `file_size` (integer)
      - `mime_type` (text)
      - `is_primary` (boolean)
      - `description` (text)
      - `uploaded_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
  3. Changes
    - Add indexes for performance
*/

-- Create site_images table
CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  original_name text NOT NULL,
  file_size integer,
  mime_type text,
  is_primary boolean DEFAULT false,
  description text,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create building_images table
CREATE TABLE IF NOT EXISTS building_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  original_name text NOT NULL,
  file_size integer,
  mime_type text,
  is_primary boolean DEFAULT false,
  description text,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_images ENABLE ROW LEVEL SECURITY;

-- Create policies for site_images
CREATE POLICY "Users can read site images"
  ON site_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert site images"
  ON site_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update site images"
  ON site_images
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete site images"
  ON site_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for building_images
CREATE POLICY "Users can read building images"
  ON building_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert building images"
  ON building_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update building images"
  ON building_images
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete building images"
  ON building_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_images_site ON site_images(site_id);
CREATE INDEX IF NOT EXISTS idx_site_images_primary ON site_images(site_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_building_images_building ON building_images(building_id);
CREATE INDEX IF NOT EXISTS idx_building_images_primary ON building_images(building_id, is_primary);