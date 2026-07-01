import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookmarkPlus, Search, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { db } from '@/lib/db'
import type { PromptTemplate } from '@/types'

const DEFAULT_CATEGORIES = ['服装', '商品图', '海报', '透明背景', '人像', 'Logo']

interface Props {
  onApply: (prompt: string) => void
}

export function TemplatesPanel({ onApply }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState({ name: '', prompt: '', category: '' })
  const [dialogOpen, setDialogOpen] = useState(false)

  const templates = useLiveQuery(async () => {
    let query = db.templates.orderBy('createdAt')
    const all = await query.reverse().toArray()
    return all.filter((t) => {
      if (selectedCategory && t.category !== selectedCategory) return false
      if (search && !t.prompt.includes(search) && !t.name.includes(search)) return false
      return true
    })
  }, [search, selectedCategory])

  const categories = useLiveQuery(async () => {
    const all = await db.templates.toArray()
    const cats = new Set(all.map((t) => t.category))
    DEFAULT_CATEGORIES.forEach((c) => cats.add(c))
    return Array.from(cats)
  })

  const handleAdd = async () => {
    if (!newTemplate.name || !newTemplate.prompt) return
    await db.templates.add({
      ...newTemplate,
      category: newTemplate.category || '未分类',
      createdAt: new Date(),
    } as PromptTemplate)
    setNewTemplate({ name: '', prompt: '', category: '' })
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    await db.templates.delete(id)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板..."
            className="pl-7 h-8 text-xs"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <BookmarkPlus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建模板</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">名称</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="模板名称"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">分类</Label>
                <Input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  placeholder="例如：商品图"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prompt</Label>
                <Textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                  placeholder="模板 Prompt 内容..."
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">保存</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={selectedCategory === null ? 'secondary' : 'ghost'}
            size="sm" className="h-6 px-2 text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'secondary' : 'ghost'}
              size="sm" className="h-6 px-2 text-xs"
              onClick={() => setSelectedCategory(cat)}
            >
              <Tag className="h-3 w-3 mr-0.5" />
              {cat}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {templates && templates.length > 0 ? (
          templates.map((t) => (
            <div
              key={t.id}
              className="border rounded-md p-2 hover:bg-accent/50 cursor-pointer transition-colors group"
              onClick={() => onApply(t.prompt)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t.name}</span>
                <Button
                  variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id!) }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{t.prompt}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">暂无模板，点击 + 添加</p>
        )}
      </div>
    </div>
  )
}
