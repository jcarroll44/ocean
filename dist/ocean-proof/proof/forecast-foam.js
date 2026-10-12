// Adapt the existing MIT Tidewater material, preserving its bubble/lace textures.
export function tuneForecastFoam(foam){
 let s=foam.module.code;
 const replace=(a,b)=>{if(!s.includes(a))throw Error('Foam hook changed: '+a);s=s.replace(a,b);};
 replace('let steps = array<f32, 3>( 0.14, 0.34, 0.7 );','let steps = array<f32, 1>( 0.34 );');
 replace('for ( var i = 0; i < 3; i++ )','for ( var i = 0; i < 1; i++ )');
 replace('sqrt( surfFoamFlowLace( pq / 2.2, pflow / 2.2, 3.0 ).x )','sqrt(max(lace.x,0.0))');
 foam.module.code=s;
}
