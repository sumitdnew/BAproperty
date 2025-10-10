-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_buildings junction table
CREATE TABLE IF NOT EXISTS public.vendor_buildings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, building_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_buildings_vendor_id ON public.vendor_buildings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_buildings_building_id ON public.vendor_buildings(building_id);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_buildings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.vendors;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vendors;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.vendors;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.vendors;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.vendor_buildings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vendor_buildings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.vendor_buildings;

-- Create RLS policies for vendors
CREATE POLICY "Enable read access for authenticated users" 
    ON public.vendors FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable insert for authenticated users" 
    ON public.vendors FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
    ON public.vendors FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable delete for authenticated users" 
    ON public.vendors FOR DELETE 
    TO authenticated 
    USING (true);

-- Create RLS policies for vendor_buildings
CREATE POLICY "Enable read access for authenticated users" 
    ON public.vendor_buildings FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable insert for authenticated users" 
    ON public.vendor_buildings FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
    ON public.vendor_buildings FOR DELETE 
    TO authenticated 
    USING (true);

-- Add updated_at trigger for vendors
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendors_updated_at_trigger ON public.vendors;

CREATE TRIGGER update_vendors_updated_at_trigger
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendors_updated_at();

-- Grant permissions
GRANT ALL ON public.vendors TO authenticated;
GRANT ALL ON public.vendor_buildings TO authenticated;

COMMENT ON TABLE public.vendors IS 'Stores vendor and service provider information';
COMMENT ON TABLE public.vendor_buildings IS 'Junction table linking vendors to buildings they service';

