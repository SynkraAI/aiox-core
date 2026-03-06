'use client'

import { useState, useTransition } from 'react'
import { Button, Input } from '@ciclo/ui'
import { createImage, deleteImage, reorderImages } from '../../lib/actions/events'

// ============================================================
// Types
// ============================================================

interface ImageItem {
  id: string
  url: string
  alt: string | null
  order: number
}

interface ImageGalleryManagerProps {
  eventId: string
  images: ImageItem[]
}

// ============================================================
// Image Gallery Manager Component
// ============================================================

export function ImageGalleryManager({ eventId, images: initialImages }: ImageGalleryManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [newUrl, setNewUrl] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!newUrl.trim()) return

    startTransition(async () => {
      const result = await createImage(eventId, newUrl.trim(), newAlt.trim() || undefined)
      if (result.success) {
        setNewUrl('')
        setNewAlt('')
        setIsAdding(false)
        // revalidatePath will refresh the page data
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteImage(id)
      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== id))
      }
    })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...images]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index]!, newOrder[index - 1]!]
    setImages(newOrder)

    startTransition(async () => {
      await reorderImages(
        eventId,
        newOrder.map((img) => img.id),
      )
    })
  }

  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return
    const newOrder = [...images]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1]!, newOrder[index]!]
    setImages(newOrder)

    startTransition(async () => {
      await reorderImages(
        eventId,
        newOrder.map((img) => img.id),
      )
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Upload via Supabase Storage sera implementado em fase posterior.
        Por enquanto, insira URLs de imagem diretamente.
      </p>

      {/* Image Grid */}
      {images.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500">Nenhuma imagem adicionada.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image, index) => (
          <div key={image.id} className="group relative">
            <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt ?? 'Imagem do evento'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = ''
                  target.alt = 'Imagem não encontrada'
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0 || isPending}
              >
                {'<'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white"
                onClick={() => handleMoveDown(index)}
                disabled={index >= images.length - 1 || isPending}
              >
                {'>'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => handleDelete(image.id)}
                disabled={isPending}
              >
                X
              </Button>
            </div>
            {image.alt && (
              <p className="mt-1 truncate text-xs text-gray-500">{image.alt}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Image Form */}
      {isAdding ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-3">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL da imagem (ex: https://...)"
          />
          <Input
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            placeholder="Texto alternativo (opcional)"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={isPending || !newUrl.trim()}>
              Adicionar Imagem
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewUrl('')
                setNewAlt('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          + Adicionar Imagem
        </Button>
      )}
    </div>
  )
}
