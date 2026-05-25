/* File: src/shared/components/canvas/AmberStone.tsx 
*/
import { useMemo } from 'react';
import * as THREE from 'three';

export default function AmberStone() {
  const edgePositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.7, 8, 5); 
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i++) {
      pos[i] += (Math.random() - 0.5) * 0.15;
    }
    const edges = new THREE.EdgesGeometry(geometry, 1);
    return edges.attributes.position.array as Float32Array;
  }, []);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#f59e0b" transparent opacity={0.4} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fbbf24" size={0.04} transparent opacity={0.6} />
      </points>
    </group>
  );
}
