import { create } from 'zustand'
import type { ApiConfig } from '@/types'
import { getConfig, saveConfig, getAllConfigs, deleteConfig, setActiveConfigId } from '@/lib/storage'

interface ConfigStore {
  config: ApiConfig
  configs: ApiConfig[]
  setConfig: (config: ApiConfig) => void
  switchConfig: (id: string) => void
  removeConfig: (id: string) => void
  refreshConfigs: () => void
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: getConfig(),
  configs: getAllConfigs(),
  setConfig: (config) => {
    saveConfig(config)
    set({ config, configs: getAllConfigs() })
  },
  switchConfig: (id) => {
    setActiveConfigId(id)
    const configs = getAllConfigs()
    const active = configs.find((c) => c.id === id)
    if (active) set({ config: active })
  },
  removeConfig: (id) => {
    deleteConfig(id)
    const configs = getAllConfigs()
    set({ configs })
    if (get().config.id === id) {
      const fallback = configs[0] || { id: 'default', name: '默认', baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-image-2' }
      setActiveConfigId(fallback.id)
      set({ config: fallback })
    }
  },
  refreshConfigs: () => set({ configs: getAllConfigs() }),
}))

interface AppStore {
  activeTab: string
  setActiveTab: (tab: string) => void
  resultImages: string[]
  setResultImages: (images: string[]) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  error: string | null
  setError: (e: string | null) => void
  appliedPrompt: string | null
  setAppliedPrompt: (p: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'generate',
  setActiveTab: (tab) => set({ activeTab: tab }),
  resultImages: [],
  setResultImages: (images) => set({ resultImages: images }),
  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  error: null,
  setError: (e) => set({ error: e }),
  appliedPrompt: null,
  setAppliedPrompt: (p) => set({ appliedPrompt: p }),
}))
