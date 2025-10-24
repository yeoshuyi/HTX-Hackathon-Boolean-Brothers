// Analysis page initialization
import { loadSnapshotFromStorage } from "./snapshot.js"
import { initOpsLog } from "./ops-log.js"

console.log("[v0] Analysis.js loading...")

function loadSnapshot() {
  console.log("[v0] Loading snapshot from storage...")
  const snapshot = loadSnapshotFromStorage()
  const snapshotImg = document.getElementById("snapshotImg")

  if (snapshot) {
    snapshotImg.src = snapshot
    console.log("[v0] Snapshot loaded successfully")
  } else {
    snapshotImg.alt = "No snapshot available"
    console.log("[v0] No snapshot found in storage")
  }
}

function initBackButton() {
  console.log("[v0] Initializing back button...")
  const backBtn = document.getElementById("backToMapBtn")

  if (!backBtn) {
    console.error("[v0] Back button not found!")
    return
  }

  backBtn.addEventListener("click", () => {
    console.log("[v0] Back button clicked, navigating to main page...")
    window.location.href = "/"
  })

  console.log("[v0] Back button initialized")
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Analysis page DOM loaded")

  try {
    loadSnapshot()
    initBackButton()
    initOpsLog()
    console.log("[v0] Analysis page initialization complete")
  } catch (error) {
    console.error("[v0] Error initializing analysis page:", error)
    console.error("[v0] Error stack:", error.stack)
  }
})
