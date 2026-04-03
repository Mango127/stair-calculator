import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { StairResult } from "@/lib/stairCalculations";
import { useMemo } from "react";

interface Props {
  result: StairResult;
}

const STEP_THICKNESS = 0.02; // 20mm in meters

function StairMesh({ result }: Props) {
  const { numTreads, numRisers, riserHeight, treadDepth, nosing, width, totalHeight, flightRun } = result;

  const s = 0.001;
  const rH = riserHeight * s;
  const tD = treadDepth * s;
  const nosingM = nosing * s;
  const going = (treadDepth - nosing) * s;
  const w = width * s;
  const wallT = 0.2;
  const wallH_extend = 1.2; // 120cm walls
  const stepT = STEP_THICKNESS;

  const steps = useMemo(() => {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < numTreads; i++) {
      const x = i * going; // front edge of going
      const y = (i + 1) * rH;

      // Tread: nosing extends BACKWARD (toward lower steps), not forward
      // The going starts at x, tread extends from (x - nosingM) to (x + going)
      // So tread center = x - nosingM/2 + going/2
      const treadCenterX = x + going / 2 - nosingM / 2;
      elements.push(
        <mesh key={`tread-${i}`} position={[treadCenterX, y - stepT / 2, 0]}>
          <boxGeometry args={[tD, stepT, w]} />
          <meshStandardMaterial color="#f5f5f7" />
        </mesh>
      );

      // Riser at front edge of this step
      elements.push(
        <mesh key={`riser-${i}`} position={[x, y - rH / 2, 0]}>
          <boxGeometry args={[0.005, rH, w]} />
          <meshStandardMaterial color="#e8e8ed" />
        </mesh>
      );
    }

    // Landing slab
    const slabX = numTreads * going;
    const slabY = totalHeight * s;
    elements.push(
      <mesh key="slab" position={[slabX + going / 2 + 0.05, slabY - stepT / 2, 0]}>
        <boxGeometry args={[going + 0.1, stepT, w]} />
        <meshStandardMaterial color="#d2d2d7" />
      </mesh>
    );

    // Walls - 120cm tall from stair line
    const runM = flightRun * s;
    const hM = totalHeight * s;
    const wallH = hM + wallH_extend;
    elements.push(
      <mesh key="wall-left" position={[runM / 2, wallH / 2 - 0.1, -w / 2 - wallT / 2]}>
        <boxGeometry args={[runM + 1, wallH, wallT]} />
        <meshStandardMaterial color="#f5f5f7" transparent opacity={0.15} />
      </mesh>
    );
    elements.push(
      <mesh key="wall-right" position={[runM / 2, wallH / 2 - 0.1, w / 2 + wallT / 2]}>
        <boxGeometry args={[runM + 1, wallH, wallT]} />
        <meshStandardMaterial color="#f5f5f7" transparent opacity={0.15} />
      </mesh>
    );

    // Floor
    elements.push(
      <mesh key="floor" position={[runM / 2, -0.025, 0]}>
        <boxGeometry args={[runM + 1, 0.05, w + 2 * wallT]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
    );

    return elements;
  }, [numTreads, rH, tD, going, nosingM, w, totalHeight, flightRun, wallT, wallH_extend, stepT]);

  return <group>{steps}</group>;
}

export default function Stair3DView({ result }: Props) {
  const runM = result.flightRun * 0.001;
  const hM = result.totalHeight * 0.001;
  const camDist = Math.max(runM, hM) * 1.2;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">3D View</h3>
      <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-secondary to-background" style={{ height: 500 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[camDist * 0.8, camDist * 0.6, camDist * 0.8]} fov={45} />
          <OrbitControls target={[runM / 2, hM / 2, 0]} enablePan enableZoom enableRotate />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.2} />
          <StairMesh result={result} />
          <gridHelper args={[10, 10, "#d2d2d7", "#e8e8ed"]} position={[runM / 2, -0.05, 0]} />
        </Canvas>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Drag to rotate · Scroll to zoom · Right-click to pan</p>
    </div>
  );
}
