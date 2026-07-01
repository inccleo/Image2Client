import type { ApiConfig } from '@/types'

const CONFIGS_KEY = 'image2client_configs'
const ACTIVE_KEY = 'image2client_active_config'

export function getAllConfigs(): ApiConfig[] {
  const raw = localStorage.getItem(CONFIGS_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // fall through
    }
  }
  return []
}

export function saveAllConfigs(configs: ApiConfig[]) {
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs))
}

export function getActiveConfigId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveConfigId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getConfig(): ApiConfig {
  const configs = getAllConfigs()
  const activeId = getActiveConfigId()
  const active = configs.find((c) => c.id === activeId)
  if (active) return active
  if (configs.length > 0) return configs[0]
  return { id: 'default', name: '默认', baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-image-2' }
}

export function saveConfig(config: ApiConfig) {
  const configs = getAllConfigs()
  const idx = configs.findIndex((c) => c.id === config.id)
  if (idx >= 0) {
    configs[idx] = config
  } else {
    configs.push(config)
  }
  saveAllConfigs(configs)
  setActiveConfigId(config.id)
}

export function deleteConfig(id: string) {
  const configs = getAllConfigs().filter((c) => c.id !== id)
  saveAllConfigs(configs)
}
