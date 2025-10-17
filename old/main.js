// Check and load latest floorplan image
function loadFloorplan() {
  const img2 = new Image();
  img2.onload = () => {
    document.getElementById('floorplanLayer').style.backgroundImage = "url('floorplan2.png?cacheBust=" + Date.now() + "')";
  };
  img2.onerror = () => {
    document.getElementById('floorplanLayer').style.backgroundImage = "url('floorplan1.png')";
  };
  img2.src = 'floorplan2.png';
}

// Run maze.py on server
async function runMazeScript() {
  const btn = document.getElementById('runMazeBtn');
  btn.disabled = true;
  btn.textContent = "⏳ Generating...";

  try {
    const response = await fetch("http://127.0.0.1:5000/run-maze", { method: "POST" });
    const data = await response.json();
    if (data.success) {
      alert("✅ New floorplan generated!");
      loadFloorplan();
    } else {
      alert("⚠️ Error: " + data.error);
    }
  } catch (err) {
    alert("❌ Could not reach server: " + err);
  }

  btn.disabled = false;
  btn.textContent = "🧩 Generate Path Map";
}

// Attach button
document.addEventListener("DOMContentLoaded", () => {
  loadFloorplan();
  document.getElementById("runMazeBtn").addEventListener("click", runMazeScript);
});
