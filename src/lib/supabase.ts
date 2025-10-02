import { createClient } from '@supabase/supabase-js'

// For local testing - hardcoded values
// TODO: Remove before pushing to git and use environment variables
const supabaseUrl = 'https://qqysxufjdnmqqdezndgq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeXN4dWZqZG5tcXFkZXpuZGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MjE5MzUsImV4cCI6MjA3MTk5NzkzNX0.Ex8oSuvmnI5BNX6i2rI599VdqKeZ1By6VDjKokyigVk'


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
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'submitted'
  due_date: string
  paid_date?: string
  reference_number?: string
  description?: string
  receipt_url?: string
  exchange_rate?: number // If payment is in different currency
  // New fields for payment submission workflow
  proof_url?: string // URL to uploaded proof of payment
  submitted_by?: string // User ID who submitted the payment
  submitted_at?: string // When the payment was submitted by tenant
  reviewed_by?: string // Admin ID who reviewed the payment
  reviewed_at?: string // When the payment was reviewed by admin
  review_notes?: string // Admin notes about the payment review
  submission_status?: 'pending' | 'approved' | 'rejected' // Status of the payment submission
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  building_id: string | null
  author_id: string | null
  title: string
  content: string
  post_type: string
  category: string | null
  is_pinned: boolean
  likes_count: number
  comments_count: number
  created_at: string
  author_name?: string
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
