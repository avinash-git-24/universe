"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface WalkerCharacterProps {
  isNight: boolean;
}

function WalkerCharacter({ isNight }: WalkerCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Load the 3D rigged model with its animations
  const { scene, animations } = useGLTF("/models/character.glb");
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
  const speed = 1.1;
  const leftBound = -7.5;
  const rightBound = 7.5;

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
        position={[-1.2, -0.65, 0]} // Start on-screen right on the road
        rotation={[0, Math.PI / 2, 0]} // Face along the road towards positive X
        scale={1.15}
      >
        <primitive object={scene} />
      </group>

      {/* Realistic Soft Contact Shadow on Road Surface */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-1.2, -0.63, 0]}
      >
        <planeGeometry args={[1.1, 0.55]} />
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
        bottom: "6%",
        height: "220px",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.35, 4.2], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none", background: "transparent", width: "100%", height: "100%" }}
      >
        {/* Crisp lighting so character stands out cleanly against the campus */}
        <ambientLight intensity={isNight ? 1.2 : 1.8} />
        <directionalLight
          position={[5, 7, 5]}
          intensity={isNight ? 1.4 : 2.2}
          color={isNight ? "#E0F2FE" : "#FFFBEB"}
        />
        <directionalLight
          position={[-5, 4, -2]}
          intensity={isNight ? 0.6 : 1.0}
          color={isNight ? "#818CF8" : "#93C5FD"}
        />

        <Suspense fallback={null}>
          <WalkerCharacter isNight={isNight} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload model asset for instant rendering
useGLTF.preload("/models/character.glb");
