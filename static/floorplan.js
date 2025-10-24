// Floorplan management (upload and switching)
import { setCurrentFloorplanSrc } from "./data.js"

export function initFloorplanControls(floorplan, mapContainer, heatmapCanvas) {
  const uploadBtn = document.getElementById("uploadFloorplanBtn")
  const blankBtn = document.getElementById("blankFloorplanBtn")
  const fileInput = document.getElementById("floorplanFileInput")

  // Handle custom floorplan upload
  uploadBtn.addEventListener("click", () => {
    fileInput.click()
  })

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newSrc = event.target.result
        floorplan.src = newSrc
        setCurrentFloorplanSrc(newSrc)
      }
      reader.readAsDataURL(file)
    } else {
      alert("Please select a valid image file")
    }
  })

  // Handle blank white floorplan
  blankBtn.addEventListener("click", () => {
    // Create a blank white canvas
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const blankSrc = canvas.toDataURL()
    floorplan.src = blankSrc
    setCurrentFloorplanSrc(blankSrc)
  })
}
