import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;
console.log(width, height);
console.log(window.innerWidth, window.innerHeight);

// Create a scene
const scene = new THREE.Scene();
// Set the background color


// Create a camera
const camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 10000);
camera.position.z = 8;


// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setClearColor(0xEBEBEB, 1);

// Disable zooming
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

document.getElementById('canvas').appendChild(renderer.domElement);

const uniforms = {
    u_resolution: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_time: {type: 'f', value: 0.0},
    u_frequency: {type: 'f', value: 0.0}
}

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xFF0000), 
    pointLight = new THREE.PointLight(0x00FF00),
    dl = new THREE.DirectionalLight(0xFF00C8, 100);
    scene.add(ambientLight, pointLight, dl);
    pointLight.position.set(0, 4, 0);
    dl.position.set(-3, 5, 0);

// const helper = new THREE.PointLightHelper(pointLight, 5);
// scene.add(helper);
// const helper2 = new THREE.DirectionalLightHelper(dl, 5);
// scene.add(helper2);

// SPHERE GEOMETRY
let sphereGeometry = new THREE.SphereGeometry(3, 64, 62);
sphereGeometry.positionData = [];
let initialDistances = new Float32Array(sphereGeometry.attributes.position.count);
let v3 = new THREE.Vector3();
for (let i = 0; i < sphereGeometry.attributes.position.count; i++){
    v3.fromBufferAttribute(sphereGeometry.attributes.position, i);
    sphereGeometry.positionData.push(v3.clone());
    initialDistances[i] = v3.length(); // Store initial distance
}


// OUTER MESH
const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('v-shad').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    wireframe: true
});
const geometry = new THREE.IcosahedronGeometry(4, 20);
geometry.positionData = [];
for (let i = 0; i < geometry.attributes.position.count; i++){
    v3.fromBufferAttribute(geometry.attributes.position, i);
    geometry.positionData.push(v3.clone());
} 
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// Add initialDistance attribute
sphereGeometry.setAttribute('initialDistance', new THREE.BufferAttribute(initialDistances, 1));

// SHADER MATERIAL
let sphereMesh = new THREE.ShaderMaterial({
    uniforms: {      
        colorA: { value: new THREE.Color(0x0037B2) },
        colorB: { value: new THREE.Color(0x8DE4F7) },
        u_frequency: {type: 'f', value: 0.0},
        audioData: { value: new Float32Array(32) }
    },
    vertexShader: document.getElementById('v-shad').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    // wireframe: true
});
let sphere = new THREE.Mesh(sphereGeometry, sphereMesh);
// sphere.scale.set(0.4, 0.4, 0.4);
scene.add(sphere);

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

const analyser = new THREE.AudioAnalyser(sound, 32);


let noise = openSimplexNoise.makeNoise4D(Date.now());
// console.log(noise(1,1,1,1));
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

// Function to linearly interpolate between two values
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
// function easeInOutQuad(t) {
//     return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
// }
const transDuration = 0.7;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    let elapsedTime = clock.getElapsedTime();

    let t = Math.min(elapsedTime / transDuration, 1.0);
    // let easedT = easeInOutQuad(t);
    // console.log(easedT);

    let audioData = analyser.data;
    let avgfrequency = analyser.getAverageFrequency();
    // console.log(avgfrequency);

    // Update sphere geometry based on audio data
    sphereGeometry.positionData.forEach((p, idx) => {
        let noiseValue = noise(p.x, p.y, p.z, elapsedTime*0.1)*1.5 + (avgfrequency * 0.01);
        let audioFactor = audioData[idx % audioData.length] / 256;
        let combinedIn = noiseValue + audioFactor;
        
        v3.copy(p).addScaledVector(p, combinedIn * 0.1);
        

        sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
        // console.log(easedT);
    })
    // sphereGeometry.positionData.forEach((p, idx) => {
    //     let noiseValue = noise(p.x, p.y, p.z, elapsedTime*0.3);
    //     let audioFactor = audioData[idx % audioData.length] / 256;
    //     let combinedIn = noiseValue + (audioFactor * 0.001);
    //     let interpolatedInfluence = easedT * combinedIn;
    //     //let interpolatedInfluence = lerp(0, combinedIn, t); 
        
    //     v3.copy(p).addScaledVector(p, interpolatedInfluence * 0.1);
        

    //     sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
    // })
    sphereGeometry.computeVertexNormals();
    sphereGeometry.attributes.position.needsUpdate = true;

    // UPADATE OUTER MESH
    // geometry.positionData.forEach((p, idx) => {
    //     let noiseValue = noise(p.x, p.y, p.z, elapsedTime*10);
    //     let audioFactor = audioData[idx % audioData.length] / 256;
    //     let combinedIn = noiseValue + (audioFactor * 0.001);
    //     let interpolatedInfluence = easedT * combinedIn;
    //     //let interpolatedInfluence = lerp(0, combinedIn, t); 
    //     v3.copy(p).addScaledVector(p, interpolatedInfluence * 0.1);
        
    //     geometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
    // })
    // geometry.computeVertexNormals();
    // geometry.attributes.position.needsUpdate = true;

    // Update audio data
    // sphereMesh.uniforms.audioData.value = audioData;
    // console.log(audioData);

    // uniforms.u_frequency.value = avgfrequency;
    // sphereMesh.uniforms.u_frequency.value = avgfrequency;

    sphere.rotation.y += 0.0006;
    sphere.rotation.x += -0.0006;

    // Update raycaster with mouse position
    raycaster.setFromCamera(mouse, camera);
   
    let direction = mouse3D.clone().sub(sphere.position).normalize();
    sphere.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    // Interpolate sphere scale
    let scale = 1.4 * 0.6;
    sphere.scale.set(scale, scale, scale);

    // Render the scene
    renderer.render(scene, camera);
}


// Make the canvas responsive
window.addEventListener('resize', () => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Start the animation loop
animate();


// D3 code for songs
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select(".song-graph")
    .attr("width", width)
    .attr("height", height) 
    .attr("viewBox", `${-width/2} ${-height/2} ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin meet");


// Load data from JSON file
d3.json("./assets/songs.json").then(data =>{
    update(data);
})

var currentAudio = false;
// var currentTrack = null;

function update(data){

    const node = svg.append("g")
        .attr("class", "preview-songs-node")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "single-song")
        .attr('dataSongLink_h', d => "./"+d.link+"_h.mp3")
        .attr('dataSongLink', d => d.link+".mp3")
        .attr('data-title', d => d.title)
        .on('click', function(event, d){
            console.log(sound.context.currentTime);
            console.log(sound);
            if (currentAudio){
                sound.stop();
                $('.current-song')[0].innerHTML = 'nothing';
                currentAudio = false;
            }
            else {
                const linkino = this.getAttribute('dataSongLink_h');
                audioLoader.load(linkino, function(buffer){
                    sound.setBuffer(buffer);
                    sound.play();
                    $('.current-song')[0].innerHTML = d.title;
                    currentAudio = true;
                
                })
            }  
            sound.onEnded = function() {
                console.log('The sound has ended!');
                sound.stop();
                // sound.context.currentTime = 0;
                currentAudio = false;
                $('.current-song')[0].innerHTML = 'nothing';
                sound.setBuffer(null);
            };       
        })
        
    // Sembra che Canzone non serva a nulla
    // const canzone = svg.append('g')
    //     .attr('class', 'audio-node')
    //     .selectAll("audio")
    //     .data(data)
    //     .enter().append('audio')
    //     .attr('href', d => d.link+d.highlight+".mp3")
   
    const simulation1 = d3.forceSimulation() 
    //   .force("charge", d3.forceManyBody())
    //   .force("x", d3.forceX())
    //   .force("y", d3.forceY())
    //   .force("charge", d3.forceManyBody().strength(-15))
    //   .force("charge", d3.forceManyBody().strength(-35).distanceMax(800))
    //   .force("charge", d3.forceManyBody().strength(200).distanceMax(-10))
    //   .force("center", d3.forceCenter(width / 2, height / 2))
    //   .force("collision", d3.forceCollide().radius(60))
    // .force("charge", d3.forceCollide().radius(5).iterations(2))
    .force("r", d3.forceRadial(width/5))
    .on("tick", ticked2);
    console.log(simulation1);
   
    const simulation2 = d3.forceSimulation()
        .force("r", d3.forceRadial(width/2.2))


    function ticked2() {
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .call(drag(simulation1));
    }

    if (width > 768){
        simulation1.nodes(data)
        simulation1.alpha(1)
        simulation1.restart()
    } else{
        simulation2.nodes(data)
        simulation2.alpha(1)
        simulation2.restart()
    }

    function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
}



// Audio toggle
var video = $('.video')[0];
let soundVolume = false;
$('.muter').on('click', function(){
    if (soundVolume) {
        $('.muter-text')[0].innerHTML = "sound on";
        sound.setVolume(1);
        // video.muted = false;
        soundVolume = false;
        console.log('now sound will be on?');

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
        alert('Sound on')

    } else {
        video.muted = true;
    }
})

// VIDEO PLAY PAUSE BASED ON SCROLL
$(window).scroll(function(){
  var scroll = $(this).scrollTop();
  scroll > height/2 ? video.pause() : video.play()
})


