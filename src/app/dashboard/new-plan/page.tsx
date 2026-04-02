'use client'

import { usePlanWizard } from '@/features/plans/usePlanWizard'
import { CropType, SoilType } from '@/engine/types'
import { CROP_RULES } from '@/engine/cropRules'

const SOIL_TYPES: { value: SoilType; label: string; label_bn: string }[] = [
  { value: 'sandy', label: 'Sandy',  label_bn: 'বালি মাটি' },
  { value: 'loamy', label: 'Loamy',  label_bn: 'দোআঁশ মাটি' },
  { value: 'silt',  label: 'Silt',   label_bn: 'পলি মাটি' },
  { value: 'clay',  label: 'Clay',   label_bn: 'এঁটেল মাটি' },
]

export default function NewPlanPage() {
  const { state, setCrop, setArea, setSoilType, calculate, reset, goBack } =
    usePlanWizard()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            New Fertilizer Plan
          </h1>
          {state.step !== 'result' && (
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    Number(state.step) >= s ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Step 1 — Crop selection */}
        {state.step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Select crop
            </h2>
            <p className="text-sm text-gray-500 mb-4">ফসল নির্বাচন করুন</p>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(CROP_RULES) as CropType[]).map(crop => (
                <button
                  key={crop}
                  onClick={() => setCrop(crop)}
                  className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">
                    {CROP_RULES[crop].name_en}
                  </div>
                  <div className="text-sm text-gray-500">
                    {CROP_RULES[crop].name_bn}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Area input */}
        {state.step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Farm area
            </h2>
            <p className="text-sm text-gray-500 mb-4">জমির পরিমাণ (বিঘা)</p>
            <form
              onSubmit={e => {
                e.preventDefault()
                const val = parseFloat(
                  (e.currentTarget.elements.namedItem('area') as HTMLInputElement).value
                )
                if (val > 0) setArea(val)
              }}
              className="space-y-4"
            >
              <div>
                <input
                  name="area"
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  placeholder="e.g. 2.5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">Enter area in bigha</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 — Soil type */}
        {state.step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Soil type
            </h2>
            <p className="text-sm text-gray-500 mb-4">মাটির ধরন</p>
            <div className="grid grid-cols-2 gap-3">
              {SOIL_TYPES.map(soil => (
                <button
                  key={soil.value}
                  onClick={() => setSoilType(soil.value)}
                  className="px-4 py-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">{soil.label}</div>
                  <div className="text-sm text-gray-500">{soil.label_bn}</div>
                </button>
              ))}
            </div>
            <button
              onClick={goBack}
              className="mt-4 w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 4 — Soil test (optional) */}
        {state.step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Soil test values
            </h2>
            <p className="text-sm text-gray-500 mb-1">মাটি পরীক্ষার ফলাফল</p>
            <p className="text-xs text-gray-400 mb-4">
              Optional — skip if no soil test available
            </p>
            <form
              onSubmit={e => {
                e.preventDefault()
                const f = e.currentTarget.elements
                const get = (name: string) => {
                  const val = (f.namedItem(name) as HTMLInputElement).value
                  return val ? parseFloat(val) : null
                }
                calculate({
                  nitrogen_ppm: get('nitrogen'),
                  phosphorus_ppm: get('phosphorus'),
                  potassium_ppm: get('potassium'),
                })
              }}
              className="space-y-4"
            >
              {[
                { name: 'nitrogen',   label: 'Nitrogen (N) ppm',   label_bn: 'নাইট্রোজেন' },
                { name: 'phosphorus', label: 'Phosphorus (P) ppm', label_bn: 'ফসফরাস' },
                { name: 'potassium',  label: 'Potassium (K) ppm',  label_bn: 'পটাশিয়াম' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    <span className="text-gray-400 ml-1">({field.label_bn})</span>
                  </label>
                  <input
                    name={field.name}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Leave blank if unknown"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              {state.error && (
                <p className="text-red-600 text-sm">{state.error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Generate plan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Result */}
        {state.step === 'result' && state.result && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h2 className="font-bold text-green-800 text-lg">
                Fertilizer Plan Ready
              </h2>
              <p className="text-green-700 text-sm">
                {CROP_RULES[state.result.crop].name_en} —{' '}
                {CROP_RULES[state.result.crop].name_bn}
              </p>
              <p className="text-green-700 text-sm">
                Area: {state.result.area_bigha} bigha
              </p>
            </div>

            {state.result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                {state.result.warnings.map((w, i) => (
                  <p key={i} className="text-yellow-800 text-sm">⚠ {w}</p>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              {state.result.recommendations.map((rec, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {rec.fertilizer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {rec.fertilizer_name_bn}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 text-lg">
                        {rec.quantity_kg} kg
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {rec.application_stage}
                  </p>
                  {rec.notes && (
                    <p className="text-xs text-blue-600 mt-1">{rec.notes}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">Estimated total cost</p>
              <p className="text-xl font-bold text-gray-900">
                ৳ {state.result.total_cost_estimate_bdt.toLocaleString()}
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Create another plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}