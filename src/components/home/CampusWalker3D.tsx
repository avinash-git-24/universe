"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// ── Error Boundary to prevent silent Suspense crashes ────────────────────────
class WalkerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    console.error("[CampusWalker3D] Error in 3D walker:", error);
    return { hasError: true };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[CampusWalker3D] Details:", error, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface WalkerCharacterProps {
  isNight: boolean;
}

function WalkerCharacter({ isNight }: WalkerCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Load the 3D rigged model with DRACO decoder explicitly enabled
  const { scene, animations } = useGLTF("/models/character.glb", "/draco/gltf/");
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    // Play the natural walk cycle animation embedded in character.glb
    const walkAction = actions["walk"];
    if (walkAction) {
      walkAction.reset().fadeIn(0.2).play();
    }
    return () => {
      walkAction?.fadeOut(0.2);
    };
  }, [actions]);

  // Adjust material tone to match Day / Night atmosphere
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.55;
          mat.metalness = 0.05;
          if (isNight) {
            mat.color = new THREE.Color("#CBD5E1"); // Crisp cool moonlight tint
          } else {
            mat.color = new THREE.Color("#FFFFFF"); // Bright natural sunlight
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, isNight]);

  // Movement along the campus road (Left ➔ Right)
  // Starts directly on-screen so the user immediately sees him walking!
  const speed = 1.15;
  const leftBound = -8.0;
  const rightBound = 8.0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Advance position smoothly across the road
    groupRef.current.position.x += speed * delta;

    // Loop seamlessly when leaving the viewport
    if (groupRef.current.position.x > rightBound) {
      groupRef.current.position.x = leftBound;
    }

    // Keep contact shadow locked under the character's feet
    if (shadowRef.current) {
      shadowRef.current.position.x = groupRef.current.position.x;
    }
  });

  return (
    <>
      {/* 3D Character Mesh — Facing right along the campus road */}
      <group
        ref={groupRef}
        position={[-1.2, -0.65, 0]} // Start directly on-screen
        rotation={[0, Math.PI / 2, 0]} // Face along the road towards positive X
        scale={1.35}
      >
        <primitive object={scene} />
      </group>

      {/* Realistic Soft Contact Shadow on Road Surface */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-1.2, -0.63, 0]}
      >
        <planeGeometry args={[1.3, 0.65]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isNight ? 0.45 : 0.3}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export function CampusWalker3D() {
  const [mounted, setMounted] = useState(false);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-15"
      style={{
        bottom: "8%",
        height: "260px",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <WalkerErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.4, 4.2], fov: 38 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none", background: "transparent", width: "100%", height: "100%" }}
        >
          {/* Crisp lighting so character stands out cleanly against the campus */}
          <ambientLight intensity={isNight ? 1.4 : 2.0} />
          <directionalLight
            position={[5, 7, 5]}
            intensity={isNight ? 1.6 : 2.4}
            color={isNight ? "#E0F2FE" : "#FFFBEB"}
          />
          <directionalLight
            position={[-5, 4, -2]}
            intensity={isNight ? 0.7 : 1.2}
            color={isNight ? "#818CF8" : "#93C5FD"}
          />

          <Suspense fallback={null}>
            <WalkerCharacter isNight={isNight} />
          </Suspense>
        </Canvas>
      </WalkerErrorBoundary>
    </div>
  );
}

// Preload model asset with DRACO enabled for instant rendering
useGLTF.preload("/models/character.glb", "/draco/gltf/");
