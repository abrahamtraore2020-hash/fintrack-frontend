'use client'

import { useEffect, useState } from 'react'

// Affiche une image en plein écran ; flèches pour passer à la suivante, Échap pour fermer.
export function Lightbox({ images, start, onClose }: { images: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(v => Math.min(images.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI(v => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const nav = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-2xl text-white hover:bg-white/30 disabled:opacity-20'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt="" className="max-h-full max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
      <button className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-white hover:bg-white/30" onClick={onClose}>✕ Fermer</button>
      {images.length > 1 && (
        <>
          <button className={`${nav} left-4`} disabled={i === 0} onClick={e => (e.stopPropagation(), setI(i - 1))}>◀</button>
          <button className={`${nav} right-4`} disabled={i === images.length - 1} onClick={e => (e.stopPropagation(), setI(i + 1))}>▶</button>
          <span className="absolute bottom-4 text-sm text-white/80">{i + 1} / {images.length}</span>
        </>
      )}
    </div>
  )
}

export function ImageGallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!images.length) return null
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((src, k) => (
          <button key={src} onClick={() => setOpen(k)} className="overflow-hidden rounded-lg border border-lion-blue/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aspect-[4/3] w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox images={images} start={open} onClose={() => setOpen(null)} />}
    </>
  )
}
