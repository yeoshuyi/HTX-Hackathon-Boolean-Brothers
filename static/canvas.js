// Canvas management and resizing
import { initFirefighterMarkers } from "./ui.js"
import { drawHeatmap } from "./heatmap.js"
import { drawRuler } from "./ruler.js"

export function resizeCanvasPreserve(floorplan, annotationCanvas, heatmapCanvas, rulerCanvas, ctx, mapContainer) {
  const temp = document.createElement("canvas")
  temp.width = annotationCanvas.width
  temp.height = annotationCanvas.height
  const tctx = temp.getContext("2d")
  tctx.drawImage(annotationCanvas, 0, 0)

  annotationCanvas.width = floorplan.clientWidth
  annotationCanvas.height = floorplan.clientHeight
  heatmapCanvas.width = floorplan.clientWidth
  heatmapCanvas.height = floorplan.clientHeight
  rulerCanvas.width = floorplan.clientWidth
  rulerCanvas.height = floorplan.clientHeight

  ctx.drawImage(temp, 0, 0, temp.width, temp.height, 0, 0, annotationCanvas.width, annotationCanvas.height)

  if (document.getElementById("locationsLayer").style.display !== "none") {
    initFirefighterMarkers(floorplan, mapContainer, heatmapCanvas)
  }

  if (heatmapCanvas.style.display !== "none") drawHeatmap(floorplan, mapContainer, heatmapCanvas)
  if (rulerCanvas.style.display !== "none") drawRuler(floorplan, mapContainer, rulerCanvas)
}
