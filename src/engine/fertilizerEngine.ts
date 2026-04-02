import { PlanInput, PlanOutput, FertilizerRecommendation } from './types'
import { CROP_RULES } from './cropRules'

// Soil adjustment multipliers
// Sandy soil drains fast — needs more fertilizer
// Clay soil retains — needs less
const SOIL_ADJUSTMENTS = {
  sandy: 1.15,
  loamy: 1.0,
  silt:  0.95,
  clay:  0.90,
}

// If soil test shows high existing nutrients, reduce recommendations
// Thresholds based on BARI guidelines
function getSoilTestMultiplier(
  nutrient: 'n' | 'p' | 'k',
  ppm: number | null
): number {
  if (ppm === null) return 1.0 // no test data — use base rate

  const thresholds = {
    n: { low: 100, high: 200 },
    p: { low: 10,  high: 25  },
    k: { low: 80,  high: 150 },
  }

  const t = thresholds[nutrient]
  if (ppm >= t.high) return 0.6  // high nutrient — reduce significantly
  if (ppm >= t.low)  return 0.8  // medium — reduce moderately
  return 1.0                      // low — use full base rate
}

export function calculateFertilizerPlan(input: PlanInput): PlanOutput {
  const warnings: string[] = []

  // Edge case: zero or negative area
  if (input.area_bigha <= 0) {
    throw new Error('Area must be greater than zero')
  }

  // Edge case: extremely large area — likely a data entry error
  if (input.area_bigha > 500) {
    warnings.push('Area exceeds 500 bigha — please verify this is correct')
  }

  const rule = CROP_RULES[input.crop]
  const soilMultiplier = SOIL_ADJUSTMENTS[input.soil_type]

  const soilTest = input.soil_test

  // Calculate adjusted quantities per bigha
  const urea_per_bigha = rule.base_urea_kg
    * soilMultiplier
    * getSoilTestMultiplier('n', soilTest?.nitrogen_ppm ?? null)

  const tsp_per_bigha = rule.base_tsp_kg
    * soilMultiplier
    * getSoilTestMultiplier('p', soilTest?.phosphorus_ppm ?? null)

  const mop_per_bigha = rule.base_mop_kg
    * soilMultiplier
    * getSoilTestMultiplier('k', soilTest?.potassium_ppm ?? null)

  // Scale to actual area and round to 1 decimal
  const urea_total = Math.round(urea_per_bigha * input.area_bigha * 10) / 10
  const tsp_total  = Math.round(tsp_per_bigha  * input.area_bigha * 10) / 10
  const mop_total  = Math.round(mop_per_bigha  * input.area_bigha * 10) / 10

  // Warn if soil test values look suspicious
  if (soilTest) {
    if (soilTest.nitrogen_ppm !== null && soilTest.nitrogen_ppm > 500) {
      warnings.push('Nitrogen value seems unusually high — please verify')
    }
    if (soilTest.phosphorus_ppm !== null && soilTest.phosphorus_ppm > 100) {
      warnings.push('Phosphorus value seems unusually high — please verify')
    }
  }

  const recommendations: FertilizerRecommendation[] = [
    {
      fertilizer_name: 'Urea',
      fertilizer_name_bn: 'ইউরিয়া',
      quantity_kg: urea_total,
      application_stage: 'Split: 1/3 basal, 1/3 tillering, 1/3 panicle',
      notes: 'Apply in the evening to reduce volatilization loss',
    },
    {
      fertilizer_name: 'TSP',
      fertilizer_name_bn: 'টিএসপি',
      quantity_kg: tsp_total,
      application_stage: 'Basal — apply before final land preparation',
      notes: null,
    },
    {
      fertilizer_name: 'MOP',
      fertilizer_name_bn: 'এমওপি',
      quantity_kg: mop_total,
      application_stage: 'Split: 1/2 basal, 1/2 at tillering',
      notes: null,
    },
  ]

  const total_cost_estimate_bdt = Math.round(
    urea_total * rule.price_urea_per_kg +
    tsp_total  * rule.price_tsp_per_kg  +
    mop_total  * rule.price_mop_per_kg
  )

  return {
    crop: input.crop,
    area_bigha: input.area_bigha,
    soil_type: input.soil_type,
    recommendations,
    total_cost_estimate_bdt,
    generated_at: new Date().toISOString(),
    warnings,
  }
}