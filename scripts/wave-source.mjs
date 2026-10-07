import fs from 'node:fs';
function once(source,from,to){
 if(source.split(from).length!==2)throw Error('Wave build anchor changed: '+from.slice(0,70));
 return source.replace(from,()=>to);
}
export function waveSource(source){
 source=once(source,'/* ===== lip-detail.js ===== */',fs.readFileSync('src/breaker-pass.js','utf8')+'\n/* ===== lip-detail.js ===== */');
 source=once(source,'const oceanFragment = environment+waves+waterLight+lipDetailGLSL+`',"const oceanFragment = __mods['breaker-pass.js'].patchOcean(environment+waves+waterLight+lipDetailGLSL+`");
 source=once(source,'}`;\n\nconst foamFragment = environment+waves+`',"}`);\n\nconst foamFragment = __mods['breaker-pass.js'].patchFoam(environment+waves+`");
 return once(source,'}`;\n\nconst sprayVertex = environment+waves+`','}`);\n\nconst sprayVertex = environment+waves+`');
}
