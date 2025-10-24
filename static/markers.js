// Marker management (start/end/dynamic markers)
import { getImageFitRect } from "./utils.js"
import { dynMarkers, setDynMarkers, setStartPoint, setGoalPoint } from "./data.js"
import { drawHeatmap, invalidateHeatmapCache } from "./heatmap.js"

export let dragging = null
export let dragOffsetX = 0
export let dragOffsetY = 0

export function setDragging(value) {
  dragging = value
}

export function setDragOffset(x, y) {
  dragOffsetX = x
  dragOffsetY = y
}

export function computeNormalizedForMarker(marker, floorplan, mapContainer) {
  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
  const containerRect = mapContainer.getBoundingClientRect()
  const markerRect = marker.getBoundingClientRect()
  const cx = markerRect.left - containerRect.left + markerRect.width / 2
  const cy = markerRect.top - containerRect.top + markerRect.height / 2

  if (cx < offsetX || cy < offsetY || cx > offsetX + displayWidth || cy > offsetY + displayHeight) return null
  const nx = (cx - offsetX) / displayWidth
  const ny = (cy - offsetY) / displayHeight
  return [nx, ny]
}

export function initStartEndMarkers(startMarker, endMarker, mapContainer, floorplan) {
  ;[startMarker, endMarker].forEach((marker) => {
    marker.addEventListener("pointerdown", (e) => {
      dragging = marker
      const r = marker.getBoundingClientRect()
      dragOffsetX = e.clientX - r.left
      dragOffsetY = e.clientY - r.top
      marker.setPointerCapture(e.pointerId)
    })
    marker.addEventListener("pointerup", (e) => {
      if (!dragging) return
      dragging.releasePointerCapture(e.pointerId)
      dragging = null
      const nxny = computeNormalizedForMarker(marker, floorplan, mapContainer)
      if (marker === startMarker) setStartPoint(nxny)
      else if (marker === endMarker) setGoalPoint(nxny)
      if (!nxny) marker.classList.add("invalid")
      else marker.classList.remove("invalid")
    })
  })

  mapContainer.addEventListener("pointermove", (e) => {
    if (!dragging) return
    const containerRect = mapContainer.getBoundingClientRect()
    let x = e.clientX - containerRect.left - dragOffsetX + dragging.offsetWidth / 2
    let y = e.clientY - containerRect.top - dragOffsetY + dragging.offsetHeight / 2

    const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
    const minX = offsetX,
      minY = offsetY,
      maxX = offsetX + displayWidth,
      maxY = offsetY + displayHeight

    x = Math.max(minX, Math.min(maxX, x))
    y = Math.max(minY, Math.min(maxY, y))

    dragging.style.left = `${x}px`
    dragging.style.top = `${y}px`
  })
}

export function addDynamicMarker(type, mapContainer, floorplan, heatmapCanvas, isErasing) {
  const el = document.createElement("div")
  el.className = "dyn-marker"
  el.dataset.type = type

  if (type === "fire") {
    el.innerHTML = '<span style="font-size:26px">🔥</span>'
  } else {
    el.innerHTML = `
      <svg class="icon-svg" viewBox="0 0 24 24" aria-label="Casualty">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#dc2626"/>
        <rect x="10.25" y="5" width="3.5" height="14" fill="white"/>
        <rect x="5" y="10.25" width="14" height="3.5" fill="white"/>
      </svg>`
  }

  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
  el.style.left = `${offsetX + displayWidth / 2}px`
  el.style.top = `${offsetY + displayHeight / 2}px`

  let localDragging = false,
    lx = 0,
    ly = 0
  let rafId = null

  el.addEventListener("pointerdown", (e) => {
    if (isErasing) {
      e.preventDefault()
      el.remove()
      setDynMarkers(dynMarkers.filter((m) => m.el !== el))
      invalidateHeatmapCache()
      if (heatmapCanvas.style.display !== "none") drawHeatmap(floorplan, mapContainer, heatmapCanvas)
      return
    }
    localDragging = true
    const r = el.getBoundingClientRect()
    lx = e.clientX - r.left
    ly = e.clientY - r.top
    el.setPointerCapture(e.pointerId)
  })
  el.addEventListener("pointermove", (e) => {
    if (!localDragging) return

    if (rafId) cancelAnimationFrame(rafId)

    const containerRect = mapContainer.getBoundingClientRect()
    let x = e.clientX - containerRect.left - lx + el.offsetWidth / 2
    let y = e.clientY - containerRect.top - ly + el.offsetHeight / 2

    const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
    const minX = offsetX,
      minY = offsetY,
      maxX = offsetX + displayWidth,
      maxY = offsetY + displayHeight

    x = Math.max(minX, Math.min(maxX, x))
    y = Math.max(minY, Math.min(maxY, y))

    el.style.left = `${x}px`
    el.style.top = `${y}px`

    if (heatmapCanvas.style.display !== "none") {
      rafId = requestAnimationFrame(() => {
        invalidateHeatmapCache()
        drawHeatmap(floorplan, mapContainer, heatmapCanvas)
      })
    }
  })
  el.addEventListener("pointerup", (e) => {
    if (!localDragging) return
    el.releasePointerCapture(e.pointerId)
    localDragging = false
    if (heatmapCanvas.style.display !== "none") {
      invalidateHeatmapCache()
      drawHeatmap(floorplan, mapContainer, heatmapCanvas)
    }
  })

  mapContainer.appendChild(el)
  dynMarkers.push({ el, type })
  if (heatmapCanvas.style.display !== "none") {
    invalidateHeatmapCache()
    drawHeatmap(floorplan, mapContainer, heatmapCanvas)
  }
}
