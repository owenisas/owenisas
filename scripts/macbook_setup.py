"""MacBook Pro M3 - Scene Setup (run after discovery)
Sets up lighting, animation, and render config.
Object names must be updated after discovery phase.
"""
import bpy, math
from mathutils import Vector

BLENDS = '/Users/user/Documents/owenisas/blends'
RENDERS = '/Users/user/Documents/owenisas/renders/macbook_pro'

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
size = max_co - min_co
max_dim = max(size)

# Find root empty
root = None
for obj in bpy.data.objects:
    if obj.type == 'EMPTY' and obj.parent is None:
        root = obj
        break

if root and max_dim > 2:
    target_size = 0.5  # laptop ~0.5 Blender units
    scale_factor = target_size / max_dim
    root.scale = (scale_factor, scale_factor, scale_factor)
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Re-center
    all_coords2 = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for v in obj.bound_box:
                all_coords2.append(obj.matrix_world @ Vector(v))
    min2 = Vector(map(min, zip(*all_coords2)))
    max2 = Vector(map(max, zip(*all_coords2)))
    center2 = (min2 + max2) / 2
    root.location.x -= center2.x
    root.location.y -= center2.y
    root.location.z -= min2.z
    print(f'Scaled by {scale_factor}, centered')

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
# DARK SURFACE + WORLD
# =============================
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new('World')
    bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
if bg:
    bg.inputs['Color'].default_value = (0.02, 0.02, 0.03, 1.0)
    bg.inputs['Strength'].default_value = 0.3

# Reflective dark floor
bpy.ops.mesh.primitive_plane_add(size=5, location=(0, 0, 0))
floor = bpy.context.object
floor.name = 'MacBookFloor'
mat = bpy.data.materials.new('DarkReflective')
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (0.015, 0.015, 0.02, 1)
bsdf.inputs['Roughness'].default_value = 0.08
floor.data.materials.append(mat)

# =============================
# APPLE-STYLE LIGHTING
# =============================
# Soft overhead area light
bpy.ops.object.light_add(type='AREA', location=(0, 0, 0.8))
key = bpy.context.object
key.name = 'OverheadKey'
key.data.energy = 20
key.data.color = (1.0, 0.98, 0.95)
key.data.size = 1.0
key.rotation_euler = (0, 0, 0)

# Left accent
bpy.ops.object.light_add(type='AREA', location=(-0.5, 0.2, 0.15))
left = bpy.context.object
left.name = 'LeftAccent'
left.data.energy = 8
left.data.color = (0.95, 0.95, 1.0)
left.data.size = 0.3
left.rotation_euler = (0, 1.3, 0)

# Right accent
bpy.ops.object.light_add(type='AREA', location=(0.5, 0.2, 0.15))
right = bpy.context.object
right.name = 'RightAccent'
right.data.energy = 8
right.data.color = (0.95, 0.95, 1.0)
right.data.size = 0.3
right.rotation_euler = (0, -1.3, 0)

# Back rim
bpy.ops.object.light_add(type='AREA', location=(0, -0.4, 0.1))
rim = bpy.context.object
rim.name = 'BackRim'
rim.data.energy = 5
rim.data.color = (0.9, 0.9, 1.0)
rim.data.size = 0.8
rim.rotation_euler = (1.0, 0, 0)

# =============================
# CAMERA
# =============================
bpy.ops.object.camera_add(location=(0.5, 0.4, 0.2))
cam = bpy.context.object
cam.name = 'MacBookCam'
cam.data.lens = 65

# Target
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0.05))
target = bpy.context.object
target.name = 'MacBookTarget'

track = cam.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
bpy.context.scene.camera = cam

print('MacBook scene setup complete')
# NOTE: Lid animation requires identifying lid vs base objects after discovery.
# Run lid animation as separate step once object names are confirmed.
