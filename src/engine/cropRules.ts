import { CropType } from './types'

// Base fertilizer requirements per bigha for each crop
// Source: Bangladesh Agricultural Research Institute (BARI) guidelines
// Units: kg per bigha

export interface CropRule {
  name_en: string
  name_bn: string
  base_urea_kg: number        // Nitrogen source
  base_tsp_kg: number         // Phosphorus source
  base_mop_kg: number         // Potassium source
  price_urea_per_kg: number   // BDT
  price_tsp_per_kg: number    // BDT
  price_mop_per_kg: number    // BDT
}

export const CROP_RULES: Record<CropType, CropRule> = {
  rice_boro: {
    name_en: 'Boro Rice',
    name_bn: 'বোরো ধান',
    base_urea_kg: 22,
    base_tsp_kg: 11,
    base_mop_kg: 11,
    price_urea_per_kg: 22,
    price_tsp_per_kg: 25,
    price_mop_per_kg: 20,
  },
  rice_aman: {
    name_en: 'Aman Rice',
    name_bn: 'আমন ধান',
    base_urea_kg: 18,
    base_tsp_kg: 9,
    base_mop_kg: 9,
    price_urea_per_kg: 22,
    price_tsp_per_kg: 25,
    price_mop_per_kg: 20,
  },
  wheat: {
    name_en: 'Wheat',
    name_bn: 'গম',
    base_urea_kg: 20,
    base_tsp_kg: 12,
    base_mop_kg: 10,
    price_urea_per_kg: 22,
    price_tsp_per_kg: 25,
    price_mop_per_kg: 20,
  },
  potato: {
    name_en: 'Potato',
    name_bn: 'আলু',
    base_urea_kg: 25,
    base_tsp_kg: 15,
    base_mop_kg: 20,
    price_urea_per_kg: 22,
    price_tsp_per_kg: 25,
    price_mop_per_kg: 20,
  },
  mustard: {
    name_en: 'Mustard',
    name_bn: 'সরিষা',
    base_urea_kg: 16,
    base_tsp_kg: 10,
    base_mop_kg: 8,
    price_urea_per_kg: 22,
    price_tsp_per_kg: 25,
    price_mop_per_kg: 20,
  },
}