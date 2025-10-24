from flask import Flask, render_template, request, jsonify
import subprocess
import os
import sys
import json
from datetime import datetime

app = Flask(__name__)
current_env = os.environ.copy()

# Ensure ops_logs.json exists
OPS_LOGS_FILE = 'ops_logs.json'
if not os.path.exists(OPS_LOGS_FILE):
    with open(OPS_LOGS_FILE, 'w') as f:
        json.dump([], f)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/run-maze', methods=['POST'])
def run_maze():
    try:
        data = request.get_json()
        start = data.get('start')
        goal = data.get('goal')

        if not start or not goal:
            return jsonify({"success": False, "error": "Missing start or goal"})

        # Run Maze.py with coordinates
        subprocess.run([sys.executable, 'Maze.py', str(start[0]), str(start[1]), str(goal[0]), str(goal[1])], check=True, env=current_env)

        if os.path.exists('static/floorplan2.png'):
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "floorplan2.png not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/api/ops-logs', methods=['GET'])
def get_ops_logs():
    """Get all ops logs from JSON file"""
    try:
        with open(OPS_LOGS_FILE, 'r') as f:
            logs = json.load(f)
        return jsonify({'success': True, 'logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ops-logs', methods=['POST'])
def add_ops_log():
    """Add a new ops log entry"""
    try:
        data = request.json
        log_entry = data.get('entry')
        
        if not log_entry:
            return jsonify({'success': False, 'error': 'No entry provided'}), 400
        
        # Read existing logs
        with open(OPS_LOGS_FILE, 'r') as f:
            logs = json.load(f)
        
        # Add new log entry
        logs.append(log_entry)
        
        # Write back to file
        with open(OPS_LOGS_FILE, 'w') as f:
            json.dump(logs, f, indent=2)
        
        return jsonify({'success': True, 'logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ops-logs/clear', methods=['POST'])
def clear_ops_logs():
    """Clear all ops logs"""
    try:
        with open(OPS_LOGS_FILE, 'w') as f:
            json.dump([], f)
        return jsonify({'success': True, 'logs': []})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
