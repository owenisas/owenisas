"""DJI Mavic 3 - Import + Discovery
Run via: python3 blender_cmd.py exec "$(cat scripts/dji_mavic_animate.py)"
"""
import bpy, math
from mathutils import Vector

ASSETS = '/Users/user/Documents/owenisas/assets'

# CLEAN + IMPORT
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

bpy.ops.import_scene.gltf(filepath=f'{ASSETS}/dji-mavic-3/source/DJI-Mavic_3.glb')

# DISCOVER
for obj in bpy.data.objects:
    info = f'Name: {obj.name} | Type: {obj.type}'
    info += f' | Parent: {obj.parent.name if obj.parent else None}'
    info += f' | Loc: {[round(x,2) for x in obj.location]}'
    info += f' | Dim: {[round(x,3) for x in obj.dimensions]}'
    if obj.type == 'MESH':
        info += f' | Verts: {len(obj.data.vertices)}'
        info += f' | Mats: {[m.name for m in obj.data.materials if m]}'
    if obj.children:
        info += f' | Children: {[c.name for c in obj.children]}'
    print(info)

# Bounding box
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
    print(f'\\nBBox Size: {[round(x,2) for x in size]}')
    print(f'Center: {[round(x,2) for x in center]}')
    print(f'Max dim: {round(max(size),2)}')

print(f'\\nTotal objects: {len(bpy.data.objects)}')
print(f'Materials: {[m.name for m in bpy.data.materials]}')
print('DJI Mavic discovery complete')
