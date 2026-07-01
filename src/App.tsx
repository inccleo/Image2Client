import { useState, useEffect } from 'react'
import { Moon, Sun, Image } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { GeneratePanel } from '@/components/generate-panel'
import { EditPanel } from '@/components/edit-panel'
import { HistoryPanel } from '@/components/history-panel'
import { TemplatesPanel } from '@/components/templates-panel'
import { PreviewPanel } from '@/components/preview-panel'
import { SettingsDialog } from '@/components/settings-dialog'
import { useAppStore, useConfigStore } from '@/stores'
import { Toaster } from 'sonner'

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
    } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true)
    }
  }, [])

  return (
    <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

export default function App() {
  const { activeTab, setActiveTab, setAppliedPrompt } = useAppStore()
  const { config } = useConfigStore()

  const handleTemplateApply = (prompt: string) => {
    setAppliedPrompt(prompt)
    setActiveTab('generate')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster position="top-right" />
      <header className="border-b px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Image className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Image2Client</h1>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v1.0</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground max-w-[120px] truncate">
            {config.name || '未配置'}
          </span>
          <ThemeToggle />
          <SettingsDialog />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[420px] border-r flex flex-col overflow-hidden shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-3 mt-3 grid grid-cols-2">
              <TabsTrigger value="generate">生成</TabsTrigger>
              <TabsTrigger value="edit">编辑</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-3">
              <TabsContent value="generate" className="mt-0">
                <GeneratePanel />
              </TabsContent>
              <TabsContent value="edit" className="mt-0">
                <EditPanel />
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t">
            <Tabs defaultValue="history" className="flex flex-col">
              <TabsList className="mx-3 mt-2 grid grid-cols-2">
                <TabsTrigger value="history">历史</TabsTrigger>
                <TabsTrigger value="templates">模板</TabsTrigger>
              </TabsList>
              <div className="p-3 max-h-[350px] overflow-y-auto">
                <TabsContent value="history" className="mt-0">
                  <HistoryPanel />
                </TabsContent>
                <TabsContent value="templates" className="mt-0">
                  <TemplatesPanel onApply={handleTemplateApply} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>
      </main>
    </div>
  )
}
