
from PIL import Image
import numpy as np

img = Image.open('etiquetas_extracted.jpg')
arr = np.array(img.convert('L'))
scale = 210/1654

# Look at a specific row band between row lines 102 and 220
# i.e., rows 110-210 (inside the first label row)
band = arr[110:210, :]
dark_in_band = (band < 248).sum(axis=0)
print('Dark pixels per column in row band 110-210:')
significant = np.where(dark_in_band > 3)[0]

# Group them
if len(significant) > 0:
    groups = []
    grp = [significant[0]]
    for p in significant[1:]:
        if p - grp[-1] <= 10:
            grp.append(p)
        else:
            groups.append(int(np.mean(grp)))
            grp = [p]
    groups.append(int(np.mean(grp)))
    print(f'Column separators: {[(g, f"{g*scale:.1f}mm") for g in groups]}')

# Try multiple row bands
print('\n--- Checking multiple row bands ---')
row_pairs = [(110, 210), (230, 320), (360, 445), (480, 565), (600, 685)]
for r1, r2 in row_pairs:
    band = arr[r1:r2, :]
    dark_in_band = (band < 248).sum(axis=0)
    significant = np.where(dark_in_band > 3)[0]
    if len(significant) > 0:
        groups = []
        grp = [significant[0]]
        for p in significant[1:]:
            if p - grp[-1] <= 10:
                grp.append(p)
            else:
                groups.append(int(np.mean(grp)))
                grp = [p]
        groups.append(int(np.mean(grp)))
        print(f'Rows {r1}-{r2}: separators at {[(g, f"{g*scale:.1f}mm") for g in groups]}')
