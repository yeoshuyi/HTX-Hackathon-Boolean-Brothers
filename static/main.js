// Main initialization and coordination
console.log("[v0] Main.js starting to load...")

try {
  console.log("[v0] Importing modules...")

  const uiModule = await import("./ui.js")
  const markersModule = await import("./markers.js")
  const annotationsModule = await import("./annotations.js")
  const heatmapModule = await import("./heatmap.js")
  const rulerModule = await import("./ruler.js")
  const controlsModule = await import("./controls.js")
  const canvasModule = await import("./canvas.js")
  const floorplanModule = await import("./floorplan.js")
  const dataModule = await import("./data.js")

  console.log("[v0] All modules imported successfully")

  const { initFirefighterList, initFirefighterMarkers, initTimer } = uiModule
  const { initStartEndMarkers, addDynamicMarker } = markersModule
  const { initAnnotationTools, isErasing, setMarkerReferences } = annotationsModule
  const { initHeatmapToggle, invalidateHeatmapCache, drawHeatmap } = heatmapModule
  const { initRulerTool } = rulerModule
  const { initGenerateButton, initClearButton, initLocationsToggle, initAnalysisButton } = controlsModule
  const { resizeCanvasPreserve } = canvasModule
  const { initFloorplanControls } = floorplanModule
  const { dynMarkers } = dataModule

  // DOM elements
  console.log("[v0] Getting DOM elements...")
  const floorplan = document.getElementById("floorplan")
  const mapContainer = document.querySelector(".map-container")
  const heatmapCanvas = document.getElementById("heatmapCanvas")
  const annotationCanvas = document.getElementById("annotationCanvas")
  const rulerCanvas = document.getElementById("rulerCanvas")
  const ctx = annotationCanvas.getContext("2d")

  const startMarker = document.getElementById("startMarker")
  const endMarker = document.getElementById("endMarker")

  const toggleAnnotationsBtn = document.getElementById("toggleAnnotations")
  const leftToolbar = document.getElementById("leftToolbar")
  const eraserBtn = document.getElementById("eraserBtn")
  const pencilBtn = document.getElementById("pencilBtn")
  const addFireBtn = document.getElementById("addFireBtn")
  const addCasualtyBtn = document.getElementById("addCasualtyBtn")

  const toggleLocationsBtn = document.getElementById("toggleLocations")
  const toggleHeatMapBtn = document.getElementById("toggleHeatMap")
  const toggleRulerBtn = document.getElementById("toggleRuler")
  const generateBtn = document.getElementById("generateBtn")
  const clearBtn = document.getElementById("clearBtn")
  const analysisBtn = document.getElementById("analysisBtn")

  console.log("[v0] DOM elements retrieved")

  // Initialize timer
  console.log("[v0] Initializing timer...")
  initTimer()

  // Initialize start/end markers
  console.log("[v0] Initializing start/end markers...")
  initStartEndMarkers(startMarker, endMarker, mapContainer, floorplan)

  // Initialize annotation tools
  console.log("[v0] Initializing annotation tools...")
  initAnnotationTools(annotationCanvas, ctx, toggleAnnotationsBtn, leftToolbar, pencilBtn, eraserBtn)

  setMarkerReferences(dynMarkers, invalidateHeatmapCache, drawHeatmap, floorplan, mapContainer, heatmapCanvas)

  // Initialize dynamic marker buttons
  console.log("[v0] Initializing dynamic marker buttons...")
  addFireBtn.addEventListener("click", () => {
    console.log("[v0] Add fire button clicked")
    addDynamicMarker("fire", mapContainer, floorplan, heatmapCanvas, isErasing)
  })
  addCasualtyBtn.addEventListener("click", () => {
    console.log("[v0] Add casualty button clicked")
    addDynamicMarker("casualty", mapContainer, floorplan, heatmapCanvas, isErasing)
  })

  // Initialize toggles
  console.log("[v0] Initializing toggles...")
  initLocationsToggle(toggleLocationsBtn)
  initHeatmapToggle(toggleHeatMapBtn, heatmapCanvas, floorplan, mapContainer)
  initRulerTool(toggleRulerBtn, rulerCanvas, mapContainer, floorplan)

  // Initialize control buttons
  console.log("[v0] Initializing control buttons...")
  initGenerateButton(generateBtn, startMarker, endMarker, floorplan, mapContainer)
  initClearButton(
    clearBtn,
    startMarker,
    endMarker,
    floorplan,
    annotationCanvas,
    ctx,
    heatmapCanvas,
    mapContainer,
    rulerCanvas,
  )

  console.log("[v0] Initializing floorplan controls...")
  initFloorplanControls(floorplan, mapContainer, heatmapCanvas)

  console.log("[v0] Initializing analysis button...")
  initAnalysisButton(analysisBtn, floorplan, mapContainer, heatmapCanvas, annotationCanvas, rulerCanvas)

  console.log("[v0] All controls initialized successfully")

  // Canvas resize handling
  window.addEventListener("resize", () => {
    console.log("[v0] Window resized")
    resizeCanvasPreserve(floorplan, annotationCanvas, heatmapCanvas, rulerCanvas, ctx, mapContainer)
  })

  floorplan.onload = () => {
    console.log("[v0] Floorplan image loaded")
    resizeCanvasPreserve(floorplan, annotationCanvas, heatmapCanvas, rulerCanvas, ctx, mapContainer)
    initFirefighterList()
    initFirefighterMarkers(floorplan, mapContainer, heatmapCanvas)
  }

  // Fallback initialization
  setTimeout(() => {
    console.log("[v0] Timeout initialization triggered")
    resizeCanvasPreserve(floorplan, annotationCanvas, heatmapCanvas, rulerCanvas, ctx, mapContainer)
    initFirefighterList()
    initFirefighterMarkers(floorplan, mapContainer, heatmapCanvas)
  }, 100)

  console.log("[v0] Main.js initialization complete!")
} catch (error) {
  console.error("[v0] CRITICAL ERROR during initialization:", error)
  console.error("[v0] Error stack:", error.stack)
  alert("Failed to initialize application. Check console for details.")
}
