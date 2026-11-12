
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

img = Image.open('etiquetas_extracted.jpg')
arr = np.array(img.convert('L'))
scale_x = 210/1654
scale_y = 297/2338

# Enhance the image contrast to see the faint lines better
enhanced = ImageEnhance.Contrast(img).enhance(5.0)
enhanced_arr = np.array(enhanced.convert('L'))

dark = enhanced_arr < 200
col_dark = dark.sum(axis=0)
row_dark = dark.sum(axis=1)

# Find column lines
significant_cols = np.where(col_dark > 20)[0]
if len(significant_cols) > 0:
    groups = []
    grp = [significant_cols[0]]
    for p in significant_cols[1:]:
        if p - grp[-1] <= 8:
            grp.append(p)
        else:
            groups.append(int(np.mean(grp)))
            grp = [p]
    groups.append(int(np.mean(grp)))
    print(f'Column lines: {[(g, f"{g*scale_x:.1f}mm") for g in groups]}')
    spacings = [(groups[i+1]-groups[i])*scale_x for i in range(len(groups)-1)]
    print(f'Spacings: {[f"{s:.1f}mm" for s in spacings]}')

# Find row lines
significant_rows = np.where(row_dark > 20)[0]
if len(significant_rows) > 0:
    groups_r = []
    grp = [significant_rows[0]]
    for p in significant_rows[1:]:
        if p - grp[-1] <= 8:
            grp.append(p)
        else:
            groups_r.append(int(np.mean(grp)))
            grp = [p]
    groups_r.append(int(np.mean(grp)))
    print(f'\nRow lines ({len(groups_r)} total):')
    for i, g in enumerate(groups_r):
        sp = (g - groups_r[i-1])*scale_y if i > 0 else 0
        print(f'  {g}px = {g*scale_y:.1f}mm (spacing: {sp:.1f}mm)')

# Save enhanced image for viewing
enhanced.save('etiquetas_enhanced.jpg')
print('\nSaved etiquetas_enhanced.jpg')

# Create a visualization with detected lines
from PIL import ImageDraw
vis = img.convert('RGB')
draw = ImageDraw.Draw(vis)
# Draw row lines
for g in groups_r:
    draw.line([(0, g), (1654, g)], fill=(255, 0, 0), width=3)
vis.save('etiquetas_rowlines.jpg')
print('Saved etiquetas_rowlines.jpg')
