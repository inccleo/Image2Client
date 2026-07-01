import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useConfigStore, useAppStore } from '@/stores'
import { editImage } from '@/lib/api'
import { db } from '@/lib/db'
import type { EditParams } from '@/types'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export function EditPanel() {
  const { config } = useConfigStore()
  const { setResultImages, isGenerating, setIsGenerating, setError } = useAppStore()

  const [params, setParams] = useState<EditParams>({
    prompt: '',
    image: null,
    mask: null,
    referenceImages: [],
    size: '1024x1024',
    quality: 'auto',
    outputFormat: 'png',
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const onDropImage = useCallback((files: File[]) => {
    if (files[0]) {
      setParams((p) => ({ ...p, image: files[0] }))
      fileToDataUrl(files[0]).then(setImagePreview)
    }
  }, [])

  const { getRootProps: getImageProps, getInputProps: getImageInput } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const onDropMask = useCallback((files: File[]) => {
    if (files[0]) setParams((p) => ({ ...p, mask: files[0] }))
  }, [])

  const { getRootProps: getMaskProps, getInputProps: getMaskInput } = useDropzone({
    onDrop: onDropMask,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const onDropRef = useCallback((files: File[]) => {
    setParams((p) => ({ ...p, referenceImages: [...p.referenceImages, ...files].slice(0, 5) }))
  }, [])

  const { getRootProps: getRefProps, getInputProps: getRefInput } = useDropzone({
    onDrop: onDropRef,
    accept: { 'image/*': [] },
    maxFiles: 5,
  })

  const handleEdit = async () => {
    if (!params.prompt.trim()) return
    if (!config.apiKey) {
      setError('请先配置 API Key')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResultImages([])

    try {
      const images = await editImage(config, params)
      setResultImages(images)

      const sourceImages: string[] = []
      if (params.image) sourceImages.push(await fileToDataUrl(params.image))

      await db.history.add({
        type: 'edit',
        prompt: params.prompt,
        params: { size: params.size, quality: params.quality, outputFormat: params.outputFormat },
        sourceImages,
        resultImages: images,
        createdAt: new Date(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '编辑失败')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>原图</Label>
        <div
          {...getImageProps()}
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getImageInput()} />
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="原图" className="max-h-32 mx-auto rounded" />
              <Button
                variant="ghost" size="icon"
                className="absolute top-0 right-0 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); setParams((p) => ({ ...p, image: null })); setImagePreview(null) }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="py-4 text-muted-foreground text-sm">
              <Upload className="h-6 w-6 mx-auto mb-2" />
              拖拽或点击上传原图
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mask（可选）</Label>
        <div
          {...getMaskProps()}
          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getMaskInput()} />
          <p className="text-xs text-muted-foreground">
            {params.mask ? params.mask.name : '拖拽或点击上传遮罩图'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>参考图（最多 5 张）</Label>
        <div
          {...getRefProps()}
          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getRefInput()} />
          <p className="text-xs text-muted-foreground">
            {params.referenceImages.length > 0
              ? `已选择 ${params.referenceImages.length} 张`
              : '拖拽或点击上传参考图'}
          </p>
        </div>
        {params.referenceImages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setParams((p) => ({ ...p, referenceImages: [] }))}>
            清除参考图
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          value={params.prompt}
          onChange={(e) => setParams({ ...params, prompt: e.target.value })}
          placeholder="描述你要编辑的内容..."
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">尺寸</Label>
          <Select value={params.size} onValueChange={(v) => setParams({ ...params, size: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024x1024</SelectItem>
              <SelectItem value="1536x1024">1536x1024</SelectItem>
              <SelectItem value="1024x1536">1024x1536</SelectItem>
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

      <Button onClick={handleEdit} disabled={isGenerating || !params.prompt.trim()} className="w-full">
        {isGenerating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> 编辑中...</>
        ) : (
          <><Pencil className="h-4 w-4" /> 编辑图片</>
        )}
      </Button>
    </div>
  )
}
