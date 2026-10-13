'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Affiche une image en grand : zoom (boutons, molette, double-clic), déplacement en glissant,
// plein écran réel, flèches pour passer à la suivante, Échap pour fermer.
export function Lightbox({ images, start, onClose }: { images: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const root = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null)

  const zoomTo = useCallback((s: number) => {
    const next = Math.min(6, Math.max(1, s))
    setScale(next)
    if (next === 1) setPos({ x: 0, y: 0 })
  }, [])
  const show = useCallback(
    (n: number) => {
      setI(Math.max(0, Math.min(images.length - 1, n)))
      zoomTo(1)
    },
    [images.length, zoomTo],
  )
  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    onClose()
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) close()
      if (e.key === 'ArrowRight') show(i + 1)
      if (e.key === 'ArrowLeft') show(i - 1)
      if (e.key === '+' || e.key === '=') zoomTo(scale * 1.5)
      if (e.key === '-') zoomTo(scale / 1.5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, scale, show, zoomTo, close])

  const pleinEcran = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else root.current?.requestFullscreen?.().catch(() => {})
  }

  const btn = 'rounded-full bg-black/60 px-3 py-1.5 text-white shadow ring-1 ring-white/20 backdrop-blur hover:bg-black/80 disabled:opacity-30'
  const nav = 'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white shadow ring-1 ring-white/20 hover:bg-black/80 disabled:opacity-30'
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] select-none overflow-hidden bg-black"
      onWheel={e => zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2))}
      onClick={() => scale === 1 && close()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[i]}
        alt=""
        draggable={false}
        className={`absolute inset-0 h-full w-full object-contain ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: drag.current ? 'none' : 'transform .15s ease-out', touchAction: 'none' }}
        onClick={e => e.stopPropagation()}
        onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.5)}
        onPointerDown={e => {
          if (scale === 1) return
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false }
        }}
        onPointerMove={e => {
          const d = drag.current
          if (!d) return
          d.moved = true
          setPos({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y })
        }}
        onPointerUp={() => (drag.current = null)}
      />

      <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-2" onClick={e => e.stopPropagation()}>
        <button className={btn} aria-label="Dézoomer" disabled={scale <= 1} onClick={() => zoomTo(scale / 1.5)}>－</button>
        <button className={btn} onClick={() => zoomTo(1)}>{Math.round(scale * 100)} %</button>
        <button className={btn} aria-label="Zoomer" disabled={scale >= 6} onClick={() => zoomTo(scale * 1.5)}>＋</button>
        <button className={btn} onClick={pleinEcran}>⛶ Plein écran</button>
        <button className={btn} onClick={close}>✕ Fermer</button>
      </div>

      {images.length > 1 && (
        <>
          <button className={`${nav} left-3`} disabled={i === 0} onClick={e => (e.stopPropagation(), show(i - 1))}>◀</button>
          <button className={`${nav} right-3`} disabled={i === images.length - 1} onClick={e => (e.stopPropagation(), show(i + 1))}>▶</button>
          <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white/90">
            {i + 1} / {images.length}
          </span>
        </>
      )}
      {scale === 1 && (
        <span className="absolute bottom-3 left-3 z-10 hidden rounded-full bg-black/50 px-3 py-1 text-xs text-white/70 sm:block">
          Double-clic ou molette pour zoomer
        </span>
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
          <button key={src} onClick={() => setOpen(k)} className="group relative overflow-hidden rounded-lg border border-lion-blue/15 bg-white" title="Agrandir">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aspect-[4/3] w-full object-contain transition group-hover:scale-105" />
            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">🔍 Agrandir</span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox images={images} start={open} onClose={() => setOpen(null)} />}
    </>
  )
}
