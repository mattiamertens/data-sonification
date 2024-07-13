import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();
// Set the background color


// Create a camera
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 100;


// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xEBEBEB, 1);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

// Create an object
// const material = new THREE.MeshBasicMaterial({ 
//     color: 0xffffff,
//     wireframe: true
//  });
const uniforms = {
    u_resolution: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_time: {type: 'f', value: 0.0},
    u_frequency: {type: 'f', value: 0.0}
}

const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    wireframe: true
});

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/despacito.mp3', function(buffer){
    sound.setBuffer(buffer);
    window.addEventListener('click', () => {
        sound.play();
    })
})

const analyser = new THREE.AudioAnalyser(sound, 32);
 
const geometry = new THREE.IcosahedronGeometry(40, 16);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Animation loop
const clock = new THREE.Clock();
function animate(time) {
    requestAnimationFrame(animate);

    const random = Math.floor(Math.random() * 10);
    uniforms.u_time.value = clock.getElapsedTime();
    // console.log(uniforms.u_time.value);
    // console.log(random);
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    

    // Render the scene
    renderer.render(scene, camera);
}



// Make the canvas responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loopoop
animate();


// varying vec2 vUv;
//     varying float noise;
//     uniform float time;

//     float turbulence( vec3 p ) {

//     float w = 100.0;
//     float t = -.5;

//     for (float f = 1.0 ; f <= 10.0 ; f++ ){
//         float power = pow( 2.0, f );
//         t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
//     }

//     return t;

//     }

// vUv = uv;

//     // add time to the noise parameters so it's animated
//     noise = 10.0 *  -.10 * turbulence( .5 * normal + time );
//     float b = 5.0 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
//     float displacement = - noise + b;

//     vec3 newPosition = position + normal * displacement;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );