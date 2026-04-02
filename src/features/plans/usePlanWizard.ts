import { useState } from 'react'
import { CropType, SoilType, PlanInput, PlanOutput } from '@/engine/types'
import { calculateFertilizerPlan } from '@/engine/fertilizerEngine'
import { db } from '@/offline/db'
import { v4 as uuidv4 } from 'uuid'

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
  savedPlanId: string | null
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
    savedPlanId: null,
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

  async function calculate(soil_test: WizardState['soil_test']) {
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

      // Save to IndexedDB immediately — works offline
      const planId = uuidv4()
      await db.plans.add({
        id: planId,
        org_id: 'local',
        farm_id: null,
        farmer_name: 'Unknown',
        area_bigha: state.area_bigha,
        crop: state.crop,
        soil_type: state.soil_type,
        plan_output: result,
        created_at: new Date().toISOString(),
        synced: false,
        sync_error: null,
      })

      // Add to sync queue
      await db.syncQueue.add({
        plan_id: planId,
        attempted_at: null,
        retry_count: 0,
      })

      setState(prev => ({
        ...prev,
        result,
        step: 'result',
        error: null,
        savedPlanId: planId,
      }))
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
      savedPlanId: null,
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
