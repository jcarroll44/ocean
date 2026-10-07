import {computeShoreField} from '../vendor/tidewater/src/world/ShoreField.js';
import {TerrainData} from '../vendor/tidewater/src/world/TerrainData.js';
let terrain;
onmessage=e=>{
 const {id,data,propagation,tide}=e.data;
 if(data)terrain=Object.assign(Object.create(TerrainData.prototype),data);
 if(!terrain)return;
 try{const field=computeShoreField(terrain,{res:512,swellDir:propagation,seaLevel:tide});postMessage({id,field},[field.data.buffer]);}
 catch(error){postMessage({id,error:String(error)});}
};
