-- SAMPLE DATA INSERT SCRIPT FOR BA PROPERTY MANAGER
-- This script uses existing user IDs from the auth.users table

-- 1. BUILDINGS TABLE
INSERT INTO buildings (id, name, address, city, province, total_apartments) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Edificio Central', 'Av. Corrientes 1234, Buenos Aires', 'Buenos Aires', 'Buenos Aires', 24),
('550e8400-e29b-41d4-a716-446655440002', 'Residencial Palermo', 'Av. Santa Fe 5678, Buenos Aires', 'Buenos Aires', 'Buenos Aires', 18),
('550e8400-e29b-41d4-a716-446655440003', 'Torre Belgrano', 'Av. Belgrano 9012, Buenos Aires', 'Buenos Aires', 'Buenos Aires', 32);

-- 2. USER_PROFILES TABLE (using existing auth.users IDs)
INSERT INTO user_profiles (id, user_type, first_name, last_name) VALUES
-- Admin users (System administrators)
('8953d244-a921-45aa-8c0e-a6214d50edb5', 'admin', 'Test', 'Admin'),
('a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'admin', 'Ana', 'Martínez'),
('ab85f2c0-0726-4121-b692-a72c82b2a504', 'admin', 'Carlos', 'Rodríguez'),

-- Property managers (Building managers)
('5065ff1b-96ef-42be-b1c6-4902c1644be3', 'property-manager', 'Test', 'Owner'),
('064cb549-74f8-4c21-ae5c-e621d120ed47', 'property-manager', 'Roberto', 'Silva'),
('0daf4e1d-3985-4460-a7c2-9cc0ec63f038', 'property-manager', 'Laura', 'Fernández'),

-- Building owners (Property owners)
('112d0476-76f7-4c40-bba7-b8f11661f639', 'building-owner', 'Juan', 'Pérez'),
('d227678c-327f-4a2a-bc03-3f0c182edbdc', 'building-owner', 'María', 'González'),

-- Tenants (Renters)
('2daf7cf3-a1e4-4c3f-9d23-4218ad02bd0c', 'tenant', 'Test', 'Tenant'),
('de420fa7-3954-45be-a5e3-558aa530598c', 'tenant', 'Test', 'Tenant 2');

-- 3. APARTMENTS TABLE (24 apartments for Edificio Central)
INSERT INTO apartments (id, building_id, unit_number, floor, bedrooms, bathrooms, square_meters, monthly_rent, is_occupied) VALUES
-- Floor 1
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '1A', 1, 1, 1, 45.5, 65000, true),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', '1B', 1, 2, 1, 65.0, 85000, true),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', '1C', 1, 1, 1, 48.0, 68000, true),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', '1D', 1, 2, 2, 75.0, 95000, false),

-- Floor 2
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', '2A', 2, 2, 1, 68.0, 88000, true),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', '2B', 2, 3, 2, 95.0, 115000, false),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', '2C', 2, 1, 1, 50.0, 72000, true),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', '2D', 2, 2, 1, 70.0, 90000, true),

-- Floor 3
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', '3A', 3, 2, 2, 85.0, 105000, true),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '3B', 3, 1, 1, 52.0, 75000, true),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', '3C', 3, 3, 2, 100.0, 120000, true),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440001', '3D', 3, 2, 1, 72.0, 92000, false),

-- Floor 4
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440001', '4A', 4, 2, 2, 88.0, 108000, true),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440001', '4B', 4, 1, 1, 55.0, 78000, true),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440001', '4C', 4, 3, 2, 105.0, 125000, true),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440001', '4D', 4, 2, 1, 75.0, 95000, false),

-- Floor 5
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440001', '5A', 5, 2, 2, 90.0, 110000, true),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440001', '5B', 5, 1, 1, 58.0, 82000, true),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440001', '5C', 5, 3, 2, 110.0, 130000, true),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440001', '5D', 5, 2, 1, 78.0, 98000, false),

-- Floor 6
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', '6A', 6, 2, 2, 92.0, 112000, true),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', '6B', 6, 1, 1, 60.0, 85000, true),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440001', '6C', 6, 3, 2, 115.0, 135000, true),
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440001', '6D', 6, 2, 1, 80.0, 100000, false);

-- 4. TENANTS TABLE (for occupied apartments)
INSERT INTO tenants (id, user_id, apartment_id, dni, phone, emergency_contact_name, emergency_contact_phone, lease_start_date, lease_end_date, deposit_amount, is_active) VALUES
-- Tenants with different profiles
('550e8400-e29b-41d4-a716-446655440201', '2daf7cf3-a1e4-4c3f-9d23-4218ad02bd0c', '550e8400-e29b-41d4-a716-446655440201', '12.345.678', '+54 11 1234-5678', 'Carlos González', '+54 11 1234-5679', '2024-01-01', '2025-12-31', 88000, true),
('550e8400-e29b-41d4-a716-446655440202', 'de420fa7-3954-45be-a5e3-558aa530598c', '550e8400-e29b-41d4-a716-446655440302', '23.456.789', '+54 11 4444-4444', 'Roberto Silva', '+54 11 4444-4445', '2024-02-01', '2025-01-31', 75000, true),
('550e8400-e29b-41d4-a716-446655440203', 'd227678c-327f-4a2a-bc03-3f0c182edbdc', '550e8400-e29b-41d4-a716-446655440501', '34.567.890', '+54 11 2222-2222', 'María Pérez', '+54 11 2222-2223', '2024-03-01', '2025-02-28', 110000, true),
('550e8400-e29b-41d4-a716-446655440204', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440101', '45.678.901', '+54 11 5555-5555', 'Ana López', '+54 11 5555-5556', '2024-01-15', '2025-01-14', 65000, true);

-- 5. MAINTENANCE_REQUESTS TABLE
INSERT INTO maintenance_requests (id, title, description, apartment, priority, status, estimated_cost) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Fuga de agua en baño', 'Hay una fuga de agua en el grifo del baño principal', '2A', 'high', 'in_progress', 15000),
('550e8400-e29b-41d4-a716-446655440302', 'Luz del pasillo no funciona', 'La luz del pasillo del 3er piso no enciende', '3C', 'medium', 'pending', 8000),
('550e8400-e29b-41d4-a716-446655440303', 'Aire acondicionado roto', 'El aire acondicionado no enfría correctamente', '5A', 'urgent', 'completed', 25000),
('550e8400-e29b-41d4-a716-446655440304', 'Cerradura defectuosa', 'La cerradura de la puerta principal no funciona bien', '1B', 'low', 'pending', 12000),
('550e8400-e29b-41d4-a716-446655440305', 'Pintura necesaria', 'Se necesita repintar la cocina', '4A', 'medium', 'completed', 18000);

-- 6. PAYMENTS TABLE
INSERT INTO payments (id, tenant_id, apartment_id, amount, payment_type, payment_method, status, due_date, paid_date, description) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440201', 88000, 'rent', 'bank_transfer', 'completed', '2024-01-01', '2024-01-01', 'Alquiler enero 2024'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', 75000, 'rent', 'bank_transfer', 'completed', '2024-02-01', '2024-02-01', 'Alquiler febrero 2024'),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440501', 110000, 'rent', 'bank_transfer', 'completed', '2024-03-01', '2024-03-01', 'Alquiler marzo 2024'),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', 65000, 'rent', 'bank_transfer', 'completed', '2024-01-15', '2024-01-15', 'Alquiler enero 2024'),
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440201', 88000, 'rent', 'bank_transfer', 'pending', '2024-02-01', NULL, 'Alquiler febrero 2024');

-- 7. INVITATIONS TABLE (only for tenants)
INSERT INTO invitations (id, email, first_name, last_name, phone, apartment_id, role, status, message) VALUES
('550e8400-e29b-41d4-a716-446655440501', 'nuevo.tenant@email.com', 'Nuevo', 'Tenant', '+54 11 9999-9999', '550e8400-e29b-41d4-a716-446655440104', 'tenant', 'pending', 'Invitación para alquilar departamento 1D'),
('550e8400-e29b-41d4-a716-446655440502', 'otro.tenant@email.com', 'Otro', 'Tenant', '+54 11 8888-8888', '550e8400-e29b-41d4-a716-446655440202', 'tenant', 'accepted', 'Invitación para alquilar departamento 2B'),
('550e8400-e29b-41d4-a716-446655440503', 'rechazado@email.com', 'Usuario', 'Rechazado', '+54 11 7777-7777', '550e8400-e29b-41d4-a716-446655440304', 'tenant', 'declined', 'Invitación rechazada para departamento 3D'),
('550e8400-e29b-41d4-a716-446655440504', 'prospecto@email.com', 'Prospecto', 'Tenant', '+54 11 6666-6666', '550e8400-e29b-41d4-a716-446655440404', 'tenant', 'pending', 'Invitación para alquilar departamento 4D');

-- 8. COMMUNITY_POSTS TABLE
INSERT INTO community_posts (id, building_id, author_id, title, content, post_type, category, is_pinned, likes_count, comments_count) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', '8953d244-a921-45aa-8c0e-a6214d50edb5', 'Reunión de consorcio - Febrero 2024', 'Se convoca a todos los propietarios a la reunión mensual del consorcio. Orden del día: presupuesto, obras pendientes y nuevas propuestas.', 'announcement', 'meeting', true, 12, 5),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'Corte de agua programado - 3A y 3B', 'El día miércoles 31/01 entre las 9:00 y 12:00 hs se realizarán trabajos de plomería en los departamentos 3A y 3B. Disculpen las molestias.', 'maintenance', 'maintenance', false, 8, 3),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440001', 'd227678c-327f-4a2a-bc03-3f0c182edbdc', 'Asado de fin de verano', 'Organizamos un asado en la terraza para el sábado 10/02 a las 19:00. ¡Confirmen asistencia! Cada familia trae algo para compartir.', 'social', 'social', false, 24, 18);

-- 9. BUILDING_AMENITIES TABLE
INSERT INTO building_amenities (id, building_id, name, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440001', 'Piscina', 'Piscina climatizada con horario de 8:00 a 22:00', true),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440001', 'Gimnasio', 'Gimnasio equipado con máquinas de cardio y pesas', true),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440001', 'Lavadero', 'Lavadero con lavadoras y secadoras', true),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440001', 'Terraza', 'Terraza común con vista a la ciudad', true),
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440001', 'Estacionamiento', 'Estacionamiento subterráneo con 30 plazas', true);

-- 10. EXPENSES TABLE
INSERT INTO expenses (id, building_id, category, description, amount, expense_date, supplier_name, status, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440001', 'maintenance', 'Reparación del ascensor', 45000, '2024-01-15', 'Ascensores Buenos Aires S.A.', 'paid', '8953d244-a921-45aa-8c0e-a6214d50edb5'),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440001', 'utilities', 'Luz común del edificio', 25000, '2024-01-20', 'Edenor', 'paid', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe'),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440001', 'cleaning', 'Limpieza mensual de áreas comunes', 18000, '2024-01-25', 'Limpieza Express', 'pending', '8953d244-a921-45aa-8c0e-a6214d50edb5');

-- 11. NOTIFICATIONS TABLE
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_id, related_type) VALUES
('550e8400-e29b-41d4-a716-446655440901', 'd227678c-327f-4a2a-bc03-3f0c182edbdc', 'Pago de alquiler vencido', 'Su pago de alquiler para febrero está vencido', 'payment_due', false, '550e8400-e29b-41d4-a716-446655440405', 'payment'),
('550e8400-e29b-41d4-a716-446655440902', 'de420fa7-3954-45be-a5e3-558aa530598c', 'Actualización de mantenimiento', 'Su solicitud de mantenimiento ha sido actualizada', 'maintenance_update', true, '550e8400-e29b-41d4-a716-446655440301', 'maintenance_request'),
('550e8400-e29b-41d4-a716-446655440903', '2daf7cf3-a1e4-4c3f-9d23-4218ad02bd0c', 'Nuevo post en la comunidad', 'Hay un nuevo anuncio en la comunidad', 'community_post', false, '550e8400-e29b-41d4-a716-446655440601', 'community_post'),
('550e8400-e29b-41d4-a716-446655440904', '5065ff1b-96ef-42be-b1c6-4902c1644be3', 'Nueva solicitud de mantenimiento', 'Se ha recibido una nueva solicitud de mantenimiento urgente', 'maintenance_request', false, '550e8400-e29b-41d4-a716-446655440303', 'maintenance_request'),
('550e8400-e29b-41d4-a716-446655440905', '112d0476-76f7-4c40-bba7-b8f11661f639', 'Invitación aceptada', 'Su invitación para unirse como propietario ha sido aceptada', 'invitation_accepted', true, '550e8400-e29b-41d4-a716-446655440502', 'invitation');

-- 12. LEASE_AGREEMENTS TABLE
INSERT INTO lease_agreements (id, tenant_id, apartment_id, agreement_type, start_date, end_date, monthly_rent, deposit_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440A01', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440201', 'initial', '2024-01-01', '2025-12-31', 88000, 88000, 'active'),
('550e8400-e29b-41d4-a716-446655440A02', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', 'initial', '2024-02-01', '2025-01-31', 75000, 75000, 'active'),
('550e8400-e29b-41d4-a716-446655440A03', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440501', 'initial', '2024-03-01', '2025-02-28', 110000, 110000, 'active'),
('550e8400-e29b-41d4-a716-446655440A04', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', 'initial', '2024-01-15', '2025-01-14', 65000, 65000, 'active');

-- 13. DOCUMENTS TABLE
INSERT INTO documents (id, title, document_type, file_url, file_size, mime_type, related_id, related_type, uploaded_by, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440B01', 'Contrato de alquiler - María González', 'lease', 'https://example.com/contracts/lease_maria_gonzalez.pdf', 1024000, 'application/pdf', '550e8400-e29b-41d4-a716-446655440A01', 'lease_agreement', '8953d244-a921-45aa-8c0e-a6214d50edb5', false),
('550e8400-e29b-41d4-a716-446655440B02', 'Recibo de pago - Enero 2024', 'receipt', 'https://example.com/receipts/receipt_jan_2024.pdf', 512000, 'application/pdf', '550e8400-e29b-41d4-a716-446655440401', 'payment', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', false),
('550e8400-e29b-41d4-a716-446655440B03', 'Reglamento del edificio', 'report', 'https://example.com/documents/building_rules.pdf', 2048000, 'application/pdf', '550e8400-e29b-41d4-a716-446655440001', 'building', '8953d244-a921-45aa-8c0e-a6214d50edb5', true),
('550e8400-e29b-41d4-a716-446655440B04', 'Manual de mantenimiento', 'manual', 'https://example.com/documents/maintenance_manual.pdf', 1536000, 'application/pdf', '550e8400-e29b-41d4-a716-446655440001', 'building', '5065ff1b-96ef-42be-b1c6-4902c1644be3', true);

-- 14. PAYMENT_RECEIPTS TABLE
INSERT INTO payment_receipts (id, payment_id, receipt_number) VALUES
('550e8400-e29b-41d4-a716-446655440C01', '550e8400-e29b-41d4-a716-446655440401', 'REC-2024-001'),
('550e8400-e29b-41d4-a716-446655440C02', '550e8400-e29b-41d4-a716-446655440402', 'REC-2024-002'),
('550e8400-e29b-41d4-a716-446655440C03', '550e8400-e29b-41d4-a716-446655440403', 'REC-2024-003'),
('550e8400-e29b-41d4-a716-446655440C04', '550e8400-e29b-41d4-a716-446655440404', 'REC-2024-004');

-- 15. MAINTENANCE_ASSIGNMENTS TABLE
INSERT INTO maintenance_assignments (id, maintenance_request_id, assigned_to, assigned_by, notes) VALUES
('550e8400-e29b-41d4-a716-446655440D01', '550e8400-e29b-41d4-a716-446655440301', 'ab85f2c0-0726-4121-b692-a72c82b2a504', '8953d244-a921-45aa-8c0e-a6214d50edb5', 'Asignado a Carlos Rodríguez para revisión urgente'),
('550e8400-e29b-41d4-a716-446655440D02', '550e8400-e29b-41d4-a716-446655440302', '064cb549-74f8-4c21-ae5c-e621d120ed47', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'Asignado a Roberto Silva para reparación eléctrica'),
('550e8400-e29b-41d4-a716-446655440D03', '550e8400-e29b-41d4-a716-446655440303', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '5065ff1b-96ef-42be-b1c6-4902c1644be3', 'Asignado a Laura Fernández para reparación de aire acondicionado');

-- 16. COMMUNITY_POST_COMMENTS TABLE
INSERT INTO community_post_comments (id, post_id, author_id, content) VALUES
('550e8400-e29b-41d4-a716-446655440E01', '550e8400-e29b-41d4-a716-446655440601', 'd227678c-327f-4a2a-bc03-3f0c182edbdc', 'Perfecto, estaré presente en la reunión'),
('550e8400-e29b-41d4-a716-446655440E02', '550e8400-e29b-41d4-a716-446655440601', 'de420fa7-3954-45be-a5e3-558aa530598c', '¿A qué hora exactamente será la reunión?'),
('550e8400-e29b-41d4-a716-446655440E03', '550e8400-e29b-41d4-a716-446655440602', '2daf7cf3-a1e4-4c3f-9d23-4218ad02bd0c', 'Gracias por el aviso, me prepararé para el corte de agua'),
('550e8400-e29b-41d4-a716-446655440E04', '550e8400-e29b-41d4-a716-446655440603', '112d0476-76f7-4c40-bba7-b8f11661f639', '¡Excelente idea! Llevaré la carne'),
('550e8400-e29b-41d4-a716-446655440E05', '550e8400-e29b-41d4-a716-446655440603', '5065ff1b-96ef-42be-b1c6-4902c1644be3', 'Yo me encargo de las bebidas');

-- 17. COMMUNITY_POST_LIKES TABLE
INSERT INTO community_post_likes (id, post_id, user_id) VALUES
('550e8400-e29b-41d4-a716-446655440F01', '550e8400-e29b-41d4-a716-446655440601', 'd227678c-327f-4a2a-bc03-3f0c182edbdc'),
('550e8400-e29b-41d4-a716-446655440F02', '550e8400-e29b-41d4-a716-446655440601', 'de420fa7-3954-45be-a5e3-558aa530598c'),
('550e8400-e29b-41d4-a716-446655440F03', '550e8400-e29b-41d4-a716-446655440601', '2daf7cf3-a1e4-4c3f-9d23-4218ad02bd0c'),
('550e8400-e29b-41d4-a716-446655440F04', '550e8400-e29b-41d4-a716-446655440602', 'd227678c-327f-4a2a-bc03-3f0c182edbdc'),
('550e8400-e29b-41d4-a716-446655440F05', '550e8400-e29b-41d4-a716-446655440603', 'de420fa7-3954-45be-a5e3-558aa530598c'),
('550e8400-e29b-41d4-a716-446655440F06', '550e8400-e29b-41d4-a716-446655440603', '112d0476-76f7-4c40-bba7-b8f11661f639'),
('550e8400-e29b-41d4-a716-446655440F07', '550e8400-e29b-41d4-a716-446655440603', '5065ff1b-96ef-42be-b1c6-4902c1644be3');

-- Update apartment occupancy status based on tenants
UPDATE apartments SET is_occupied = true WHERE id IN (
  SELECT apartment_id FROM tenants WHERE is_active = true
);

-- Update total_apartments count in buildings
UPDATE buildings SET total_apartments = (SELECT COUNT(*) FROM apartments WHERE building_id = buildings.id);
