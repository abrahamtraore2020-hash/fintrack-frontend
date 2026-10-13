'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Tool = 'pen' | 'eraser'
interface Stroke {
  tool: Tool
  color: string
  size: number
  points: [number, number][] // normalisés 0..1, pour survivre au redimensionnement
}

const COLORS = ['#111111', '#E11D48', '#2563EB', '#06D6A0', '#EAB308']
const SIZES = [3, 6, 12]

export function Whiteboard() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const current = useRef<Stroke | null>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [expanded, setExpanded] = useState(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const s of [...strokes.current, ...(current.current ? [current.current] : [])]) {
      if (s.points.length === 0) continue
      ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.tool === 'eraser' ? s.size * 3 : s.size
      ctx.beginPath()
      s.points.forEach(([x, y], i) => {
        const px = x * canvas.width
        const py = y * canvas.height
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      if (s.points.length === 1) ctx.lineTo(s.points[0][0] * canvas.width + 0.01, s.points[0][1] * canvas.height)
      ctx.stroke()
    }
  }, [])

  // Adapte la résolution du canvas à sa taille affichée (y compris à l'agrandissement)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(r.width))
      canvas.height = Math.max(1, Math.round(r.height))
      redraw()
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [redraw])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const point = (e: React.PointerEvent): [number, number] => {
    const r = canvasRef.current!.getBoundingClientRect()
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
  }

  const onDown = (e: React.PointerEvent) => {
    canvasRef.current!.setPointerCapture(e.pointerId)
    current.current = { tool, color, size, points: [point(e)] }
    redraw()
  }
  const onMove = (e: React.PointerEvent) => {
    if (!current.current) return
    current.current.points.push(point(e))
    redraw()
  }
  const onUp = () => {
    if (!current.current) return
    strokes.current.push(current.current)
    current.current = null
  }

  const undo = () => {
    strokes.current.pop()
    redraw()
  }
  const clear = () => {
    strokes.current = []
    redraw()
  }

  const btn = (active: boolean) =>
    `rounded-md border px-2 py-1 text-sm ${active ? 'border-gold bg-gold/20 font-semibold' : 'border-gold/30'}`

  return (
    <div
      ref={wrapRef}
      className={
        expanded
          ? 'fixed inset-0 z-50 flex flex-col bg-white p-3 text-black'
          : 'flex flex-col rounded-xl border border-gold/30 bg-white p-2 text-black'
      }
    >
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button className={btn(tool === 'pen')} onClick={() => setTool('pen')}>✏️ Stylo</button>
        <button className={btn(tool === 'eraser')} onClick={() => setTool('eraser')}>🧽 Gomme</button>
        {COLORS.map(c => (
          <button
            key={c}
            aria-label={`Couleur ${c}`}
            onClick={() => { setColor(c); setTool('pen') }}
            className={`h-6 w-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-black' : 'border-transparent'}`}
            style={{ background: c }}
          />
        ))}
        {SIZES.map(s => (
          <button key={s} className={btn(size === s)} onClick={() => setSize(s)}>
            <span className="inline-block rounded-full bg-black align-middle" style={{ width: s + 2, height: s + 2 }} />
          </button>
        ))}
        <button className={btn(false)} onClick={undo}>↩️ Annuler</button>
        <button className={btn(false)} onClick={clear}>🗑️ Effacer tout</button>
        <button className={`${btn(false)} ml-auto`} onClick={() => setExpanded(v => !v)}>
          {expanded ? '⤡ Réduire' : '⤢ Agrandir'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={`w-full flex-1 cursor-crosshair rounded-md border border-gray-200 bg-white ${expanded ? '' : 'h-80'}`}
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}
