/* File: src/shared/components/canvas/FossilCore.tsx */
import { useMemo } from 'react';

export default function FossilCore() {
  const positions = useMemo(() => {
    const nodeCount = 12;
    const pos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      // Tập trung cực nhỏ ở tâm (0.15) để trông như một mẫu vật kẹt bên trong
      pos[i * 3] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#2d1301" size={0.09} sizeAttenuation={true} />
    </points>
  );
}