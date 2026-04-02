import { describe, it, expect } from 'vitest'
import { calculateFertilizerPlan } from './fertilizerEngine'
import { PlanInput } from './types'

describe('calculateFertilizerPlan', () => {

  // ── Basic functionality ──────────────────────────────────────

  it('returns a valid plan for boro rice on loamy soil', () => {
    const input: PlanInput = {
      crop: 'rice_boro',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: null,
    }
    const output = calculateFertilizerPlan(input)

    expect(output.crop).toBe('rice_boro')
    expect(output.area_bigha).toBe(1)
    expect(output.recommendations).toHaveLength(3)
    expect(output.total_cost_estimate_bdt).toBeGreaterThan(0)
    expect(output.warnings).toHaveLength(0)
  })

  it('scales quantities correctly for larger area', () => {
    const input1: PlanInput = {
      crop: 'wheat',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: null,
    }
    const input5: PlanInput = {
      crop: 'wheat',
      area_bigha: 5,
      soil_type: 'loamy',
      soil_test: null,
    }

    const out1 = calculateFertilizerPlan(input1)
    const out5 = calculateFertilizerPlan(input5)

    const urea1 = out1.recommendations[0].quantity_kg
    const urea5 = out5.recommendations[0].quantity_kg

    expect(urea5).toBeCloseTo(urea1 * 5, 1)
  })

  // ── Soil type adjustments ────────────────────────────────────

  it('recommends more fertilizer for sandy soil than clay', () => {
    const base: Omit<PlanInput, 'soil_type'> = {
      crop: 'rice_aman',
      area_bigha: 1,
      soil_test: null,
    }

    const sandy = calculateFertilizerPlan({ ...base, soil_type: 'sandy' })
    const clay  = calculateFertilizerPlan({ ...base, soil_type: 'clay' })

    const sandyUrea = sandy.recommendations[0].quantity_kg
    const clayUrea  = clay.recommendations[0].quantity_kg

    expect(sandyUrea).toBeGreaterThan(clayUrea)
  })

  // ── Soil test adjustments ────────────────────────────────────

  it('reduces urea when soil nitrogen is high', () => {
    const withoutTest: PlanInput = {
      crop: 'rice_boro',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: null,
    }
    const withHighN: PlanInput = {
      crop: 'rice_boro',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: {
        nitrogen_ppm: 250,   // high — above 200 threshold
        phosphorus_ppm: null,
        potassium_ppm: null,
      },
    }

    const out1 = calculateFertilizerPlan(withoutTest)
    const out2 = calculateFertilizerPlan(withHighN)

    expect(out2.recommendations[0].quantity_kg)
      .toBeLessThan(out1.recommendations[0].quantity_kg)
  })

  // ── Edge cases ───────────────────────────────────────────────

  it('throws an error when area is zero', () => {
    const input: PlanInput = {
      crop: 'potato',
      area_bigha: 0,
      soil_type: 'loamy',
      soil_test: null,
    }
    expect(() => calculateFertilizerPlan(input)).toThrow(
      'Area must be greater than zero'
    )
  })

  it('throws an error when area is negative', () => {
    const input: PlanInput = {
      crop: 'potato',
      area_bigha: -5,
      soil_type: 'loamy',
      soil_test: null,
    }
    expect(() => calculateFertilizerPlan(input)).toThrow(
      'Area must be greater than zero'
    )
  })

  it('adds a warning for suspiciously large area', () => {
    const input: PlanInput = {
      crop: 'mustard',
      area_bigha: 600,
      soil_type: 'loamy',
      soil_test: null,
    }
    const output = calculateFertilizerPlan(input)
    expect(output.warnings).toContain(
      'Area exceeds 500 bigha — please verify this is correct'
    )
  })

  it('adds a warning for unusually high nitrogen reading', () => {
    const input: PlanInput = {
      crop: 'rice_boro',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: {
        nitrogen_ppm: 600,
        phosphorus_ppm: null,
        potassium_ppm: null,
      },
    }
    const output = calculateFertilizerPlan(input)
    expect(output.warnings).toContain(
      'Nitrogen value seems unusually high — please verify'
    )
  })

  it('produces zero warnings for normal valid input', () => {
    const input: PlanInput = {
      crop: 'wheat',
      area_bigha: 3,
      soil_type: 'silt',
      soil_test: {
        nitrogen_ppm: 120,
        phosphorus_ppm: 15,
        potassium_ppm: 100,
      },
    }
    const output = calculateFertilizerPlan(input)
    expect(output.warnings).toHaveLength(0)
  })

  it('includes both English and Bangla fertilizer names', () => {
    const input: PlanInput = {
      crop: 'rice_boro',
      area_bigha: 1,
      soil_type: 'loamy',
      soil_test: null,
    }
    const output = calculateFertilizerPlan(input)

    output.recommendations.forEach(rec => {
      expect(rec.fertilizer_name.length).toBeGreaterThan(0)
      expect(rec.fertilizer_name_bn.length).toBeGreaterThan(0)
    })
  })
})