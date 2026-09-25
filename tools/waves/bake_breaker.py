"""Headless Blender/Mantaflow wave tank. SI units; one piston-generated pulse.

blender -b --factory-startup -t 6 --python tools/waves/bake_breaker.py -- \
  --out /tmp/bobuoy-wave --resolution 160 --frames 240 --phase all

The requested 4 ft is a calibration target, NOT an asserted measured result.
The piston stroke uses linear wavemaker theory; exported gauges measure the
actual nonlinear result. This tank is an idealized beach, not surveyed Inlet.
"""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy

G = 9.81

def arguments():
    p = argparse.ArgumentParser()
    p.add_argument('--out', required=True)
    p.add_argument('--resolution', type=int, default=160)
    p.add_argument('--frames', type=int, default=240)
    p.add_argument('--fps', type=int, default=30)
    p.add_argument('--height-ft', type=float, default=4)
    p.add_argument('--period', type=float, default=6)
    p.add_argument('--width', type=float, default=6)
    p.add_argument('--slope', type=float, default=.105)
    p.add_argument('--length', type=float, default=36)
    p.add_argument('--stroke-gain', type=float, default=1)
    p.add_argument('--phase', choices=['build', 'data', 'mesh', 'all'], default='all')
    return p.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])

def select(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

def box(name, location, dimensions):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.object
    o.name = name
    o.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return o

def prism(name, polygon, half_width):
    """Extrude a CCW polygon in the YZ plane along X; outward closed surface."""
    n = len(polygon)
    vertices = [(x, y, z) for x in [-half_width, half_width] for y, z in polygon]
    faces = [tuple(reversed(range(n))), tuple(range(n, 2*n))]
    faces += [(i, (i+1) % n, (i+1) % n+n, i+n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    return o

def effector(o):
    m = o.modifiers.new('Fluid collision', 'FLUID')
    m.fluid_type = 'EFFECTOR'
    bpy.context.view_layer.update()
    m.effector_settings.surface_distance = 1.0
    o.hide_render = True

def wavenumber(period, depth):
    omega = 2*math.pi/period
    k = max(omega*omega/G, omega/math.sqrt(G*depth))
    for _ in range(12):
        t = math.tanh(k*depth)
        k -= (G*k*t-omega*omega)/(G*(t+k*depth*(1-t*t)))
    return k

def build(args, out):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1
    scene.gravity = (0, 0, -G)
    scene.render.fps = args.fps
    scene.frame_start, scene.frame_end = 1, args.frames
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 6
    depth, slope, start_slope = 2.4, args.slope, 3.0
    shore = start_slope + depth/slope
    half_width = args.width/2
    domain = box('Water domain', (0, args.length/2, .25), (args.width, args.length, 6.5))
    mod = domain.modifiers.new('Mantaflow liquid', 'FLUID')
    mod.fluid_type = 'DOMAIN'
    bpy.context.view_layer.update()
    d = mod.domain_settings
    d.domain_type = 'LIQUID'
    d.resolution_max = args.resolution
    d.cache_type = 'MODULAR'
    d.cache_directory = str(out/'cache')
    d.cache_frame_start, d.cache_frame_end = 1, args.frames
    d.cache_data_format = 'UNI'
    d.cache_mesh_format = 'BOBJECT'
    d.use_mesh = True
    d.mesh_scale = 2
    d.mesh_smoothen_pos = 2
    d.mesh_smoothen_neg = 2
    d.particle_number = 2
    d.flip_ratio = .95
    d.timesteps_min = 2
    d.timesteps_max = 8
    d.cfl_condition = 2
    d.use_adaptive_timesteps = True
    d.use_speed_vectors = True
    # Closed sides/floor; a single pulse is reviewed before return reflections.
    for side in ['front','back','left','right','top','bottom']:
        setattr(d, 'use_collision_border_'+side, True)

    bed = prism('Idealized beach', [(-1,-3.5),(args.length+1,-3.5),(args.length+1,(args.length+1-start_slope)*slope-depth),
                                   (start_slope,-depth),(-1,-depth)], half_width+.6)
    effector(bed)
    # The initial water volume follows the bed; a stationary fill, not a dam.
    water = prism('Still water at t0', [(.05,-depth+.03),(start_slope,-depth+.03),
                                       (shore-.2,-.03),(shore-.2,0),(.05,0)], half_width-.025)
    m = water.modifiers.new('Initial fluid volume', 'FLUID')
    m.fluid_type = 'FLOW'
    bpy.context.view_layer.update()
    m.flow_settings.flow_type = 'LIQUID'
    m.flow_settings.flow_behavior = 'GEOMETRY'
    water.hide_render = True

    k = wavenumber(args.period, depth)
    kd = k*depth
    transfer = 4*math.sinh(kd)**2/(math.sinh(2*kd)+2*kd)
    height = args.height_ft*.3048
    stroke = height/transfer*args.stroke_gain
    piston = box('Wave piston', (0, -1.1, 0), (args.width+1, 3.0, 7.0))
    effector(piston)
    # Smooth advance and return: produces a crest followed by a trough.
    # No fake animated wave surface is used to produce the baked result.
    for frame in range(1, args.frames+1):
        t = (frame-1)/args.fps
        phase = min(1, max(0, (t-.35)/args.period))
        piston.location.y = -1.1 + stroke*.5*(1-math.cos(2*math.pi*phase))
        piston.keyframe_insert(data_path='location', frame=frame)
    for fc in piston.animation_data.action.fcurves:
        for point in fc.keyframe_points:
            point.interpolation = 'LINEAR'
    scene.frame_set(1)
    select(domain)
    meta = dict(schema='bobuoy-wave-tank-v1', blender=bpy.app.version_string,
                targetIndividualHeightM=height, targetPeriodS=args.period,
                heightValidated=False, depthM=depth, slope=slope, shoreY=shore,
                widthM=args.width, tankLengthM=args.length, frameCount=args.frames,
                fps=args.fps, resolution=args.resolution,
                voxelSizeM=args.length/args.resolution, pistonStrokeM=stroke,
                linearWavemakerTransfer=transfer, coordinateSystem='Blender Z up; +Y shoreward',
                source='Blender Mantaflow FLIP; idealized piston wave tank',
                note='Single-pulse prototype. Measured crest-to-trough height must be calibrated before a 4 ft claim.')
    (out/'tank.json').write_text(json.dumps(meta, indent=2))
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'breaker.blend'))
    print('WAVE_TANK_BUILT', json.dumps(meta), flush=True)
    return domain

def main():
    args = arguments()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    if args.phase in ['build','all']:
        domain = build(args, out)
    else:
        bpy.ops.wm.open_mainfile(filepath=str(out/'breaker.blend'))
        domain = bpy.data.objects['Water domain']
        select(domain)
    if args.phase in ['data','all']:
        print('BAKE_DATA_START', flush=True)
        bpy.ops.fluid.bake_data()
        print('BAKE_DATA_COMPLETE', flush=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(out/'breaker.blend'))
    if args.phase in ['mesh','all']:
        print('BAKE_MESH_START', flush=True)
        bpy.ops.fluid.bake_mesh()
        bpy.ops.wm.save_as_mainfile(filepath=str(out/'breaker.blend'))
        print('BAKE_MESH_COMPLETE', flush=True)

if __name__ == '__main__':
    main()
