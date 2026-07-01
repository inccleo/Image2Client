import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Sparkles, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useConfigStore, useAppStore } from '@/stores'
import { generateImage } from '@/lib/api'
import { db } from '@/lib/db'
import type { GenerateParams } from '@/types'

export function GeneratePanel() {
  const { config } = useConfigStore()
  const { setResultImages, isGenerating, setIsGenerating, setError, appliedPrompt, setAppliedPrompt } = useAppStore()

  const [params, setParams] = useState<GenerateParams>({
    prompt: '',
    size: '1024x1024',
    quality: 'auto',
    background: 'auto',
    outputFormat: 'png',
    n: 1,
    referenceImages: [],
  })

  const onDropRef = useCallback((files: File[]) => {
    setParams((p) => ({
      ...p,
      referenceImages: [...(p.referenceImages || []), ...files].slice(0, 5),
    }))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropRef,
    accept: { 'image/*': [] },
    maxFiles: 5,
  })

  useEffect(() => {
    if (appliedPrompt) {
      setParams((p) => ({ ...p, prompt: appliedPrompt }))
      setAppliedPrompt(null)
    }
  }, [appliedPrompt, setAppliedPrompt])

  const handleGenerate = async () => {
    if (!params.prompt.trim()) return
    if (!config.apiKey) {
      setError('请先配置 API Key')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResultImages([])

    try {
      const images = await generateImage(config, params)
      setResultImages(images)
      await db.history.add({
        type: 'generate',
        prompt: params.prompt,
        params: { ...params },
        resultImages: images,
        createdAt: new Date(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          value={params.prompt}
          onChange={(e) => setParams({ ...params, prompt: e.target.value })}
          placeholder="描述你想生成的图片..."
          className="min-h-[120px] resize-none"
        />
        <div className="text-xs text-muted-foreground text-right">
          {params.prompt.length} 字符
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">尺寸</Label>
          <Select value={params.size} onValueChange={(v) => setParams({ ...params, size: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024x1024</SelectItem>
              <SelectItem value="1536x1024">1536x1024 (横)</SelectItem>
              <SelectItem value="1024x1536">1024x1536 (竖)</SelectItem>
              <SelectItem value="1792x1024">1792x1024 (宽横)</SelectItem>
              <SelectItem value="1024x1792">1024x1792 (长竖)</SelectItem>
              <SelectItem value="auto">auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">质量</Label>
          <Select value={params.quality} onValueChange={(v) => setParams({ ...params, quality: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">auto</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="low">low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">背景</Label>
          <Select value={params.background} onValueChange={(v) => setParams({ ...params, background: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">auto</SelectItem>
              <SelectItem value="transparent">transparent</SelectItem>
              <SelectItem value="opaque">opaque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">格式</Label>
          <Select value={params.outputFormat} onValueChange={(v) => setParams({ ...params, outputFormat: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">数量</Label>
        <Select value={String(params.n)} onValueChange={(v) => setParams({ ...params, n: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">参考图（可选，最多 5 张）</Label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getInputProps()} />
          <p className="text-xs text-muted-foreground">
            {params.referenceImages && params.referenceImages.length > 0
              ? `已选择 ${params.referenceImages.length} 张`
              : <><Upload className="h-3.5 w-3.5 inline mr-1" />拖拽或点击上传</>}
          </p>
        </div>
        {params.referenceImages && params.referenceImages.length > 0 && (
          <Button
            variant="ghost" size="sm" className="h-6 px-2 text-xs"
            onClick={() => setParams((p) => ({ ...p, referenceImages: [] }))}
          >
            <X className="h-3 w-3 mr-1" />清除参考图
          </Button>
        )}
      </div>

      <Button onClick={handleGenerate} disabled={isGenerating || !params.prompt.trim()} className="w-full">
        {isGenerating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> 生成中...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> 生成图片</>
        )}
      </Button>
    </div>
  )
}
