import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

const i_width = window.innerWidth;
const i_height = window.innerHeight;

const container = document.getElementById('canvas');
const c_width = container.clientWidth;
const c_height = container.clientHeight;

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(100, c_width / c_height);
camera.position.z = 8;


// Create a renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(c_width, c_height);
renderer.setClearColor(0xEBEBEB, 1);

// Disable zooming
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

document.getElementById('canvas').appendChild(renderer.domElement);

// SPHERE GEOMETRY
let sphereGeometry = new THREE.SphereGeometry(3, 100, 100);
sphereGeometry.positionData = [];
let initialDistances = new Float32Array(sphereGeometry.attributes.position.count);
let v3 = new THREE.Vector3();
for (let i = 0; i < sphereGeometry.attributes.position.count; i++){
    v3.fromBufferAttribute(sphereGeometry.attributes.position, i);
    sphereGeometry.positionData.push(v3.clone());
    initialDistances[i] = v3.length(); // Store initial distance
}

// Add initialDistance attribute
sphereGeometry.setAttribute('initialDistance', new THREE.BufferAttribute(initialDistances, 1));

// SHADER MATERIAL
let sphereMesh = new THREE.ShaderMaterial({
    uniforms: {      
        colorA: {type: 'vec3', value: new THREE.Vector3(0.5, 0.5, 0.5)},
    },
    vertexShader: document.getElementById('codeV').textContent,
    fragmentShader: document.getElementById('codeF').textContent,
    // wireframe: true
});



let sphere = new THREE.Mesh(sphereGeometry, sphereMesh);
scene.add(sphere);

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
const linkino = '../assets/albums/Venere/Venere.mp3';

audioLoader.load(linkino, function(buffer){
    sound.setBuffer(buffer);

    scrubber.max = sound.buffer.duration;
    songStartTime = sound.context.currentTime;
    sound.offset = 0;
    pausedAt = 0;
    // sound.play();
    
    currentAudio = linkino;

    requestWakeLock();
    console.log('New song');
    console.log(songStartTime);
    

    const timeDisplay = document.getElementById('song-duration');
    const songDuration = formatTime(sound.buffer.duration);
    timeDisplay.innerHTML = `${songDuration}`;

})

// TEST
// if (currentAudio === linkino){
//     if (sound.isPlaying){
//         // Stop SAME song that is already playing

//         pausedAt = timePassed
//         console.log('paused at: ' + pausedAt);
        
//         sound.stop();
//         // currentSong.innerHTML = 'Nothing';
//         // currentAudio = null;
        
//         playButton.text('Play');
//         pauseText.innerHTML = "Play";
//         trackTitle.removeClass('bold underlined');
//         $(this).removeClass('active');

//     }
//     else {
//         // Resume SAME song
//         audioLoader.load(linkino, function(buffer){
//             sound.setBuffer(buffer);
//             console.log(pausedAt);
            
//             sound.offset = pausedAt;
//             songStartTime = sound.context.currentTime - pausedAt;
//             sound.play();

//             console.log(songStartTime);
            
//         })

//         console.log('Same song');

//         playButton.text('Pause');
//         trackTitle.addClass('bold underlined');
//         $(this).addClass('active');
//     }
// }

const analyser = new THREE.AudioAnalyser(sound, 32);


let noise = openSimplexNoise.makeNoise4D(Date.now());
let clock = new THREE.Clock();

// Mouse position
let mouse = new THREE.Vector2();
let mouse3D = new THREE.Vector3();
let raycaster = new THREE.Raycaster();

// Add event listener for mouse move
window.addEventListener('mousemove', (event) => {
    // Normalize mouse position to range [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Convert mouse position to 3D
    mouse3D.set(mouse.x, mouse.y, 0);
    mouse3D.unproject(camera);
});

const transDuration = 0.7;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    let elapsedTime = clock.getElapsedTime()/1.0;
    // console.log(elapsedTime);

    let audioData = analyser.data;
    let avgfrequency = analyser.getAverageFrequency()/60;
    // console.log(audioData);


    sphereGeometry.positionData.forEach((p, idx) => {
        let audioFactor = audioData[idx % audioData.length] / 256;
        let noiseValue = noise(
            p.x * (avgfrequency), 
            p.y * (avgfrequency), 
            p.z * (avgfrequency), 
            elapsedTime * 0.7
        );
        
        // Apply a low-pass filter or smooth the noise value over time
        let smoothNoiseValue = lerp(p.noisePrevValue || noiseValue, noiseValue, 0.01);
        p.noisePrevValue = smoothNoiseValue; // Store the previous noise value for smoothing
        
        // Scale down the noise contribution to make the transition smoother
        let combinedValue = smoothNoiseValue + audioFactor * 0.005;
    
        v3.copy(p).addScaledVector(p, combinedValue);
        sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
    });
    
    // Function to linearly interpolate between two values
    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    sphereGeometry.computeVertexNormals();
    sphereGeometry.attributes.position.needsUpdate = true;

    sphere.rotation.y += 0.0006;
    sphere.rotation.x += -0.0006;

    // Update raycaster with mouse position
    raycaster.setFromCamera(mouse, camera);
   
    let direction = mouse3D.clone().sub(sphere.position).normalize();
    sphere.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    console.log('resizing');
}
window.addEventListener('resize', onWindowResize);

// Start the animation loop
animate();



// SCRUBBER PLAYBACK
const scrubber = document.getElementById('scrubber');
let isDragging = false;
let songStartTime = 0;
let timePassed = 0;
let pausedAt = 0;
let isPaused = false;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

function updateScrubber() {
    if (!isDragging && sound.isPlaying) {
        timePassed = (sound.context.currentTime - songStartTime);
        scrubber.value = (timePassed / sound.buffer.duration) * scrubber.max;

        // console.log(timePassed);
        const currentTimeDisplay = document.getElementById('current-time-display');
        if (currentTimeDisplay) {
            currentTimeDisplay.innerHTML = formatTime(timePassed);
        }
    }
    requestAnimationFrame(updateScrubber);      
}

$('.pause').on('click', playPauseText);
let pauseText = document.getElementsByClassName('pause-text')[0];

function playPauseText(){
    console.log('central pause button clicked');
    
    if (sound.isPlaying){
        pausedAt = timePassed
        sound.stop();
        pauseText.innerHTML = "Play";
    } else {
        sound.offset = pausedAt;
        songStartTime = sound.context.currentTime - pausedAt;
        sound.play();
        pauseText.innerHTML = "Pause";
    }
}


scrubber.addEventListener('input', function() {
    isDragging = true;
});

scrubber.addEventListener("change", function () {
    const newTime = (scrubber.value / scrubber.max) * sound.buffer.duration;
    sound.stop();
        
    songStartTime = sound.context.currentTime - newTime;
    sound.offset = newTime;
    
    sound.play();

    pauseText.innerHTML = "Pause";
    isDragging = false;
    console.log('scrubber changed');
    console.log(newTime);
    
});

var currentAudio = null;


requestAnimationFrame(updateScrubber);




// Audio toggle
var video = $('.video')[0];
let soundVolume = false;
$('.muter').on('click', function(){
    if (soundVolume) {
        $('.muter-text')[0].innerHTML = "sound on";
        sound.setVolume(1);
        soundVolume = false;

    } else {
        $('.muter-text')[0].innerHTML = "sound off";
        sound.setVolume(0);
        // video.muted = true;
        soundVolume = true;
    }
})


// HOMEPAGE
$('.audioToggle').on('click', function(){
    if(video.muted){
        video.muted = false;

    } else {
        video.muted = true;
    }
})

// WAKELOCK to keep the screen on
let wakelock = null;

async function requestWakeLock() {
    wakelock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock is active!');
}

function releaseWakeLock() {
    if (wakelock !== null) {
        wakelock.release();
        wakelock = null;
        console.log('Wake Lock is released!');
    }
    
}