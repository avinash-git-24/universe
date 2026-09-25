"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface WalkerModelProps {
  isNight?: boolean;
}

function WalkerCharacter({ isNight }: WalkerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Load the 3D model and its skeletal animations
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    // Play the natural walk cycle animation embedded in character.glb
    const walkAction = actions["walk"];
    if (walkAction) {
      walkAction.reset().fadeIn(0.3).play();
    }
    return () => {
      walkAction?.fadeOut(0.3);
    };
  }, [actions]);

  // Adjust material tone to match Day / Night atmosphere
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.65;
          mat.metalness = 0.1;
          if (isNight) {
            mat.color = new THREE.Color("#B0C4DE"); // Cool moonlight tint
          } else {
            mat.color = new THREE.Color("#FFFFFF"); // Natural sunlight
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, isNight]);

  // Movement along the campus road (Left ➔ Right)
  const speed = 1.35; // walking speed
  const leftBound = -10;
  const rightBound = 10;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Advance position
    groupRef.current.position.x += speed * delta;

    // Loop seamlessly across the road
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
      {/* 3D Character Mesh */}
      <group
        ref={groupRef}
        position={[leftBound, 0, 0]}
        rotation={[0, Math.PI / 2, 0]} // Face along the road towards positive X
        scale={0.88}
      >
        <primitive object={scene} />
      </group>

      {/* Realistic Soft Contact Shadow on Road Surface */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[leftBound, 0.02, 0]}
      >
        <planeGeometry args={[1.2, 0.6]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isNight ? 0.35 : 0.22}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export function CampusWalker3D({ isNight = false }: { isNight?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        bottom: "0%",
        height: "26%",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 1.0, 6.2], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        {/* Ambient & Directional Lighting matched to Day/Night mode */}
        <ambientLight intensity={isNight ? 0.75 : 1.35} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={isNight ? 0.9 : 1.6}
          color={isNight ? "#BAE6FD" : "#FFF7ED"}
        />
        <directionalLight
          position={[-4, 3, -2]}
          intensity={isNight ? 0.3 : 0.6}
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
