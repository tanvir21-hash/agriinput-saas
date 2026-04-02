import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function CropBadge({ cropType }: { cropType: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    rice:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'RI' },
    wheat:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'WH' },
    mustard: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'MU' },
    potato:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'PO' },
    jute:    { bg: 'bg-lime-100',   text: 'text-lime-700',   label: 'JU' },
  }
  const c = config[cropType] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: cropType.slice(0,2).toUpperCase() }
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${c.bg} ${c.text}`}>
      {c.label}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, org_id')
    .eq('id', user.id)
    .single()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, plan_tier')
    .eq('id', profile?.org_id)
    .single()

  const { data: plans } = await supabase
    .from('fertilizer_plans')
    .select(`
      id,
      crop_type,
      soil_type,
      created_at,
      synced_at,
      plan_output,
      farms (
        farmer_name,
        village,
        upazila,
        area_bigha
      )
    `)
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { count: totalFarms } = await supabase
    .from('farms')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)

  const { count: totalPlans } = await supabase
    .from('fertilizer_plans')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)

  const { count: unsyncedPlans } = await supabase
    .from('fertilizer_plans')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)
    .is('synced_at', null)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{org?.name ?? 'AgriInput'}</p>
              <p className="text-xs text-gray-400 capitalize">{org?.plan_tier ?? 'free'} plan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {profile?.full_name ?? user.email}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
              {profile?.role?.replace('_', ' ') ?? 'user'}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Field operations overview</p>
          </div>
          <Link
            href="/dashboard/new-plan"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            + New Plan
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Farms</p>
            <p className="text-3xl font-bold text-gray-900">{totalFarms ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">মোট খামার</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Plans</p>
            <p className="text-3xl font-bold text-gray-900">{totalPlans ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">মোট পরিকল্পনা</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pending Sync</p>
            <p className={`text-3xl font-bold ${(unsyncedPlans ?? 0) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {unsyncedPlans ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">সিঙ্ক বাকি</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Plans</h2>
            <p className="text-xs text-gray-400">সাম্প্রতিক পরিকল্পনা</p>
          </div>

          {!plans || plans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm">No plans yet.</p>
              <Link href="/dashboard/new-plan" className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block">
                Create your first plan →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {plans.map((plan: any) => {
                const farm = Array.isArray(plan.farms) ? plan.farms[0] : plan.farms
                const output = plan.plan_output as any
                return (
                  <div key={plan.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <CropBadge cropType={plan.crop_type} />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{plan.crop_type}</p>
                        <p className="text-sm text-gray-500">
                          {farm?.farmer_name ?? '—'} • {farm?.village ?? ''} {farm?.upazila ?? ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {farm?.area_bigha} bigha • {new Date(plan.created_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        ৳ {output?.total_cost_estimate_bdt?.toLocaleString() ?? '—'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${plan.synced_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {plan.synced_at ? 'Synced' : 'Offline'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
