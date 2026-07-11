import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { Truck3DModel } from './truck-3d-model';
import {
  OPERATIONAL_STATUS_CONFIG,
  HARDWARE_STATUS_CONFIG,
} from '../../../shared/constants/status.constant';
import { cn } from '../../../lib/cn';
import type { FleetPosition } from '../../../shared/types/fleet.types';
import type { OperationalStatus } from '../../../shared/types/common.types';

interface Truck3DViewerProps {
  position: FleetPosition;
  onClose: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" />
        <p className="text-sm text-muted-foreground">{progress.toFixed(0)}% Loading...</p>
      </div>
    </Html>
  );
}

function getVolumeColor(percent: number): string {
  if (percent < 40) return 'text-success';
  if (percent < 75) return 'text-warning';
  return 'text-destructive';
}

function getVolumeBgColor(percent: number): string {
  if (percent < 40) return 'bg-success';
  if (percent < 75) return 'bg-warning';
  return 'bg-destructive';
}

export function Truck3DViewer({ position, onClose }: Truck3DViewerProps) {
  const navigate = useNavigate();

  const statusConfig = OPERATIONAL_STATUS_CONFIG[position.operationalStatus];
  const hardwareConfig = HARDWARE_STATUS_CONFIG[position.hardwareStatus];

  const handleViewDetail = useCallback(() => {
    navigate(`/app/fleet/${position.fleetId}`);
  }, [navigate, position.fleetId]);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative h-[85vh] w-[90vw] max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: `hsl(var(--${statusConfig.colorClass.replace('bg-', '')}))`,
                }}
              />
              <h2 className="text-xl font-bold text-foreground">
                {position.plateNumber}
              </h2>
            </div>
            
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close 3D viewer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[calc(100%-180px)] w-full">
          <Canvas
            shadows
            camera={{ position: [8, 5, 8], fov: 45 }}
            className="bg-linear-to-b from-slate-100 to-slate-200"
          >
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
              />
              <directionalLight position={[-5, 5, -5]} intensity={0.3} />

              <Truck3DModel
                status={position.operationalStatus}
                volumePercent={position.volumePercent}
                animate={position.operationalStatus !== 'OFFLINE'}
              />

              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
              />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#e2e8f0" />
              </mesh>

              <gridHelper args={[20, 20, '#94a3b8', '#cbd5e1']} position={[0, -0.01, 0]} />

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={20}
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI / 2 - 0.1}
                autoRotate={position.operationalStatus !== 'OFFLINE'}
                autoRotateSpeed={0.5}
              />

              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: `hsl(var(--${statusConfig.colorClass.replace('bg-', '')}))`,
                  }}
                />
                <p className="text-sm font-medium text-foreground">{statusConfig.label}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Hardware</p>
              <p className="text-sm font-medium text-foreground">{hardwareConfig.label}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Volume Muatan</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full transition-all', getVolumeBgColor(position.volumePercent))}
                    style={{ width: `${position.volumePercent}%` }}
                  />
                </div>
                <span className={cn('text-sm font-bold', getVolumeColor(position.volumePercent))}>
                  {position.volumePercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleViewDetail}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 cursor-pointer"
              >
                Lihat Detail Lengkap
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-24 left-4 rounded-lg bg-black/70 px-3 py-2 text-xs text-white">
          <p>Drag untuk rotasi • Scroll untuk zoom • Klik kanan untuk pan</p>
        </div>
      </div>
    </div>
  );
}