/* File: src/shared/components/canvas/ParticleScene.tsx */
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import NeuralAmberNetwork from './AmberParticles';
import AmberStone from './AmberStone';

export default function ParticleScene() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <group>
            <NeuralAmberNetwork />
            <AmberStone />
          </group>

          <OrbitControls enablePan={false} enableZoom={false} makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}
