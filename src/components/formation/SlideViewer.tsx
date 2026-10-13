'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Episode, Lecon } from '@/data/formation'
import { contraste, googleFontsUrl, type Theme } from '@/data/theme'
import { Lightbox } from './Lightbox'

type Slide =
  | { kind: 'cover' }
  | { kind: 'sommaire' }
  | { kind: 'lecon'; index: number; lecon: Lecon }
  | { kind: 'end' }

const pad = (n: number) => String(n).padStart(2, '0')

// Les tailles en cqw suivent la largeur de la diapositive : même rendu en petit et en plein écran.
export function SlideViewer({ formationTitre, episode, theme }: { formationTitre: string; episode: Episode; theme: Theme }) {
  const slides: Slide[] = [
    { kind: 'cover' },
    ...(episode.lecons.length > 1 ? [{ kind: 'sommaire' as const }] : []),
    ...episode.lecons.map((lecon, index) => ({ kind: 'lecon' as const, index, lecon })),
    { kind: 'end' },
  ]
  const [i, setI] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(false)
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

  // Défilement automatique : s'arrête sur la dernière diapositive.
  useEffect(() => {
    if (!playing || !theme.autoSecondes) return
    if (i >= last) return setPlaying(false)
    const t = setTimeout(() => go(1), theme.autoSecondes * 1000)
    return () => clearTimeout(t)
  }, [playing, i, last, go, theme.autoSecondes])

  const s = slides[Math.min(i, last)]
  const onSection = contraste(theme.section)
  const anim = theme.animation
  const item = (k: number) => (anim === 'aucune' ? {} : { animation: `la-item .5s ease-out both`, animationDelay: `${0.25 + k * 0.18}s` })
  const fonts = googleFontsUrl([theme.policeTitre, theme.policeTexte])
  const tFont = { fontFamily: `'${theme.policeTitre}', sans-serif` }
  const bFont = { fontFamily: `'${theme.policeTexte}', sans-serif` }

  const logo = (cls: string, style?: React.CSSProperties) =>
    theme.logo && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={theme.logo} alt="" className={`object-contain ${cls}`} style={style} />
    )

  const content = (
    <>
      {s.kind === 'cover' && (
        <div className="absolute inset-0 flex items-center px-[7cqw]" style={{ background: theme.section, color: onSection }}>
          <div className="absolute inset-y-0 left-0 w-[1.2cqw]" style={{ background: theme.accent }} />
          <div className="flex-1 pr-[4cqw]">
            <p className="text-[1.5cqw] font-semibold uppercase tracking-[0.35em]" style={{ ...bFont, color: theme.accent, ...item(0) }}>
              {formationTitre}
            </p>
            <p className="mt-[2cqw] text-[5.2cqw] font-bold leading-[1.08]" style={{ ...tFont, ...item(1) }}>{episode.titre}</p>
            {episode.resume && <p className="mt-[2cqw] max-w-[48cqw] text-[1.9cqw] opacity-80" style={{ ...bFont, ...item(2) }}>{episode.resume}</p>}
            <div className="mt-[3cqw] flex items-center gap-[1.5cqw]" style={item(3)}>
              <div className="h-[0.5cqw] w-[8cqw]" style={{ background: theme.accent }} />
              <span className="text-[1.5cqw] font-semibold uppercase tracking-[0.2em]" style={bFont}>Module {pad(episode.numero)}</span>
            </div>
          </div>
          {theme.logo && (
            <div className="flex h-[24cqw] w-[24cqw] shrink-0 items-center justify-center rounded-full bg-white p-[3cqw] shadow-2xl" style={item(1)}>
              {logo('h-full w-full')}
            </div>
          )}
        </div>
      )}

      {s.kind === 'sommaire' && (
        <div className="absolute inset-0 flex" style={{ background: theme.fond, color: theme.texte }}>
          <div className="flex w-[34%] flex-col justify-center px-[5cqw]" style={{ background: theme.section, color: onSection }}>
            <p className="text-[1.4cqw] uppercase tracking-[0.3em]" style={{ ...bFont, color: theme.accent }}>Module {pad(episode.numero)}</p>
            <p className="mt-[1.5cqw] text-[4cqw] font-bold leading-tight" style={tFont}>Au programme</p>
          </div>
          <ol className="flex flex-1 flex-col justify-center gap-[1.6cqw] px-[5cqw]" style={bFont}>
            {episode.lecons.slice(0, 8).map((l, k) => (
              <li key={k} className="flex items-center gap-[2cqw]" style={item(k)}>
                <span className="flex h-[4cqw] w-[4cqw] shrink-0 items-center justify-center rounded-full text-[1.6cqw] font-bold" style={{ background: theme.accent, color: contraste(theme.accent) }}>
                  {pad(k + 1)}
                </span>
                <span className="text-[2cqw] font-semibold">{l.titre}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {s.kind === 'lecon' && (
        <div className="absolute inset-0 flex flex-col px-[5cqw] pb-[3.5cqw] pt-[4cqw]" style={{ background: theme.fond, color: theme.texte }}>
          {logo('absolute right-[4cqw] top-[3cqw] h-[5.5cqw] w-[5.5cqw] rounded-[0.6cqw] bg-white p-[0.4cqw]')}
          <div className="flex items-end gap-[2cqw]" style={item(0)}>
            <span className="text-[7cqw] font-bold leading-none" style={{ ...tFont, color: theme.accent }}>{pad(s.index + 1)}</span>
            <div className="pb-[0.8cqw] pr-[8cqw]">
              <p className="text-[1.3cqw] uppercase tracking-[0.25em] opacity-60" style={bFont}>Leçon {s.index + 1}</p>
              <p className="text-[3.4cqw] font-bold leading-tight" style={{ ...tFont, color: theme.titre }}>{s.lecon.titre}</p>
            </div>
          </div>
          <div className="mt-[1.8cqw] h-[0.35cqw] w-full opacity-30" style={{ background: theme.accent }} />
          <div className="mt-[3cqw] flex min-h-0 flex-1 gap-[3.5cqw]">
            <ul className={`space-y-[1.8cqw] text-[2.3cqw] leading-snug ${s.lecon.images?.length ? 'w-[48%]' : 'w-full'}`} style={bFont}>
              {s.lecon.points.map((p, k) => (
                <li key={k} className="flex gap-[1.6cqw]" style={item(k + 1)}>
                  <span className="mt-[0.75cqw] h-[1.1cqw] w-[1.1cqw] shrink-0 rotate-45 rounded-[0.2cqw]" style={{ background: theme.accent }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {!!s.lecon.images?.length && (
              <div className={`grid min-h-0 flex-1 gap-[1.2cqw] ${s.lecon.images.length > 1 ? 'grid-cols-2' : ''}`} style={item(2)}>
                {s.lecon.images.slice(0, 4).map((src, k) => (
                  <button
                    key={src}
                    onClick={() => setZoom({ images: s.lecon.images!, start: k })}
                    className="min-h-0 overflow-hidden rounded-[0.8cqw] bg-white shadow-lg ring-1 ring-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="absolute inset-x-[5cqw] bottom-[1.6cqw] flex justify-between text-[1.1cqw] opacity-50" style={bFont}>
            <span>{formationTitre} · Module {episode.numero}</span>
            <span>{i + 1}</span>
          </div>
        </div>
      )}

      {s.kind === 'end' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: theme.section, color: onSection }}>
          {theme.logo && (
            <div className="mb-[3cqw] flex h-[14cqw] w-[14cqw] items-center justify-center rounded-full bg-white p-[2cqw] shadow-2xl" style={item(0)}>
              {logo('h-full w-full')}
            </div>
          )}
          <p className="text-[5cqw] font-bold" style={{ ...tFont, ...item(1) }}>Merci !</p>
          <p className="mt-[1cqw] text-[2.2cqw] opacity-80" style={{ ...bFont, ...item(2) }}>Des questions ?</p>
          <div className="mt-[2.5cqw] h-[0.5cqw] w-[8cqw]" style={{ background: theme.accent, ...item(3) }} />
        </div>
      )}
    </>
  )

  const slide = (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-sm ring-1 ring-black/10" style={{ containerType: 'inline-size', background: theme.fond }}>
      <div
        key={i}
        className="absolute inset-0"
        style={anim === 'aucune' ? undefined : { animation: `la-${anim} .55s cubic-bezier(.2,.7,.2,1) both` }}
      >
        {content}
      </div>
    </div>
  )

  const btn = 'rounded-md border border-lion-blue/20 bg-white px-3 py-1 text-sm text-lion-blue disabled:opacity-30'
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btn} disabled={i === 0} onClick={() => go(-1)}>◀</button>
      <span className={`min-w-[4rem] text-center text-sm ${expanded ? 'text-white' : 'text-lion-ink/70'}`}>{i + 1} / {slides.length}</span>
      <button className={btn} disabled={i === last} onClick={() => go(1)}>▶</button>
      {theme.autoSecondes > 0 && (
        <button
          className={btn}
          onClick={() => {
            if (!playing && i === last) setI(0)
            setPlaying(p => !p)
          }}
        >
          {playing ? '⏸ Pause' : `⏵ Défilement auto (${theme.autoSecondes}s)`}
        </button>
      )}
      <button className={`${btn} ml-auto`} onClick={() => setExpanded(v => !v)}>{expanded ? '⤡ Réduire' : '⤢ Agrandir'}</button>
    </div>
  )

  // Un seul élément racine : une marge héritée du parent (space-y) ne décale pas le plein écran.
  return (
    <div>
      {fonts && <link rel="stylesheet" href={fonts} />}
      <style>{`
        @keyframes la-fondu { from { opacity: 0 } to { opacity: 1 } }
        @keyframes la-glissement { from { opacity: 0; transform: translateX(6%) } to { opacity: 1; transform: none } }
        @keyframes la-zoom { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: none } }
        @keyframes la-item { from { opacity: 0; transform: translateY(1.2cqw) } to { opacity: 1; transform: none } }
      `}</style>
      {expanded ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black p-3">
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
    </div>
  )
}
