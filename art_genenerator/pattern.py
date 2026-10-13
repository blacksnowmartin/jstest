import tkinter as tk
from tkinter import messagebox
import math

class PatternUnlockScreen:
    def __init__(self, root):
        self.root = root
        self.root.title("Pattern Unlock Simulator")
        self.root.geometry("400x500")
        self.root.configure(bg="#1c1c1e")
        self.root.resizable(False, False)

        # Predefined correct pattern (0-8 indexing for a 3x3 grid)
        # 0 1 2
        # 3 4 5
        # 6 7 8
        # This example pattern makes a "Z" shape: 0 -> 1 -> 2 -> 4 -> 6 -> 7 -> 8
        self.CORRECT_PATTERN = [0, 1, 2, 4, 6, 7, 8]
        
        self.current_pattern = []
        self.dots = []      # Stores center coordinates and radius of the dots
        self.is_drawing = False

        # Status Label
        self.status_label = tk.Label(
            root, text="Draw your pattern to unlock", 
            font=("Helvetica", 14), fg="white", bg="#1c1c1e"
        )
        self.status_label.pack(pady=30)

        # Drawing Canvas
        self.canvas = tk.Canvas(root, width=300, height=300, bg="#1c1c1e", highlightthickness=0)
        self.canvas.pack(pady=10)

        # Create the 3x3 grid of dots
        self.create_grid()

        # Bind Mouse Events
        self.canvas.bind("<ButtonPress-1>", self.on_press)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)

    def create_grid(self):
        """Generates the 3x3 layout of interactive dots."""
        padding = 50
        spacing = 100
        radius = 12

        for i in range(3):
            for j in range(3):
                # Calculate center coordinates for each dot
                cx = padding + j * spacing
                cy = padding + i * spacing
                dot_id = i * 3 + j
                
                # Draw the outer ring (hidden initially) and inner dot
                ring = self.canvas.create_oval(cx-radius*2, cy-radius*2, cx+radius*2, cy+radius*2, outline="", width=2)
                dot = self.canvas.create_oval(cx-radius, cy-radius, cx+radius, cy+radius, fill="#8e8e93", outline="")
                
                self.dots.append({
                    "id": dot_id, "cx": cx, "cy": cy, 
                    "radius": radius, "dot_obj": dot, "ring_obj": ring
                })

    def on_press(self, event):
        """Triggered when the user click/touches down."""
        self.reset_canvas_ui()
        self.is_drawing = True
        self.check_dot_collision(event.x, event.y)

    def on_drag(self, event):
        """Triggered when the user drags the mouse."""
        if not self.is_drawing:
            return

        self.check_dot_collision(event.x, event.y)
        self.redraw_lines(event.x, event.y)

    def on_release(self, event):
        """Triggered when the user lifts the mouse."""
        if not self.is_drawing:
            return
        
        self.is_drawing = False
        # Remove the floating tracker line leading to the mouse cursor
        self.canvas.delete("tracker")

        # Validate pattern
        if self.current_pattern == self.CORRECT_PATTERN:
            self.update_ui_color("#34c759") # Green for success
            self.status_label.config(text="Phone Unlocked!", fg="#34c759")
            messagebox.showinfo("Success", "Welcome back! Phone unlocked.")
        else:
            self.update_ui_color("#ff3b30") # Red for failure
            self.status_label.config(text="Wrong Pattern. Try again.", fg="#ff3b30")

    def check_dot_collision(self, x, y):
        """Checks if the cursor is over an unvisited dot using distance tracking."""
        hit_radius = 25 # Generous collision boundary for smooth dragging
        
        for dot in self.dots:
            if dot["id"] not in self.current_pattern:
                # Euclidean distance formula
                distance = math.sqrt((x - dot["cx"])**2 + (y - dot["cy"])**2)
                if distance <= hit_radius:
                    self.current_pattern.append(dot["id"])
                    # Light up the selected node
                    self.canvas.itemconfig(dot["dot_obj"], fill="#007aff")
                    self.canvas.itemconfig(dot["ring_obj"], outline="#007aff")
                    break

    def redraw_lines(self, mouse_x, mouse_y):
        """Draws the tracking lines connecting the selected dots."""
        self.canvas.delete("line")
        self.canvas.delete("tracker")

        # Draw lines between selected nodes
        for i in range(len(self.current_pattern) - 1):
            p1 = self.dots[self.current_pattern[i]]
            p2 = self.dots[self.current_pattern[i+1]]
            self.canvas.create_line(p1["cx"], p1["cy"], p2["cx"], p2["cy"], fill="#007aff", width=4, tags="line")

        # Draw a floating line from the last node to the current mouse cursor location
        if self.current_pattern:
            last_dot = self.dots[self.current_pattern[-1]]
            self.canvas.create_line(last_dot["cx"], last_dot["cy"], mouse_x, mouse_y, fill="#007aff", width=3, tags="tracker")

    def update_ui_color(self, color):
        """Changes the lines, dots, and rings to match a state (Success/Failure)."""
        self.canvas.itemconfig("line", fill=color)
        for dot_id in self.current_pattern:
            dot = self.dots[dot_id]
            self.canvas.itemconfig(dot["dot_obj"], fill=color)
            self.canvas.itemconfig(dot["ring_obj"], outline=color)

    def reset_canvas_ui(self):
        """Clears the current tracking context for a new drawing session."""
        self.current_pattern = []
        self.canvas.delete("line")
        self.canvas.delete("tracker")
        self.status_label.config(text="Draw your pattern to unlock", fg="white")
        
        for dot in self.dots:
            self.canvas.itemconfig(dot["dot_obj"], fill="#8e8e93")
            self.canvas.itemconfig(dot["ring_obj"], outline="")

if __name__ == "__main__":
    window = tk.Tk()
    app = PatternUnlockScreen(window)
    window.mainloop()
