"""Compile/link exported water shaders with Mesa EGL/GLES; no rendering/FPS claim.
Run check-breakers.mjs --export-shaders first. No browser or new dependency.
"""
import ctypes as C
from pathlib import Path
import sys

root = Path(sys.argv[1])
egl = C.CDLL('libEGL.so.1')
egl.eglGetProcAddress.argtypes = [C.c_char_p]
egl.eglGetProcAddress.restype = C.c_void_p
def proc(name, result, *args):
    address = egl.eglGetProcAddress(name.encode())
    if not address:
        raise RuntimeError('Missing GL entry point: '+name)
    return C.CFUNCTYPE(result, *args)(address)

get_display = proc('eglGetPlatformDisplayEXT', C.c_void_p, C.c_uint, C.c_void_p, C.POINTER(C.c_int))
display = get_display(0x31DD, None, None)
initialize = proc('eglInitialize', C.c_uint, C.c_void_p, C.POINTER(C.c_int), C.POINTER(C.c_int))
major, minor = C.c_int(), C.c_int()
assert initialize(display, C.byref(major), C.byref(minor))
assert proc('eglBindAPI', C.c_uint, C.c_uint)(0x30A0)
attributes = (C.c_int*9)(0x3033,1,0x3040,0x40,0x3024,8,0x3025,0,0x3038)
config, count = C.c_void_p(), C.c_int()
assert proc('eglChooseConfig',C.c_uint,C.c_void_p,C.POINTER(C.c_int),C.POINTER(C.c_void_p),C.c_int,C.POINTER(C.c_int))(display,attributes,C.byref(config),1,C.byref(count)) and count.value
context = proc('eglCreateContext',C.c_void_p,C.c_void_p,C.c_void_p,C.c_void_p,C.POINTER(C.c_int))(display,config,None,(C.c_int*3)(0x3098,3,0x3038))
assert context
assert proc('eglMakeCurrent',C.c_uint,C.c_void_p,C.c_void_p,C.c_void_p,C.c_void_p)(display,None,None,context)
create_shader=proc('glCreateShader',C.c_uint,C.c_uint)
set_source=proc('glShaderSource',None,C.c_uint,C.c_int,C.POINTER(C.c_char_p),C.POINTER(C.c_int))
compile_shader=proc('glCompileShader',None,C.c_uint)
shader_status=proc('glGetShaderiv',None,C.c_uint,C.c_uint,C.POINTER(C.c_int))
shader_log=proc('glGetShaderInfoLog',None,C.c_uint,C.c_int,C.POINTER(C.c_int),C.c_char_p)
create_program=proc('glCreateProgram',C.c_uint)
attach_shader=proc('glAttachShader',None,C.c_uint,C.c_uint)
link=proc('glLinkProgram',None,C.c_uint)
program_status=proc('glGetProgramiv',None,C.c_uint,C.c_uint,C.POINTER(C.c_int))
program_log=proc('glGetProgramInfoLog',None,C.c_uint,C.c_int,C.POINTER(C.c_int),C.c_char_p)

common='#version 300 es\nprecision highp float;\nprecision highp int;\n#define texture2D texture\n'
vertex=common+'#define attribute in\n#define varying out\nuniform mat4 modelMatrix,modelViewMatrix,projectionMatrix,viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nin vec3 position,normal;\nin vec2 uv;\n'
fragment=common+'#define varying in\nout vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor\nuniform vec3 cameraPosition;\n'
def compile_file(name, kind):
    shader=create_shader(kind)
    text=((vertex if kind==0x8B31 else fragment)+(root/(name+'.glsl')).read_text()).encode()
    ptr=C.c_char_p(text);set_source(shader,1,C.byref(ptr),None);compile_shader(shader)
    status=C.c_int();shader_status(shader,0x8B81,C.byref(status))
    if not status.value:
        log=C.create_string_buffer(32768);shader_log(shader,len(log),None,log)
        raise RuntimeError(name+': '+log.value.decode())
    return shader

for vert, frag in [('oceanVertex','oceanFragment'),('quadVertex','foamFragment')]:
    vs,fs=compile_file(vert,0x8B31),compile_file(frag,0x8B30)
    program=create_program();attach_shader(program,vs);attach_shader(program,fs);link(program)
    status=C.c_int();program_status(program,0x8B82,C.byref(status))
    if not status.value:
        log=C.create_string_buffer(32768);program_log(program,len(log),None,log)
        raise RuntimeError(frag+' link: '+log.value.decode())
    print('PASS: Mesa GLES3 compilation + link:',vert,'/',frag)
print('Compilation only. Not an iPhone, browser, image-quality or performance test.')
