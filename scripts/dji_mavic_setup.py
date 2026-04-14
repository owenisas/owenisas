"""DJI Mavic 3 - Scene Setup Template (run after discovery)
Object names for arms/propellers must be updated after discovery.
"""
import bpy, math
from mathutils import Vector

BLENDS = '/Users/user/Documents/owenisas/blends'
RENDERS = '/Users/user/Documents/owenisas/renders/dji_mavic'

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
    print(f'Scaled by {sf}')

# =============================
# SCENE SETTINGS
# =============================
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.frame_start = 1
scene.frame_end = 360
scene.render.fps = 30

# =============================
# CLEAN STUDIO WORLD
# =============================
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new('World')
    bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value = (0.15, 0.15, 0.18, 1.0)
    bg.inputs['Strength'].default_value = 0.5

# White floor
bpy.ops.mesh.primitive_plane_add(size=5, location=(0, 0, 0))
floor = bpy.context.object
floor.name = 'StudioFloor'
mat = bpy.data.materials.new('LightFloor')
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (0.8, 0.8, 0.82, 1)
bsdf.inputs['Roughness'].default_value = 0.3
floor.data.materials.append(mat)

# =============================
# TECH PRODUCT LIGHTING
# =============================
# Large soft key from upper right
bpy.ops.object.light_add(type='AREA', location=(0.5, 0.3, 0.6))
key = bpy.context.object
key.name = 'DJI_Key'
key.data.energy = 25
key.data.color = (1.0, 0.98, 0.95)
key.data.size = 0.8
key.rotation_euler = (-0.6, 0.3, 0)

# Fill from left
bpy.ops.object.light_add(type='AREA', location=(-0.4, 0.2, 0.4))
fill = bpy.context.object
fill.name = 'DJI_Fill'
fill.data.energy = 10
fill.data.size = 0.5
fill.rotation_euler = (-0.4, -0.3, 0)

# Rim from behind-below
bpy.ops.object.light_add(type='AREA', location=(0, -0.4, 0.05))
rim = bpy.context.object
rim.name = 'DJI_Rim'
rim.data.energy = 12
rim.data.color = (0.9, 0.95, 1.0)
rim.data.size = 0.6
rim.rotation_euler = (1.2, 0, 0)

# =============================
# CAMERA
# =============================
bpy.ops.object.camera_add(location=(0.45, 0.35, 0.25))
cam = bpy.context.object
cam.name = 'DJICam'
cam.data.lens = 60

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0.05))
target = bpy.context.object
target.name = 'DJITarget'

track = cam.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
bpy.context.scene.camera = cam

print('DJI scene setup complete')
# NOTE: Arm unfold + propeller + hover animations require object name mapping from discovery.
