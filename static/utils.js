// Utility functions
export function getO2Color(o2) {
  if (o2 < 30) return "#dc2626"
  if (o2 < 50) return "#ef4444"
  if (o2 < 75) return "#eab308"
  return "#22c55e"
}

export function getImageFitRect(floorplan, mapContainer) {
  const containerRect = mapContainer.getBoundingClientRect()
  const naturalWidth = floorplan.naturalWidth || 1
  const naturalHeight = floorplan.naturalHeight || 1
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  const imageAspect = naturalWidth / naturalHeight
  const containerAspect = containerWidth / containerHeight

  let displayWidth, displayHeight, offsetX, offsetY
  if (imageAspect > containerAspect) {
    displayWidth = containerWidth
    displayHeight = containerWidth / imageAspect
    offsetX = 0
    offsetY = (containerHeight - displayHeight) / 2
  } else {
    displayHeight = containerHeight
    displayWidth = containerHeight * imageAspect
    offsetY = 0
    offsetX = (containerWidth - displayWidth) / 2
  }
  return { displayWidth, displayHeight, offsetX, offsetY }
}

export function hexToRGBA(hex, alpha = 160) {
  const h = hex.replace("#", "")
  const r = Number.parseInt(h.substring(0, 2), 16)
  const g = Number.parseInt(h.substring(2, 4), 16)
  const b = Number.parseInt(h.substring(4, 6), 16)
  return [r, g, b, alpha]
}

export function seededRand(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1))

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const projX = x1 + t * dx
  const projY = y1 + t * dy

  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY))
}
