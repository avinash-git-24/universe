"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { random } from "maath";

function Starfield() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate a random starfield
  // Length must be a multiple of 3 (x, y, z for each point)
  const sphere = random.inSphere(new Float32Array(5001), { radius: 5 });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00E676"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function Planet({ position, size, color, speed, wireframe = false }: { position: [number, number, number], size: number, color: string, speed: number, wireframe?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += speed * delta;
      meshRef.current.rotation.x += (speed / 2) * delta;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[size, 64, 64]}>
      <meshStandardMaterial 
        color={color} 
        wireframe={wireframe} 
        roughness={0.85}
        metalness={0.15}
        emissive={color}
        emissiveIntensity={0.12}
        transparent
        opacity={0.65}
      />
    </Sphere>
  );
}

function SpaceScene() {
  const groupRef = useRef<THREE.Group>(null);

  // Slight parallax effect based on mouse movement
  useFrame((state) => {
    if (groupRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 20;
      const targetY = (state.pointer.y * Math.PI) / 20;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#66FFB2" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#00C853" />

      {/* Main Celestial Planet (Positioned lower and deeper in space to avoid text collision on mobile) */}
      <Planet position={[-2.4, -1.6, -1.8]} size={0.42} color="#00E676" speed={0.02} />
      
      {/* Small Wireframe Planet (Top Right) */}
      <Planet position={[1.6, 1.4, -2.5]} size={0.18} color="#66FFB2" speed={0.06} wireframe />

      <Starfield />
    </group>
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020604]">
      {/* Nebula gradient background to match the reference image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 70% 30%, rgba(0, 230, 118, 0.25) 0%, transparent 60%)"
        }}
      />
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <SpaceScene />
        </Canvas>
      </div>
    </div>
  );
}
