// Data and state management
export const firefighters = [
  { id: 1, name: "Cpt. DARREN", o2: 85, x: 27, y: 27 },
  { id: 2, name: "Pvt. JUDITH", o2: 45, x: 67, y: 27 },
  { id: 3, name: "Pvt. BERNICE", o2: 28, x: 27, y: 73 },
]

export let dynMarkers = []
export let rulerPoints = []
export let startPoint = null
export let goalPoint = null
export let activePopupMarker = null

export let currentFloorplanSrc = "static/floorplan1.png"

export function setCurrentFloorplanSrc(src) {
  currentFloorplanSrc = src
}

export function setDynMarkers(markers) {
  dynMarkers = markers
}

export function setRulerPoints(points) {
  rulerPoints = points
}

export function setStartPoint(point) {
  startPoint = point
}

export function setGoalPoint(point) {
  goalPoint = point
}

export function setActivePopupMarker(marker) {
  activePopupMarker = marker
}
