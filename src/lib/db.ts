import type { WantItem, Plan, AiConnection, EncryptedSecretRecord, TimelineEntry, DashboardInsight, AppSettings } from '@/types'

const DB_NAME = 'wysh-lyst-db'
const DB_VERSION = 1

const STORES = {
  WANTS: 'wants',
  PLANS: 'plans',
  AI_CONNECTIONS: 'ai_connections',
  ENCRYPTED_SECRETS: 'encrypted_secrets',
  TIMELINE: 'timeline',
  INSIGHTS: 'insights',
  SETTINGS: 'settings',
} as const

class WyshLystDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORES.WANTS)) {
          const wantStore = db.createObjectStore(STORES.WANTS, { keyPath: 'id' })
          wantStore.createIndex('category', 'category', { unique: false })
          wantStore.createIndex('status', 'status', { unique: false })
          wantStore.createIndex('createdAt', 'createdAt', { unique: false })
          wantStore.createIndex('archived', 'archived', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.PLANS)) {
          db.createObjectStore(STORES.PLANS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.AI_CONNECTIONS)) {
          db.createObjectStore(STORES.AI_CONNECTIONS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.ENCRYPTED_SECRETS)) {
          db.createObjectStore(STORES.ENCRYPTED_SECRETS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.TIMELINE)) {
          const timelineStore = db.createObjectStore(STORES.TIMELINE, { keyPath: 'id' })
          timelineStore.createIndex('date', 'date', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.INSIGHTS)) {
          db.createObjectStore(STORES.INSIGHTS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result as T[])
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result as T | undefined)
      request.onerror = () => reject(request.error)
    })
  }

  async put(storeName: string, value: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.put(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllWants(): Promise<WantItem[]> {
    return this.getAll<WantItem>(STORES.WANTS)
  }

  async getWant(id: string): Promise<WantItem | undefined> {
    return this.get<WantItem>(STORES.WANTS, id)
  }

  async putWant(want: WantItem): Promise<void> {
    return this.put(STORES.WANTS, want)
  }

  async deleteWant(id: string): Promise<void> {
    return this.delete(STORES.WANTS, id)
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.getAll<Plan>(STORES.PLANS)
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    return this.get<Plan>(STORES.PLANS, id)
  }

  async putPlan(plan: Plan): Promise<void> {
    return this.put(STORES.PLANS, plan)
  }

  async deletePlan(id: string): Promise<void> {
    return this.delete(STORES.PLANS, id)
  }

  async getAllAiConnections(): Promise<AiConnection[]> {
    return this.getAll<AiConnection>(STORES.AI_CONNECTIONS)
  }

  async getAiConnection(id: string): Promise<AiConnection | undefined> {
    return this.get<AiConnection>(STORES.AI_CONNECTIONS, id)
  }

  async putAiConnection(connection: AiConnection): Promise<void> {
    return this.put(STORES.AI_CONNECTIONS, connection)
  }

  async deleteAiConnection(id: string): Promise<void> {
    return this.delete(STORES.AI_CONNECTIONS, id)
  }

  async getEncryptedSecret(id: string): Promise<EncryptedSecretRecord | undefined> {
    return this.get<EncryptedSecretRecord>(STORES.ENCRYPTED_SECRETS, id)
  }

  async putEncryptedSecret(secret: EncryptedSecretRecord): Promise<void> {
    return this.put(STORES.ENCRYPTED_SECRETS, secret)
  }

  async deleteEncryptedSecret(id: string): Promise<void> {
    return this.delete(STORES.ENCRYPTED_SECRETS, id)
  }

  async getAllTimeline(): Promise<TimelineEntry[]> {
    const entries = await this.getAll<TimelineEntry>(STORES.TIMELINE)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async putTimelineEntry(entry: TimelineEntry): Promise<void> {
    return this.put(STORES.TIMELINE, entry)
  }

  async getAllInsights(): Promise<DashboardInsight[]> {
    return this.getAll<DashboardInsight>(STORES.INSIGHTS)
  }

  async putInsight(insight: DashboardInsight): Promise<void> {
    return this.put(STORES.INSIGHTS, insight)
  }

  async deleteInsight(id: string): Promise<void> {
    return this.delete(STORES.INSIGHTS, id)
  }

  async getSettings(): Promise<AppSettings | undefined> {
    return this.get<AppSettings>(STORES.SETTINGS, 'app-settings')
  }

  async putSettings(settings: AppSettings): Promise<void> {
    return this.put(STORES.SETTINGS, { ...settings, id: 'app-settings' })
  }

  async clearAllData(): Promise<void> {
    const stores = Object.values(STORES)
    for (const store of stores) {
      await this.clear(store)
    }
  }
}

export const db = new WyshLystDB()
