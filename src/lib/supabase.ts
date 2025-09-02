import { createClient } from '@supabase/supabase-js'



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript interfaces for the property management system
export interface Building {
  id: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  country: string
  building_type: 'apartment' | 'house' | 'commercial' | 'mixed'
  total_units: number
  amenities: string[]
  year_built: number
  cuit: string // Argentine tax identification
  iibb_number: string // Argentine provincial tax number
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  building_id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  dni: string // Argentine national identity document
  cuit: string // Argentine tax identification
  lease_start_date: string
  lease_end_date: string
  monthly_rent: number
  currency: 'ARS' | 'USD'
  deposit_amount: number
  is_active: boolean
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
  created_at: string
  updated_at: string
}

export interface MaintenanceRequest {
  id: string
  building_id: string
  tenant_id: string
  unit_number: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'appliance' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  title: string
  description: string
  photos: string[]
  requested_date: string
  scheduled_date?: string
  completed_date?: string
  assigned_contractor?: string
  contractor_phone?: string
  cost?: number
  currency: 'ARS' | 'USD'
  tenant_rating?: number
  tenant_feedback?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  building_id: string
  tenant_id: string
  unit_number: string
  payment_type: 'rent' | 'deposit' | 'maintenance' | 'utilities' | 'other'
  amount: number
  currency: 'ARS' | 'USD'
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'digital_wallet'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  due_date: string
  paid_date?: string
  reference_number?: string
  description?: string
  receipt_url?: string
  exchange_rate?: number // If payment is in different currency
  created_at: string
  updated_at: string
}

// Database table names
export const TABLES = {
  BUILDINGS: 'buildings',
  TENANTS: 'tenants',
  MAINTENANCE_REQUESTS: 'maintenance_requests',
  PAYMENTS: 'payments'
} as const

// Helper types
export type BuildingType = Building['building_type']
export type MaintenanceCategory = MaintenanceRequest['category']
export type MaintenancePriority = MaintenanceRequest['priority']
export type MaintenanceStatus = MaintenanceRequest['status']
export type PaymentType = Payment['payment_type']
export type PaymentMethod = Payment['payment_method']
export type PaymentStatus = Payment['status']
export type Currency = 'ARS' | 'USD'
