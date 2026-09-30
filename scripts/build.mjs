import fs from 'node:fs';
fs.mkdirSync('dist',{recursive:true});
const read=p=>fs.readFileSync('src/'+p,'utf8');
let html=read('index.html').replace('/* DAYBUOY_CSS */',()=>read('font.css')+'\n'+read('style.css')).replace('/* DAYBUOY_JS */',()=>read('scene-data.js')+'\n'+read('daybuoy.js'));
fs.writeFileSync('dist/index.html',html);
console.log('Built DayBuoy: retained 3D scene and data; new UI.');
