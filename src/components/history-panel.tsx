import { useLiveQuery } from 'dexie-react-hooks'
import { Clock, RotateCw, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { useAppStore } from '@/stores'

export function HistoryPanel() {
  const { setResultImages } = useAppStore()
  const history = useLiveQuery(() => db.history.orderBy('createdAt').reverse().limit(50).toArray())

  const handleReuse = (record: NonNullable<typeof history>[0]) => {
    setResultImages(record.resultImages)
  }

  const handleDelete = async (id: number) => {
    await db.history.delete(id)
  }

  const handleDownload = (images: string[]) => {
    images.forEach((src, i) => {
      const a = document.createElement('a')
      a.href = src
      a.download = `image-${Date.now()}-${i}.png`
      a.click()
    })
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        暂无历史记录
      </div>
    )
  }

  return (
    <div className="space-y-2 pr-1">
      {history.map((record) => (
        <div
          key={record.id}
          className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => handleReuse(record)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-foreground line-clamp-2 flex-1">
              {record.prompt}
            </p>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {new Date(record.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {record.resultImages.length > 0 && (
            <div className="flex gap-1">
              {record.resultImages.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt="" className="h-10 w-10 rounded object-cover" />
              ))}
              {record.resultImages.length > 3 && (
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{record.resultImages.length - 3}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleReuse(record) }}>
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleDownload(record.resultImages) }}>
              <Download className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(record.id!) }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
