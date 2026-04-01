import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { StairResult } from "@/lib/stairCalculations";
import { useMemo } from "react";

interface Props {
  result: StairResult;
}

const STEP_THICKNESS = 0.02; // 20mm
const RISER_THICKNESS = 0.2; // 200mm

function StairMesh({ result }: Props) {
  const { numTreads, numRisers, riserHeight, treadDepth, nosing, width, totalHeight, flightRun } = result;

  const s = 0.001;
  const rH = riserHeight * s;
  const tD = treadDepth * s;
  const going = (treadDepth - nosing) * s;
  const nos = nosing * s;
  const w = width * s;
  const wallT = 0.2;
  const stepT = STEP_THICKNESS;
  const riserT = RISER_THICKNESS;

  const steps = useMemo(() => {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < numRisers; i++) {
      const riserX = i * going;
      const riserY = (i + 1) * rH;

      // Riser (200mm thick)
      elements.push(
        <mesh key={`riser-${i}`} position={[riserX, riserY - rH / 2, 0]}>
          <boxGeometry args={[riserT, rH, w]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
      );

      if (i < numTreads) {
        // Tread - nosing overhangs inward (backward over step below)
        const treadStartX = riserX - nos;
        const treadCenterX = treadStartX + tD / 2;

        elements.push(
          <mesh key={`tread-${i}`} position={[treadCenterX, riserY - stepT / 2, 0]}>
            <boxGeometry args={[tD, stepT, w]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
        );
      }
    }

    // Slab at top
    const slabX = numTreads * going;
    const slabY = totalHeight * s;
    elements.push(
      <mesh key="slab" position={[slabX + tD / 2 + 0.05, slabY - stepT / 2, 0]}>
        <boxGeometry args={[tD + 0.1, stepT, w]} />
        <meshStandardMaterial color="#c0c8d0" />
      </mesh>
    );

    // Walls
    const runM = flightRun * s;
    const hM = totalHeight * s;
    const wallH = hM + 0.3;
    elements.push(
      <mesh key="wall-left" position={[runM / 2, wallH / 2 - 0.1, -w / 2 - wallT / 2]}>
        <boxGeometry args={[runM + 1, wallH, wallT]} />
        <meshStandardMaterial color="#dde3ea" transparent opacity={0.3} />
      </mesh>
    );
    elements.push(
      <mesh key="wall-right" position={[runM / 2, wallH / 2 - 0.1, w / 2 + wallT / 2]}>
        <boxGeometry args={[runM + 1, wallH, wallT]} />
        <meshStandardMaterial color="#dde3ea" transparent opacity={0.3} />
      </mesh>
    );

    // Floor
    elements.push(
      <mesh key="floor" position={[runM / 2, -0.025, 0]}>
        <boxGeometry args={[runM + 1, 0.05, w + 2 * wallT]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    );

    return elements;
  }, [numTreads, numRisers, rH, tD, going, nos, w, totalHeight, flightRun, wallT, stepT, riserT]);

  return <group>{steps}</group>;
}

export default function Stair3DView({ result }: Props) {
  const runM = result.flightRun * 0.001;
  const hM = result.totalHeight * 0.001;
  const camDist = Math.max(runM, hM) * 1.2;

  return (
    <div className="w-full border border-border rounded-lg bg-card p-4">
      <h3 className="text-base font-semibold text-foreground mb-3 px-2">3D View</h3>
      <div className="w-full rounded-lg overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200" style={{ height: 500 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[camDist * 0.8, camDist * 0.6, camDist * 0.8]} fov={45} />
          <OrbitControls target={[runM / 2, hM / 2, 0]} enablePan enableZoom enableRotate />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.3} />
          <StairMesh result={result} />
          <gridHelper args={[10, 10, "#aabbcc", "#dde3ea"]} position={[runM / 2, -0.05, 0]} />
        </Canvas>
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-2">Click and drag to rotate · Scroll to zoom · Right-click to pan</p>
    </div>
  );
}
