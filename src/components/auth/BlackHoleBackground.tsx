"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Shaders ──────────────────────────────────────────────────────────────────

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uStabilize; 
  uniform float uAspect;
  uniform float uExposure;
  varying vec2 vUv;

  // --- NOISE FUNCTIONS ---
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 st) {
    float v = 0.0; float a = 0.5; vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(st); st = rot * st * 2.0 + shift; a *= 0.5;
    }
    return v;
  }

  void main() {
    // Coordinate Setup
    vec2 uv = vUv - 0.5;
    uv.x *= uAspect; // Maintain perfect circles across window sizes
    
    float chaos = 1.0 - uStabilize;
    float rBase = length(uv);

    // 1. Interactive Gravitational Twist (Applies BEFORE shaping)
    float twist = chaos * 15.0 * exp(-rBase * 6.0); 
    float angle = atan(uv.y, uv.x) + twist;
    
    // Reconstruct warped coordinates
    vec2 p = vec2(cos(angle), sin(angle)) * rBase;
    float pr = length(p);

    // 2. The Singularity (Event Horizon)
    float horizon = 0.15;
    float isVoid = smoothstep(horizon - 0.005, horizon + 0.005, pr);

    // 3. The Lensed Halo (Back of the Accretion Disk bent over the top/bottom)
    float haloRadius = horizon * 1.5;
    float haloThickness = abs(pr - haloRadius);
    
    // Pinch the halo at the equator to simulate 3D occlusion
    float pinch = smoothstep(0.0, 0.15, abs(p.y));
    
    // Core halo band + outer glow
    float halo = exp(-haloThickness * 40.0) * pinch;
    halo += exp(-haloThickness * 10.0) * 0.4 * pinch;

    // 4. The Front Accretion Disk
    float diskY = abs(p.y);
    float diskX = abs(p.x);
    
    // Inner Cutout (The ISCO - Innermost Stable Circular Orbit)
    float innerEllipse = length(vec2(p.x, p.y * 5.0));
    float diskCutout = smoothstep(horizon * 1.1, horizon * 1.4, innerEllipse);
    
    // Main horizontal piercing beam + secondary soft glow
    float frontDisk = exp(-diskY * 80.0) * diskCutout;
    frontDisk += exp(-diskY * 15.0) * 0.5 * diskCutout; 
    
    // Fade out towards the horizontal edges
    frontDisk *= smoothstep(1.3, 0.3, diskX);

    // 5. Texture & Volumetric Details (FBM Noise)
    // Concentric bands for the Halo
    vec2 polar = vec2(atan(p.y, p.x), pr);
    float nHalo = fbm(vec2(polar.x * 4.0 - uTime * 0.1, pr * 50.0));
    halo *= (nHalo * 0.7 + 0.3);
    
    // Horizontal streaks for the Front Disk
    float nDisk = fbm(vec2(p.x * 10.0 - uTime * 0.4, p.y * 100.0));
    frontDisk *= (nDisk * 0.8 + 0.2);

    // 6. Composition
    float density = (halo * isVoid) + frontDisk;

    // Add deep space nebula dust caught in the gravity well
    float nebula = fbm(p * 3.0 + uTime * 0.02) * 0.1;
    nebula *= smoothstep(0.0, 0.6, pr); 
    density += nebula;

    // 7. Cinematic Color Grading (Interstellar Palette: amber, copper, bright core)
    vec3 cDark = vec3(0.18, 0.05, 0.01);      // Deep space amber
    vec3 cMid = vec3(1.0, 0.45, 0.15);       // Searing copper/orange
    vec3 cLight = vec3(1.0, 0.95, 0.9);      // Blow-out white
    
    vec3 color = mix(vec3(0.0), cDark, smoothstep(0.0, 0.15, density));
    color = mix(color, cMid, smoothstep(0.15, 0.4, density));
    color = mix(color, cLight, smoothstep(0.4, 1.0, density));

    // 8. Doppler Beaming Physics
    // Accretion disk moving towards camera (left side) is brighter
    float doppler = 1.0 - p.x * 0.6;
    color *= mix(1.0, doppler, smoothstep(0.0, 1.0, pr * 2.0));

    // 9. Lensed Background Stars (Generated in-shader for gravity distortion)
    vec2 starPos = p * 150.0;
    float starGrid = random(floor(starPos));
    float starShape = smoothstep(0.4, 0.0, length(fract(starPos) - 0.5));
    float lensedStars = smoothstep(0.98, 1.0, starGrid) * starShape;
    
    lensedStars *= smoothstep(horizon * 1.05, horizon * 1.5, pr); 
    lensedStars *= smoothstep(0.4, 0.0, density); 
    
    vec3 starColor = mix(vec3(0.5, 0.8, 1.0), vec3(1.0, 0.7, 0.4), random(floor(starPos) + 1.0));
    color += starColor * lensedStars * 3.0 * isVoid;

    // Enforce absolute Vantablack inside the Event Horizon
    color *= isVoid;

    // Global exposure boost
    color *= 1.35 * uExposure;

    // 10. Blend with Background
    float alphaMask = smoothstep(1.0, 0.4, pr);
    alphaMask = max(alphaMask, smoothstep(0.1, 0.5, density));

    gl_FragColor = vec4(color, alphaMask);
  }
`;

// Helper: Circular particle texture for soft glowing stars
function createStarTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

export default function BlackHoleBackground({ isWarping = false }: { isWarping?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isWarpingRef = useRef(isWarping);

  useEffect(() => {
    isWarpingRef.current = isWarping;
  }, [isWarping]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Device performance check
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    // Uniforms
    const uniforms = {
      uTime: { value: 0.0 },
      uStabilize: { value: 1.0 }, // Smooth stabilized state for login
      uAspect: { value: window.innerWidth / window.innerHeight },
      uExposure: { value: 1.05 },
    };

    // Portal mesh
    const portalGeometry = new THREE.PlaneGeometry(12, 12);
    const portalMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    scene.add(portal);

    // Starfield particles
    const starsCount = isMobile ? 1200 : 3000;
    const starsGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(starsCount * 3);
    const colArray = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = (Math.random() - 0.5) * 30;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
      const isWarm = Math.random() > 0.6;
      colArray[i] = 1.0;
      colArray[i + 1] = isWarm ? 0.6 + Math.random() * 0.2 : 0.8 + Math.random() * 0.2;
      colArray[i + 2] = isWarm ? 0.3 + Math.random() * 0.2 : 0.9 + Math.random() * 0.1;
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(colArray, 3));

    const starTexture = createStarTexture();
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      map: starTexture || undefined,
      depthWrite: false,
    });
    const starMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starMesh);

    // Web Audio Synthesizer for Warp Whoosh
    const playWarpAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.8);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.8);
      } catch {
        // audio playback on user gesture fallback
      }
    };

    // Animation & Parallax variables
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let warpProgress = 0;
    let audioPlayed = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || isWarpingRef.current) return;
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      uniforms.uAspect.value = width / height;
    };

    window.addEventListener("resize", handleResize);

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isWarpingRef.current) {
        if (!audioPlayed) {
          playWarpAudio();
          audioPlayed = true;
        }

        warpProgress += delta * 0.55; // Reaches 1.0 in ~1.8s
        const easeWarp = Math.min(1.0, Math.pow(warpProgress, 2.2));

        // Accelerate Black hole rotation and collapse gravity
        uniforms.uTime.value += delta * (1.0 + easeWarp * 12.0);
        uniforms.uStabilize.value = 1.0 - easeWarp * 2.0; // Collapses from 1.0 to -1.0
        uniforms.uExposure.value = 1.05 + easeWarp * 2.5;

        // Camera flies forward directly through the black hole singularity
        camera.position.z = 4.0 - easeWarp * 12.0; // from 4.0 down to -8.0
        camera.position.x *= 0.95;
        camera.position.y *= 0.95;
        camera.lookAt(0, 0, -20);

        // Hyperspace star streaks
        starsMaterial.size = 0.055 + easeWarp * 0.12;
        const positions = starMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < positions.length; i += 3) {
          positions[i] += (1.2 + easeWarp * 35.0) * delta;
          if (positions[i] > camera.position.z + 5) positions[i] = camera.position.z - 25;
        }
        starMesh.geometry.attributes.position.needsUpdate = true;
      } else {
        uniforms.uTime.value += delta * 1.0;

        // Drift stars towards camera
        const positions = starMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < positions.length; i += 3) {
          positions[i] += 1.2 * delta;
          if (positions[i] > camera.position.z) positions[i] = -20;
        }
        starMesh.geometry.attributes.position.needsUpdate = true;

        // Parallax smooth interpolation
        if (!prefersReducedMotion) {
          const time = uniforms.uTime.value;
          const idleX = Math.sin(time * 0.15) * 0.06;
          const idleY = Math.cos(time * 0.1) * 0.06;

          mouseX += (targetX * 0.12 - mouseX) * 0.05;
          mouseY += (targetY * 0.12 - mouseY) * 0.05;

          camera.position.x = idleX + mouseX;
          camera.position.y = idleY + mouseY;
          camera.lookAt(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      portalGeometry.dispose();
      portalMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      if (starTexture) starTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Absolute base dark void */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -3,
          background: "#000002",
        }}
      />

      {/* WebGL 3D Black Hole Canvas */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          pointerEvents: "none",
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: "radial-gradient(circle at center, transparent 35%, rgba(0, 2, 8, 0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Film Grain Texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
          opacity: 0.03,
          pointerEvents: "none",
        }}
      />

      {/* Warp Jump Flash Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "#ffffff",
          opacity: isWarping ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 0.25s ease-in 1.9s",
        }}
      />
    </>
  );
}
