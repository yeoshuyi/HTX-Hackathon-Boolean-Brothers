import sys
import cv2
import numpy as np
import matplotlib.pyplot as plt
from heapq import heappush, heappop
import os


# --------------------------
# Heuristic function (Manhattan distance)
# --------------------------
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


# --------------------------
# A* pathfinding algorithm
# --------------------------
def astar(grid, start, goal):
    h, w = grid.shape
    open_set = []
    heappush(open_set, (heuristic(start, goal), 0, start))
    came_from = {}
    g_score = {start: 0}

    # 8 possible movement directions
    directions = [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]

    while open_set:
        _, cost, current = heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for dy, dx in directions:
            ny, nx = current[0] + dy, current[1] + dx
            ny, nx = int(ny), int(nx)
            if 0 <= ny < h and 0 <= nx < w and grid[ny, nx] == 1:
                new_cost = cost + 1
                if (ny, nx) not in g_score or new_cost < g_score[(ny, nx)]:
                    g_score[(ny, nx)] = new_cost
                    priority = new_cost + heuristic((ny, nx), goal)
                    heappush(open_set, (priority, new_cost, (ny, nx)))
                    came_from[(ny, nx)] = current

    return None


# --------------------------
# Main map generation function
# --------------------------
def generate_map(start, goal):
    
    # 1. Load and preprocess floorplan
    img = cv2.imread('static/floorplan1.png', cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError("Could not find 'static/floorplan1.png'.")
   
    h, w = img.shape
    print(f"Image size: width={w}, height={h}")

    # Convert to binary (1 = free, 0 = wall)
    _, binary = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
    binary = (binary == 255).astype(np.uint8)

    # 2. Discretize image into grid cells
    cell_size = 20  # pixels per cell
    grid_h, grid_w = h // cell_size, w // cell_size
    grid = np.zeros((grid_h, grid_w), dtype=np.uint8)

    for y in range(grid_h):
        for x in range(grid_w):
            cell = binary[y*cell_size:(y+1)*cell_size, x*cell_size:(x+1)*cell_size]
            grid[y, x] = 1 if np.all(cell == 1) else 0

    # 3. Convert normalized coords (0–1) → pixel → grid
    OFFSET = 0.00  # small padding from edges

    # Clamp between 0 and 1 just in case
    start = np.clip(start, 0.0, 1.0)
    goal = np.clip(goal, 0.0, 1.0)

    # Apply offset adjustment (if your clicks are slightly off)
    start = start * (1 - 2*OFFSET) + OFFSET
    goal  = goal  * (1 - 2*OFFSET) + OFFSET

    # Convert normalized to pixel coordinates
    start_px = (start[0] * w, start[1] * h)
    goal_px  = (goal[0]  * w, goal[1]  * h)

    start_grid = (int(start_px[1] // cell_size), int(start_px[0] // cell_size))
    goal_grid  = (int(goal_px[1]  // cell_size), int(goal_px[0]  // cell_size))

    print(f"\nNormalized start: {start}")
    print(f"Normalized goal:  {goal}")
    print(f"Pixel start: {start_px}")
    print(f"Pixel goal:  {goal_px}")
    print(f"Grid start: {start_grid}")
    print(f"Grid goal:  {goal_grid}")

    # 4. A* pathfinding
    try:
        path = astar(grid, start_grid, goal_grid)
        if path is None:
            raise ValueError("❌ No path found from entrance to destination.")
    except Exception as e:
        print(f"⚠️ Pathfinding error: {e}")
        sys.exit(1)

    # 5. Visualize path
    path_pixels = [(y*cell_size + cell_size//2, x*cell_size + cell_size//2) for y, x in path]
    color = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    for y, x in path_pixels:
        cv2.rectangle(color, (x - cell_size//2, y - cell_size//2),
                      (x + cell_size//2, y + cell_size//2), (0, 0, 255), -1)

    start_pixel = (start_grid[1]*cell_size + cell_size//2, start_grid[0]*cell_size + cell_size//2)
    goal_pixel = (goal_grid[1]*cell_size + cell_size//2, goal_grid[0]*cell_size + cell_size//2)
    cv2.circle(color, start_pixel, 6, (0,255,0), -1)
    cv2.circle(color, goal_pixel, 6, (255,0,0), -1)

    os.makedirs('static', exist_ok=True)
    output_path = os.path.join('static', 'floorplan2.png')
    plt.figure(figsize=(8,8))
    plt.imshow(cv2.cvtColor(color, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    print(f"✅ Path map saved as {output_path}")


# --------------------------
# Entry point
# --------------------------
if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python Maze.py <start_x> <start_y> <goal_x> <goal_y>")
        sys.exit(1)

    # Normalized inputs (0–1)
    start = (float(sys.argv[1]), float(sys.argv[2]))
    goal  = (float(sys.argv[3]), float(sys.argv[4]))

    print(f"Running pathfinding from {start} → {goal}")
    generate_map(start, goal)
