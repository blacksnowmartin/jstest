import os
from PIL import Image

def slice_to_png_frames(sheet_path, rows, cols, output_dir="extracted_frames"):
    """Splits a sprite sheet and saves every frame as an individual PNG file."""
    if not os.path.exists(sheet_path):
        print(f"Error: Could not find image at {sheet_path}")
        return

    os.makedirs(output_dir, exist_ok=True)
    
    sheet = Image.open(sheet_path)
    sheet_width, sheet_height = sheet.size
    frame_width = sheet_width // cols
    frame_height = sheet_height // rows

    frame_count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * frame_width
            top = r * frame_height
            right = left + frame_width
            bottom = top + frame_height
            
            frame = sheet.crop((left, top, right, bottom))
            
            # Pad file numbers (e.g., frame_01.png) so they sort correctly in folders
            frame.save(os.path.join(output_dir, f"frame_{frame_count:02d}.png"))
            frame_count += 1
            
    print(f"Done! {frame_count - 1} frames extracted to the folder: '{output_dir}/'")

# --- Execute Script ---
slice_to_png_frames("soldier_spritesheet.png", rows=2, cols=5)
