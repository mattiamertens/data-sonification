// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

// const container = document.getElementById('canvas');
// const c_width = container.clientWidth;
// const c_height = container.clientHeight;

// // Create a scene
// const scene = new THREE.Scene();
// // Set the background color


// // Create a camera
// const camera = new THREE.PerspectiveCamera(100, c_width / c_height, 0.1, 10000);
// camera.position.z = 8;



// // Create a renderer
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(c_width, c_height);
// renderer.setClearColor(0xEBEBEB, 1);

// // Disable zooming
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableZoom = false;

// document.getElementById('canvas').appendChild(renderer.domElement);

// // SPHERE GEOMETRY
// let sphereGeometry = new THREE.SphereGeometry(3, 100, 100);
// sphereGeometry.positionData = [];
// let initialDistances = new Float32Array(sphereGeometry.attributes.position.count);
// let v3 = new THREE.Vector3();
// for (let i = 0; i < sphereGeometry.attributes.position.count; i++){
//     v3.fromBufferAttribute(sphereGeometry.attributes.position, i);
//     sphereGeometry.positionData.push(v3.clone());
//     initialDistances[i] = v3.length(); // Store initial distance
// }


// // Add initialDistance attribute
// sphereGeometry.setAttribute('initialDistance', new THREE.BufferAttribute(initialDistances, 1));

// // SHADER MATERIAL
// let sphereMesh = new THREE.ShaderMaterial({
//     uniforms: {      
//         colorA: {type: 'vec3', value: new THREE.Vector3(0.5, 0.5, 0.5)},
//     },
//     vertexShader: document.getElementById('codeV').textContent,
//     fragmentShader: document.getElementById('codeF').textContent,
//     // wireframe: true
// });
// let sphere = new THREE.Mesh(sphereGeometry, sphereMesh);
// scene.add(sphere);

// const listener = new THREE.AudioListener();
// camera.add(listener);

// const sound = new THREE.Audio(listener);
// const audioLoader = new THREE.AudioLoader();

// const analyser = new THREE.AudioAnalyser(sound, 32);


// let noise = openSimplexNoise.makeNoise4D(Date.now());
// let clock = new THREE.Clock();

// // Mouse position
// let mouse = new THREE.Vector2();
// let mouse3D = new THREE.Vector3();
// let raycaster = new THREE.Raycaster();

// // Add event listener for mouse move
// window.addEventListener('mousemove', (event) => {
//     // Normalize mouse position to range [-1, 1]
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

//     // Convert mouse position to 3D
//     mouse3D.set(mouse.x, mouse.y, 0);
//     mouse3D.unproject(camera);
// });

// const transDuration = 0.7;

// // Animation loop
// function animate() {
//     requestAnimationFrame(animate);
//     let elapsedTime = clock.getElapsedTime()/1.0;

//     let audioData = analyser.data;
//     let avgfrequency = analyser.getAverageFrequency()/60;

//     sphereGeometry.positionData.forEach((p, idx) => {
//         let audioFactor = audioData[idx % audioData.length] / 256;
//         let noiseValue = noise(
//             p.x * (avgfrequency), 
//             p.y * (avgfrequency), 
//             p.z * (avgfrequency), 
//             elapsedTime * 0.7
//         );
        
//         // Apply a low-pass filter or smooth the noise value over time
//         let smoothNoiseValue = lerp(p.noisePrevValue || noiseValue, noiseValue, 0.01);
//         p.noisePrevValue = smoothNoiseValue; // Store the previous noise value for smoothing
        
//         // Scale down the noise contribution to make the transition smoother
//         let combinedValue = smoothNoiseValue + audioFactor * 0.005;
    
//         v3.copy(p).addScaledVector(p, combinedValue);
//         sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
//     });
    
//     // Function to linearly interpolate between two values
//     function lerp(start, end, t) {
//         return start * (1 - t) + end * t;
//     }
    

//     sphereGeometry.computeVertexNormals();
//     sphereGeometry.attributes.position.needsUpdate = true;


//     sphere.rotation.y += 0.006+avgfrequency;
//     sphere.rotation.x += -0.006;

//     // Update raycaster with mouse position
//     raycaster.setFromCamera(mouse, camera);
   
//     let direction = mouse3D.clone().sub(sphere.position).normalize();
//     sphere.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

//     // Interpolate sphere scale
//     let scale = 1.4 * 0.6;
//     sphere.scale.set(scale, scale, scale);

//     // Render the scene
//     renderer.render(scene, camera);
// }


// // Make the canvas responsive
// // window.addEventListener('resize', () => {
// //     camera.aspect = width / height;
// //     camera.updateProjectionMatrix();
// //     renderer.setSize(width, height);
// // });
// function onWindowResize() {
//     const newWidth = container.clientWidth;
//     const newHeight = container.clientHeight;
//     camera.aspect = newWidth / newHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(newWidth, newHeight);
//     console.log('resizing');
// }
// window.addEventListener('resize', onWindowResize);

// // Start the animation loop
// animate();


// // D3 code for songs
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// const svg = d3.select(".song-graph")
//     .attr("width", width)
//     .attr("height", height) 
//     .attr("viewBox", `${-width/2} ${-height/2} ${width} ${height}`)
//     .attr("preserveAspectRatio", "xMinYMin meet");


// // Load data from JSON file
// d3.json("./assets/songs_D&P.json").then(data =>{
//     update(data);
// })

// var currentAudio = false;
// // var currentTrack = null;

// function update(data){

//     const node = svg.append("g")
//         .attr("class", "preview-songs-node")
//         .selectAll("circle")
//         .data(data)
//         .enter().append("circle")
//         .attr("class", "single-song")
//         .attr('dataSongLink_h', d => "./"+d.link+"_h.mp3")
//         .attr('dataSongLink', d => d.link+".mp3")
//         .attr('data-title', d => d.title)
//         .on('click', function(event, d){

//             if (currentAudio){
//                 sound.stop();
//                 $('.current-song')[0].innerHTML = 'nothing';
//                 currentAudio = false;
//                 $(this).removeClass('active');
//             }
//             else {
//                 const linkino = this.getAttribute('dataSongLink_h');
//                 audioLoader.load(linkino, function(buffer){
//                     sound.setBuffer(buffer);
//                     sound.play();
//                     $('.current-song')[0].innerHTML = d.title;
//                     currentAudio = true;
//                 })

//                 $(this).addClass('active');
//                 $(this).siblings().removeClass('active');
//             }  
//             sound.onEnded = function() {
//                 console.log('The sound has ended!');
//                 sound.stop();
//                 currentAudio = false;
//                 $('.current-song')[0].innerHTML = 'nothing';
//                 sound.setBuffer(null);
//                 $('.single-song').removeClass('active');
//             };       
//         })

//     const radius = Math.min(width, height) / 3;
//     console.log(radius);
    
//     data.forEach((d, i) => {
//         const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2; 
//         d.x = Math.cos(angle) * radius;
//         d.y = Math.sin(angle) * radius;
//     });
        
//     const simulation = d3.forceSimulation(data)
//     .force("x", d3.forceX(d => d.x).strength(1))
//     .force("y", d3.forceY(d => d.y).strength(1))
//     .on("tick", ticked2);

//     simulation.nodes(data)
//     simulation.alpha(1)
//     simulation.restart()
//     function ticked2() {
//         node.attr("cx", d => d.x)
//             .attr("cy", d => d.y)
//             .call(drag(simulation));
//     }

//     function drag(simulation) {
//     function dragstarted(event, d) {
//         if (!event.active) simulation.alphaTarget(0.3).restart();
//         d.fx = d.x;
//         d.fy = d.y;
//     }

//     function dragged(event, d) {
//         d.fx = event.x;
//         d.fy = event.y;
//     }

//     function dragended(event, d) {
//         if (!event.active) simulation.alphaTarget(0);
//         d.fx = null;
//         d.fy = null;
//     }

//     return d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended);
//     }
// }



// // Audio toggle
var video = $('.video')[0];
// let soundVolume = false;
// $('.muter').on('click', function(){
//     if (soundVolume) {
//         $('.muter-text')[0].innerHTML = "sound on";
//         sound.setVolume(1);
//         video.muted = false;
//         soundVolume = false;

//     } else {
//         $('.muter-text')[0].innerHTML = "sound off";
//         sound.setVolume(0);
//         video.muted = true;
//         soundVolume = true;
//     }
// })


// HOMEPAGE
$('.audioToggle, .muter').on('click', function(){
    if(video.muted){
        video.muted = false;
        $('.muter-text')[0].innerHTML = "sound on";

    } else {
        video.muted = true;
        $('.muter-text')[0].innerHTML = "sound off";
    }
})

// VIDEO PLAY PAUSE BASED ON SCROLL
$(window).scroll(function(){
  var scroll = $(this).scrollTop();
  scroll > height/2 ? video.pause() : video.play()
})

$('.video').on('click', function(){
    if (!this.fullscreenElement) {
        this.requestFullscreen();
        // alert('fullscreen');
    } 
    // else if (this.exitFullscreen) {
    //     this.exitFullscreen();
    // }
})

// $(document).ready(function(){
// var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
//     if (isSafari) {
//         console.log('Safari detected');
//         let take = document.getElementsByClassName('single-song');
//         $('.single-song').addClass('single-song-safari')
//     }
// });