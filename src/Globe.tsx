import React, { ReactNode } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

interface GlobeProps {
  textureUrl: string;
  width?: string;
  height?: string;
  children?: ReactNode;
}

const Globe: React.FC<GlobeProps> = ({ textureUrl, width = '100%', height = '100%', children }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  return (
    <div style={{ width, height, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />

        <mesh>
          <sphereGeometry args={[3, 64, 64]} />
          <meshStandardMaterial map={texture} metalness={0.5} roughness={0.3} />
        </mesh>

        {children}

        <OrbitControls
          enableZoom={true}
          zoomSpeed={0.6}
          maxDistance={200}
          minDistance={4}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};

export default Globe;
