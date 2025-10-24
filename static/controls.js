// Control panel handlers
import {
  setStartPoint,
  setGoalPoint,
  startPoint,
  goalPoint,
  dynMarkers,
  setDynMarkers,
  rulerPoints,
  setRulerPoints,
} from "./data.js"
import { computeNormalizedForMarker } from "./markers.js"
import { drawHeatmap } from "./heatmap.js"
import { drawRuler, createRulerPoint, rulerEnabled } from "./ruler.js"
import { getImageFitRect } from "./utils.js"
import { captureSnapshot, saveSnapshotToStorage } from "./snapshot.js"

export function initGenerateButton(generateBtn, startMarker, endMarker, floorplan, mapContainer) {
  generateBtn.addEventListener("click", async () => {
    console.log("[v0] Generate button clicked")
    let sp = startPoint
    let gp = goalPoint

    if (!sp) sp = computeNormalizedForMarker(startMarker, floorplan, mapContainer)
    if (!gp) gp = computeNormalizedForMarker(endMarker, floorplan, mapContainer)

    if (!sp || !gp) {
      alert("Please drag the Start 🚩 and End 🏁 markers onto the floorplan area.")
      return
    }

    setStartPoint(sp)
    setGoalPoint(gp)

    try {
      const res = await fetch("/run-maze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: sp, goal: gp }),
      })
      const data = await res.json()
      if (data.success) {
        floorplan.src = "static/floorplan2.png?cacheBust=" + Date.now()
      } else {
        alert("⚠️ " + data.error)
      }
    } catch (err) {
      alert("❌ Could not reach backend: " + err)
    }
  })
}

export function initClearButton(
  clearBtn,
  startMarker,
  endMarker,
  floorplan,
  annotationCanvas,
  ctx,
  heatmapCanvas,
  mapContainer,
  rulerCanvas,
) {
  clearBtn.addEventListener("click", () => {
    console.log("[v0] Clear button clicked")
    setStartPoint(null)
    setGoalPoint(null)
    startMarker.style.left = "60px"
    startMarker.style.top = "60px"
    endMarker.style.left = "160px"
    endMarker.style.top = "60px"
    startMarker.classList.remove("invalid")
    endMarker.classList.remove("invalid")
    floorplan.src = "static/floorplan1.png?cacheBust=" + Date.now()

    ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height)

    dynMarkers.forEach((m) => m.el.remove())
    setDynMarkers([])
    if (heatmapCanvas.style.display !== "none") drawHeatmap(floorplan, mapContainer, heatmapCanvas)

    rulerPoints.forEach((p) => p.el.remove())
    setRulerPoints([])
    if (rulerEnabled) {
      const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
      const marker1 = createRulerPoint(
        offsetX + displayWidth * 0.3,
        offsetY + displayHeight * 0.5,
        mapContainer,
        floorplan,
        rulerCanvas,
      )
      const marker2 = createRulerPoint(
        offsetX + displayWidth * 0.7,
        offsetY + displayHeight * 0.5,
        mapContainer,
        floorplan,
        rulerCanvas,
      )
      rulerPoints.push({ x: offsetX + displayWidth * 0.3, y: offsetY + displayHeight * 0.5, el: marker1 })
      rulerPoints.push({ x: offsetX + displayWidth * 0.7, y: offsetY + displayHeight * 0.5, el: marker2 })
      drawRuler(floorplan, mapContainer, rulerCanvas)
    }
  })
}

export function initLocationsToggle(toggleLocationsBtn) {
  toggleLocationsBtn.addEventListener("click", () => {
    console.log("[v0] Locations toggle clicked")
    const layer = document.getElementById("locationsLayer")
    const isOn = toggleLocationsBtn.classList.toggle("active")
    layer.style.display = isOn ? "block" : "none"
  })
}

export function initAnalysisButton(analysisBtn, floorplan, mapContainer, heatmapCanvas, annotationCanvas, rulerCanvas) {
  analysisBtn.addEventListener("click", () => {
    console.log("[v0] Analysis button clicked")
    // Capture current state
    const snapshotData = captureSnapshot(floorplan, mapContainer, heatmapCanvas, annotationCanvas, rulerCanvas)
    saveSnapshotToStorage(snapshotData)

    // Save dynamic markers data
    const dynMarkersData = dynMarkers.map((m) => ({ type: m.type }))
    localStorage.setItem("dynMarkersData", JSON.stringify(dynMarkersData))

    // Navigate to analysis page
    window.location.href = "/analysis"
  })
}
