import type { StairResult } from "@/lib/stairCalculations";

interface Props {
  result: StairResult;
}

const STEP_THICKNESS = 20;
const RISER_THICKNESS = 200;

export default function StairSectionView({ result }: Props) {
  const { totalHeight, flightRun, numTreads, riserHeight, treadDepth, nosing, numRisers } = result;
  const going = treadDepth - nosing;

  const margin = 300;
  const gridSize = 600;

  const svgW = flightRun + 2 * margin + 200;
  const svgH = totalHeight + 2 * margin + 200;

  const ox = margin;
  const oy = svgH - margin;

  const viewBox = `0 0 ${svgW} ${svgH}`;

  const gridLinesH: number[] = [];
  for (let y = 0; y <= totalHeight + gridSize; y += gridSize) gridLinesH.push(y);
  const gridLinesV: number[] = [];
  for (let x = -gridSize; x <= flightRun + gridSize; x += gridSize) gridLinesV.push(x);

  const stepPaths: JSX.Element[] = [];
  for (let i = 0; i < numRisers; i++) {
    const riserX = ox + i * going;

    // Riser (200mm thick rectangle)
    stepPaths.push(
      <rect
        key={`riser-${i}`}
        x={riserX - RISER_THICKNESS / 2}
        y={oy - (i + 1) * riserHeight}
        width={RISER_THICKNESS}
        height={riserHeight}
        fill="hsl(215, 20%, 90%)"
        stroke="hsl(220, 20%, 15%)"
        strokeWidth={1.5}
      />
    );

    if (i < numTreads) {
      // Tread - nosing overhangs inward (over the step below)
      const treadX = riserX - nosing;
      const treadY = oy - (i + 1) * riserHeight;

      stepPaths.push(
        <rect
          key={`tread-${i}`}
          x={treadX}
          y={treadY}
          width={treadDepth}
          height={STEP_THICKNESS}
          fill="hsl(215, 20%, 95%)"
          stroke="hsl(220, 20%, 15%)"
          strokeWidth={1.5}
        />
      );

      // Nosing indicator (dashed line showing where nosing starts)
      if (nosing > 0) {
        stepPaths.push(
          <line
            key={`nosing-line-${i}`}
            x1={riserX}
            y1={treadY}
            x2={riserX}
            y2={treadY + STEP_THICKNESS}
            stroke="hsl(217, 80%, 55%)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        );

        // Nosing dimension on first tread
        if (i === 0) {
          stepPaths.push(
            <line
              key="nosing-dim"
              x1={treadX}
              y1={treadY + STEP_THICKNESS + 10}
              x2={riserX}
              y2={treadY + STEP_THICKNESS + 10}
              stroke="hsl(217, 80%, 55%)"
              strokeWidth={0.8}
            />
          );
          stepPaths.push(
            <text
              key="nosing-label"
              x={treadX + nosing / 2}
              y={treadY + STEP_THICKNESS + 28}
              fontSize={18}
              fill="hsl(217, 80%, 55%)"
              fontFamily="monospace"
              textAnchor="middle"
            >
              n={nosing}
            </text>
          );
        }
      }
    }
  }

  // Slab at top
  const slabX = ox + numTreads * going;
  const slabY = oy - totalHeight;
  stepPaths.push(
    <rect key="slab" x={slabX} y={slabY} width={treadDepth + 100} height={STEP_THICKNESS}
      fill="hsl(215, 15%, 85%)" stroke="hsl(220, 20%, 15%)" strokeWidth={2} />
  );
  stepPaths.push(
    <text key="slab-label" x={slabX + (treadDepth + 100) / 2} y={slabY - 8}
      fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" textAnchor="middle">SLAB</text>
  );

  // Floor
  stepPaths.push(
    <line key="floor" x1={ox - 50} y1={oy} x2={ox + 200} y2={oy}
      stroke="hsl(220, 20%, 15%)" strokeWidth={2} />
  );

  // Angle arc
  const arcRadius = 400;
  const angleRad = (result.angle * Math.PI) / 180;
  const arcEndX = ox + arcRadius * Math.cos(angleRad);
  const arcEndY = oy - arcRadius * Math.sin(angleRad);

  const dimX = ox + flightRun + 120;
  const dimY = oy + 80;

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card p-4">
      <h3 className="text-base font-semibold text-foreground mb-3 px-2">Section View (Longitudinal Profile)</h3>
      <svg viewBox={viewBox} className="w-full" style={{ minHeight: 500 }}>
        {gridLinesH.map((y) => (
          <line key={`gh-${y}`} x1={0} y1={oy - y} x2={svgW} y2={oy - y} stroke="hsl(215, 15%, 90%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}
        {gridLinesV.map((x) => (
          <line key={`gv-${x}`} x1={ox + x} y1={0} x2={ox + x} y2={svgH} stroke="hsl(215, 15%, 90%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}

        <line x1={ox} y1={oy} x2={ox + flightRun} y2={oy - totalHeight} stroke="hsl(217, 80%, 55%)" strokeWidth={1} strokeDasharray="10 5" />

        {stepPaths}

        <path d={`M ${ox + arcRadius} ${oy} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}`} fill="none" stroke="hsl(217, 80%, 55%)" strokeWidth={1} />
        <text x={ox + arcRadius * 0.6} y={oy - arcRadius * 0.15} fontSize={24} fill="hsl(217, 80%, 55%)" fontFamily="monospace">
          {result.angle.toFixed(1)}°
        </text>

        <line x1={dimX} y1={oy} x2={dimX} y2={oy - totalHeight} stroke="hsl(220, 15%, 40%)" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-up)" />
        <text x={dimX + 10} y={oy - totalHeight / 2} fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" dominantBaseline="middle">
          {totalHeight} mm
        </text>

        <line x1={ox} y1={dimY} x2={ox + flightRun} y2={dimY} stroke="hsl(220, 15%, 40%)" strokeWidth={1} />
        <text x={ox + flightRun / 2} y={dimY + 28} fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" textAnchor="middle">
          {flightRun} mm
        </text>

        <line x1={ox - 60} y1={oy} x2={ox - 60} y2={oy - riserHeight} stroke="hsl(217, 80%, 55%)" strokeWidth={0.8} />
        <text x={ox - 70} y={oy - riserHeight / 2} fontSize={20} fill="hsl(217, 80%, 55%)" fontFamily="monospace" textAnchor="end" dominantBaseline="middle">
          {riserHeight.toFixed(1)}
        </text>

        <line x1={ox} y1={oy - riserHeight - 40} x2={ox + treadDepth} y2={oy - riserHeight - 40} stroke="hsl(217, 80%, 55%)" strokeWidth={0.8} />
        <text x={ox + treadDepth / 2} y={oy - riserHeight - 55} fontSize={20} fill="hsl(217, 80%, 55%)" fontFamily="monospace" textAnchor="middle">
          {treadDepth.toFixed(1)}
        </text>

        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(220, 15%, 40%)" />
          </marker>
          <marker id="arrowhead-up" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(220, 15%, 40%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
