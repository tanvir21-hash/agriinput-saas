import { db } from './db'
import { supabase } from '@/lib/supabase'

const MAX_RETRIES = 3

export async function addToSyncQueue(plan_id: string) {
  await db.syncQueue.add({
    plan_id,
    attempted_at: null,
    retry_count: 0,
  })
}

export async function processSyncQueue(): Promise<void> {
  const items = await db.syncQueue
    .where('retry_count')
    .below(MAX_RETRIES)
    .toArray()

  if (items.length === 0) return

  for (const item of items) {
    const plan = await db.plans.get(item.plan_id)
    if (!plan) {
      await db.syncQueue.delete(item.id!)
      continue
    }

    try {
      const { error } = await supabase
        .from('fertilizer_plans')
        .insert({
          id: plan.id,
          org_id: plan.org_id,
          farm_id: plan.farm_id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          crop_type: plan.crop,
          soil_type: plan.soil_type,
          plan_output: plan.plan_output,
          synced_at: new Date().toISOString(),
        })

      if (error) throw error

      // Success — mark as synced and remove from queue
      await db.plans.update(plan.id, {
        synced: true,
        sync_error: null,
      })
      await db.syncQueue.delete(item.id!)

    } catch (err) {
      // Failed — increment retry count
      await db.syncQueue.update(item.id!, {
        retry_count: item.retry_count + 1,
        attempted_at: new Date().toISOString(),
      })
      await db.plans.update(plan.id, {
        sync_error: err instanceof Error ? err.message : 'Sync failed',
      })
    }
  }
}

export async function getUnsyncedCount(): Promise<number> {
  return db.plans.where('synced').equals(0).count()
}