// BOBVAT2 playback: original implementation using the app's existing Three.js.
// This is a geometry cache, not a live fluid solver. No topology interpolation.
(function () {
  const vertex = `
attribute float aSlot;
uniform sampler2D uBakePositions,uBakeNormals,uBakeIndices;
uniform vec2 uBakeAtlas,uBakeIndexAtlas;
uniform float uBakeFrame,uBakeRows,uBakeIndexRows,uBakeScale,uBakeShore;
uniform vec3 uBakeCenter;
varying vec3 vBakeWorld,vBakeNormal;
varying float vBakeValid;
vec3 octNormal(vec2 e){
 vec2 f=e*2.0-1.0;vec3 n=vec3(f,1.0-abs(f.x)-abs(f.y));
 float t=clamp(-n.z,0.0,1.0);n.xy+=vec2(n.x>=0.0?-t:t,n.y>=0.0?-t:t);
 return normalize(n);
}
void main(){
 float pair=floor(aSlot*.5);
 vec2 indexUV=(vec2(mod(pair,uBakeIndexAtlas.x),floor(pair/uBakeIndexAtlas.x)+uBakeFrame*uBakeIndexRows)+.5)/uBakeIndexAtlas;
 vec4 indexBytes=floor(texture2D(uBakeIndices,indexUV)*255.0+.5);
 vec2 word=mod(aSlot,2.0)<.5?indexBytes.rg:indexBytes.ba;
 float slot=word.x+256.0*word.y;
 float row=floor(slot/uBakeAtlas.x)+uBakeFrame*uBakeRows;
 vec2 uv=(vec2(mod(slot,uBakeAtlas.x),row)+.5)/uBakeAtlas;
 vec4 baked=texture2D(uBakePositions,uv);
 vec3 p=baked.xyz+uBakeCenter;
 p.x*=uBakeScale;p.z=(p.z-uBakeShore)*uBakeScale+baseShore(p.x);p.y=p.y*uBakeScale+uTide;
 vec3 n=octNormal(texture2D(uBakeNormals,uv).rg);
 // Apply the same gently curved shoreline mapping to positions and normals.
 float curve=.045*cos(p.x*.10)+.0435*cos(p.x*.29);
 n=normalize(vec3(n.x-curve*n.z,n.y,n.z));
 vec3 baseN;vec3 sea=displacement(p.xz,baseN);
 float weight=smoothstep(.55,.96,bakeMask(p.xz));
 p.y=mix(sea.y,p.y,weight);n=normalize(mix(baseN,n,weight));
 vBakeWorld=p;vBakeNormal=n;vBakeValid=baked.a;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;
  const fragment = `
uniform float uBakeGray;
varying vec3 vBakeWorld,vBakeNormal;
varying float vBakeValid;
void main(){
 if(vBakeValid<.5||bakeMask(vBakeWorld.xz)<=.55)discard;
 vec3 n=normalize(vBakeNormal),v=normalize(cameraPosition-vBakeWorld);
 if(dot(n,v)<0.0)n=-n;
 vec3 color;
 if(uBakeGray>.5){color=vec3(.36,.42,.44)*(.35+.65*max(dot(n,sunDir()),0.0));}
 else{
  float depth=max(.02,vBakeWorld.y-bed(vBakeWorld.xz));
  vec2 ripples=micro(vBakeWorld.xz,length(cameraPosition-vBakeWorld));
  n=normalize(n-vec3(ripples.x,0.0,ripples.y)*.35);
  color=shadeWater(vBakeWorld,n,v,depth,max(0.0,vBakeWorld.y-uTide));
 }
 color=mix(color,sky(normalize(vec3(-v.x,.003,-v.z)),false),seaHaze(length(cameraPosition-vBakeWorld)));
 gl_FragColor=vec4(finish(color),1.0);
}`;
  async function binary(url, expected) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Asset ${response.status}: ${url}`);
    let bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] === 31 && bytes[1] === 139) {
      if (typeof DecompressionStream === 'undefined') throw new Error('This preview requires gzip decompression support.');
      bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    }
    if (bytes.byteLength !== expected) throw new Error('Incomplete wave asset: decoded byte count does not match the manifest.');
    return bytes;
  }
  window.createBakedPlayer = async function (lab, url) {
    const { THREE, engine, uniforms: u } = lab;
    const response = await fetch(url);
    if (!response.ok) throw new Error('The fluid bake has not been exported to this preview yet.');
    const m = await response.json();
    if (m.schema !== 'BOBVAT2') throw new Error('Unsupported wave asset format');
    if (Math.max(m.width,m.height,m.indexWidth,m.indexHeight) > engine.renderer.capabilities.maxTextureSize) throw new Error('Wave texture exceeds this device’s limit.');
    const base = new URL('.', new URL(url, location.href));
    const [p,n,ix] = await Promise.all([
      binary(new URL(m.files.positions.file,base),m.width*m.height*8),
      binary(new URL(m.files.normals.file,base),m.width*m.height*4),
      binary(new URL(m.files.indices.file,base),m.indexWidth*m.indexHeight*4)
    ]);
    const positions = new THREE.DataTexture(new Uint16Array(p.buffer),m.width,m.height,THREE.RGBAFormat,THREE.HalfFloatType);
    const normals = new THREE.DataTexture(n,m.width,m.height,THREE.RGBAFormat,THREE.UnsignedByteType);
    const indices = new THREE.DataTexture(ix,m.indexWidth,m.indexHeight,THREE.RGBAFormat,THREE.UnsignedByteType);
    for (const tex of [positions,normals,indices]) {
      tex.minFilter=tex.magFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.flipY=false;
      tex.colorSpace=THREE.NoColorSpace;tex.needsUpdate=true;
    }
    Object.assign(u,{
      uBakePositions:{value:positions},uBakeNormals:{value:normals},
      uBakeIndices:{value:indices},uBakeIndexAtlas:{value:new THREE.Vector2(m.indexWidth,m.indexHeight)},uBakeIndexRows:{value:m.indexRowsPerFrame},
      uBakeAtlas:{value:new THREE.Vector2(m.width,m.height)},uBakeFrame:{value:0},
      uBakeRows:{value:m.rowsPerFrame},uBakeCenter:{value:new THREE.Vector3(...m.positionCenterM)},
      uBakeScale:{value:1},uBakeShore:{value:m.provenance.shoreY},uBakeGray:{value:1}
    });
    const slots=Float32Array.from({length:m.maxVertices},(_,i)=>i);
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(m.maxVertices*3),3));
    geo.setAttribute('aSlot',new THREE.BufferAttribute(slots,1));
    const code=engine.labPrograms;
    const material=new THREE.ShaderMaterial({uniforms:u,vertexShader:code.environment+code.waves+vertex,
      fragmentShader:code.environment+code.waves+code.waterLight+fragment,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=1;
    engine.scene.add(mesh);
    return {
      manifest:m,mesh,material,
      set(time,scale=1,gray=true,enabled=true){
        scale=Math.max(.875,Math.min(1.125,scale));
        const f=Math.min(m.frameCount-1,Math.max(0,Math.floor(time*m.fps+.5)));
        u.uBakeFrame.value=f;u.uBakeScale.value=scale;u.uBakeGray.value=gray?1:0;
        geo.setDrawRange(0,m.frameVertices[f]);mesh.visible=enabled;u.uBakeOn.value=enabled?1:0;
        u.uBakeBounds.value.set(m.boundsMinM[0]*scale,m.boundsMaxM[0]*scale,
          (m.boundsMinM[2]-m.provenance.shoreY)*scale,(m.boundsMaxM[2]-m.provenance.shoreY)*scale);
      },
      dispose(){engine.scene.remove(mesh);geo.dispose();material.dispose();positions.dispose();normals.dispose();indices.dispose();u.uBakeOn.value=0;}
    };
  };
})();
