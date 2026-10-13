'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Episode, Lecon } from '@/data/formation'
import { PLATEFORME } from '@/data/formation'
import { Lightbox } from './Lightbox'

type Slide = { kind: 'cover' } | { kind: 'lecon'; index: number; lecon: Lecon } | { kind: 'end' }

// Les tailles en cqw suivent la largeur de la diapositive : même rendu en petit et en plein écran.
export function SlideViewer({ formationTitre, episode }: { formationTitre: string; episode: Episode }) {
  const slides: Slide[] = [
    { kind: 'cover' },
    ...episode.lecons.map((lecon, index) => ({ kind: 'lecon' as const, index, lecon })),
    { kind: 'end' },
  ]
  const [i, setI] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [zoom, setZoom] = useState<{ images: string[]; start: number } | null>(null)
  const last = slides.length - 1
  const go = useCallback((d: number) => setI(v => Math.max(0, Math.min(last, v + d))), [last])

  useEffect(() => {
    if (!expanded || zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') (e.preventDefault(), go(1))
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') (e.preventDefault(), go(-1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, zoom, go])

  const s = slides[Math.min(i, last)]
  const btn = 'rounded-md border border-lion-blue/20 bg-white px-3 py-1 text-sm text-lion-blue disabled:opacity-30'

  const slide = (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg bg-white text-lion-ink shadow-sm ring-1 ring-lion-blue/10"
      style={{ containerType: 'inline-size' }}
    >
      {s.kind === 'cover' && (
        <div className="absolute inset-0 flex">
          <div className="w-[2.5cqw] bg-lion-blue" />
          <div className="w-[0.8cqw] bg-lion-gold" />
          <div className="flex flex-1 items-center gap-[4cqw] px-[6cqw]">
            <div className="flex-1">
              <p className="text-[1.6cqw] font-bold tracking-[0.4em] text-lion-blue">{PLATEFORME.nom.toUpperCase()}</p>
              <p className="mt-[2cqw] text-[4.6cqw] font-bold leading-tight">{episode.titre}</p>
              <p className="mt-[1.5cqw] text-[1.8cqw] text-lion-ink/60">{formationTitre} · Module {episode.numero}</p>
              <div className="mt-[3cqw] h-[0.6cqw] w-[12cqw] bg-lion-gold" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lion-attitude-head.png" alt="" className="w-[22cqw]" />
          </div>
        </div>
      )}
      {s.kind === 'lecon' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-[0.9cqw] bg-lion-blue" />
          <div className="flex flex-1 flex-col px-[4.5cqw] pt-[2.5cqw]">
            <p className="text-[1.2cqw] text-lion-ink/50">Module {episode.numero} · Leçon {s.index + 1}</p>
            <p className="mt-[0.6cqw] text-[3.2cqw] font-bold leading-tight text-lion-blue">{s.lecon.titre}</p>
            <div className="mt-[1cqw] h-[0.5cqw] w-[9cqw] bg-lion-gold" />
            <div className="mt-[2.5cqw] flex min-h-0 flex-1 gap-[3cqw] pb-[3cqw]">
              <ul className={`space-y-[1.2cqw] text-[2.2cqw] ${s.lecon.images?.length ? 'w-1/2' : 'w-full'}`}>
                {s.lecon.points.map((p, k) => (
                  <li key={k} className="flex gap-[1.2cqw]">
                    <span className="mt-[0.9cqw] h-[0.9cqw] w-[0.9cqw] shrink-0 rounded-full bg-lion-gold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {!!s.lecon.images?.length && (
                <div className={`grid min-h-0 w-1/2 gap-[1cqw] ${s.lecon.images.length > 1 ? 'grid-cols-2' : ''}`}>
                  {s.lecon.images.slice(0, 4).map((src, k) => (
                    <button key={src} onClick={() => setZoom({ images: s.lecon.images!, start: k })} className="min-h-0 overflow-hidden rounded-[0.6cqw] ring-1 ring-lion-blue/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full bg-white object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-[0.9cqw] bg-lion-gold" />
        </div>
      )}
      {s.kind === 'end' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lion-attitude-head.png" alt="" className="w-[14cqw]" />
          <p className="mt-[2cqw] text-[4cqw] font-bold text-lion-blue">Des questions ?</p>
          <p className="text-[1.8cqw] text-lion-ink/60">{PLATEFORME.nom}</p>
          <div className="absolute inset-x-0 bottom-0 h-[3cqw] bg-lion-blue" />
        </div>
      )}
    </div>
  )

  const controls = (
    <div className="flex items-center gap-2">
      <button className={btn} disabled={i === 0} onClick={() => go(-1)}>◀</button>
      <span className={`min-w-[4rem] text-center text-sm ${expanded ? 'text-white' : 'text-lion-ink/70'}`}>{i + 1} / {slides.length}</span>
      <button className={btn} disabled={i === last} onClick={() => go(1)}>▶</button>
      <button className={`${btn} ml-auto`} onClick={() => setExpanded(v => !v)}>{expanded ? '⤡ Réduire' : '⤢ Agrandir'}</button>
    </div>
  )

  return (
    <>
      {expanded ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-lion-ink p-3">
          <div className="w-full" style={{ maxWidth: 'calc((100vh - 5rem) * 16 / 9)' }}>
            {slide}
            <div className="mt-3">{controls}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-lion-blue/15 bg-lion-blue/[0.03] p-3">
          <p className="text-sm font-semibold text-lion-blue">🎞️ Présentation</p>
          {slide}
          {controls}
        </div>
      )}
      {zoom && <Lightbox images={zoom.images} start={zoom.start} onClose={() => setZoom(null)} />}
    </>
  )
}
