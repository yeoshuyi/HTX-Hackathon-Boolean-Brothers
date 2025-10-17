from flask import Flask, render_template, jsonify
from flask_cors import CORS   # <— ADD THIS
import subprocess
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/run-maze', methods=['POST'])
def run_maze():
    try:
        subprocess.run(['python', 'maze.py'], check=True)

        if os.path.exists("floorplan2.png"):
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "No output image found"})
    except subprocess.CalledProcessError as e:
        return jsonify({"success": False, "error": str(e)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)