import { Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores'

export function PreviewPanel() {
  const { resultImages, isGenerating, error } = useAppStore()
  const [zoom, setZoom] = useState(100)

  const handleDownload = (src: string, index: number) => {
    const a = document.createElement('a')
    a.href = src
    a.download = `image-${Date.now()}-${index}.png`
    a.click()
  }

  const handleDownloadAll = () => {
    resultImages.forEach((src, i) => handleDownload(src, i))
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">生成中，请稍候...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (resultImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">生成结果将在这里显示</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5 border-b">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(50, z - 25))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownloadAll}>
          <Download className="h-3 w-3 mr-1" />
          下载全部
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div className={`grid gap-4 place-items-center w-full ${resultImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {resultImages.map((src, i) => (
            <div key={i} className="relative group flex items-center justify-center">
              <img
                src={src}
                alt={`Result ${i + 1}`}
                className="max-h-[calc(100vh-160px)] rounded-lg border shadow-sm object-contain"
                style={{ maxWidth: `${zoom}%` }}
              />
              <Button
                variant="secondary" size="sm"
                className="absolute top-2 right-2 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDownload(src, i)}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
