export interface ApiConfig {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  model: string
}

export interface GenerateParams {
  prompt: string
  size: string
  quality: string
  background: string
  outputFormat: string
  n: number
  referenceImages?: File[]
}

export interface EditParams {
  prompt: string
  image: File | null
  mask: File | null
  referenceImages: File[]
  size: string
  quality: string
  outputFormat: string
}

export interface HistoryRecord {
  id?: number
  type: 'generate' | 'edit'
  prompt: string
  params: Record<string, unknown>
  sourceImages?: string[]
  resultImages: string[]
  createdAt: Date
}

export interface PromptTemplate {
  id?: number
  name: string
  prompt: string
  category: string
  createdAt: Date
}
