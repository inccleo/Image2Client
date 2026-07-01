import Dexie, { type EntityTable } from 'dexie'
import type { HistoryRecord, PromptTemplate } from '@/types'

const db = new Dexie('Image2Client') as Dexie & {
  history: EntityTable<HistoryRecord, 'id'>
  templates: EntityTable<PromptTemplate, 'id'>
}

db.version(1).stores({
  history: '++id, type, createdAt',
  templates: '++id, category, name',
})

export { db }
