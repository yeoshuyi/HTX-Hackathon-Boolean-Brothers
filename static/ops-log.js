// Operations monitoring log functionality with Flask API integration

export function initOpsLog() {
  console.log("[v0] Initializing ops log...")
  const opsInput = document.getElementById("opsInput")
  const opsSubmitBtn = document.getElementById("opsSubmitBtn")
  const opsLogContainer = document.getElementById("opsLogContainer")
  const aiRecommendationBtn = document.getElementById("aiRecommendationBtn")

  if (!opsInput || !opsSubmitBtn || !opsLogContainer || !aiRecommendationBtn) {
    console.error("[v0] Ops log elements not found!")
    return
  }

  // Load existing logs from server
  loadOpsLogsFromServer()

  // Handle ops update submission
  opsSubmitBtn.addEventListener("click", () => {
    const message = opsInput.value.trim()
    if (message) {
      addOpsUpdate(message)
      opsInput.value = ""
    }
  })

  // Handle Enter key in input
  opsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const message = opsInput.value.trim()
      if (message) {
        addOpsUpdate(message)
        opsInput.value = ""
      }
    }
  })

  // Handle AI recommendation button
  aiRecommendationBtn.addEventListener("click", () => {
    addAIRecommendation()
  })

  console.log("[v0] Ops log initialized successfully")
}

async function addOpsUpdate(message) {
  const timestamp = formatTimestamp(new Date())
  const logEntry = {
    type: "OPS UPDATE",
    timestamp: timestamp,
    message: message,
  }

  await saveLogEntryToServer(logEntry)
}

async function addAIRecommendation() {
  const timestamp = formatTimestamp(new Date())
  const logEntry = {
    type: "AI RECC",
    timestamp: timestamp,
    message: "Error",
  }

  await saveLogEntryToServer(logEntry)
}

function formatTimestamp(date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${day}${month}${year} ${hours}${minutes}${seconds}`
}

function displayLogEntry(logEntry) {
  const opsLogContainer = document.getElementById("opsLogContainer")
  const logDiv = document.createElement("div")
  logDiv.className = "p-2 bg-[#2a2a2a] rounded text-xs border border-[#3a3a3a]"

  const typeColor = logEntry.type === "AI RECC" ? "text-purple-400" : "text-blue-400"

  logDiv.innerHTML = `
    <span class="${typeColor} font-semibold">[${logEntry.type} ${logEntry.timestamp}]</span>
    <span class="text-gray-200 ml-2">${logEntry.message}</span>
  `

  opsLogContainer.insertBefore(logDiv, opsLogContainer.firstChild)
}

async function saveLogEntryToServer(logEntry) {
  try {
    const response = await fetch("/api/ops-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entry: logEntry }),
    })

    const data = await response.json()

    if (data.success) {
      displayLogEntry(logEntry)
      console.log("[v0] Log entry saved successfully")
    } else {
      console.error("[v0] Failed to save log entry:", data.error)
      alert("Failed to save log entry: " + data.error)
    }
  } catch (error) {
    console.error("[v0] Error saving log entry:", error)
    alert("Error saving log entry: " + error.message)
  }
}

async function loadOpsLogsFromServer() {
  try {
    const response = await fetch("/api/ops-logs")
    const data = await response.json()

    if (data.success) {
      // Display logs in reverse order (newest first)
      const logs = data.logs.reverse()
      logs.forEach((log) => displayLogEntry(log))
      console.log("[v0] Loaded", logs.length, "ops logs from server")
    } else {
      console.error("[v0] Failed to load ops logs:", data.error)
    }
  } catch (error) {
    console.error("[v0] Error loading ops logs:", error)
  }
}

export async function clearOpsLogs() {
  try {
    const response = await fetch("/api/ops-logs/clear", {
      method: "POST",
    })

    const data = await response.json()

    if (data.success) {
      const opsLogContainer = document.getElementById("opsLogContainer")
      opsLogContainer.innerHTML = ""
      console.log("[v0] Ops logs cleared successfully")
    } else {
      console.error("[v0] Failed to clear ops logs:", data.error)
    }
  } catch (error) {
    console.error("[v0] Error clearing ops logs:", error)
  }
}
