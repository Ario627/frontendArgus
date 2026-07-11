import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';

interface Truck3DModelProps {
  status: 'ONLINE_NORMAL' | 'ONLINE_BROKEN' | 'STALE' | 'OFFLINE';
  volumePercent: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
}

const STATUS_COLORS = {
  ONLINE_NORMAL: '#22c55e', // green
  ONLINE_BROKEN: '#ef4444', // red
  STALE: '#eab308', // yellow
  OFFLINE: '#6b7280', // gray
};

export function Truck3DModel({
  status,
  volumePercent,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animate = true,
}: Truck3DModelProps) {
  const truckRef = useRef<Group>(null);
  const wheelFLRef = useRef<Mesh>(null);
  const wheelFRRef = useRef<Mesh>(null);
  const wheelRLRef = useRef<Mesh>(null);
  const wheelRRRef = useRef<Mesh>(null);
  const compactorRef = useRef<Mesh>(null);

  const mainColor = STATUS_COLORS[status];
  const bodyColor = '#f8fafc';
  const wheelColor = '#1f2937';
  const windowColor = '#60a5fa';

  useFrame((state) => {
    if (!animate) return;

    const time = state.clock.getElapsedTime();

    const wheelRotation = time * 2;
    if (wheelFLRef.current) wheelFLRef.current.rotation.x = wheelRotation;
    if (wheelFRRef.current) wheelFRRef.current.rotation.x = wheelRotation;
    if (wheelRLRef.current) wheelRLRef.current.rotation.x = wheelRotation;
    if (wheelRRRef.current) wheelRRRef.current.rotation.x = wheelRotation;

    if (truckRef.current) {
      truckRef.current.position.y = Math.sin(time * 3) * 0.02;
    }

    if (compactorRef.current) {
      compactorRef.current.position.z = -1.8 + Math.sin(time * 2) * 0.05;
    }
  });

  const fillHeight = (volumePercent / 100) * 1.2;

  return (
    <group
      ref={truckRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      <mesh position={[0, 0.8, 1.5]} castShadow>
        <boxGeometry args={[2, 1.6, 2]} />
        <meshStandardMaterial color={mainColor} />
      </mesh>

      <mesh position={[0, 1.7, 1.5]} castShadow>
        <boxGeometry args={[2.1, 0.1, 2.1]} />
        <meshStandardMaterial color={mainColor} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 1.1, 2.51]} castShadow>
        <boxGeometry args={[1.6, 0.8, 0.05]} />
        <meshStandardMaterial
          color={windowColor}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh position={[1.01, 1.1, 1.5]} castShadow>
        <boxGeometry args={[0.05, 0.6, 1.2]} />
        <meshStandardMaterial
          color={windowColor}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[-1.01, 1.1, 1.5]} castShadow>
        <boxGeometry args={[0.05, 0.6, 1.2]} />
        <meshStandardMaterial
          color={windowColor}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh position={[0, 0.9, -0.5]} castShadow>
        <boxGeometry args={[2.2, 1.8, 2.8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.6} />
      </mesh>

      <mesh position={[1.11, 0.9, -0.5]} castShadow>
        <boxGeometry args={[0.05, 1.7, 2.7]} />
        <meshStandardMaterial color={mainColor} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-1.11, 0.9, -0.5]} castShadow>
        <boxGeometry args={[0.05, 1.7, 2.7]} />
        <meshStandardMaterial color={mainColor} metalness={0.3} roughness={0.5} />
      </mesh>

      <mesh position={[0, 1.85, -0.5]} castShadow>
        <boxGeometry args={[2.3, 0.1, 2.9]} />
        <meshStandardMaterial color={mainColor} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.3 + fillHeight / 2, -0.5]}>
        <boxGeometry args={[2, fillHeight, 2.6]} />
        <meshStandardMaterial
          color={volumePercent > 80 ? '#ef4444' : volumePercent > 50 ? '#eab308' : '#22c55e'}
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh ref={compactorRef} position={[0, 0.9, -1.9]} castShadow>
        <boxGeometry args={[2, 1.6, 0.3]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
      </mesh>

      <mesh position={[0.8, 1.2, -1.7]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.8, 1.2, -1.7]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.1, 0.5]} castShadow>
        <boxGeometry args={[1.8, 0.2, 5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.3, 2.6]} castShadow>
        <boxGeometry args={[2.1, 0.4, 0.2]} />
        <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[0.7, 0.6, 2.6]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={status === 'OFFLINE' ? 0 : 0.5}
        />
      </mesh>
      <mesh position={[-0.7, 0.6, 2.6]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={status === 'OFFLINE' ? 0 : 0.5}
        />
      </mesh>

      <mesh position={[0.9, 0.6, -2]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={status === 'ONLINE_BROKEN' ? 0.8 : 0.2}
        />
      </mesh>
      <mesh position={[-0.9, 0.6, -2]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={status === 'ONLINE_BROKEN' ? 0.8 : 0.2}
        />
      </mesh>

      
      <mesh ref={wheelFLRef} position={[1.1, 0.3, 1.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color={wheelColor} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh ref={wheelFRRef} position={[-1.1, 0.3, 1.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color={wheelColor} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh ref={wheelRLRef} position={[1.1, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.35, 16]} />
        <meshStandardMaterial color={wheelColor} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh ref={wheelRRRef} position={[-1.1, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.35, 16]} />
        <meshStandardMaterial color={wheelColor} metalness={0.3} roughness={0.7} />
      </mesh>

      <mesh position={[1.26, 0.3, 1.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.26, 0.3, 1.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.28, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.28, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.9, 1.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={mainColor}
          emissiveIntensity={status === 'OFFLINE' ? 0 : 1}
        />
      </mesh>
    </group>
  );
}