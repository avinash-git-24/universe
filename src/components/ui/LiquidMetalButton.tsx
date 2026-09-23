"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface LiquidMetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const HEAD = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uC;
uniform vec2  uHalf;
uniform float uT;
uniform float uHover;
uniform float uPress;
uniform vec4  uRip[3];
uniform vec4  uRipK;
uniform vec4  uRipK2;
uniform vec4  uPtr;
uniform vec4  uPtrK;

#define PI 3.14159265

float sdPill(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - r;
}

float ripple(vec2 p, float t){
  float sum = 0.;
  for(int i = 0; i < 3; i++){
    if(uRip[i].w < 0.5) continue;
    float age = t - uRip[i].z;
    if(age < 0. || age > 4.) continue;
    vec2  rp = p - uRip[i].xy;
    float facet = 1. + uRipK2.x * cos(uRipK2.y * atan(rp.y, rp.x) + age * 2.1 + float(i) * 2.4);
    float x = (length(rp) - age * uRipK.x * facet) / uRipK.y;
    sum += exp(-pow(abs(x) + 1e-4, uRipK2.z)) * exp(-age * uRipK.z);
  }
  return sum;
}

float pointerW(vec2 p){
  if(uPtr.z < 0.001) return 0.;
  float d = length(p - uPtr.xy) / uPtrK.x;
  return exp(-d*d) * uPtr.z;
}

vec2 pointerWarp(vec2 p){
  float w = pointerW(p);
  if(w <= 0.) return vec2(0.);
  return normalize(p - uPtr.xy + vec2(1e-5)) * w * (uPtrK.y + uPtrK.z * uPtr.w);
}
`;

const FRAG_RIM = HEAD + `
uniform float uBw;
uniform float uE[8];

float perim(vec2 d, float a, float r){
  float P = 4.*a + 2.*PI*r;
  float s;
  if(d.x >= a){
    float th = atan(d.y, d.x - a); if(th < 0.) th += 2.*PI;
    s = (th <= PI*0.5) ? r*th : P - r*(2.*PI - th);
  } else if(d.x <= -a){
    float th = atan(d.y, d.x + a); if(th < 0.) th += 2.*PI;
    s = r*PI*0.5 + 2.*a + r*(th - PI*0.5);
  } else if(d.y >= 0.){
    s = r*PI*0.5 + (a - d.x);
  } else {
    s = r*PI*1.5 + 2.*a + (d.x + a);
  }
  return s / P;
}

float pb(float u, float w){ u = fract(u); float x = min(u, 1.-u); return exp(-(x*x)/(w*w)); }

float rimHot(float s, float t){
  float v = uE[0];
  v += 0.62 * pb(s - t*uE[4],             0.075);
  v += 0.44 * pb(s + t*uE[4]*0.63 + 0.41, 0.135);
  v += 0.30 * pb(s - t*uE[4]*0.34 + 0.73, 0.200);
  return v;
}

float rimBand(float sd, float off){ return 1. - smoothstep(0., uBw*1.05, abs(sd + uBw*0.55 + off)); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  if(sd > uBw*2.5 || sd < -uBw*3.5){ o = vec4(0.); return; }

  float a = max(uHalf.x - uHalf.y, 0.);
  float s = perim(d, a, uHalf.y);
  float top = mix(1., 0.5 + 0.5 * (d.y / uHalf.y), uE[5]);

  vec2  p   = vec2(d.x, -d.y) / (uHalf.y * 2.);
  float lift = 1. + uPress * uE[6] + ripple(p, uT) * uE[7] + pointerW(p) * uPtrK.w;

  o = vec4(vec3(
    rimBand(sd,  uE[2]) * rimHot(s + uE[3], uT),
    rimBand(sd,  0.   ) * rimHot(s,         uT),
    rimBand(sd, -uE[2]) * rimHot(s - uE[3], uT)
  ) * uE[1] * top * lift, 1.);
}`;

const FRAG_SCENE = HEAD + `
uniform float uP[21];

float h21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = h21(i), b = h21(i+vec2(1,0)), c = h21(i+vec2(0,1)), d = h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y) * 2. - 1.;
}
float fbm(vec2 p, float g){
  float s = 0., a = 1., n = 0.;
  for(int i=0;i<4;i++){ s += a*vn(p); n += a; p = p*2.03 + 11.7; a *= g; }
  return s / n;
}
float fbm(vec2 p){ return fbm(p, 0.5); }

float wig(float x, float t, float seed){
  return vn(vec2(x,          t*0.150 + seed)) * 0.60
       + vn(vec2(x*2.07 + 4., t*0.105 + seed)) * 0.27
       + vn(vec2(x*4.30 - 7., t*0.080 + seed)) * 0.13;
}

float valleyAt(vec2 p, float t){ return wig(p.x*uP[0], t, 0.0) * uP[1]; }
float densAt  (vec2 p, float t){ return uP[2] * exp(uP[3] * wig(p.x*uP[4] + 9.0, t, 2.7)); }

float surface(vec2 p, float t){
  float V = (p.y - valleyAt(p,t)) * densAt(p,t);
  V += uP[5] * fbm(p*vec2(0.8, 1.7)*uP[6] + vec2(t*0.05, -t*0.03), uP[17]);
  return V - uP[7];
}
float tone(float v){
  float u = fract(v);
  float e = uP[9], W = uP[10] * 0.5;
  return smoothstep(0.5-W-e, 0.5-W, u) * (1. - smoothstep(0.5+W, 0.5+W+e, u));
}
vec3 spec(float t){ return clamp(vec3(1.5) - abs(4.*t - vec3(3.,2.,1.)), 0., 1.); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);
  float S = uHalf.y * 2.;
  float t = uT;

  if(uHover <= 0.0015 || pill <= 0.0015){ o = vec4(0., 0., 0., pill); return; }

  vec2  p = vec2(d.x, -d.y) / S;
  vec2  q = p + pointerWarp(p);

  float h0 = surface(q, t);
  vec2  gp = vec2(dFdx(h0), -dFdy(h0)) * S;
  float V  = surface(q - gp * uP[8] / max(uP[2], .001), t);

  vec2  gd = normalize(gp + vec2(1e-5));
  V += uP[13] * fbm(vec2(dot(q,gd)*uP[14], dot(q, vec2(-gd.y,gd.x))*uP[14]*0.04) + vec2(0., t*0.06));

  float rip  = ripple(p, t);
  float well = pointerW(p);
  V += rip * uRipK.w;

  const int N = 21;
  float mid = 1. - pow(0.5, uP[12]);
  vec3 col = vec3(0.), wsum = vec3(0.);
  for(int i=0;i<N;i++){
    float k = float(i)/float(N-1);
    vec3  w = spec(k);
    col  += w * tone(V + ((1. - pow(1. - k, uP[12])) - mid) * uP[11]);
    wsum += w;
  }
  col /= wsum;
  col = pow(col, vec3(uP[15]));

  float lit = smoothstep(uP[18], uP[19], q.y - valleyAt(q, t));
  lit *= mix(1., lit, 0.55);
  col *= uP[16] * lit;

  col = col * (1. + rip * 1.15 + well * 0.60);

  o = vec4(col * pill * uHover, pill);
}`;

const FRAG_DOWN = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex, uTex2;
uniform vec2 uDstTexel;
uniform vec2 uSrcTexel;
uniform float uAdd;
void main(){
  vec2 uv = gl_FragCoord.xy * uDstTexel;
  vec2 e = uDstTexel * 0.25;
  vec4 s = texture(uTex, uv + vec2(-e.x,-e.y)) + texture(uTex, uv + vec2( e.x,-e.y))
         + texture(uTex, uv + vec2(-e.x, e.y)) + texture(uTex, uv + vec2( e.x, e.y));
  s *= 0.25;
  if(uAdd > 0.5){
    vec4 r = texture(uTex2, uv + vec2(-e.x,-e.y)) + texture(uTex2, uv + vec2( e.x,-e.y))
           + texture(uTex2, uv + vec2(-e.x, e.y)) + texture(uTex2, uv + vec2( e.x, e.y));
    s.rgb += r.rgb * 0.25;
  }
  o = s;
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir; uniform float uR;
void main(){
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 st = uTexel * uDir * uR;
  vec4 s = texture(uTex, uv) * 0.1964;
  s += (texture(uTex, uv + st*1.4118) + texture(uTex, uv - st*1.4118)) * 0.2969;
  s += (texture(uTex, uv + st*3.2941) + texture(uTex, uv - st*3.2941)) * 0.0944;
  s += (texture(uTex, uv + st*5.1765) + texture(uTex, uv - st*5.1765)) * 0.0104;
  o = s;
}`;

const FRAG_COMP = HEAD + `
uniform sampler2D uSoft, uRim, uGlow;
uniform vec2  uRes;
uniform float uGlowGain, uGlowIn, uOccl, uDim, uPunch;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 glow = texture(uGlow, uv).rgb;

  vec2  d    = gl_FragCoord.xy - uC;
  float sd   = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);

  vec4 m = texture(uSoft, uv);
  float veil = 1. - smoothstep(0.46, 0.88, abs(d.y) / uHalf.y);
  vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.), vec3(uPunch));

  vec3 core = metal * pill * mix(1., uDim, veil) + texture(uRim, uv).rgb;
  float rip = ripple(vec2(d.x, -d.y) / (uHalf.y * 2.), uT);
  core += vec3(rip * rip) * uRipK2.w * pill * mix(1., 0.42, veil);

  float sdSh = sdPill(d + vec2(0., uHalf.y * 0.62), uHalf * 0.94, uHalf.y * 0.94);
  float occl = uOccl * exp(-max(sdSh, 0.) / (uHalf.y * 0.75));

  vec3 rgb = core + glow * uGlowGain * mix(1., uGlowIn, pill) * (1. - occl * (1. - pill));
  float a = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0., 1.);
  o = vec4(min(rgb, vec3(1.)), a);
}`;

const P = {
  valFreq: 0.50,
  valAmp: 0.55,
  dens: 2.40,
  densVar: 2.20,
  densFreq: 0.32,
  wobAmp: 0.12,
  wobFreq: 1.60,
  lift: 0.05,
  refract: 0.18,
  edge: 0.04,
  width: 0.46,
  disp: 0.30,
  skew: 1.50,
  fineAmp: 0.0,
  fineFreq: 9.0,
  gamma: 1.00,
  gain: 1.90,
  octGain: 0.32,
  litLo: -0.26,
  litHi: 0.10,
  dim: 0.44
};
const PKEYS = Object.keys(P) as (keyof typeof P)[];

const E = {
  base: 0.22,
  hot: 0.86,
  chromA: 0.42,
  chromS: 0.030,
  speed: 0.070,
  top: 0.35,
  press: 0.85,
  ripple: 1.60
};
const EKEYS = Object.keys(E) as (keyof typeof E)[];

const C = {
  glow: 1.95,
  glowR: 1.30,
  glowIn: 0.30,
  occl: 0.62,
  soften: 0.24,
  punch: 1.50
};

const R = {
  speed: 1.85,
  width: 0.20,
  decay: 1.35,
  amp: 1.35,
  facet: 0.18,
  lobes: 6.0,
  sharp: 1.15,
  emit: 0.45,
  ptrRad: 0.55,
  ptrAmp: 0.32,
  ptrFast: 0.40,
  ptrRim: 0.80,
  ptrLag: 0.0016,
  ptrVref: 4.5
};

const PADDING = 28;

export function LiquidMetalButton({
  children,
  className = "",
  containerClassName = "",
  type = "button",
  disabled = false,
  onClick,
  ...props
}: LiquidMetalButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [isSupported, setIsSupported] = useState(true);
  const [isHot, setIsHot] = useState(false);
  const [isPress, setIsPress] = useState(false);

  // Interaction ripple helper
  const addRippleRef = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const btn = btnRef.current;
    const stage = stageRef.current;
    if (!cv || !btn || !stage) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = cv.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance"
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setIsSupported(false);
      return;
    }

    const localGl = gl;

    function sh(type: number, src: string) {
      const s = localGl.createShader(type);
      if (!s) throw new Error("Failed to create shader");
      localGl.shaderSource(s, src);
      localGl.compileShader(s);
      if (!localGl.getShaderParameter(s, localGl.COMPILE_STATUS)) {
        const info = localGl.getShaderInfoLog(s);
        localGl.deleteShader(s);
        throw new Error(info || "Shader compilation failed");
      }
      return s;
    }

    function prog(fs: string) {
      const p = localGl.createProgram();
      if (!p) throw new Error("Failed to create program");
      const vs = sh(localGl.VERTEX_SHADER, VERT);
      const s = sh(localGl.FRAGMENT_SHADER, fs);
      localGl.attachShader(p, vs);
      localGl.attachShader(p, s);
      localGl.bindAttribLocation(p, 0, "position");
      localGl.linkProgram(p);
      if (!localGl.getProgramParameter(p, localGl.LINK_STATUS)) {
        const info = localGl.getProgramInfoLog(p);
        throw new Error(info || "Program link failed");
      }
      const u: Record<string, WebGLUniformLocation> = {};
      const n = localGl.getProgramParameter(p, localGl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = localGl.getActiveUniform(p, i);
        if (info) {
          const loc = localGl.getUniformLocation(p, info.name);
          if (loc) u[info.name.replace("[0]", "")] = loc;
        }
      }
      return { p, u };
    }

    let pScene: ReturnType<typeof prog>;
    let pRim: ReturnType<typeof prog>;
    let pDown: ReturnType<typeof prog>;
    let pBlur: ReturnType<typeof prog>;
    let pComp: ReturnType<typeof prog>;

    try {
      pScene = prog(FRAG_SCENE);
      pRim = prog(FRAG_RIM);
      pDown = prog(FRAG_DOWN);
      pBlur = prog(FRAG_BLUR);
      pComp = prog(FRAG_COMP);
    } catch (e) {
      console.warn("LiquidMetalButton shader error:", e);
      setIsSupported(false);
      return;
    }

    const vao = localGl.createVertexArray();
    localGl.bindVertexArray(vao);
    const vbo = localGl.createBuffer();
    localGl.bindBuffer(localGl.ARRAY_BUFFER, vbo);
    localGl.bufferData(
      localGl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      localGl.STATIC_DRAW
    );
    localGl.enableVertexAttribArray(0);
    localGl.vertexAttribPointer(0, 2, localGl.FLOAT, false, 0, 0);

    const hasFloat = !!localGl.getExtension("EXT_color_buffer_half_float");

    interface RenderTarget {
      tex: WebGLTexture | null;
      fbo: WebGLFramebuffer | null;
      w: number;
      h: number;
    }

    function makeTarget(): RenderTarget {
      const tex = localGl.createTexture();
      localGl.bindTexture(localGl.TEXTURE_2D, tex);
      localGl.texParameteri(localGl.TEXTURE_2D, localGl.TEXTURE_MIN_FILTER, localGl.LINEAR);
      localGl.texParameteri(localGl.TEXTURE_2D, localGl.TEXTURE_MAG_FILTER, localGl.LINEAR);
      localGl.texParameteri(localGl.TEXTURE_2D, localGl.TEXTURE_WRAP_S, localGl.CLAMP_TO_EDGE);
      localGl.texParameteri(localGl.TEXTURE_2D, localGl.TEXTURE_WRAP_T, localGl.CLAMP_TO_EDGE);
      const fbo = localGl.createFramebuffer();
      localGl.bindFramebuffer(localGl.FRAMEBUFFER, fbo);
      localGl.framebufferTexture2D(
        localGl.FRAMEBUFFER,
        localGl.COLOR_ATTACHMENT0,
        localGl.TEXTURE_2D,
        tex,
        0
      );
      return { tex, fbo, w: 0, h: 0 };
    }

    function sizeTarget(t: RenderTarget, w: number, h: number) {
      if (t.w === w && t.h === h) return;
      t.w = w;
      t.h = h;
      localGl.bindTexture(localGl.TEXTURE_2D, t.tex);
      if (hasFloat) {
        localGl.texImage2D(
          localGl.TEXTURE_2D,
          0,
          localGl.RGBA16F,
          w,
          h,
          0,
          localGl.RGBA,
          localGl.HALF_FLOAT,
          null
        );
      } else {
        localGl.texImage2D(
          localGl.TEXTURE_2D,
          0,
          localGl.RGBA8,
          w,
          h,
          0,
          localGl.RGBA,
          localGl.UNSIGNED_BYTE,
          null
        );
      }
    }

    const T_core = makeTarget();
    const T_rim = makeTarget();
    const T_s1 = makeTarget();
    const T_s2 = makeTarget();
    const T_a = makeTarget();
    const T_b = makeTarget();

    let W = 0;
    let H = 0;
    let DPR = 1;
    let BW = 0;
    let BH = 0;
    let CX = 0;
    let CY = 0;
    let DOWN = 4;
    const GLOW_TEX = 129;
    let needResize = true;

    function resize() {
      if (!cv || !btn || !stage) return;
      const r = cv.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(r.width * DPR));
      const h = Math.max(2, Math.round(r.height * DPR));
      if (w !== W || h !== H) {
        W = w;
        H = h;
        cv.width = W;
        cv.height = H;
      }
      BW = br.width * DPR;
      BH = br.height * DPR;
      CX = (br.left - r.left) * DPR + BW / 2;
      CY = H - ((br.top - r.top) * DPR + BH / 2);

      sizeTarget(T_core, W, H);
      sizeTarget(T_rim, W, H);
      const hw = Math.max(2, Math.ceil(W / 2));
      const hh = Math.max(2, Math.ceil(H / 2));
      sizeTarget(T_s1, hw, hh);
      sizeTarget(T_s2, hw, hh);
      DOWN = Math.max(1, Math.min(4, Math.round(BH / GLOW_TEX)));
      const dw = Math.max(2, Math.ceil(W / DOWN));
      const dh = Math.max(2, Math.ceil(H / DOWN));
      sizeTarget(T_a, dw, dh);
      sizeTarget(T_b, dw, dh);
      needResize = false;
    }

    const resizeObserver = new ResizeObserver(() => {
      needResize = true;
    });
    resizeObserver.observe(stage);
    resizeObserver.observe(btn);

    function drawTo(t: RenderTarget | null) {
      localGl.bindFramebuffer(localGl.FRAMEBUFFER, t ? t.fbo : null);
      localGl.viewport(0, 0, t ? t.w : W, t ? t.h : H);
      localGl.drawArrays(localGl.TRIANGLES, 0, 3);
    }

    const uArr = new Float32Array(PKEYS.length);
    const eArr = new Float32Array(EKEYS.length);

    // Initial base hover so the metal ribbons are softly visible at rest, blooming to full on interaction
    const IDLE_HOVER = 0.35;
    let hover = IDLE_HOVER;
    let hoverTarget = IDLE_HOVER;
    let clock = 0;
    let last = performance.now();

    const RIP = [0, 1, 2].map(() => ({ x: 0, y: 0, t: -99, on: 0 }));
    const ripArr = new Float32Array(12);
    let ripNext = 0;
    let press = 0;
    let pressTarget = 0;

    const ptr = { x: 0, y: 0 };
    const ptrS = { x: 0, y: 0 };
    let ptrAmt = 0;
    let ptrSpeed = 0;

    function addRipple(x: number, y: number) {
      const r = RIP[ripNext];
      ripNext = (ripNext + 1) % RIP.length;
      r.x = x;
      r.y = y;
      r.t = clock;
      r.on = 1;
    }
    addRippleRef.current = addRipple;

    function localPt(e: PointerEvent | MouseEvent) {
      if (!btn) return [0, 0];
      const b = btn.getBoundingClientRect();
      const s = b.height;
      return [(e.clientX - (b.left + b.width / 2)) / s, (e.clientY - (b.top + b.height / 2)) / s];
    }

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let drawn: string | null = null;
    let rafId = 0;

    const on = { over: false, press: false, focus: false };
    const sync = () => {
      hoverTarget = on.over || on.press || on.focus ? 1.0 : IDLE_HOVER;
      pressTarget = on.press ? 1 : 0;
      setIsHot(hoverTarget > 0.6);
      setIsPress(on.press);
    };

    function frame(now: number) {
      const dtRaw = (now - last) / 1000;
      last = now;
      const dt = Math.min(dtRaw, 1 / 20);
      if (!calm.matches) clock += dt;

      const k = hoverTarget > hover ? 1 - Math.pow(0.0012, dt) : 1 - Math.pow(0.00012, dt);
      hover += (hoverTarget - hover) * k;
      if (Math.abs(hoverTarget - hover) < 0.0008) hover = hoverTarget;

      const pk = pressTarget > press ? 1 - Math.pow(1e-9, dt) : 1 - Math.pow(0.004, dt);
      press += (pressTarget - press) * pk;
      if (Math.abs(pressTarget - press) < 0.002) press = pressTarget;

      for (let i = 0; i < RIP.length; i++) {
        const r = RIP[i];
        if (r.on && clock - r.t > 4) r.on = 0;
        ripArr[i * 4] = r.x;
        ripArr[i * 4 + 1] = r.y;
        ripArr[i * 4 + 2] = r.t;
        ripArr[i * 4 + 3] = r.on;
      }
      const ripLive = RIP.some((r) => r.on);

      const lag = 1 - Math.pow(R.ptrLag, dt);
      const dx = (ptr.x - ptrS.x) * lag;
      const dy = (ptr.y - ptrS.y) * lag;
      ptrS.x += dx;
      ptrS.y += dy;
      const inst = Math.min(Math.hypot(dx, dy) / Math.max(dt, 1e-3) / R.ptrVref, 1);
      ptrSpeed += (inst - ptrSpeed) * (1 - Math.pow(inst > ptrSpeed ? 0.001 : 0.02, dt));
      const wantWell = on.over || on.press ? 1 : 0;
      ptrAmt += (wantWell - ptrAmt) * (1 - Math.pow(0.004, dt));
      if (Math.abs(wantWell - ptrAmt) < 0.002) ptrAmt = wantWell;

      if (needResize) resize();

      const sig =
        calm.matches && !ripLive && ptrAmt < 0.002 ? `${hover}|${press}|${W}|${H}` : null;
      if (sig !== null && sig === drawn) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      drawn = sig;

      for (let i = 0; i < uArr.length; i++) uArr[i] = P[PKEYS[i]];
      for (let i = 0; i < eArr.length; i++) eArr[i] = E[EKEYS[i]];
      const bw = Math.max(1.5, 3.2 * (BH / 516));

      // 1. Metal scene pass
      localGl.useProgram(pScene.p);
      localGl.uniform2f(pScene.u.uC, CX, CY);
      localGl.uniform2f(pScene.u.uHalf, BW / 2, BH / 2);
      localGl.uniform1f(pScene.u.uT, clock);
      localGl.uniform1f(pScene.u.uHover, hover);
      localGl.uniform1f(pScene.u.uPress, press);
      localGl.uniform4fv(pScene.u.uRip, ripArr);
      localGl.uniform4f(pScene.u.uRipK, R.speed, R.width, R.decay, R.amp);
      localGl.uniform4f(pScene.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      localGl.uniform4f(pScene.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
      localGl.uniform4f(pScene.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
      localGl.uniform1fv(pScene.u.uP, uArr);
      drawTo(T_core);

      // 2. Travelling razor rim pass
      localGl.useProgram(pRim.p);
      localGl.uniform2f(pRim.u.uC, CX, CY);
      localGl.uniform2f(pRim.u.uHalf, BW / 2, BH / 2);
      localGl.uniform1f(pRim.u.uT, clock);
      localGl.uniform1f(pRim.u.uBw, bw);
      localGl.uniform1f(pRim.u.uPress, press);
      localGl.uniform4fv(pRim.u.uRip, ripArr);
      localGl.uniform4f(pRim.u.uRipK, R.speed, R.width, R.decay, R.amp);
      localGl.uniform4f(pRim.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      localGl.uniform4f(pRim.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
      localGl.uniform4f(pRim.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
      localGl.uniform1fv(pRim.u.uE, eArr);
      drawTo(T_rim);

      // 3. Soften metal pass
      localGl.useProgram(pDown.p);
      localGl.activeTexture(localGl.TEXTURE0);
      localGl.bindTexture(localGl.TEXTURE_2D, T_core.tex);
      localGl.uniform1i(pDown.u.uTex, 0);
      localGl.uniform1f(pDown.u.uAdd, 0);
      localGl.uniform2f(pDown.u.uDstTexel, 1 / T_s1.w, 1 / T_s1.h);
      localGl.uniform2f(pDown.u.uSrcTexel, 1 / W, 1 / H);
      drawTo(T_s1);

      localGl.useProgram(pBlur.p);
      localGl.uniform1i(pBlur.u.uTex, 0);
      localGl.uniform2f(pBlur.u.uTexel, 1 / T_s1.w, 1 / T_s1.h);
      const sigTex = C.soften * (BH * 0.5) * 0.95;
      if (sigTex > 0.1) {
        const iters = Math.min(4, Math.max(1, Math.ceil(sigTex / 3.0)));
        localGl.uniform1f(pBlur.u.uR, sigTex / Math.sqrt(iters) / 1.95);
        for (let i = 0; i < iters; i++) {
          localGl.bindTexture(localGl.TEXTURE_2D, T_s1.tex);
          localGl.uniform2f(pBlur.u.uDir, 1, 0);
          drawTo(T_s2);
          localGl.bindTexture(localGl.TEXTURE_2D, T_s2.tex);
          localGl.uniform2f(pBlur.u.uDir, 0, 1);
          drawTo(T_s1);
        }
      }

      // 4. Bloom pass
      localGl.useProgram(pDown.p);
      localGl.activeTexture(localGl.TEXTURE0);
      localGl.bindTexture(localGl.TEXTURE_2D, T_s1.tex);
      localGl.activeTexture(localGl.TEXTURE1);
      localGl.bindTexture(localGl.TEXTURE_2D, T_rim.tex);
      localGl.uniform1i(pDown.u.uTex, 0);
      localGl.uniform1i(pDown.u.uTex2, 1);
      localGl.uniform1f(pDown.u.uAdd, 1);
      localGl.uniform2f(pDown.u.uDstTexel, 1 / T_a.w, 1 / T_a.h);
      localGl.uniform2f(pDown.u.uSrcTexel, 1 / T_s1.w, 1 / T_s1.h);
      drawTo(T_a);

      localGl.useProgram(pBlur.p);
      localGl.activeTexture(localGl.TEXTURE0);
      localGl.uniform1i(pBlur.u.uTex, 0);
      localGl.uniform2f(pBlur.u.uTexel, 1 / T_a.w, 1 / T_a.h);
      const rs = (C.glowR * (BH / DOWN)) / GLOW_TEX;
      for (const r of [1.0, 2.3, 5.2, 9.0].map((v) => v * rs)) {
        localGl.uniform1f(pBlur.u.uR, r);
        localGl.bindTexture(localGl.TEXTURE_2D, T_a.tex);
        localGl.uniform2f(pBlur.u.uDir, 1, 0);
        drawTo(T_b);
        localGl.bindTexture(localGl.TEXTURE_2D, T_b.tex);
        localGl.uniform2f(pBlur.u.uDir, 0, 1);
        drawTo(T_a);
      }

      // 5. Composite pass
      localGl.useProgram(pComp.p);
      localGl.activeTexture(localGl.TEXTURE0);
      localGl.bindTexture(localGl.TEXTURE_2D, T_s1.tex);
      localGl.uniform1i(pComp.u.uSoft, 0);
      localGl.activeTexture(localGl.TEXTURE1);
      localGl.bindTexture(localGl.TEXTURE_2D, T_rim.tex);
      localGl.uniform1i(pComp.u.uRim, 1);
      localGl.activeTexture(localGl.TEXTURE2);
      localGl.bindTexture(localGl.TEXTURE_2D, T_a.tex);
      localGl.uniform1i(pComp.u.uGlow, 2);
      localGl.uniform2f(pComp.u.uRes, W, H);
      localGl.uniform2f(pComp.u.uC, CX, CY);
      localGl.uniform2f(pComp.u.uHalf, BW / 2, BH / 2);
      localGl.uniform1f(pComp.u.uT, clock);
      localGl.uniform4fv(pComp.u.uRip, ripArr);
      localGl.uniform4f(pComp.u.uRipK, R.speed, R.width, R.decay, R.amp);
      localGl.uniform4f(pComp.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      localGl.uniform1f(pComp.u.uGlowGain, C.glow);
      localGl.uniform1f(pComp.u.uGlowIn, C.glowIn);
      localGl.uniform1f(pComp.u.uOccl, C.occl);
      localGl.uniform1f(pComp.u.uDim, P.dim);
      localGl.uniform1f(pComp.u.uPunch, C.punch);
      drawTo(null);

      rafId = requestAnimationFrame(frame);
    }

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const [px, py] = localPt(e);
      ptr.x = px;
      ptr.y = py;
      ptrS.x = px;
      ptrS.y = py;
      ptrSpeed = 0;
      on.over = true;
      sync();
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        on.over = false;
        sync();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!on.over && !on.press) return;
      const [px, py] = localPt(e);
      ptr.x = px;
      ptr.y = py;
    };

    const onPointerDown = (e: PointerEvent) => {
      const [px, py] = localPt(e);
      ptr.x = px;
      ptr.y = py;
      on.press = true;
      sync();
      addRipple(ptr.x, ptr.y);
    };

    const onPointerUp = () => {
      on.press = false;
      sync();
    };

    const onFocus = () => {
      on.focus = btn.matches(":focus-visible");
      sync();
    };

    const onBlur = () => {
      on.focus = false;
      sync();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== "Enter" && e.key !== " ") || e.repeat) return;
      on.press = true;
      sync();
      addRipple(0, 0);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      on.press = false;
      sync();
    };

    btn.addEventListener("pointerenter", onPointerEnter);
    btn.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    btn.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);
    btn.addEventListener("keydown", onKeyDown);
    btn.addEventListener("keyup", onKeyUp);

    resize();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      btn.removeEventListener("pointerenter", onPointerEnter);
      btn.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointermove", onPointerMove);
      btn.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      btn.removeEventListener("focus", onFocus);
      btn.removeEventListener("blur", onBlur);
      btn.removeEventListener("keydown", onKeyDown);
      btn.removeEventListener("keyup", onKeyUp);

      try {
        localGl.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        // cleanup safe
      }
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (addRippleRef.current && btnRef.current) {
        const b = btnRef.current.getBoundingClientRect();
        const s = b.height;
        const x = (e.clientX - (b.left + b.width / 2)) / s;
        const y = (e.clientY - (b.top + b.height / 2)) / s;
        addRippleRef.current(x, y);
      }
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <div
      ref={stageRef}
      className={`relative w-full flex items-center justify-center select-none ${containerClassName}`}
      style={{ touchAction: "manipulation" }}
    >
      {/* ── Solid body plate & deep dynamic drop shadow ── */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
          isPress
            ? "bg-[#070809] shadow-[0_3px_8px_rgba(0,0,0,0.85),0_8px_20px_rgba(0,0,0,0.70)]"
            : isHot
            ? "bg-[#08090a] shadow-[0_6px_14px_rgba(0,0,0,0.80),0_20px_45px_rgba(0,0,0,0.72),0_44px_90px_rgba(0,0,0,0.55)]"
            : "bg-[#0b0c0e] shadow-[0_5px_12px_rgba(0,0,0,0.72),0_15px_34px_rgba(0,0,0,0.62),0_32px_68px_rgba(0,0,0,0.42)]"
        }`}
      />

      {/* ── WebGL 2 Liquid Metal & Specular Bloom Canvas ── */}
      {isSupported ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            inset: `-${PADDING}px`,
            width: `calc(100% + ${PADDING * 2}px)`,
            height: `calc(100% + ${PADDING * 2}px)`
          }}
        />
      ) : (
        /* Fallback for environments without WebGL 2 */
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 pointer-events-none"
        />
      )}

      {/* ── Interactive Accessible Button ── */}
      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={`relative z-10 w-full h-[52px] rounded-full flex items-center justify-center gap-2.5 px-6 font-semibold text-white tracking-wide cursor-pointer transition-transform duration-100 active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none select-none outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

export default LiquidMetalButton;
