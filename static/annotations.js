// Annotation drawing functionality
export let isDrawingEnabled = false
export let drawing = false
export let lastX = 0
export let lastY = 0
export let isErasing = false
export let penColor = "#000000"

let dynMarkersRef = []
let invalidateHeatmapCacheRef = null
let drawHeatmapRef = null
let floorplanRef = null
let mapContainerRef = null
let heatmapCanvasRef = null

export function setIsDrawingEnabled(value) {
  isDrawingEnabled = value
}

export function setIsErasing(value) {
  isErasing = value
}

export function setPenColor(color) {
  penColor = color
}

export function setMarkerReferences(
  dynMarkers,
  invalidateHeatmapCache,
  drawHeatmap,
  floorplan,
  mapContainer,
  heatmapCanvas,
) {
  dynMarkersRef = dynMarkers
  invalidateHeatmapCacheRef = invalidateHeatmapCache
  drawHeatmapRef = drawHeatmap
  floorplanRef = floorplan
  mapContainerRef = mapContainer
  heatmapCanvasRef = heatmapCanvas
}

export function getCanvasPos(e, annotationCanvas) {
  const rect = annotationCanvas.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

function checkAndRemoveMarker(x, y, annotationCanvas) {
  if (!isErasing || dynMarkersRef.length === 0) return false

  const canvasRect = annotationCanvas.getBoundingClientRect()
  const absoluteX = canvasRect.left + x
  const absoluteY = canvasRect.top + y

  // Check each marker to see if click is within its bounds
  for (let i = dynMarkersRef.length - 1; i >= 0; i--) {
    const marker = dynMarkersRef[i]
    const markerRect = marker.el.getBoundingClientRect()

    if (
      absoluteX >= markerRect.left &&
      absoluteX <= markerRect.right &&
      absoluteY >= markerRect.top &&
      absoluteY <= markerRect.bottom
    ) {
      // Remove the marker
      marker.el.remove()
      dynMarkersRef.splice(i, 1)

      // Invalidate heatmap cache and redraw if heatmap is visible
      if (invalidateHeatmapCacheRef) invalidateHeatmapCacheRef()
      if (heatmapCanvasRef && heatmapCanvasRef.style.display !== "none" && drawHeatmapRef) {
        drawHeatmapRef(floorplanRef, mapContainerRef, heatmapCanvasRef)
      }

      return true
    }
  }

  return false
}

export function beginStroke(e, annotationCanvas) {
  if (!isDrawingEnabled) return

  const [x, y] = getCanvasPos(e, annotationCanvas)

  if (checkAndRemoveMarker(x, y, annotationCanvas)) {
    return // Don't start drawing if we removed a marker
  }

  drawing = true
  ;[lastX, lastY] = [x, y]
}

export function moveStroke(e, annotationCanvas, ctx) {
  if (!isDrawingEnabled || !drawing) return
  const [x, y] = getCanvasPos(e, annotationCanvas)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.lineWidth = isErasing ? 18 : 3.5
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over"
  if (!isErasing) ctx.strokeStyle = penColor
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  ;[lastX, lastY] = [x, y]
}

export function endStroke() {
  drawing = false
}

export function initAnnotationTools(annotationCanvas, ctx, toggleAnnotationsBtn, leftToolbar, pencilBtn, eraserBtn) {
  toggleAnnotationsBtn.addEventListener("click", () => {
    isDrawingEnabled = !isDrawingEnabled
    annotationCanvas.style.display = isDrawingEnabled ? "block" : "none"
    toggleAnnotationsBtn.classList.toggle("active", isDrawingEnabled)
    leftToolbar.style.display = isDrawingEnabled ? "flex" : "none"
  })

  pencilBtn.addEventListener("click", () => {
    isErasing = false
    pencilBtn.classList.add("active")
    eraserBtn.classList.remove("active")
  })

  eraserBtn.addEventListener("click", () => {
    isErasing = true
    eraserBtn.classList.add("active")
    pencilBtn.classList.remove("active")
  })

  document.querySelectorAll(".color-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".color-chip").forEach((c) => c.classList.remove("selected"))
      chip.classList.add("selected")
      penColor = chip.dataset.color || "#ffffff"
    })
  })

  annotationCanvas.addEventListener("mousedown", (e) => beginStroke(e, annotationCanvas))
  annotationCanvas.addEventListener("mousemove", (e) => moveStroke(e, annotationCanvas, ctx))
  annotationCanvas.addEventListener("mouseup", endStroke)
  annotationCanvas.addEventListener("mouseleave", endStroke)
  annotationCanvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault()
      beginStroke(e.touches[0], annotationCanvas)
    },
    { passive: false },
  )
  annotationCanvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault()
      moveStroke(e.touches[0], annotationCanvas, ctx)
    },
    { passive: false },
  )
  annotationCanvas.addEventListener("touchend", endStroke)
  annotationCanvas.addEventListener("touchcancel", endStroke)
}
