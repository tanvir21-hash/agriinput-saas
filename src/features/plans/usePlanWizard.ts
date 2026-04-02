import { useState } from 'react'
import { CropType, SoilType, PlanInput, PlanOutput } from '@/engine/types'
import { calculateFertilizerPlan } from '@/engine/fertilizerEngine'

export type WizardStep = 1 | 2 | 3 | 4 | 'result'

interface WizardState {
  step: WizardStep
  crop: CropType | null
  area_bigha: number | null
  soil_type: SoilType | null
  soil_test: {
    nitrogen_ppm: number | null
    phosphorus_ppm: number | null
    potassium_ppm: number | null
  } | null
  result: PlanOutput | null
  error: string | null
}

export function usePlanWizard() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    crop: null,
    area_bigha: null,
    soil_type: null,
    soil_test: null,
    result: null,
    error: null,
  })

  function setCrop(crop: CropType) {
    setState(prev => ({ ...prev, crop, step: 2 }))
  }

  function setArea(area_bigha: number) {
    setState(prev => ({ ...prev, area_bigha, step: 3 }))
  }

  function setSoilType(soil_type: SoilType) {
    setState(prev => ({ ...prev, soil_type, step: 4 }))
  }

  function calculate(soil_test: WizardState['soil_test']) {
    if (!state.crop || !state.area_bigha || !state.soil_type) {
      setState(prev => ({ ...prev, error: 'Missing required fields' }))
      return
    }

    try {
      const input: PlanInput = {
        crop: state.crop,
        area_bigha: state.area_bigha,
        soil_type: state.soil_type,
        soil_test,
      }
      const result = calculateFertilizerPlan(input)
      setState(prev => ({ ...prev, result, step: 'result', error: null }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Calculation failed',
      }))
    }
  }

  function reset() {
    setState({
      step: 1,
      crop: null,
      area_bigha: null,
      soil_type: null,
      soil_test: null,
      result: null,
      error: null,
    })
  }

  function goBack() {
    setState(prev => ({
      ...prev,
      step: prev.step === 'result' ? 4 : Math.max(1, Number(prev.step) - 1) as WizardStep,
    }))
  }

  return { state, setCrop, setArea, setSoilType, calculate, reset, goBack }
}