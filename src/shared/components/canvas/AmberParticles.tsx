/* File: src/shared/components/canvas/AmberParticles.tsx
*/
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NeuralAmberNetwork() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [themeColor, setThemeColor] = useState('#000000');

  useEffect(() => {
    
    const updateTheme = () => {
      const root = getComputedStyle(document.documentElement);
      const color = root.getPropertyValue('--foreground').trim();
      setThemeColor(color.includes(' ') ? `hsl(${color.replace(/ /g, ',')})` : color);
    };

    updateTheme(); 

    
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const { positions, lineIndices } = useMemo(() => {
    const s = 1.1; 
    const posArray = [-s,-s,-s, s,-s,-s, s,s,-s, -s,s,-s, -s,-s,s, s,-s,s, s,s,s, -s,s,s];
    const indicesArray = [0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 0,4, 1,5, 2,6, 3,7];
    return { positions: new Float32Array(posArray), lineIndices: new Uint16Array(indicesArray) };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uColor.value.set(themeColor);
    }
  });

  return (
    <group>
      {/* Khung đường kẻ: opacity 0.3 để tinh tế */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[lineIndices, 1]} />
        </bufferGeometry>
        <lineBasicMaterial color={themeColor} transparent opacity={0.3} />
      </lineSegments>

      {}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          transparent={true}
          blending={THREE.NormalBlending}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(themeColor) }
          }}
          vertexShader={`
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = (28.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            varying vec3 vPosition;
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              float alpha = smoothstep(0.5, 0.2, dist);
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
        />
      </points>
    </group>
  );
}