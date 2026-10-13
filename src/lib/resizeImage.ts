// Réduit une photo avant l'envoi (max 1600 px de côté, JPEG), pour rester sous la limite d'envoi.
export async function resizeImage(file: File, max = 1600): Promise<Blob> {
  if (file.type === 'image/gif') return file // garde l'animation
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#FFFFFF' // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Conversion impossible'))), 'image/jpeg', 0.85),
  )
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await resizeImage(file)
  const form = new FormData()
  form.append('file', blob, file.type === 'image/gif' ? file.name : 'image.jpg')
  const res = await fetch('/api/formation/upload', { method: 'POST', body: form })
  const d = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(d.error || 'Envoi impossible')
  return d.url
}
