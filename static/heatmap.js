// Heat map visualization
import { firefighters, dynMarkers } from "./data.js"
import { getImageFitRect, hexToRGBA, seededRand } from "./utils.js"

const PALETTE = [
  "#2a6df2",
  "#2cc9e4",
  "#3e53e5",
  "#7a3fe6",
  "#c934c1",
  "#f24aa8",
  "#ff6f91",
  "#ff8b57",
  "#ffa63a",
  "#ffc43a",
  "#ffe04a",
].map((hex) => hexToRGBA(hex, 110))

let heatmapCache = null
let lastSourcesHash = ""

function getNormalizedXYFromEl(el, floorplan, mapContainer) {
  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
  const containerRect = mapContainer.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const cx = r.left - containerRect.left + r.width / 2
  const cy = r.top - containerRect.top + r.height / 2
  return [(cx - offsetX) / displayWidth, (cy - offsetY) / displayHeight]
}

export function drawHeatmap(floorplan, mapContainer, heatmapCanvas) {
  const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
  const W = heatmapCanvas.width,
    H = heatmapCanvas.height
  const hctx = heatmapCanvas.getContext("2d")

  hctx.clearRect(0, 0, W, H)
  hctx.save()
  hctx.beginPath()
  hctx.rect(offsetX, offsetY, displayWidth, displayHeight)
  hctx.clip()

  const sources = []

  dynMarkers
    .filter((m) => m.type === "fire")
    .forEach((m) => {
      const [nx, ny] = getNormalizedXYFromEl(m.el, floorplan, mapContainer)
      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) sources.push({ x: nx, y: ny, power: 1.0 })
    })

  if (sources.length === 0) {
    firefighters.forEach((ff) => {
      const p = Math.min(1, (100 - ff.o2) / 100)
      if (p > 0.15) sources.push({ x: ff.x / 100, y: ff.y / 100, power: 0.5 * p })
    })
  }

  if (sources.length > 0) {
    sources.push({ x: 0.5, y: 0.5, power: 0.18 })
    const rand = seededRand(Math.floor(Date.now() / 60000))
    for (let i = 0; i < 10; i++) {
      sources.push({ x: 0.08 + 0.84 * rand(), y: 0.08 + 0.84 * rand(), power: 0.05 + 0.1 * rand() })
    }
  } else {
    hctx.restore()
    return
  }

  const sourcesHash = JSON.stringify(sources.map((s) => [s.x.toFixed(3), s.y.toFixed(3), s.power.toFixed(2)]))
  if (heatmapCache && lastSourcesHash === sourcesHash) {
    hctx.putImageData(heatmapCache, 0, 0)
    hctx.filter = "blur(2px)"
    hctx.drawImage(heatmapCanvas, 0, 0)
    hctx.filter = "none"
    hctx.restore()
    return
  }

  const baseSigma = Math.max(displayWidth, displayHeight) * 0.16
  const inv2s1 = 1 / (2 * baseSigma * baseSigma)
  const inv2s2 = 1 / (2 * (baseSigma * 0.55) * (baseSigma * 0.55))

  const sumPower = Math.max(
    0.1,
    sources.reduce((a, s) => a + s.power, 0),
  )

  const step = Math.max(2, Math.floor(Math.min(W, H) / 300))
  const imgData = hctx.createImageData(W, H)
  const data = imgData.data

  const LEVELS = 2 * PALETTE.length

  const normalizedPower = 0.9 * sumPower

  for (let y = Math.floor(offsetY); y < offsetY + displayHeight; y += step) {
    for (let x = Math.floor(offsetX); x < offsetX + displayWidth; x += step) {
      const nx = (x - offsetX) / displayWidth
      const ny = (y - offsetY) / displayHeight

      let v1 = 0,
        v2 = 0

      for (const s of sources) {
        const dx = (nx - s.x) * displayWidth
        const dy = (ny - s.y) * displayHeight
        const d2 = dx * dx + dy * dy

        const exp1 = Math.min(20, -d2 * inv2s1)
        const exp2 = Math.min(20, -d2 * inv2s2)

        const contrib1 = s.power * Math.exp(exp1)
        const contrib2 = s.power * Math.exp(exp2)

        v1 += Math.min(100, contrib1)
        v2 += Math.min(100, contrib2)
      }

      if (!isFinite(v1)) v1 = 0
      if (!isFinite(v2)) v2 = 0

      let t = (0.65 * v1 + 0.35 * v2) / normalizedPower
      t = Math.max(0, Math.min(1, t))
      const band = Math.min(LEVELS - 1, Math.floor(t * LEVELS))
      const [r, g, b, a] = PALETTE[band]

      for (let yy = 0; yy < step; yy++) {
        const py = y + yy
        if (py < 0 || py >= H) continue
        for (let xx = 0; xx < step; xx++) {
          const px = x + xx
          if (px < 0 || px >= W) continue
          const idx = (py * W + px) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = a
        }
      }
    }
  }

  heatmapCache = hctx.createImageData(W, H)
  heatmapCache.data.set(data)
  lastSourcesHash = sourcesHash

  hctx.putImageData(imgData, 0, 0)

  hctx.filter = "blur(2px)"
  hctx.drawImage(heatmapCanvas, 0, 0)
  hctx.filter = "none"

  hctx.restore()
}

export function invalidateHeatmapCache() {
  heatmapCache = null
  lastSourcesHash = ""
}

export function initHeatmapToggle(toggleHeatMapBtn, heatmapCanvas, floorplan, mapContainer) {
  toggleHeatMapBtn.addEventListener("click", () => {
    const active = toggleHeatMapBtn.classList.toggle("active")
    heatmapCanvas.style.display = active ? "block" : "none"
    if (active) drawHeatmap(floorplan, mapContainer, heatmapCanvas, true)
  })
}
