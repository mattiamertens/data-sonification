export const vertexShaderOnline = `
    uniform float u_time;
		uniform float u_frequency;
  
		vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
		vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
		vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
		vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
		vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
  
		// Classic Perlin noise, periodic variant
		float pnoise(vec3 P, vec3 rep) {
		  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
		  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
		  Pi0 = mod289(Pi0);
		  Pi1 = mod289(Pi1);
		  vec3 Pf0 = fract(P); // Fractional part for interpolation
		  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
		  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		  vec4 iy = vec4(Pi0.yy, Pi1.yy);
		  vec4 iz0 = Pi0.zzzz;
		  vec4 iz1 = Pi1.zzzz;
		  vec4 ixy = permute(permute(ix) + iy);
		  vec4 ixy0 = permute(ixy + iz0);
		  vec4 ixy1 = permute(ixy + iz1);
		  vec4 gx0 = ixy0 * (1.0 / 7.0);
		  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
		  gx0 = fract(gx0);
		  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
		  vec4 sz0 = step(gz0, vec4(0.0));
		  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
		  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
		  vec4 gx1 = ixy1 * (1.0 / 7.0);
		  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
		  gx1 = fract(gx1);
		  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
		  vec4 sz1 = step(gz1, vec4(0.0));
		  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
		  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
		  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
		  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
		  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
		  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
		  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
		  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
		  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
		  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
		  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
		  g000 *= norm0.x;
		  g010 *= norm0.y;
		  g100 *= norm0.z;
		  g110 *= norm0.w;
		  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
		  g001 *= norm1.x;
		  g011 *= norm1.y;
		  g101 *= norm1.z;
		  g111 *= norm1.w;
		  float n000 = dot(g000, Pf0);
		  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
		  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
		  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
		  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
		  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
		  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
		  float n111 = dot(g111, Pf1);
		  vec3 fade_xyz = fade(Pf0);
		  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
		  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
		  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
		  return 2.2 * n_xyz;
		}
  
		void main() {
		  float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
		  float displacement = (u_frequency / 30.) * (noise / 10.);
		  vec3 newPosition = position + normal * displacement;
		  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
		}
`;

export const fragmentShaderOnline = `
    void main() {
		  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
`;
export const vertexShader = `
    #define NORMAL

    #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
        varying vec3 vViewPosition;
    #endif

    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    void main() {

        #include <uv_vertex>

        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <normal_vertex>

        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>

        // world-space normal & position for the reflection
        vWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );
        vWorldPosition = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;

    #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
        vViewPosition = - mvPosition.xyz;
    #endif

    }
`;

export const fragmentShader = `
    uniform vec3 colorA;

#define NORMAL

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
    varying vec3 vViewPosition;
#endif

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// simple 3D hash/noise, cheap but good enough to break up symmetry
float hash( vec3 p ) {
    p = fract( p * 0.3183099 + 0.1 );
    p *= 17.0;
    return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) );
}

float noise( vec3 x ) {
    vec3 i = floor( x );
    vec3 f = fract( x );
    f = f * f * ( 3.0 - 2.0 * f );

    return mix(
        mix( mix( hash( i + vec3(0,0,0) ), hash( i + vec3(1,0,0) ), f.x ),
             mix( hash( i + vec3(0,1,0) ), hash( i + vec3(1,1,0) ), f.x ), f.y ),
        mix( mix( hash( i + vec3(0,0,1) ), hash( i + vec3(1,0,1) ), f.x ),
             mix( hash( i + vec3(0,1,1) ), hash( i + vec3(1,1,1) ), f.x ), f.y ),
        f.z
    );
}

void main() {

    #include <clipping_planes_fragment>
    #include <logdepthbuf_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>

    vec3 N = normalize( vWorldNormal );
    vec3 viewDir = normalize( vWorldPosition - cameraPosition );
    vec3 R = reflect( viewDir, N );

    // --- base: mostly black ---
    vec3 envColor = vec3( 0.015 );

    // low-frequency noise to warp the band shape and its brightness,
    // sampled from R so it stays fixed in world space, not screen space
    float warp = noise( R * 2.5 ) - 0.5;        // ~[-0.5, 0.5]
    float brightnessNoise = noise( R * 4.0 + 10.0 );

    // thin bright horizon band — R.y offset by "warp" so the ring bulges/breaks
    float bandY = R.y - 0.05 + warp * 0.18;
    float horizon = 1.0 - smoothstep( 0.0, 0.08, abs( bandY ) );
    horizon *= mix( 0.4, 1.0, brightnessNoise ); // vary brightness along the ring
    envColor += horizon * vec3( 1.0, 0.96, 0.9 ) * 0.8;

    // second, dimmer band lower down, warped independently
    float bandY2 = R.y + 0.35 + ( noise( R * 3.0 + 5.0 ) - 0.5 ) * 0.22;
    float horizon2 = 1.0 - smoothstep( 0.0, 0.1, abs( bandY2 ) );
    horizon2 *= mix( 0.3, 1.0, noise( R * 3.5 + 20.0 ) );
    envColor += horizon2 * vec3( 0.6, 0.55, 0.5 ) * 0.35;

    // tight specular streaks, now with slight noise-based intensity variation
    float streakA = pow( max( 0.0, sin( R.x * 5.0 + R.z * 2.0 + warp * 2.0 ) ), 60.0 );
    float streakB = pow( max( 0.0, sin( R.x * 1.5 - R.z * 4.0 + 2.0 + warp * 1.5 ) ), 80.0 );
    float streakC = pow( max( 0.0, cos( R.y * 4.0 + R.x * 3.0 + warp ) ), 100.0 );
    envColor += ( streakA * 1.1 + streakB * 0.9 + streakC * 0.7 ) * vec3( 1.0, 0.97, 0.9 );

    // fresnel rim, also slightly broken up so it's not a perfect ring
    float fresnel = pow( 1.0 - clamp( dot( -viewDir, N ), 0.0, 1.0 ), 5.0 );
    fresnel *= mix( 0.5, 1.0, brightnessNoise );
    envColor += fresnel * vec3( 0.22, 0.21, 0.19 );

    vec3 tint = mix( vec3( 1.0 ), colorA * 2.0, 0.15 );
    vec3 chrome = envColor * tint;

    chrome = pow( chrome, vec3( 1.1 ) );

    gl_FragColor = vec4( chrome, 1.0 );

    #ifdef OPAQUE
        gl_FragColor.a = 1.0;
    #endif

}
`;