# Firefighter Situation Map

A real-time firefighter monitoring and operations analysis system built with Flask and vanilla JavaScript.

## Flask File Structure

\`\`\`
your-project/
├── app.py                          # Flask application (main server file)
├── requirements.txt                # Python dependencies
├── ops_logs.json                   # Auto-generated ops logs storage
├── templates/                      # HTML templates for Flask
│   ├── index.html                 # Main map interface
│   └── analysis.html              # Operations analysis page
└── static/                        # Static files (JS, CSS, images)
    ├── floorplan1.png            # Default floorplan image
    ├── main.js                   # Main app initialization
    ├── analysis.js               # Analysis page logic
    ├── ops-log.js                # Operations logging with API integration
    ├── ui.js                     # UI components and updates
    ├── markers.js                # Marker management
    ├── annotations.js            # Drawing and annotation tools
    ├── heatmap.js                # Heat map visualization
    ├── ruler.js                  # Ruler measurement tool
    ├── controls.js               # Control panel handlers
    ├── canvas.js                 # Canvas utilities
    ├── data.js                   # Data and state management
    ├── utils.js                  # Utility functions
    ├── snapshot.js               # Snapshot capture functionality
    └── floorplan.js              # Floorplan management
\`\`\`

## Setup Instructions

### 1. Install Python Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 2. File Organization

**Move files to correct locations:**

- Move `index.html` and `analysis.html` to `templates/` folder
- Move all `.js` files to `static/` folder
- Move `floorplan1.png` to `static/` folder
- Keep `app.py` in the root directory

### 3. Run the Application

\`\`\`bash
python app.py
\`\`\`

The application will start on `http://localhost:5000`

## Features

### Main Map Interface (`/`)
- Real-time firefighter O2 monitoring
- Interactive floorplan with draggable markers
- Heat map visualization
- Annotation tools (drawing, fire markers, casualty markers)
- Ruler measurement tool
- Custom floorplan upload
- Blank floorplan option

### Analysis Page (`/analysis`)
- Minimized map snapshot with all overlays
- Compact personnel status display
- Incident summary
- Critical alerts
- **Operations Monitoring Box**:
  - Input field for ops updates (formatted as `[OPS UPDATE DDMMYY HHMMSS] message`)
  - AI Recommendation button (adds `[AI RECC] Error` entries)
  - Scrollable log display
  - All logs stored in `ops_logs.json` via Flask API

## API Endpoints

- `GET /api/ops-logs` - Retrieve all operations logs
- `POST /api/ops-logs` - Add a new operations log entry
- `POST /api/ops-logs/clear` - Clear all operations logs

## Troubleshooting

### Buttons Not Working on Main Page

1. **Check browser console** (F12) for JavaScript errors
2. **Verify file paths**: Ensure all JS files are in `static/` folder
3. **Check Flask is serving files**: Visit `http://localhost:5000/static/main.js` directly
4. **MIME type issues**: Flask should automatically serve `.js` files with correct MIME type
5. **Module loading**: Look for `[v0]` prefixed console logs to track initialization

### Common Issues

**Issue**: "Failed to load module script"
- **Solution**: Ensure all `.js` files are in the `static/` folder and Flask is running

**Issue**: "Cannot find module"
- **Solution**: Check that all import paths use `./filename.js` format

**Issue**: Ops logs not saving
- **Solution**: Ensure Flask server is running and `ops_logs.json` has write permissions

## Development Notes

- All JavaScript modules use ES6 import/export syntax
- Console logs prefixed with `[v0]` help track initialization flow
- Operations logs are persisted to `ops_logs.json` file
- Map snapshots are stored in browser localStorage
- All function and variable names retained from original implementation
