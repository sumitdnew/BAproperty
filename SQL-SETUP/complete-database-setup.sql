-- COMPLETE DATABASE STRUCTURE FOR BA PROPERTY MANAGER

-- Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  total_apartments INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  dni VARCHAR(20),
  cuit_cuil VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  apartment VARCHAR(10) NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  estimated_cost DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL
);






-- Apartments Table
CREATE TABLE IF NOT EXISTS apartments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number VARCHAR(10) NOT NULL,
  floor INTEGER NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  square_meters DECIMAL(8,2),
  monthly_rent DECIMAL(12,2) NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  dni VARCHAR(20),
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  payment_type VARCHAR(20) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(10) DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  reference_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  token UUID DEFAULT gen_random_uuid()
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(20) NOT NULL,
  category VARCHAR(20),
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COMMUNITY_POST_COMMENTS TABLE
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. COMMUNITY_POST_LIKES TABLE
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ARS',
  expense_date DATE NOT NULL,
  supplier_name VARCHAR(255),
  invoice_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Building Amenities Table
CREATE TABLE IF NOT EXISTS building_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  maintenance_schedule VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Assignments Table
CREATE TABLE IF NOT EXISTS maintenance_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_by UUID REFERENCES user_profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  related_id UUID,
  related_type VARCHAR(50),
  uploaded_by UUID REFERENCES user_profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Receipts Table
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(100) NOT NULL,
  receipt_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(receipt_number)
);

-- Lease Agreements Table
CREATE TABLE IF NOT EXISTS lease_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  agreement_type VARCHAR(20) DEFAULT 'initial',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL,
  terms_and_conditions TEXT,
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Building Access Table
CREATE TABLE IF NOT EXISTS admin_building_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  access_level VARCHAR(20) DEFAULT 'full',
  can_manage_tenants BOOLEAN DEFAULT TRUE,
  can_manage_payments BOOLEAN DEFAULT TRUE,
  can_manage_maintenance BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, building_id)
);

-- Note: There is also a 'maintenance_requests_with_tenant_info' view/table in the actual schema
-- This appears to be a view that joins maintenance_requests with tenant and apartment information

-- DATA REQUIREMENTS FOR EACH TABLE:

-- BUILDINGS (1 building for testing)
-- - name: "Edificio Central"
-- - address: "Av. Corrientes 1234, Buenos Aires" 
-- - city: "Buenos Aires"
-- - province: "Buenos Aires"
-- - total_apartments: 24

-- USER_PROFILES (25-30 users total)
-- - 1 admin user
-- - 1 property_manager user  
-- - 2-3 building_owner users
-- - 20-25 tenant users
-- - 1-2 maintenance staff
-- Argentine names, DNI numbers (format: 12.345.678), phones (+54 11 xxxx-xxxx)

-- APARTMENTS (24 apartments)
-- - unit_numbers: 1A, 1B, 1C, 1D, 2A, 2B, 2C, 2D, 3A, 3B, 3C, 3D, 4A, 4B, 4C, 4D, 5A, 5B, 5C, 5D, 6A, 6B, 6C, 6D
-- - floors: 1-6 (4 apartments per floor)
-- - bedrooms: 1-3 (varied)
-- - bathrooms: 1-2 
-- - square_meters: 45-120 (varied)
-- - monthly_rent: 60000-120000 ARS (realistic Buenos Aires prices)
-- - is_occupied: ~75% occupied (18/24 apartments)

-- TENANTS (18 tenants for occupied apartments)
-- - Link to user_profiles with user_type='tenant'
-- - Link to occupied apartments
-- - lease_start_date: varied (some recent, some older)
-- - lease_end_date: 1-2 years from start
-- - deposit_amount: 1-2 months rent
-- - emergency contacts with Argentine names/phones

-- MAINTENANCE_REQUESTS (20-25 requests)
-- - Mix of priorities: low, medium, high, urgent
-- - Mix of statuses: pending, in_progress, completed, cancelled
-- - Categories: plumbing, electrical, hvac, cleaning, security, other
-- - Realistic titles/descriptions in Spanish
-- - estimated_cost: 5000-200000 ARS
-- - Date range: last 3 months

-- PAYMENTS (60-80 payment records)
-- - Monthly rent payments for all tenants (last 3 months)
-- - Some utility payments, deposits, maintenance fees
-- - Mix of statuses: completed, pending, overdue
-- - Various payment methods
-- - Reference numbers for bank transfers

-- INVITATIONS (10-12 invitations)
-- - Mix of statuses: pending, accepted, declined, expired
-- - Different roles: tenant, owner
-- - Realistic email addresses
-- - Some with phone numbers, some without
-- - Date range: last month

-- COMMUNITY_POSTS (15-20 posts)
-- - Mix of post_types: announcement, maintenance, social, complaint
-- - 2-3 pinned posts
-- - Varied likes_count and comments_count
-- - Realistic content in Spanish for Buenos Aires building
-- - Date range: last 2 months

-- COMMUNITY_POST_COMMENTS (30-50 comments)
-- - Multiple comments per popular post
-- - Realistic responses in Spanish

-- COMMUNITY_POST_LIKES (50-100 likes)
-- - Distribute likes across posts realistically

-- EXPENSES (20-30 expense records)
-- - Categories: maintenance, utilities, insurance, cleaning, security
-- - Mix of amounts and dates
-- - Some pending approval, some paid

-- NOTIFICATIONS (40-60 notifications)
-- - Various types for different users
-- - Mix of read/unread status

-- BUILDING_AMENITIES (8-12 amenities)
-- - Pool, gym, laundry room, rooftop, parking, etc.

-- MAINTENANCE_ASSIGNMENTS (15-20 assignments)
-- - Link maintenance requests to staff

-- DOCUMENTS (20-30 documents)
-- - Lease agreements, receipts, reports, invoices

-- PAYMENT_RECEIPTS (40-50 receipts)
-- - Link to completed payments

-- LEASE_AGREEMENTS (18-20 agreements)
-- - One per tenant, some renewals

-- SAMPLE DATA CHARACTERISTICS:
-- - All text in Spanish (Argentine style)
-- - Realistic Buenos Aires addresses, names, phone numbers
-- - Argentine peso amounts (ARS)
-- - DNI format: XX.XXX.XXX
-- - Phone format: +54 11 XXXX-XXXX  
-- - Apartment numbering: [Floor][Letter] (1A, 2B, etc.)
-- - Realistic rent prices for Buenos Aires (60k-120k ARS)
-- - Mix of payment methods common in Argentina
-- - Realistic maintenance issues for apartment buildings
-- - Proper relationships between all tables