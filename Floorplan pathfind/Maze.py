import cv2
import numpy as np
import matplotlib.pyplot as plt
from heapq import heappush, heappop

# --------------------------
# 1. Load floorplan and preprocess
# --------------------------
img = cv2.imread('floorplan.png', cv2.IMREAD_GRAYSCALE)
if img is None:
    raise FileNotFoundError("Could not find 'floorplan.png' in current directory.")

# Convert to binary: walls=0, free=1
_, binary = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
binary = (binary == 255).astype(np.uint8)  # 1 = free, 0 = wall

# Grid discretization
cell_size = 20  # pixels per grid cell, adjust for more/fewer grids
h, w = binary.shape
grid_h, grid_w = h // cell_size, w // cell_size
grid = np.zeros((grid_h, grid_w), dtype=np.uint8)

# Fill grid: 0 = wall, 1 = free
for y in range(grid_h):
    for x in range(grid_w):
        cell = binary[y*cell_size:(y+1)*cell_size, x*cell_size:(x+1)*cell_size]
        if np.any(cell == 0):  # wall present
            grid[y, x] = 0
        else:
            grid[y, x] = 1

# --------------------------
# 2. Get start and goal from user click
# --------------------------
plt.imshow(img, cmap='gray')
plt.title("Click entrance, then destination")
coords = plt.ginput(2)
plt.close()

# Convert pixel coordinates to grid coordinates
start = (int(coords[0][1] // cell_size), int(coords[0][0] // cell_size))
goal = (int(coords[1][1] // cell_size), int(coords[1][0] // cell_size))
print("Entrance (grid coords):", start)
print("Destination (grid coords):", goal)

# --------------------------
# 3. A* pathfinding
# --------------------------
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(grid, start, goal):
    h, w = grid.shape
    open_set = []
    heappush(open_set, (heuristic(start, goal), 0, start))
    came_from = {}
    g_score = {start: 0}

    # 8 directions: N, S, E, W + diagonals
    directions = [(-1,0),(1,0),(0,-1),(0,1), (-1,-1), (-1,1), (1,-1), (1,1)]

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

path = astar(grid, start, goal)
if path is None:
    raise ValueError("No path found from entrance to destination.")

# --------------------------
# 4. Visualize path
# --------------------------
# Scale path back to pixels (center of each cell)
path_pixels = [(y*cell_size + cell_size//2, x*cell_size + cell_size//2) for y, x in path]

# Convert original image to BGR for drawing
color = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

# Draw path
for y, x in path_pixels:
    cv2.rectangle(color,
                  (x - cell_size//2, y - cell_size//2),
                  (x + cell_size//2, y + cell_size//2),
                  (0, 0, 255), -1)
# Draw start and goal
start_pixel = (start[1]*cell_size + cell_size//2, start[0]*cell_size + cell_size//2)
goal_pixel = (goal[1]*cell_size + cell_size//2, goal[0]*cell_size + cell_size//2)
cv2.circle(color, start_pixel, 5, (0,255,0), -1)  # Green start
cv2.circle(color, goal_pixel, 5, (255,0,0), -1)   # Blue goal

plt.figure(figsize=(8,8))
plt.imshow(cv2.cvtColor(color, cv2.COLOR_BGR2RGB))
plt.title("Path from Entrance to Destination")
plt.axis('off')
plt.show()
