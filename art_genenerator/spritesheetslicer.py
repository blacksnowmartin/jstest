import os
from PIL import Image

def create_gif_from_spritesheet(sheet_path, rows, cols, output_path="run_animation.gif", duration=100):
    """
    Slices a sprite sheet and exports it as an animated GIF.
    
    :param sheet_path: Path to your sprite sheet image
    :param rows: Number of horizontal rows (2 in this case)
    :param cols: Number of vertical columns (5 in this case)
    :param output_path: Desired name/path for the output GIF
    :param duration: Time each frame stays on screen in milliseconds (100ms = 10fps)
    """
    if not os.path.exists(sheet_path):
        print(f"Error: Could not find image at {sheet_path}")
        return

    # Load the sheet image
    sheet = Image.open(sheet_path)
    sheet_width, sheet_height = sheet.size

    # Calculate individual frame sizes
    frame_width = sheet_width // cols
    frame_height = sheet_height // rows

    frames = []

    # Slice frames sequentially from top-left to bottom-right
    for r in range(rows):
        for c in range(cols):
            # Define bounding box for the current frame
            left = c * frame_width
            top = r * frame_height
            right = left + frame_width
            bottom = top + frame_height
            
            # Crop the frame and add it to our list
            frame = sheet.crop((left, top, right, bottom))
            frames.append(frame)

    # Save the frames compiled together as a looping GIF
    if frames:
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            optimize=False,
            duration=duration,
            loop=0 # 0 means infinite loop
        )
        print(f"Success! Animated GIF saved to: {output_path}")

# --- Execute Script ---
# Make sure "soldier_spritesheet.png" matches your saved file name!
create_gif_from_spritesheet(
    sheet_path="soldier_spritesheet.png", 
    rows=2, 
    cols=5, 
    duration=100  # 100 milliseconds per frame = a solid 10 frames per second
)
