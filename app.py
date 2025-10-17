from flask import Flask, render_template, request, jsonify
import subprocess
import os
import sys

app = Flask(__name__)
current_env = os.environ.copy()

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

if __name__ == '__main__':
    app.run(debug=True)
