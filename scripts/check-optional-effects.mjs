import assert from 'node:assert/strict';
import {createOptionalEffects,installOptionalSky} from '../ocean-proof/proof/optional-effects.js';
const removed=[],messages=[],spray={mesh:{visible:true},update(){return 1;}},rain={visible:true};
const app={scene:{remove(mesh){removed.push(mesh)}},spray,weatherSurfaces:{rain},
 engine:{meshRenderer:{pipelines:new Map([
  ['p0',{label:'Spray main',handle:{failed:true}}],
  ['p1',{label:'Forecast thin rain particles main',handle:{failed:true}}]
 ])}},nativeWeather:{module:{code:'fn nativeStormBolt(dir:vec3f)->vec3f {return vec3f(1.0);}\nfn nativeCloudShadow(P:vec3f)->f32{return 1.0;}'},uniforms:{fields:{flash:{value:1}}}}};
const fx=createOptionalEffects(app,e=>messages.push(e));
const outcome=fx.checkPipelines();
assert.equal(outcome.disabled.length,2);assert.equal(outcome.degraded,true);
assert.equal(spray.mesh.visible,false);assert.equal(spray.update(),undefined);
assert.equal(rain.visible,false);assert.equal(removed.length,2);
assert.equal(messages.filter(e=>e.status==='effect-disabled').length,2);
fx.checkPipelines();assert.equal(messages.length,2,'Disable events are emitted exactly once');
app.engine.meshRenderer.pipelines.set('core',{label:'Water main',handle:{failed:true}});
assert.throws(()=>fx.checkPipelines(),/Mandatory GPU pipeline/,'Never hide a failed water pipeline');
app.engine.meshRenderer.pipelines.delete('core');
let creates=0;
const create=()=>({stand:{},pass:{handle:{failed:++creates===1,label:'DayBuoy native sky'}}});
const sky=await installOptionalSky(app,create,{pipelinesReady:async()=>{}},fx);
assert.equal(creates,2);assert.equal(sky.pass.handle.failed,false);
assert.equal(app.nativeWeather.lightningDisabled,true);
assert.equal(app.nativeWeather.uniforms.fields.flash.value,0);
assert(app.nativeWeather.module.code.includes('return vec3f(0.0)'));
assert.equal(fx.describe().disabled.length,3);
const skyOk=await installOptionalSky(app,()=>({pass:{handle:{failed:false}}}),{pipelinesReady:async()=>{}},fx);
assert(skyOk.pass);
console.log('PASS: optional spray/rain/bolt pipeline failures disable only those effects, once; core-water errors still throw. Mock handles, not iPhone WGSL evidence.');
