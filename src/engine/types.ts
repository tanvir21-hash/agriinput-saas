// These types are framework-agnostic — no React, no Supabase
// This engine can run in a browser, a server, or a CLI tool

export type CropType =
  | 'rice_boro'
  | 'rice_aman'
  | 'wheat'
  | 'potato'
  | 'mustard'

export type SoilType = 'sandy' | 'loamy' | 'clay' | 'silt'

export interface SoilTestValues {
  nitrogen_ppm: number | null
  phosphorus_ppm: number | null
  potassium_ppm: number | null
}

export interface PlanInput {
  crop: CropType
  area_bigha: number
  soil_type: SoilType
  soil_test: SoilTestValues | null
}

export interface FertilizerRecommendation {
  fertilizer_name: string
  fertilizer_name_bn: string
  quantity_kg: number
  application_stage: string
  notes: string | null
}

export interface PlanOutput {
  crop: CropType
  area_bigha: number
  soil_type: SoilType
  recommendations: FertilizerRecommendation[]
  total_cost_estimate_bdt: number
  generated_at: string
  warnings: string[]
}