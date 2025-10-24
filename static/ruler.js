// Ruler measurement tool
import { rulerPoints } from "./data.js"
import { getImageFitRect, distanceToSegment } from "./utils.js"

export let rulerEnabled = false
export let rulerDragging = null
const FLOORPLAN_WIDTH_METERS = 20

export function setRulerDragging(value) {
  rulerDragging = value
}

export function createRulerPoint(x, y, mapContainer, floorplan, rulerCanvas, dragOffsetX, dragOffsetY) {
  const marker = document.createElement("div")
  marker.className = "ruler-marker"
  marker.style.left = `${x}px`
  marker.style.top = `${y}px`
  marker.style.display = rulerEnabled ? "block" : "none"

  marker.addEventListener("pointerdown", (e) => {
    rulerDragging = marker
    const r = marker.getBoundingClientRect()
    dragOffsetX = e.clientX - r.left
    dragOffsetY = e.clientY - r.top
    marker.setPointerCapture(e.pointerId)
    e.stopPropagation()
  })

  marker.addEventListener("pointermove", (e) => {
    if (rulerDragging !== marker) return
    const containerRect = mapContainer.getBoundingClientRect()
    let newX = e.clientX - containerRect.left - dragOffsetX + marker.offsetWidth / 2
    let newY = e.clientY - containerRect.top - dragOffsetY + marker.offsetHeight / 2

    const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
    const minX = offsetX,
      minY = offsetY,
      maxX = offsetX + displayWidth,
      maxY = offsetY + displayHeight

    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))

    marker.style.left = `${newX}px`
    marker.style.top = `${newY}px`

    const point = rulerPoints.find((p) => p.el === marker)
    if (point) {
      point.x = newX
      point.y = newY
    }

    drawRuler(floorplan, mapContainer, rulerCanvas)
    e.stopPropagation()
  })

  marker.addEventListener("pointerup", (e) => {
    if (rulerDragging !== marker) return
    marker.releasePointerCapture(e.pointerId)
    rulerDragging = null
    e.stopPropagation()
  })

  mapContainer.appendChild(marker)
  return marker
}

export function drawRuler(floorplan, mapContainer, rulerCanvas) {
  if (!rulerEnabled || rulerPoints.length < 2) return

  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
  const W = rulerCanvas.width,
    H = rulerCanvas.height
  const rctx = rulerCanvas.getContext("2d")

  rctx.clearRect(0, 0, W, H)

  const containerRect = mapContainer.getBoundingClientRect()

  let totalDistPx = 0
  for (let i = 0; i < rulerPoints.length - 1; i++) {
    const p1 = rulerPoints[i]
    const p2 = rulerPoints[i + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    totalDistPx += Math.sqrt(dx * dx + dy * dy)
  }

  const totalDistMeters = (totalDistPx / displayWidth) * FLOORPLAN_WIDTH_METERS

  rctx.strokeStyle = "#0d7bdb"
  rctx.lineWidth = 2
  rctx.beginPath()
  rctx.moveTo(rulerPoints[0].x, rulerPoints[0].y)
  for (let i = 1; i < rulerPoints.length; i++) {
    rctx.lineTo(rulerPoints[i].x, rulerPoints[i].y)
  }
  rctx.stroke()

  const pxPerMeter = displayWidth / FLOORPLAN_WIDTH_METERS
  let accumulatedDist = 0

  for (let i = 0; i < rulerPoints.length - 1; i++) {
    const p1 = rulerPoints[i]
    const p2 = rulerPoints[i + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const segmentLength = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    let distInSegment = 0
    while (distInSegment < segmentLength) {
      const nextTickDist = Math.ceil((accumulatedDist + distInSegment) / pxPerMeter) * pxPerMeter
      const tickDistInSegment = nextTickDist - accumulatedDist

      if (tickDistInSegment > segmentLength) break
      if (tickDistInSegment <= 0) {
        distInSegment = pxPerMeter
        continue
      }

      const t = tickDistInSegment / segmentLength
      const tickX = p1.x + dx * t
      const tickY = p1.y + dy * t

      const perpAngle = angle + Math.PI / 2
      const tickLen = 8
      const tx1 = tickX + Math.cos(perpAngle) * tickLen
      const ty1 = tickY + Math.sin(perpAngle) * tickLen
      const tx2 = tickX - Math.cos(perpAngle) * tickLen
      const ty2 = tickY - Math.sin(perpAngle) * tickLen

      rctx.strokeStyle = "#0d7bdb"
      rctx.lineWidth = 1.5
      rctx.beginPath()
      rctx.moveTo(tx1, ty1)
      rctx.lineTo(tx2, ty2)
      rctx.stroke()

      distInSegment = tickDistInSegment + pxPerMeter
    }

    accumulatedDist += segmentLength
  }

  const midDist = totalDistPx / 2
  let currentDist = 0
  let midX = 0,
    midY = 0,
    midAngle = 0

  for (let i = 0; i < rulerPoints.length - 1; i++) {
    const p1 = rulerPoints[i]
    const p2 = rulerPoints[i + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const segmentLength = Math.sqrt(dx * dx + dy * dy)

    if (currentDist + segmentLength >= midDist) {
      const t = (midDist - currentDist) / segmentLength
      midX = p1.x + dx * t
      midY = p1.y + dy * t
      midAngle = Math.atan2(dy, dx)
      break
    }
    currentDist += segmentLength
  }

  const labelOffset = 20
  const labelX = midX + Math.cos(midAngle + Math.PI / 2) * labelOffset
  const labelY = midY + Math.sin(midAngle + Math.PI / 2) * labelOffset

  const labelText = `${totalDistMeters.toFixed(2)}m`

  rctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif"
  rctx.textAlign = "center"
  rctx.textBaseline = "middle"
  const metrics = rctx.measureText(labelText)
  const padding = 6

  rctx.fillStyle = "#2a2a2a"
  rctx.fillRect(labelX - metrics.width / 2 - padding, labelY - 8, metrics.width + padding * 2, 16)

  rctx.strokeStyle = "#3f3f3f"
  rctx.lineWidth = 1
  rctx.strokeRect(labelX - metrics.width / 2 - padding, labelY - 8, metrics.width + padding * 2, 16)

  rctx.fillStyle = "#ffffff"
  rctx.fillText(labelText, labelX, labelY)
}

export function initRulerTool(toggleRulerBtn, rulerCanvas, mapContainer, floorplan, dragOffsetX, dragOffsetY) {
  toggleRulerBtn.addEventListener("click", () => {
    rulerEnabled = !rulerEnabled
    toggleRulerBtn.classList.toggle("active", rulerEnabled)
    rulerCanvas.style.display = rulerEnabled ? "block" : "none"

    if (rulerEnabled) {
      if (rulerPoints.length === 0) {
        const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
        const marker1 = createRulerPoint(
          offsetX + displayWidth * 0.3,
          offsetY + displayHeight * 0.5,
          mapContainer,
          floorplan,
          rulerCanvas,
          dragOffsetX,
          dragOffsetY,
        )
        const marker2 = createRulerPoint(
          offsetX + displayWidth * 0.7,
          offsetY + displayHeight * 0.5,
          mapContainer,
          floorplan,
          rulerCanvas,
          dragOffsetX,
          dragOffsetY,
        )
        rulerPoints.push({ x: offsetX + displayWidth * 0.3, y: offsetY + displayHeight * 0.5, el: marker1 })
        rulerPoints.push({ x: offsetX + displayWidth * 0.7, y: offsetY + displayHeight * 0.5, el: marker2 })
      } else {
        rulerPoints.forEach((p) => (p.el.style.display = "block"))
      }
      drawRuler(floorplan, mapContainer, rulerCanvas)
    } else {
      rulerPoints.forEach((p) => (p.el.style.display = "none"))
    }
  })

  rulerCanvas.addEventListener("click", (e) => {
    if (!rulerEnabled || rulerPoints.length < 2) return

    const containerRect = mapContainer.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left
    const clickY = e.clientY - containerRect.top

    const threshold = 10

    for (let i = 0; i < rulerPoints.length - 1; i++) {
      const p1 = rulerPoints[i]
      const p2 = rulerPoints[i + 1]

      const dist = distanceToSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y)

      if (dist < threshold) {
        const newMarker = createRulerPoint(
          clickX,
          clickY,
          mapContainer,
          floorplan,
          rulerCanvas,
          dragOffsetX,
          dragOffsetY,
        )

        rulerPoints.splice(i + 1, 0, { x: clickX, y: clickY, el: newMarker })

        drawRuler(floorplan, mapContainer, rulerCanvas)
        break
      }
    }
  })
}
