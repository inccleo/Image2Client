import { useState } from 'react'
import { Settings, Zap, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useConfigStore } from '@/stores'
import { testConnection } from '@/lib/api'
import type { ApiConfig } from '@/types'

export function SettingsDialog() {
  const { config, configs, setConfig, switchConfig, removeConfig } = useConfigStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ApiConfig | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setEditing(null)
      setTestResult(null)
    }
  }

  const handleNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-image-2',
    })
    setTestResult(null)
  }

  const handleEdit = (cfg: ApiConfig) => {
    setEditing({ ...cfg })
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!editing) return
    setTesting(true)
    setTestResult(null)
    const ok = await testConnection(editing)
    setTestResult(ok)
    setTesting(false)
    toast(ok ? '连接成功' : '连接失败', {
      description: ok ? 'API 配置验证通过' : '请检查 Base URL 和 API Key',
    })
  }

  const handleSave = () => {
    if (!editing) return
    if (!editing.name.trim()) {
      toast.error('请输入配置名称')
      return
    }
    setConfig(editing)
    setEditing(null)
    toast.success('配置已保存')
  }

  const handleSwitch = (id: string) => {
    switchConfig(id)
    toast.success('已切换配置')
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    removeConfig(id)
    toast('配置已删除')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="例如：OpenAI 官方、中转站 A"
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={editing.baseUrl}
                onChange={(e) => setEditing({ ...editing, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={editing.apiKey}
                onChange={(e) => setEditing({ ...editing, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={editing.model}
                onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                placeholder="gpt-image-2"
                list="model-suggestions"
              />
              <datalist id="model-suggestions">
                <option value="gpt-image-2" />
                <option value="image2" />
                <option value="gpt-image-1" />
                <option value="dall-e-3" />
                <option value="dall-e-2" />
              </datalist>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleTest} disabled={testing} variant="outline" className="flex-1">
                <Zap className="h-4 w-4 mr-1" />
                {testing ? '测试中...' : '测试连接'}
              </Button>
              {testResult !== null && (
                <span className={testResult ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                  {testResult ? '连接成功' : '连接失败'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                保存配置
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {configs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  暂无配置，点击下方按钮添加
                </p>
              ) : (
                configs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className={`border rounded-lg p-3 flex items-center gap-3 transition-colors ${
                      cfg.id === config.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{cfg.name || '未命名'}</span>
                        {cfg.id === config.id && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">当前</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {cfg.baseUrl} · {cfg.model}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {cfg.id !== config.id && (
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleSwitch(cfg.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleEdit(cfg)}>
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-7 px-2 text-destructive"
                        onClick={() => handleDelete(cfg.id)}
                        disabled={configs.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full" onClick={handleNew}>
              <Plus className="h-4 w-4 mr-1" />
              新增配置
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
