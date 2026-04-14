"""Divergence Meter - Scene Setup Template (run after discovery)
Nixie tube material names must be updated after discovery.
"""
import bpy, math
from mathutils import Vector

BLENDS = '/Users/user/Documents/owenisas/blends'
RENDERS = '/Users/user/Documents/owenisas/renders/divergence_meter'

# =============================
# NORMALIZE SCALE
# =============================
all_coords = []
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for v in obj.bound_box:
            all_coords.append(obj.matrix_world @ Vector(v))

min_co = Vector(map(min, zip(*all_coords)))
max_co = Vector(map(max, zip(*all_coords)))
center = (min_co + max_co) / 2
max_dim = max(max_co - min_co)

root = None
for obj in bpy.data.objects:
    if obj.type == 'EMPTY' and obj.parent is None:
        root = obj
        break

if root and max_dim > 2:
    target_size = 0.4
    sf = target_size / max_dim
    root.scale = (sf, sf, sf)
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    all_coords2 = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for v in obj.bound_box:
                all_coords2.append(obj.matrix_world @ Vector(v))
    min2 = Vector(map(min, zip(*all_coords2)))
    max2 = Vector(map(max, zip(*all_coords2)))
    c2 = (min2 + max2) / 2
    root.location.x -= c2.x
    root.location.y -= c2.y
    root.location.z -= min2.z

# =============================
# SCENE SETTINGS
# =============================
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.frame_start = 1
scene.frame_end = 300
scene.render.fps = 30

# =============================
# DARK WORLD - near black
# =============================
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new('World')
    bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value = (0.005, 0.005, 0.008, 1.0)
    bg.inputs['Strength'].default_value = 0.05

# No floor needed - dark void

# =============================
# DRAMATIC LIGHTING
# =============================
# Cool blue rim from behind
bpy.ops.object.light_add(type='AREA', location=(0, -0.3, 0.15))
rim = bpy.context.object
rim.name = 'CoolRim'
rim.data.energy = 3
rim.data.color = (0.3, 0.4, 1.0)
rim.data.size = 0.4
rim.rotation_euler = (0.8, 0, 0)
# Animate: start dark, fade in
rim.data.energy = 0
rim.data.keyframe_insert(data_path='energy', frame=1)
rim.data.energy = 3
rim.data.keyframe_insert(data_path='energy', frame=30)

# Warm key from front-above (simulates nixie tube spill)
bpy.ops.object.light_add(type='POINT', location=(0, 0.15, 0.1))
warm = bpy.context.object
warm.name = 'WarmSpill'
warm.data.energy = 2
warm.data.color = (1.0, 0.6, 0.1)
# Animate
warm.data.energy = 0
warm.data.keyframe_insert(data_path='energy', frame=1)
warm.data.energy = 0
warm.data.keyframe_insert(data_path='energy', frame=50)
warm.data.energy = 2
warm.data.keyframe_insert(data_path='energy', frame=90)

# =============================
# CAMERA - slow reveal dolly
# =============================
bpy.ops.object.camera_add(location=(0, 0.8, 0.1))
cam = bpy.context.object
cam.name = 'DivergenceCam'
cam.data.lens = 85

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0.05))
target = bpy.context.object
target.name = 'DivTarget'

track = cam.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
bpy.context.scene.camera = cam

# Camera dolly: far -> close (frames 1-90)
cam.location.y = 0.8
cam.keyframe_insert(data_path='location', index=1, frame=1)
cam.location.y = 0.4
cam.keyframe_insert(data_path='location', index=1, frame=90)

# =============================
# ORBIT (180 degrees, frames 180-300)
# =============================
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
pivot = bpy.context.object
pivot.name = 'DivPivot'

cam_world = cam.matrix_world.copy()
cam.parent = pivot
cam.matrix_world = cam_world

pivot.rotation_euler = (0, 0, 0)
pivot.keyframe_insert(data_path='rotation_euler', index=2, frame=180)
pivot.rotation_euler[2] = math.radians(180)
pivot.keyframe_insert(data_path='rotation_euler', index=2, frame=300)

# Camera also drifts upward during orbit
cam.keyframe_insert(data_path='location', index=2, frame=180)
cam.location.z += 0.05
cam.keyframe_insert(data_path='location', index=2, frame=300)

print('Divergence Meter scene setup complete')
print('NOTE: Nixie tube emission animation requires material names from discovery.')
print('Identify materials with tube/digit/nixie in name, then animate Emission Strength')
print('Pattern: stagger each tube 8 frames apart, emission 0->8, amber color (1.0, 0.6, 0.1)')
