-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_buildings junction table to link vendors to buildings
CREATE TABLE IF NOT EXISTS public.vendor_buildings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, building_id)
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Create index on name for faster searching
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);

-- Create indexes for vendor_buildings table
CREATE INDEX IF NOT EXISTS idx_vendor_buildings_vendor_id ON public.vendor_buildings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_buildings_building_id ON public.vendor_buildings(building_id);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all vendors
CREATE POLICY "Allow authenticated users to read vendors" ON public.vendors
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert vendors (for admins/managers)
CREATE POLICY "Allow authenticated users to insert vendors" ON public.vendors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update vendors (for admins/managers)
CREATE POLICY "Allow authenticated users to update vendors" ON public.vendors
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete vendors (for admins/managers)
CREATE POLICY "Allow authenticated users to delete vendors" ON public.vendors
    FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS for vendor_buildings table
ALTER TABLE public.vendor_buildings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_buildings
CREATE POLICY "Allow authenticated users to read vendor_buildings" ON public.vendor_buildings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vendor_buildings" ON public.vendor_buildings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vendor_buildings" ON public.vendor_buildings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vendor_buildings" ON public.vendor_buildings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add vendor_id column to maintenance_requests table to link vendors
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id);

-- Create index on vendor_id for faster joins
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_vendor_id ON public.maintenance_requests(vendor_id);

-- Update the maintenance_requests_with_tenant_info view to include vendor information
-- First drop the existing view if it exists
DROP VIEW IF EXISTS public.maintenance_requests_with_tenant_info;

-- Recreate the view with vendor information
CREATE VIEW public.maintenance_requests_with_tenant_info AS
SELECT 
    mr.*,
    up.first_name || ' ' || up.last_name as tenant_name,
    v.name as vendor_name,
    v.category as vendor_category,
    v.contact_person as vendor_contact_person,
    v.email as vendor_email,
    v.phone as vendor_phone
FROM public.maintenance_requests mr
LEFT JOIN public.tenants t ON mr.apartment_id = t.apartment_id AND t.is_active = true
LEFT JOIN public.user_profiles up ON t.user_id = up.id
LEFT JOIN public.vendors v ON mr.vendor_id = v.id;

-- Grant access to the view
GRANT SELECT ON public.maintenance_requests_with_tenant_info TO authenticated;

-- Insert some sample vendors with Argentine names
INSERT INTO public.vendors (name, category, contact_person, email, phone, address, description, is_active) VALUES
-- Plumbing Services
('Plomería Buenos Aires', 'Plumbing', 'Carlos Rodríguez', 'carlos@plomeriaba.com.ar', '+54-11-4567-8901', 'Av. Corrientes 1234, CABA', 'Servicios de plomería profesional para propiedades residenciales y comerciales', true),
('Sanitarios del Sur', 'Plumbing', 'María González', 'maria@sanitariosdelsur.com.ar', '+54-11-4567-8902', 'Av. Santa Fe 5678, CABA', 'Especialistas en instalaciones sanitarias y reparaciones', true),
('Plomería Express', 'Plumbing', 'Diego Fernández', 'diego@plomeriaexpress.com.ar', '+54-11-4567-8903', 'Av. Rivadavia 9012, CABA', 'Servicio de plomería 24 horas para emergencias', true),

-- Electrical Services
('Electricidad Central', 'Electrical', 'Roberto Martínez', 'roberto@electricidadcentral.com.ar', '+54-11-4567-8904', 'Av. 9 de Julio 3456, CABA', 'Electricistas matriculados para todas las necesidades eléctricas', true),
('Luz y Energía', 'Electrical', 'Ana López', 'ana@luzyenergia.com.ar', '+54-11-4567-8905', 'Av. Córdoba 7890, CABA', 'Instalaciones eléctricas y mantenimiento especializado', true),
('Electro Técnica', 'Electrical', 'Pablo Sánchez', 'pablo@electrotecnica.com.ar', '+54-11-4567-8906', 'Av. Callao 1234, CABA', 'Servicios eléctricos industriales y residenciales', true),

-- HVAC Services
('Clima Total', 'HVAC', 'Gabriel Herrera', 'gabriel@climatotal.com.ar', '+54-11-4567-8907', 'Av. Las Heras 5678, CABA', 'Especialistas en calefacción, ventilación y aire acondicionado', true),
('Aire Puro', 'HVAC', 'Laura Jiménez', 'laura@airepuro.com.ar', '+54-11-4567-8908', 'Av. Scalabrini Ortiz 9012, CABA', 'Instalación y mantenimiento de sistemas HVAC', true),
('Climatización Pro', 'HVAC', 'Fernando Ruiz', 'fernando@climatizacionpro.com.ar', '+54-11-4567-8909', 'Av. Cabildo 3456, CABA', 'Soluciones integrales de climatización', true),

-- Cleaning Services
('Limpieza Total', 'Cleaning', 'Silvia Morales', 'silvia@limpiezatotal.com.ar', '+54-11-4567-8910', 'Av. Belgrano 7890, CABA', 'Servicios de limpieza profesional para edificios y áreas comunes', true),
('Clean Argentina', 'Cleaning', 'Ricardo Vega', 'ricardo@cleanargentina.com.ar', '+54-11-4567-8911', 'Av. Entre Ríos 1234, CABA', 'Limpieza residencial y comercial especializada', true),
('Hogar Limpio', 'Cleaning', 'Patricia Castro', 'patricia@hogarlimpio.com.ar', '+54-11-4567-8912', 'Av. Pueyrredón 5678, CABA', 'Servicios de limpieza y mantenimiento de hogares', true),

-- Security Services
('Seguridad Integral', 'Security', 'Alejandro Torres', 'alejandro@seguridadintegral.com.ar', '+54-11-4567-8913', 'Av. Libertador 9012, CABA', 'Servicios de seguridad 24/7 y monitoreo', true),
('Guardianes del Norte', 'Security', 'Carmen Díaz', 'carmen@guardianesdelnorte.com.ar', '+54-11-4567-8914', 'Av. General Paz 3456, CABA', 'Vigilancia y seguridad para propiedades', true),
('Protección Total', 'Security', 'Miguel Ramírez', 'miguel@protecciontotal.com.ar', '+54-11-4567-8915', 'Av. San Martín 7890, CABA', 'Sistemas de seguridad y personal de vigilancia', true),

-- Landscaping Services
('Jardines del Plata', 'Landscaping', 'Elena Vargas', 'elena@jardinesdelplata.com.ar', '+54-11-4567-8916', 'Av. del Libertador 1234, CABA', 'Diseño de paisajismo y mantenimiento de jardines', true),
('Verde Natural', 'Landscaping', 'Héctor Mendoza', 'hector@verdenatural.com.ar', '+54-11-4567-8917', 'Av. Figueroa Alcorta 5678, CABA', 'Mantenimiento de espacios verdes y jardines', true),
('Paisajismo Urbano', 'Landscaping', 'Valeria Romero', 'valeria@paisajismourbano.com.ar', '+54-11-4567-8918', 'Av. Sarmiento 9012, CABA', 'Diseño y mantenimiento de jardines urbanos', true),

-- Painting Services
('Pinturas del Sur', 'Painting', 'Oscar Silva', 'oscar@pinturasdelsur.com.ar', '+54-11-4567-8919', 'Av. Boedo 3456, CABA', 'Servicios de pintura interior y exterior', true),
('Color Express', 'Painting', 'Natalia Aguilar', 'natalia@colorexpress.com.ar', '+54-11-4567-8920', 'Av. Independencia 7890, CABA', 'Pintura residencial y comercial especializada', true),
('Pintura Pro', 'Painting', 'Gustavo Navarro', 'gustavo@pinturapro.com.ar', '+54-11-4567-8921', 'Av. San Juan 1234, CABA', 'Servicios profesionales de pintura y decoración', true),

-- Carpentry Services
('Carpintería Artesanal', 'Carpentry', 'Jorge Peña', 'jorge@carpinteriaartesanal.com.ar', '+54-11-4567-8922', 'Av. Chacabuco 5678, CABA', 'Carpintería personalizada y trabajos en madera', true),
('Maderas del Norte', 'Carpentry', 'Isabel Flores', 'isabel@maderasdelnorte.com.ar', '+54-11-4567-8923', 'Av. Cramer 9012, CABA', 'Construcción y reparación de muebles y estructuras', true),
('Carpintería Moderna', 'Carpentry', 'Raúl Guerrero', 'raul@carpinteriamoderna.com.ar', '+54-11-4567-8924', 'Av. Monroe 3456, CABA', 'Servicios de carpintería moderna y tradicional', true),

-- General Maintenance
('Mantenimiento Integral', 'General Maintenance', 'Adriana Rojas', 'adriana@mantenimientointegral.com.ar', '+54-11-4567-8925', 'Av. Coronel Díaz 7890, CABA', 'Servicios generales de mantenimiento y reparaciones', true),
('Reparaciones Express', 'General Maintenance', 'Sergio Medina', 'sergio@reparacionesexpress.com.ar', '+54-11-4567-8926', 'Av. Santa Fe 1234, CABA', 'Reparaciones rápidas y mantenimiento preventivo', true),
('Mantenimiento Pro', 'General Maintenance', 'Claudia Espinoza', 'claudia@mantenimientopro.com.ar', '+54-11-4567-8927', 'Av. Córdoba 5678, CABA', 'Servicios profesionales de mantenimiento', true),

-- Other Services
('Tecno Soluciones', 'Other', 'Andrés Contreras', 'andres@tecnosoluciones.com.ar', '+54-11-4567-8928', 'Av. Corrientes 9012, CABA', 'Soporte técnico y servicios de tecnología', true),
('Servicios Digitales', 'Other', 'Mónica Paredes', 'monica@serviciosdigitales.com.ar', '+54-11-4567-8929', 'Av. Rivadavia 3456, CABA', 'Servicios de digitalización y tecnología', true),
('Innovación Tech', 'Other', 'Daniel Campos', 'daniel@innovaciontech.com.ar', '+54-11-4567-8930', 'Av. 9 de Julio 7890, CABA', 'Soluciones tecnológicas innovadoras', true)
ON CONFLICT DO NOTHING;
