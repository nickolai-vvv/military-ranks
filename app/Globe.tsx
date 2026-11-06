"use client";
import { useEffect, useRef, useState } from "react";

import { softwareRenderer } from "./softwareRenderer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const countries = [{ id: "ru", title: "Россия", latitude: 61, longitude: 89 }];
const rad = Math.PI / 180;
const tilt = 41 * rad;
const center = 70 * rad;

function position(
  country: (typeof countries)[number],
  longitude: number,
  latitude = tilt,
): React.CSSProperties {
  const lat = country.latitude * rad;
  const delta = country.longitude * rad - longitude;
  const x = Math.cos(lat) * Math.sin(delta);
  const y =
    Math.sin(lat) * Math.cos(latitude) -
    Math.cos(lat) * Math.cos(delta) * Math.sin(latitude);
  const visible =
    Math.sin(lat) * Math.sin(latitude) +
      Math.cos(lat) * Math.cos(delta) * Math.cos(latitude) >
    0;
  return {
    visibility: visible ? "visible" : "hidden",
    left: 50 + 50 * x + "%",
    top: 50 - 50 * y + "%",
  };
}

const vertex =
  "attribute vec2 a; varying vec2 p; void main(){p=a;gl_Position=vec4(a,0.,1.);}";
const fragment = `precision highp float;
varying vec2 p; uniform sampler2D earth; uniform float lon; uniform float tilt;
void main(){
  float r=dot(p,p); if(r>1.)discard;
  float z=sqrt(max(0.,1.-r)); float t=tilt;
  float lat=asin(clamp(p.y*cos(t)+z*sin(t),-1.,1.));
  float lng=lon+atan(p.x,z*cos(t)-p.y*sin(t));
  vec3 tex=texture2D(earth,vec2(fract(lng/6.283185+.5),.5-lat/3.141593)).rgb;
  float light=dot(vec3(p,z),normalize(vec3(-.87,.53,.30)));
  vec3 c=mix(vec3(dot(tex,vec3(.3,.59,.11))),tex,.70);
  c*=.09+1.12*smoothstep(-.23,.85,light);
  c+=vec3(.045,.13,.22)*pow(1.-z,2.3)*(.25+max(light,0.));
  gl_FragColor=vec4(c,1.);
}`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const s = gl.createShader(type);
  if (!s) throw Error("shader");
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error("shader");
  return s;
}

export default function Globe({
  onSelect,
  active,
}: {
  onSelect: (id: string) => void;
  active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    layer = useRef<HTMLDivElement>(null);
  const lowCanvas = useRef<HTMLCanvasElement>(null),
    drag = useRef<{ id: number; x: number; y: number } | null>(null),
    manual = useRef(false);
  const view = useRef({ longitude: center, latitude: tilt });
  const target = useRef({ ...view.current });
  const renderManual = useRef<(() => void) | null>(null);
  function turn(dx: number, dy: number) {
    if (!manual.current) target.current = { ...view.current };
    manual.current = true;
    const camera = target.current;
    camera.longitude += dx;
    camera.latitude = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, camera.latitude + dy),
    );
    renderManual.current?.();
  }
  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (active || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }
  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const prev = drag.current;
    if (!prev || prev.id !== event.pointerId) return;
    const scale = Math.PI / event.currentTarget.clientWidth;
    turn((prev.x - event.clientX) * scale, (event.clientY - prev.y) * scale);
    prev.x = event.clientX;
    prev.y = event.clientY;
  }
  function keyTurn(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = 10 * rad;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (!offsets[event.key]) return;
    event.preventDefault();
    turn(...offsets[event.key]);
  }
  const [phase, setPhase] = useState("loading");
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const el = canvas.current;
    if (!el) return;
    const device = navigator as Navigator & {
      connection?: { saveData: boolean };
      deviceMemory?: number;
    };
    const lowPower =
      device.connection?.saveData || (device.deviceMemory ?? Infinity) <= 2;
    const gl = lowPower
      ? null
      : el.getContext("webgl", { alpha: true, antialias: true });
    let frame = 0,
      stopped = false;
    function updateMarkers() {
      const markers = layer.current;
      if (!markers) return;
      const { longitude, latitude } = view.current;
      countries.forEach((c, i) =>
        Object.assign(
          (markers.children[i] as HTMLElement).style,
          position(c, longitude, latitude),
        ),
      );
    }
    function fallback() {
      cancelAnimationFrame(frame);
      if (stopped) return;
      if (texture.naturalWidth && lowCanvas.current) {
        const draw = softwareRenderer(lowCanvas.current, texture);
        renderManual.current = () => {
          Object.assign(view.current, target.current);
          draw(view.current.longitude, view.current.latitude);
          updateMarkers();
          setPhase("software");
        };
        if (manual.current) renderManual.current();
        else setPhase("poster");
      } else setPhase("unavailable");
    }
    el.addEventListener("webglcontextlost", fallback);
    const texture = new Image();
    texture.onerror = fallback;
    texture.onload = () => {
      if (stopped) return;
      if (!gl) {
        fallback();
        return;
      }
      try {
        const program = gl.createProgram();
        if (!program) throw Error("program");
        gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw Error("link");
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const attr = gl.getAttribLocation(program, "a");
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          texture,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        const longitude = gl.getUniformLocation(program, "lon");
        const latitude = gl.getUniformLocation(program, "tilt");
        const size = Math.min(
          1280,
          Math.ceil(el.clientWidth * Math.min(devicePixelRatio, 1.5)),
        );
        el.width = el.height = size;
        gl.viewport(0, 0, size, size);
        const start = performance.now();
        let previous = start;
        const draw = (now: number) => {
          if (stopped) return;
          const dt = Math.min(64, now - previous);
          previous = now;
          const camera = view.current;
          if (manual.current) {
            const blend = motion.matches ? 1 : 1 - Math.exp(-dt / 48);
            camera.longitude +=
              (target.current.longitude - camera.longitude) * blend;
            camera.latitude +=
              (target.current.latitude - camera.latitude) * blend;
          } else if (!motion.matches) {
            camera.longitude = center + 0.2 * Math.sin((now - start) / 24000);
          }
          gl.uniform1f(longitude, camera.longitude);
          gl.uniform1f(latitude, camera.latitude);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          updateMarkers();
          frame = requestAnimationFrame(draw);
        };
        draw(start);
        setPhase("ready");
      } catch {
        fallback();
      }
    };
    texture.src = basePath + '/atlas/earth.webp';
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      el.removeEventListener("webglcontextlost", fallback);
      texture.onerror = null;
      renderManual.current = null;
      if (!el.isConnected)
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);
  return (
    <div className={"orbital " + (active ? "approach" : "")}>
      <div className="orbit" aria-hidden="true" />
      <div
        className="sphere"
        tabIndex={phase === "unavailable" ? -1 : 0}
        role="group"
        aria-label="Глобус. Вращайте перетаскиванием или клавишами со стрелками."
        onKeyDown={keyTurn}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <canvas
          ref={canvas}
          aria-hidden="true"
          style={{
            display:
              phase === "ready" || phase === "loading" ? "block" : "none",
            opacity: phase === "ready" ? 1 : 0,
          }}
        />
        <canvas
          ref={lowCanvas}
          aria-hidden="true"
          style={{ display: phase === "software" ? "block" : "none" }}
        />
      </div>
      <div className="markers" ref={layer}>
        {countries.map((c) => (
          <button
            className="pin"
            key={c.id}
            style={position(c, center)}
            aria-label={"Выбрать страну: " + c.title}
            onClick={() => onSelect(c.id)}
          >
            <span className="dot" />
            <span className="pin-label">
              {c.title}
              <em>Выбрать страну</em>
            </span>
          </button>
        ))}
      </div>
      {phase === "loading" && (
        <span className="loading" role="status">
          Загрузка глобуса…
        </span>
      )}
    </div>
  );
}
