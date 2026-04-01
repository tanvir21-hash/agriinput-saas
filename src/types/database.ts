// These types mirror our Supabase database schema exactly.
// Every table, every column. This is our single source of truth for types.

export type UserRole = 'org_admin' | 'field_officer' | 'viewer'
export type PlanTier = 'free' | 'pro' | 'enterprise'
export type SoilType = 'sandy' | 'loamy' | 'clay' | 'silt'

export interface Organization {
  id: string
  name: string
  slug: string
  plan_tier: PlanTier
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Farm {
  id: string
  org_id: string
  created_by: string
  farmer_name: string
  village: string | null
  upazila: string | null
  district: string | null
  area_bigha: number
  created_at: string
}

export interface FertilizerPlan {
  id: string
  org_id: string
  farm_id: string
  created_by: string
  crop_type: string
  soil_type: SoilType | null
  soil_n: number | null
  soil_p: number | null
  soil_k: number | null
  plan_output: PlanOutput        // typed, not raw JSON
  synced_at: string | null       // null = created offline
  pdf_url: string | null
  created_at: string
}

// This is what the calculation engine produces
// We will build this engine in Week 3
export interface PlanOutput {
  crop: string
  area_bigha: number
  recommendations: FertilizerRecommendation[]
  total_cost_estimate_bdt: number
  generated_at: string
}

export interface FertilizerRecommendation {
  fertilizer_name: string
  fertilizer_name_bn: string     // Bangla name
  quantity_kg: number
  application_stage: string
  notes: string | null
}