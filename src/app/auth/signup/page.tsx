'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    org_name: '',
    org_slug: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'org_name') {
        updated.org_slug = value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      }
      return updated
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Step 1: Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Failed to create account')
      setLoading(false)
      return
    }

    // Step 2: Sign in immediately so session is active for RLS
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('Account created but could not sign in: ' + signInError.message)
      setLoading(false)
      return
    }

    // Step 3: Create the organization (RLS allows it — user is authenticated)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: form.org_name,
        slug: form.org_slug,
        plan_tier: 'free',
      })
      .select()
      .single()

    if (orgError || !org) {
      setError('Failed to create organization: ' + orgError?.message)
      setLoading(false)
      return
    }

    // Step 4: Create profile linking user to org as admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        org_id: org.id,
        full_name: form.full_name,
        role: 'org_admin',
      })

    if (profileError) {
      setError('Failed to create profile: ' + profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create your organization
        </h1>
        <p className="text-gray-500 mb-6">
          You will be the admin of your organization
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your full name
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Md. Tanvir Ahmed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@organization.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <hr className="my-2" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization name
            </label>
            <input
              type="text"
              name="org_name"
              value={form.org_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="DAE Khulna Office"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization slug
            </label>
            <input
              type="text"
              name="org_slug"
              value={form.org_slug}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="dae-khulna-office"
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-generated from org name. Used in URLs.
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create organization'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/auth/login" className="text-green-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}