/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

const FS = /* glsl */ `
#define USE_MAP

precision mediump float;

varying vec2 vUv;
varying float vWave;
uniform sampler2D uTexture;

void main() {

  float shadow_strength = 3.0;

  float wave = vWave * 0.25;
  vec3 pixel = texture2D(uTexture, vUv).rgb  + shadow_strength * vWave - 0.05;
  gl_FragColor = vec4(pixel, 1.0);

}
`;

const VS = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying float vWave;
uniform float uTime;

uniform float wave_count_x;
uniform float wave_count_y;
uniform float wave_power;
uniform float wave_speed_x;
uniform float wave_speed_y;

uniform float mouse_x;
uniform float mouse_y;

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

void main() {

  vUv = uv;

  vec3 pos = position;

  float mouse_power_multiplier = 1. / sqrt(((mouse_x + 1.0) / 2.0 - vUv.x) * ((mouse_x + 1.0) / 2.0 - vUv.x) * 165. + ((mouse_y + 1.0) / 2.0 - vUv.y) * ((mouse_y + 1.0) / 2.0 - vUv.y) * 165.) * 20.5;

  mouse_power_multiplier = max(mouse_power_multiplier, 1.0);
  mouse_power_multiplier = min(mouse_power_multiplier, 5.0);

  vec3 noisePos = vec3(pos.x * wave_count_x + uTime * wave_speed_x, pos.y * wave_count_y * 2. + uTime * wave_speed_y, pos.z);
  float delta = snoise(noisePos) * wave_power * mouse_power_multiplier;
  pos.z += delta;
  vWave = delta;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
`;

import * as THREE from 'three';

class App{
    constructor(wave_count_x=4.5, wave_count_y=1.25, wave_speed_x=1, wave_speed_y=0.25, wave_power=0.0425){
        
        this.wave_count_x = wave_count_x;
        this.wave_count_y = wave_count_y;
        this.wave_speed_x = wave_speed_x;
        this.wave_speed_y = wave_speed_y;
        this.wave_power = wave_power;
        
        this.texture_ratio = 1;
    }
    render(app_container){

        this.width_ = 1.2;
        this.ratio_ = 1.7;
        
        this.timer = new THREE.Clock();
        
        this.is_mouse_down = false;
        this.mouse_last = new THREE.Vector2(1, 1);
        this.client_pos = new THREE.Vector2(0, 0);
        
        this.shadow_quality = 2500;
        
        this.css = 'width: 100%; height: 100%; position: relative;';
        
        this.app_container = null;
        
        this.mount = document.createElement('div');
        this.mount.setAttribute('style', this.css);
        
        this.app_container = app_container;
        this.app_container.appendChild(this.mount);
        
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(15, this.mount.offsetWidth / this.mount.offsetHeight, 0.1, 10000);
        
        this.camera.position.z = 2;

        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(this.mount.offsetWidth, this.mount.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.mouse = new THREE.Vector2(1, 1);
        this.raycaster = new THREE.Raycaster();
          
        this.mount.appendChild(this.renderer.domElement);
        
        this.texture_loader = new THREE.TextureLoader();
        
        this.add_event_listeners();    
        
        this.add_models();
        
        this.GameLoop();
    }
    
    add_models(){
        this.texture_loader.load('./img/flag.png', (texture) => {
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            texture.needsUpdate = true;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            const width = texture.source.data.width;
            const height = texture.source.data.height;
            this.geometry = new THREE.PlaneGeometry(width / width, height / width , 128, 128);
            this.texture_ratio = width / height;
            
            this.material = new THREE.ShaderMaterial({
              fragmentShader: FS,
              vertexShader: VS,
              uniforms: {
                wave_count_x: {value: this.wave_count_x},
                wave_count_y: {value: this.wave_count_y},
                wave_speed_x: {value: this.wave_speed_x},
                wave_speed_y: {value: this.wave_speed_y},
                wave_power: {value: this.wave_power},
                uTime: {value: 0.0},
                uTexture: {value: texture}
              },
              side: THREE.DoubleSide,
            });
            
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;
            this.scene.add(this.mesh);
        });        
    }
    
    GameLoop(){
        requestAnimationFrame(() => this.GameLoop());
        this.render_scene();
        this.update();
    }
    
    update(){
        this.hover();
        this.resize();
        
        if(this.material !== undefined){
            this.material.uniforms.uTime.value = this.timer.getElapsedTime();  
        }
    }
    
   
    
    render_scene(){
        this.renderer.render(this.scene, this.camera);
    }
    
    add_event_listeners(){
        
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        window.addEventListener('mousemove', (event) => {
            this.mouse_move(event);
        });

        window.addEventListener('mousedown', (event) => {
            this.mouse_down(event);
        });
        
        window.addEventListener('mouseup', (event) => {
            this.mouse_up(event);
        });
        
        window.addEventListener('scroll', () => {
            this.scroll();
        });
        
        document.onselectstart = (e) => {return false}          
        this.mount.addEventListener("contextmenu", e => e.preventDefault());
    }
    
    scroll(){
        this.mouse.x = ((this.client_pos.x + window.scrollX - this.mount.parentNode.offsetLeft) / this.mount.offsetWidth) * 2 - 1;
        this.mouse.y = - ((this.client_pos.y + window.scrollY - this.mount.parentNode.offsetTop) / this.mount.offsetHeight) * 2 + 1;
    }
    
    mouse_move(event){
        this.mouse_last = {...this.mouse}
        
        this.mouse.x = ((event.clientX + window.scrollX - this.mount.parentNode.offsetLeft) / this.mount.offsetWidth) * 2 - 1;
        this.mouse.y = - ((event.clientY + window.scrollY - this.mount.parentNode.offsetTop) / this.mount.offsetHeight) * 2 + 1;
        
        this.client_pos.x = event.clientX;
        this.client_pos.y = event.clientY;
        
    }
    
    resize(){
        var ratio = this.texture_ratio;
        
        var width = this.mount.offsetWidth;
        var height = this.mount.offsetHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();
        if(width/height > ratio){
            this.camera.position.z =  1;
        }
        else{
            this.camera.position.z = height / width * ratio;
        }
    }
    
    resize_(){
        var width = this.mount.offsetWidth;
        var height = this.mount.offsetHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();
        
        this.width = this.width_;
        this.height = this.width;
        
        this.ratio = ((this.mount.offsetWidth) / (this.mount.offsetHeight));
        
        if(this.ratio < this.ratio_){this.height /= this.ratio}
        else{this.width *= this.ratio / this.ratio_; this.height /= this.ratio_;}
        
        this.camera.left = -this.width / 2;
        this.camera.right = this.width / 2;
        this.camera.top = this.height / 2;
        this.camera.bottom = -this.height / 2;
    }
    
    mouse_up(event){
        this.is_mouse_down = false;
        this.raycaster.setFromCamera(this.mouse, this.camera);
    }
    
    mouse_down(event){
        this.is_mouse_down = true;
        this.raycaster.setFromCamera(this.mouse, this.camera);
    }
    
    hover(){
        this.raycaster.setFromCamera(this.mouse, this.camera);
        if(this.model !== undefined){
            const intersects_model = this.raycaster.intersectObject(this.model);
            if(intersects_model.length > 0){
                document.body.style.cursor = 'pointer';
            }
            else{
                document.body.style.cursor = 'default';
            }
        }

    }
}

export default App