import * as THREE from 'three';

// One GPU point cloud and one GPU trail batch, not individual star objects.
const vertex = `
uniform float uTime, uSequence, uRatio, uReduced;
attribute float aSeed, aFamily, aSize;
varying vec3 vColor;
varying float vAlpha, vFamily;
vec3 family(float f){if(f<.5)return vec3(.89,.70,.44);if(f<1.5)return vec3(.82,.48,.48);if(f<2.5)return vec3(.57,.44,.78);return vec3(.43,.66,.85);}
void main(){
 float t=uSequence; float clock=uReduced>.5?0.:uTime;
 vec3 p=position;
 p.x+=sin(clock*.12+aSeed*36.)*2.;p.y+=cos(clock*.09+aSeed*27.)*1.4;
 float gather=smoothstep(12.,19.,t);
 float a=aSeed*6.28318+clock*.07+gather*7.;
 float radius=9.+aSeed*8.;
 float latitude=asin(sin(aSeed*317.));
 vec3 orb=vec3(cos(a)*cos(latitude)*radius,sin(latitude)*radius,sin(a)*cos(latitude)*radius);
 p=mix(p,orb,gather);
 if(t>=22.)p=mix(p,orb*1.7,smoothstep(22.,27.,t));
 vec4 mv=modelViewMatrix*vec4(p,1.);
 gl_Position=projectionMatrix*mv;
 float awake=t<0.?1.:smoothstep(aSeed*7.,aSeed*7.+2.5,t);
 vAlpha=awake*(.35+aSeed*.65);vColor=family(aFamily);vFamily=aFamily;
 gl_PointSize=clamp(aSize*uRatio*230./max(10.,-mv.z),1.,46.);
}`;
const fragment=`
varying vec3 vColor;varying float vAlpha,vFamily;
void main(){vec2 p=gl_PointCoord-.5;float r=length(p);
 float glow=exp(-r*r*20.)*.24;float core=exp(-r*r*240.);
 float rays=exp(-abs(p.x)*100.)*exp(-abs(p.y)*9.)+exp(-abs(p.y)*100.)*exp(-abs(p.x)*9.);
 float halo=exp(-pow((r-.23)*45.,2.))*.09;
 float a=(glow+core*.85+rays*(vFamily<1.5?.22:.1)+halo)*vAlpha;
 gl_FragColor=vec4(mix(vColor,vec3(1.,.94,.83),core*.7),a);
}`;
const trailVertex=`
uniform float uSequence,uTime;attribute float aStream,aAlong;
varying float vAlpha;varying vec3 vColor;
void main(){float g=smoothstep(12.,19.,uSequence);float settle=1.-smoothstep(21.,25.,uSequence);
 float tail=aAlong;
 float radius=mix(5.,110.,tail)*(1.-g*.45);
 float angle=aStream*2.39996+tail*5.5-uTime*(.12+g*.35);
 vec3 p=vec3(cos(angle)*radius,sin(angle)*radius*.48,sin(angle+aStream)*radius*.6);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 float pulse=.45+.55*pow(max(0.,sin(aAlong*12.-uTime*3.+aStream)),4.);
 vAlpha=sin(aAlong*3.14159)*smoothstep(10.,15.,uSequence)*settle*(.10+g*.30)*pulse;
 vColor=mix(vec3(.68,.44,.29),vec3(.46,.40,.69),mod(aStream,3.)/3.);
}`;
const trailFragment=`varying float vAlpha;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,vAlpha);}`;
const planeVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const atmosphere=`
varying vec2 vUv;uniform float uTime,uSequence,uReduced;
void main(){vec2 p=(vUv-.5)*vec2(1.8,1.);float t=uReduced>.5?0.:uTime*.025;
 float dust=sin(p.x*8.+sin(p.y*9.+t))*sin(p.y*6.-t)*.12+.88;
 float cloud=exp(-pow((p.y-sin(p.x*4.+t)*.16)*3.5,2.))*exp(-dot(p,p)*1.7);
 float shaft=pow(max(0.,cos(atan(p.y,p.x)*5.+t)),28.)*exp(-length(p)*2.5);
 float awake=uSequence<0.?1.:smoothstep(1.,12.,uSequence);
 vec3 c=mix(vec3(.19,.10,.21),vec3(.38,.22,.13),smoothstep(-.3,.4,p.x));
 gl_FragColor=vec4(c,(cloud*dust*.38+shaft*.13)*awake);
}`;
const coreFragment=`
varying vec2 vUv;uniform float uSequence;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);
 float build=smoothstep(15.,20.,uSequence);float settle=1.-smoothstep(22.,27.,uSequence)*.73;
 float glow=exp(-r*r*5.)*.35+exp(-r*r*35.)*.55;
 float edge=exp(-pow((r-.25)*30.,2.))*.2;
 float ray=exp(-abs(p.y)*65.)*exp(-abs(p.x)*1.5)*.35;
 float wave=clamp((uSequence-19.)/3.,0.,1.);float ring=exp(-pow((r-wave*1.35)*50.,2.))*sin(wave*3.14159)*.65;
 vec3 c=mix(vec3(.67,.34,.15),vec3(1.,.82,.55),exp(-r*r*15.));
 gl_FragColor=vec4(c,clamp((glow+edge+ray)*build*settle+ring,0.,.82));
}`;

export function createGalaxy(host,readState,onFailure){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'high-performance'});}catch{onFailure();return()=>{};}
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(55,1,.1,600);
 const mobile=host.clientWidth<700;
 const total=mobile?1400:3200;
 const geometry=new THREE.BufferGeometry();
 const positions=new Float32Array(total*3),seeds=new Float32Array(total),families=new Float32Array(total),sizes=new Float32Array(total);
 function random(i,n){const x=Math.sin((i+1)*n)*43758.5453;return x-Math.floor(x);}
 for(let i=0;i<total;i++){
  positions[i*3]=(random(i,12.98)-.5)*240;positions[i*3+1]=(random(i,78.23)-.5)*150;positions[i*3+2]=(random(i,39.47)-.5)*320;
  seeds[i]=random(i,25.19);families[i]=i%4;sizes[i]=1.4+Math.pow(random(i,54.31),5)*7;
 }
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));geometry.setAttribute('aFamily',new THREE.BufferAttribute(families,1));geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
 const uniforms={uTime:{value:0},uSequence:{value:-1},uRatio:{value:1},uReduced:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
 const streams=mobile?24:42,segments=100;
 const trailGeometry=new THREE.BufferGeometry();
 const streamData=[],alongData=[],trailPos=[];
 for(let s=0;s<streams;s++)for(let j=0;j<segments-1;j++)for(const k of [j,j+1]){streamData.push(s);alongData.push(k/(segments-1));trailPos.push(0,0,0);}
 trailGeometry.setAttribute('position',new THREE.Float32BufferAttribute(trailPos,3));trailGeometry.setAttribute('aStream',new THREE.Float32BufferAttribute(streamData,1));trailGeometry.setAttribute('aAlong',new THREE.Float32BufferAttribute(alongData,1));
 const trailMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:trailVertex,fragmentShader:trailFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const trails=new THREE.LineSegments(trailGeometry,trailMaterial);trails.frustumCulled=false;scene.add(trails);
 const planeGeo=new THREE.PlaneGeometry(1,1);
 const hazeMat=new THREE.ShaderMaterial({uniforms,vertexShader:planeVertex,fragmentShader:atmosphere,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const haze=new THREE.Mesh(planeGeo,hazeMat);haze.position.z=-95;haze.scale.set(430,250,1);scene.add(haze);
 const coreMat=new THREE.ShaderMaterial({uniforms,vertexShader:planeVertex,fragmentShader:coreFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const core=new THREE.Mesh(planeGeo,coreMat);core.scale.set(110,110,1);core.position.z=20;scene.add(core);
 // The visitor's light has its own halo, then moves into the central formation.
 const personalGeo=new THREE.BufferGeometry();personalGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));personalGeo.setAttribute('aSeed',new THREE.Float32BufferAttribute([.02],1));personalGeo.setAttribute('aFamily',new THREE.Float32BufferAttribute([0],1));personalGeo.setAttribute('aSize',new THREE.Float32BufferAttribute([19],1));
 const personal=new THREE.Points(personalGeo,material);personal.frustumCulled=false;scene.add(personal);
 renderer.setClearColor(0x06060c,1);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.25:1.5));host.appendChild(renderer.domElement);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();uniforms.uRatio.value=renderer.getPixelRatio();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let frame,dead=false,frameTotal=0,previous=0,slowFrames=0,frames=0,started=performance.now(),lastSequence=null,sequenceAnchor=started;
 const lost=e=>{e.preventDefault();dead=true;cancelAnimationFrame(frame);onFailure();};renderer.domElement.addEventListener('webglcontextlost',lost);
 function draw(now){
  if(dead)return;frame=requestAnimationFrame(draw);
  if(document.hidden){previous=now;return;}
  const state=readState();const dt=previous?now-previous:16;previous=now;frameTotal+=dt;
  // One-way quality reduction on sustained slow frames avoids oscillating load.
  if(dt>36)slowFrames++;frames++;if(frames%120===0){host.dataset.renderFps=(1000/(frameTotal/120)).toFixed(1);host.dataset.starCount=String(geometry.drawRange.count===Infinity?total:geometry.drawRange.count);frameTotal=0;}if(frames===120&&slowFrames>40){geometry.setDrawRange(0,Math.floor(total*.6));renderer.setPixelRatio(1);resize();}
  const clock=state.reduced?0:(now-started)/1000;
  if(state.seconds!==lastSequence){lastSequence=state.seconds;sequenceAnchor=now;}
  let t=state.seconds===null?(state.phase==='reveal'?27:-1):Math.min(27,state.seconds+(now-sequenceAnchor)/1000);
  uniforms.uTime.value=clock;uniforms.uSequence.value=t;uniforms.uReduced.value=state.reduced?1:0;
  const travel=t<0?0:THREE.MathUtils.smoothstep(t,5,12);
  camera.position.set(state.reduced?0:Math.sin(clock*.075)*3, state.reduced?0:Math.cos(clock*.06)*1.5,145-travel*45);
  camera.lookAt(0,0,0);
  const family=state.color==='#b6a0ef'?2:state.color==='#e7acac'?1:state.color==='#a3cef0'?3:0;
  personalGeo.attributes.aFamily.array[0]=family;personalGeo.attributes.aFamily.needsUpdate=true;
  personal.visible=t<5;personal.position.set(t<0?18:0,t<0?8:0,40);
  trails.visible=!state.reduced&&t>=10&&t<25;
  renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(draw);
 return()=>{dead=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);geometry.dispose();trailGeometry.dispose();planeGeo.dispose();personalGeo.dispose();material.dispose();trailMaterial.dispose();hazeMat.dispose();coreMat.dispose();renderer.dispose();renderer.domElement.remove();};
}
