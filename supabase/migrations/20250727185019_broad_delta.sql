@@ .. @@
 -- File attachments table
-CREATE TABLE file_attachments (
-    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
-    entity_type VARCHAR(50) NOT NULL, -- 'building', 'equipment', 'audit', 'site', 'client'
-    entity_id UUID NOT NULL,
-    file_path VARCHAR(500) NOT NULL,
-    original_name VARCHAR(255) NOT NULL,
-    file_size INTEGER,
-    mime_type VARCHAR(100),
-    file_type VARCHAR(50) NOT NULL, -- 'image', 'document', 'video', 'pdf'
-    is_primary BOOLEAN DEFAULT false,
-    description TEXT,
-    uploaded_by UUID REFERENCES users(id),
-    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-);
+-- Replaced by specific image tables: site_images, building_images
+
+-- Site images table
+CREATE TABLE site_images (
+    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
+    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
+    file_path VARCHAR(500) NOT NULL,
+    original_name VARCHAR(255) NOT NULL,
+    file_size INTEGER,
+    mime_type VARCHAR(100),
+    is_primary BOOLEAN DEFAULT false,
+    description TEXT,
+    uploaded_by UUID REFERENCES users(id),
+    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
+);
+
+-- Building images table
+CREATE TABLE building_images (
+    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
+    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
+    file_path VARCHAR(500) NOT NULL,
+    original_name VARCHAR(255) NOT NULL,
+    file_size INTEGER,
+    mime_type VARCHAR(100),
+    is_primary BOOLEAN DEFAULT false,
+    description TEXT,
+    uploaded_by UUID REFERENCES users(id),
+    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
+);
@@ .. @@
 CREATE INDEX idx_levels_building ON levels(building_id);
 CREATE INDEX idx_locals_level ON locals(level_id);
-CREATE INDEX idx_file_attachments_entity ON file_attachments(entity_type, entity_id);
-CREATE INDEX idx_file_attachments_type ON file_attachments(file_type);
-CREATE INDEX idx_file_attachments_primary ON file_attachments(entity_type, entity_id, is_primary);
+CREATE INDEX idx_site_images_site ON site_images(site_id);
+CREATE INDEX idx_site_images_primary ON site_images(site_id, is_primary);
+CREATE INDEX idx_building_images_building ON building_images(building_id);
+CREATE INDEX idx_building_images_primary ON building_images(building_id, is_primary);
 CREATE INDEX idx_activity_log_user ON activity_log(user_id);
 CREATE INDEX idx_activity_log_date ON activity_log(created_at);