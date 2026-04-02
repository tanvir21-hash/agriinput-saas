import Dexie, { Table } from 'dexie'
import { CropType, SoilType, PlanOutput } from '@/engine/types'

// This is the local IndexedDB schema
// It mirrors our Supabase schema but lives on the device

export interface LocalPlan {
  id: string                    // UUID generated locally
  org_id: string
  farm_id: string | null
  farmer_name: string
  area_bigha: number
  crop: CropType
  soil_type: SoilType
  plan_output: PlanOutput
  created_at: string
  synced: boolean               // false = needs to be uploaded
  sync_error: string | null     // last sync error if any
}

export interface SyncQueueItem {
  id?: number                   // auto-increment
  plan_id: string
  attempted_at: string | null
  retry_count: number
}

class AgriInputDB extends Dexie {
  plans!: Table<LocalPlan>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('agriinput-db')

    this.version(1).stores({
      plans: 'id, org_id, synced, created_at',
      syncQueue: '++id, plan_id, retry_count',
    })
  }
}

export const db = new AgriInputDB()