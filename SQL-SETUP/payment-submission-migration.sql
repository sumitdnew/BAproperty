-- Migration to add payment submission features
-- Run this in your Supabase SQL Editor

-- Add new columns to payments table for submission workflow
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS submission_status VARCHAR(20) DEFAULT 'pending';

-- Update the status column to support more payment states
-- Note: This might require updating existing data
-- ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);
-- UPDATE payments SET status = 'pending' WHERE status = 'pending';

-- Create storage bucket for payment proofs (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;

-- Create simpler RLS policies for payment proofs storage
CREATE POLICY "Users can upload their own payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND 
    auth.uid() IS NOT NULL AND
    name LIKE auth.uid()::text || '/%'
  );

CREATE POLICY "Users can view their own payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND 
    auth.uid() IS NOT NULL AND
    name LIKE auth.uid()::text || '/%'
  );

CREATE POLICY "Admins can view all payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND 
    EXISTS (
      SELECT 1 FROM admin_building_access 
      WHERE admin_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_submission_status ON payments(submission_status);
CREATE INDEX IF NOT EXISTS idx_payments_submitted_at ON payments(submitted_at);
CREATE INDEX IF NOT EXISTS idx_payments_reviewed_at ON payments(reviewed_at);

-- Add comments for documentation
COMMENT ON COLUMN payments.proof_url IS 'URL to the uploaded proof of payment file';
COMMENT ON COLUMN payments.submitted_by IS 'User who submitted the payment proof';
COMMENT ON COLUMN payments.submitted_at IS 'When the payment was submitted by tenant';
COMMENT ON COLUMN payments.reviewed_by IS 'Admin who reviewed the payment';
COMMENT ON COLUMN payments.reviewed_at IS 'When the payment was reviewed by admin';
COMMENT ON COLUMN payments.review_notes IS 'Admin notes about the payment review';
COMMENT ON COLUMN payments.submission_status IS 'Status of the payment submission: pending, approved, rejected';
