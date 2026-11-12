
from PIL import Image
import numpy as np

img = Image.open('etiquetas_extracted.jpg')
arr = np.array(img.convert('L'))
scale = 210/1654

dark = arr < 247
col_dark = dark.sum(axis=0)
row_dark = dark.sum(axis=1)

print('=== COLUMN ANALYSIS ===')
for threshold in [100, 200, 300, 400, 500]:
    cols = np.where(col_dark > threshold)[0]
    if len(cols) > 0:
        groups = []
        grp = [cols[0]]
        for p in cols[1:]:
            if p - grp[-1] <= 5:
                grp.append(p)
            else:
                groups.append(int(np.mean(grp)))
                grp = [p]
        groups.append(int(np.mean(grp)))
        print(f'threshold>{threshold}: {[f"{g}px={g*scale:.1f}mm" for g in groups]}')

print('\n=== ROW ANALYSIS ===')
for threshold in [100, 200, 300, 400, 500]:
    rows = np.where(row_dark > threshold)[0]
    if len(rows) > 0:
        groups = []
        grp = [rows[0]]
        for p in rows[1:]:
            if p - grp[-1] <= 5:
                grp.append(p)
            else:
                groups.append(int(np.mean(grp)))
                grp = [p]
        groups.append(int(np.mean(grp)))
        print(f'threshold>{threshold}: {[(g, f"{g*scale:.1f}mm") for g in groups]}')

print('\n=== IMAGE SIZE ===')
print(f'Image: {arr.shape[1]}x{arr.shape[0]} pixels')
print(f'Scale: {scale:.4f} mm/px')
print(f'A4: 210x297mm')
