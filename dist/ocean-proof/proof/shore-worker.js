import {computeShoreField} from '../vendor/tidewater/src/world/ShoreField.js';
import {TerrainData} from '../vendor/tidewater/src/world/TerrainData.js';
import {retainObliqueSurf} from './open-coast-shore.js';
import {shoreDirection} from './shore-direction.js';
let terrain;
onmessage=e=>{
 const {id,data,propagation,tide}=e.data;
 if(data)terrain=Object.assign(Object.create(TerrainData.prototype),data);
 if(!terrain)return;
 try{const raw=computeShoreField(terrain,{res:512,swellDir:propagation,seaLevel:tide});const field=e.data.retainSurf===false?raw:retainObliqueSurf(raw,propagation);const direction=shoreDirection(field.data,field.res,terrain.origin,terrain.size);postMessage({id,field,direction},[field.data.buffer,direction.buffer]);}
 catch(error){postMessage({id,error:String(error)});}
};
