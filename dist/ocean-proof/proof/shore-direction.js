// Same bilinear direction/exposure values as the pinned ShoreWaves.buildDirTexture.
export function shoreDirection(data,fres,origin,tsize,{min={x:-190,y:-170},size=380,res=128}={}){
		const out = new Float32Array( res * res * 4 );
		for ( let j = 0; j < res; j ++ ) for ( let i = 0; i < res; i ++ ) {

			const x = min.x + ( i + 0.5 ) / res * size, z = min.y + ( j + 0.5 ) / res * size;
			const fx = Math.min( Math.max( ( x - origin ) / tsize * fres - 0.5, 0 ), fres - 1.001 );
			const fz = Math.min( Math.max( ( z - origin ) / tsize * fres - 0.5, 0 ), fres - 1.001 );
			const i0 = Math.floor( fx ), j0 = Math.floor( fz ), tx = fx - i0, tz = fz - j0;
			const at = ( c ) => {

				const a = data[ ( j0 * fres + i0 ) * 4 + c ], b = data[ ( j0 * fres + i0 + 1 ) * 4 + c ];
				const cc = data[ ( ( j0 + 1 ) * fres + i0 ) * 4 + c ], d = data[ ( ( j0 + 1 ) * fres + i0 + 1 ) * 4 + c ];
				return ( a * ( 1 - tx ) + b * tx ) * ( 1 - tz ) + ( cc * ( 1 - tx ) + d * tx ) * tz;

			};

			const dx = at( 1 ), dz = at( 2 );
			const e = Math.hypot( dx, dz ) || 1e-4;
			const k = ( j * res + i ) * 4;
			out[ k ] = dx / e;
			out[ k + 1 ] = dz / e;
			out[ k + 2 ] = Math.min( 1, e * 1.4 );
			out[ k + 3 ] = 1;

		}

return out;
}
