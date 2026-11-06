'use client';
import { useEffect, useRef, useState } from 'react';

const countries = [{ id: 'ru', title: 'Россия', latitude: 61, longitude: 89 }];
const rad = Math.PI / 180;
const tilt = 41 * rad;
const center = 70 * rad;

function position(country, longitude) {
  const lat = country.latitude * rad;
  const delta = country.longitude * rad - longitude;
  const x = Math.cos(lat) * Math.sin(delta);
  const y = Math.sin(lat) * Math.cos(tilt) - Math.cos(lat) * Math.cos(delta) * Math.sin(tilt);
  return { left: (50 + 50*x)+'%', top: (50 - 50*y)+'%' };
}

const vertex = 'attribute vec2 a; varying vec2 p; void main(){p=a;gl_Position=vec4(a,0.,1.);}';
const fragment = `precision highp float;
varying vec2 p; uniform sampler2D earth; uniform float lon;
void main(){
  float r=dot(p,p); if(r>1.)discard;
  float z=sqrt(max(0.,1.-r)); float t=radians(41.);
  float lat=asin(clamp(p.y*cos(t)+z*sin(t),-1.,1.));
  float lng=lon+atan(p.x,z*cos(t)-p.y*sin(t));
  vec3 tex=texture2D(earth,vec2(fract(lng/6.283185+.5),.5-lat/3.141593)).rgb;
  float light=dot(vec3(p,z),normalize(vec3(-.87,.53,.30)));
  vec3 c=mix(vec3(dot(tex,vec3(.3,.59,.11))),tex,.70);
  c*=.09+1.12*smoothstep(-.23,.85,light);
  c+=vec3(.045,.13,.22)*pow(1.-z,2.3)*(.25+max(light,0.));
  gl_FragColor=vec4(c,1.);
}`;

function shader(gl,type,source){
  const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');
  return s;
}

export default function Globe({onSelect, active}){
  const canvas=useRef(null), layer=useRef(null);
  const [phase,setPhase]=useState('loading');
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    if(motion.matches || navigator.connection?.saveData || navigator.deviceMemory<=2){
      setPhase('poster');return;
    }
    const el=canvas.current, gl=el.getContext('webgl',{alpha:true,antialias:true});
    if(!gl){setPhase('poster');return}
    let frame=0, stopped=false;
    function fallback(){cancelAnimationFrame(frame);setPhase('poster')}
    el.addEventListener('webglcontextlost',fallback);
    const texture=new Image();
    texture.onerror=fallback;
    texture.onload=()=>{
      if(stopped)return;
      try{
        const program=gl.createProgram();
        gl.attachShader(program,shader(gl,gl.VERTEX_SHADER,vertex));
        gl.attachShader(program,shader(gl,gl.FRAGMENT_SHADER,fragment));
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        const attr=gl.getAttribLocation(program,'a');
        gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
        gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        const longitude=gl.getUniformLocation(program,'lon');
        const size=Math.min(1280,Math.ceil(el.clientWidth*Math.min(devicePixelRatio,1.5)));
        el.width=el.height=size;gl.viewport(0,0,size,size);
        const start=performance.now();let last=-100;
        function draw(now){
          if(stopped)return;
          if(now-last>40){
            const angle=center+(motion.matches?0:0.17*Math.sin((now-start)/36000));
            gl.uniform1f(longitude,angle);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
            countries.forEach((c,i)=>Object.assign(layer.current.children[i].style,position(c,angle)));
            last=now;
          }
          frame=requestAnimationFrame(draw);
        }
        draw(start);setPhase('ready');
      }catch{fallback()}
    };
    texture.src='/atlas/earth.webp';
    return ()=>{stopped=true;cancelAnimationFrame(frame);el.removeEventListener('webglcontextlost',fallback);texture.onerror=null;if(!el.isConnected)gl.getExtension('WEBGL_lose_context')?.loseContext()};
  },[]);
  return <div className={'orbital '+(active?'approach':'')}>
    <div className="orbit" aria-hidden="true"/>
    <div className="sphere"><canvas ref={canvas} aria-hidden="true" style={{opacity:phase==='ready'?1:0}}/></div>
    <div className="markers" ref={layer}>{countries.map(c=><button className="pin" key={c.id} style={position(c,center)} aria-label={'Выбрать страну: '+c.title} onClick={()=>onSelect(c.id)}>
      <span className="dot"/><span className="pin-label">{c.title}<em>Выбрать страну</em></span>
    </button>)}</div>
    {phase==='loading'&&<span className="loading" role="status">Загрузка глобуса…</span>}
  </div>
}

