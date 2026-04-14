"""MacBook Pro M3 - Portfolio Animation Script
Clean Apple product photography: lid open, screen glow, turntable.
Run via: python3 blender_cmd.py exec "$(cat scripts/macbook_animate.py)"
"""
import bpy, math
from mathutils import Vector

ASSETS = '/Users/user/Documents/owenisas/assets'
BLENDS = '/Users/user/Documents/owenisas/blends'
RENDERS = '/Users/user/Documents/owenisas/renders/macbook_pro'

# =============================
# PHASE 1: CLEAN + IMPORT
# =============================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Try GLB import (more reliable than .blend append)
bpy.ops.import_scene.gltf(filepath=f'{ASSETS}/macbook_pro_m3_16_inch_2024.glb')

# =============================
# PHASE 2: DISCOVER
# =============================
for obj in bpy.data.objects:
    info = f'Name: {obj.name} | Type: {obj.type}'
    info += f' | Parent: {obj.parent.name if obj.parent else None}'
    info += f' | Dim: {[round(x,3) for x in obj.dimensions]}'
    if obj.type == 'MESH':
        info += f' | Verts: {len(obj.data.vertices)}'
        info += f' | Mats: {[m.name for m in obj.data.materials if m]}'
    print(info)

# Get bounding box
all_coords = []
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for v in obj.bound_box:
            all_coords.append(obj.matrix_world @ Vector(v))

if all_coords:
    min_co = Vector(map(min, zip(*all_coords)))
    max_co = Vector(map(max, zip(*all_coords)))
    center = (min_co + max_co) / 2
    size = max_co - min_co
    max_dim = max(size)
    print(f'Size: {[round(x,2) for x in size]}, Max: {round(max_dim,2)}')
    print(f'Center: {[round(x,2) for x in center]}')

print('MacBook import + discovery complete')
