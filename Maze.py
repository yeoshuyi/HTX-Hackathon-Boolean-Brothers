import sys
import cv2
import numpy as np
import matplotlib.pyplot as plt
from heapq import heappush, heappop
import os


# --------------------------
# Octile heuristic (8 directional)
# --------------------------
def heuristic(a, b):
    dx = abs(a[0] - b[0])
    dy = abs(a[1] - b[1])
    return max(dx, dy) + 0.414 * min(dx, dy)


# --------------------------
# A* with turn penalty
# --------------------------
def astar(grid, start, goal):
    h, w = grid.shape
    open_set = []
    heappush(open_set, (heuristic(start, goal), 0, start, None))
    came_from = {}
    g_score = {start: 0}

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]

    while open_set:
        _, cost, current, prev_dir = heappop(open_set)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for dy, dx in directions:
            ny, nx = current[0] + dy, current[1] + dx
            if not (0 <= ny < h and 0 <= nx < w):
                continue
            if grid[ny, nx] == 0:
                continue

            move_cost = 1.414 if dy != 0 and dx != 0 else 1
            if prev_dir and prev_dir != (dy, dx):
                move_cost += 0.2

            new_cost = cost + move_cost
            neighbor = (ny, nx)

            if neighbor not in g_score or new_cost < g_score[neighbor]:
                g_score[neighbor] = new_cost
                priority = new_cost + heuristic(neighbor, goal)
                heappush(open_set, (priority, new_cost, neighbor, (dy, dx)))
                came_from[neighbor] = current

    return None


# --------------------------
# Post smoothing (less aggressive)
# --------------------------
def smooth_path(path, grid):
    smoothed = [path[0]]
    last = path[0]
    for i in range(1, len(path)):
        if not has_line_of_sight(grid, last, path[i]):
            smoothed.append(path[i - 1])
            last = path[i - 1]
    smoothed.append(path[-1])
    return smoothed


# --------------------------
# Bresenham line-of-sight
# --------------------------
def has_line_of_sight(grid, a, b):
    y0, x0 = a
    y1, x1 = b
    dy = abs(y1 - y0)
    dx = abs(x1 - x0)
    sy = 1 if y1 > y0 else -1
    sx = 1 if x1 > x0 else -1
    err = dx - dy
    while True:
        if grid[y0, x0] == 0:
            return False
        if (y0, x0) == (y1, x1):
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy
    return True


# --------------------------
# Generate path map
# --------------------------
def generate_map(start, goal):
    img = cv2.imread('static/floorplan1.png', cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError("Could not find 'static/floorplan1.png'.")

    h, w = img.shape
    print(f"Image size: width={w}, height={h}")

    _, binary = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
    binary = (binary == 255).astype(np.uint8)

    cell_size = 20
    grid_h, grid_w = h // cell_size, w // cell_size
    grid = np.zeros((grid_h, grid_w), dtype=np.uint8)

    for y in range(grid_h):
        for x in range(grid_w):
            cell = binary[y*cell_size:(y+1)*cell_size, x*cell_size:(x+1)*cell_size]
            grid[y, x] = 1 if np.count_nonzero(cell) > 0.8 * (cell_size**2) else 0

    start = np.clip(start, 0.0, 1.0)
    goal = np.clip(goal, 0.0, 1.0)
    start_px = (start[0] * w, start[1] * h)
    goal_px = (goal[0] * w, goal[1] * h)
    start_grid = (int(start_px[1] // cell_size), int(start_px[0] // cell_size))
    goal_grid = (int(goal_px[1] // cell_size), int(goal_px[0] // cell_size))

    print(f"Grid start: {start_grid}, goal: {goal_grid}")

    path = astar(grid, start_grid, goal_grid)
    if not path:
        raise ValueError("❌ No path found")

    # Less aggressive smoothing
    smoothed = smooth_path(path, grid)

    color = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    # Draw thick continuous path segments instead of isolated blocks
    for i in range(1, len(smoothed)):
        y1, x1 = smoothed[i-1]
        y2, x2 = smoothed[i]
        p1 = (int(x1*cell_size + cell_size/2), int(y1*cell_size + cell_size/2))
        p2 = (int(x2*cell_size + cell_size/2), int(y2*cell_size + cell_size/2))
        cv2.line(color, p1, p2, (0, 0, 255), 5)

    start_c = (start_grid[1]*cell_size + cell_size//2, start_grid[0]*cell_size + cell_size//2)
    goal_c = (goal_grid[1]*cell_size + cell_size//2, goal_grid[0]*cell_size + cell_size//2)
    cv2.circle(color, start_c, 6, (0,255,0), -1)
    cv2.circle(color, goal_c, 6, (255,0,0), -1)

    os.makedirs('static', exist_ok=True)
    output_path = os.path.join('static', 'floorplan2.png')
    plt.figure(figsize=(8,8))
    plt.imshow(cv2.cvtColor(color, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    print(f"✅ Path map saved as {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python Maze.py <start_x> <start_y> <goal_x> <goal_y>")
        sys.exit(1)

    start = (float(sys.argv[1]), float(sys.argv[2]))
    goal = (float(sys.argv[3]), float(sys.argv[4]))
    print(f"Running pathfinding from {start} → {goal}")
    generate_map(start, goal)
