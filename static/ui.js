// UI initialization and updates
import { firefighters, setActivePopupMarker, activePopupMarker } from "./data.js"
import { getImageFitRect } from "./utils.js"
import { drawHeatmap } from "./heatmap.js"

export function initFirefighterList() {
  const list = document.getElementById("firefighterList")
  list.innerHTML = ""
  firefighters.forEach((ff) => {
    const card = document.createElement("div")
    card.className = "p-3 hover:bg-[#2d2d2d] transition-colors"
    const o2Class = ff.o2 < 30 ? "critical" : ff.o2 < 50 ? "low" : ff.o2 < 75 ? "medium" : "high"
    card.innerHTML = `<div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-sm bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-base font-semibold shadow-sm border border-[#3a3a3a]">${ff.id}</div>
      <div class="flex-1">
        <div class="font-medium text-xs">${ff.name}</div>
        <div class="text-xs text-gray-400 mt-0.5">O₂: ${ff.o2}%</div>
        <div class="w-full bg-[#1a1a1a] rounded-none h-1 mt-1.5 border border-[#333]">
          <div class="o2-bar ${o2Class}" style="width:${ff.o2}%"></div>
        </div>
      </div></div>`
    list.appendChild(card)
  })
}

export function initFirefighterMarkers(floorplan, mapContainer, heatmapCanvas) {
  const layer = document.getElementById("locationsLayer")
  layer.innerHTML = ""

  firefighters.forEach((ff) => {
    const m = document.createElement("div")
    m.className = "firefighter-marker"
    const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
    m.style.left = `${offsetX + (ff.x / 100) * displayWidth}px`
    m.style.top = `${offsetY + (ff.y / 100) * displayHeight}px`
    m.dataset.firefighterId = ff.id

    const badge = document.createElement("div")
    badge.className = "firefighter-badge"
    badge.style.background = "linear-gradient(to bottom right, #dc2626, #ea580c)"
    badge.textContent = ff.id
    m.appendChild(badge)

    const popup = document.createElement("div")
    popup.className = "firefighter-popup"
    popup.style.display = "none"
    popup.innerHTML = `
      <div class="firefighter-popup-name">${ff.name}</div>
      <div class="firefighter-popup-o2">O₂: ${ff.o2}%</div>
    `
    m.appendChild(popup)

    let isDragging = false
    let hasMoved = false
    let dragStartX = 0,
      dragStartY = 0

    m.addEventListener("pointerdown", (e) => {
      isDragging = true
      hasMoved = false
      dragStartX = e.clientX
      dragStartY = e.clientY
      m.setPointerCapture(e.pointerId)
      e.stopPropagation()
    })

    m.addEventListener("pointermove", (e) => {
      if (!isDragging) return

      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true

        const containerRect = mapContainer.getBoundingClientRect()
        let x = e.clientX - containerRect.left
        let y = e.clientY - containerRect.top

        const { displayWidth, displayHeight, offsetX, offsetY } = getImageFitRect(floorplan, mapContainer)
        const minX = offsetX,
          minY = offsetY,
          maxX = offsetX + displayWidth,
          maxY = offsetY + displayHeight

        x = Math.max(minX, Math.min(maxX, x))
        y = Math.max(minY, Math.min(maxY, y))

        m.style.left = `${x}px`
        m.style.top = `${y}px`

        ff.x = ((x - offsetX) / displayWidth) * 100
        ff.y = ((y - offsetY) / displayHeight) * 100

        if (heatmapCanvas.style.display !== "none") drawHeatmap(floorplan, mapContainer, heatmapCanvas)
      }
    })

    m.addEventListener("pointerup", (e) => {
      if (!isDragging) return
      m.releasePointerCapture(e.pointerId)
      isDragging = false

      if (!hasMoved) {
        if (activePopupMarker === m) {
          popup.style.display = "none"
          setActivePopupMarker(null)
        } else {
          if (activePopupMarker) {
            const otherPopup = activePopupMarker.querySelector(".firefighter-popup")
            if (otherPopup) otherPopup.style.display = "none"
          }
          popup.style.display = "block"
          setActivePopupMarker(m)
        }
      }
    })

    layer.appendChild(m)
  })
}

export function initTimer() {
  let sec = 0
  setInterval(() => {
    sec++
    const h = String(Math.floor(sec / 3600)).padStart(2, "0")
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0")
    const s = String(sec % 60).padStart(2, "0")
    document.getElementById("incidentTime").textContent = `${h}:${m}:${s}`
  }, 1000)
}
