// Snapshot functionality for analysis page
import { getImageFitRect } from "./utils.js"

export function captureSnapshot(floorplan, mapContainer, heatmapCanvas, annotationCanvas, rulerCanvas) {
  const canvas = document.createElement("canvas")
  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)

  canvas.width = displayWidth
  canvas.height = displayHeight
  const ctx = canvas.getContext("2d")

  // Draw floorplan
  ctx.drawImage(floorplan, offsetX, offsetY, displayWidth, displayHeight, 0, 0, displayWidth, displayHeight)

  // Draw heatmap if visible
  if (heatmapCanvas.style.display !== "none") {
    ctx.drawImage(heatmapCanvas, offsetX, offsetY, displayWidth, displayHeight, 0, 0, displayWidth, displayHeight)
  }

  // Draw annotations if visible
  if (annotationCanvas.style.display !== "none") {
    ctx.drawImage(annotationCanvas, offsetX, offsetY, displayWidth, displayHeight, 0, 0, displayWidth, displayHeight)
  }

  // Draw ruler if visible
  if (rulerCanvas.style.display !== "none") {
    ctx.drawImage(rulerCanvas, offsetX, offsetY, displayWidth, displayHeight, 0, 0, displayWidth, displayHeight)
  }

  return canvas.toDataURL("image/png")
}

export function saveSnapshotToStorage(snapshotData) {
  localStorage.setItem("mapSnapshot", snapshotData)
}

export function loadSnapshotFromStorage() {
  return localStorage.getItem("mapSnapshot")
}
