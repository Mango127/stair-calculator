import type { StairResult } from "@/lib/stairCalculations";

interface Props {
  result: StairResult;
}

const STEP_THICKNESS = 20;

export default function StairSectionView({ result }: Props) {
  const { totalHeight, flightRun, numTreads, riserHeight, treadDepth, nosing, numRisers } = result;

  const margin = 350;
  const gridSize = 600;

  const svgW = flightRun + 2 * margin + 300;
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
    if (i < numTreads) {
      const tx = ox + i * treadDepth;
      const ty = oy - (i + 1) * riserHeight;

      stepPaths.push(
        <rect key={`tread-${i}`} x={tx} y={ty} width={treadDepth} height={STEP_THICKNESS}
          fill="hsl(220, 14%, 96%)" stroke="hsl(220, 14%, 10%)" strokeWidth={1.5} />
      );

      // Nosing annotation (internal – extends back over previous step)
      if (nosing > 0 && i > 0) {
        const nosingX = tx; // front edge of this tread = back overlap start
        stepPaths.push(
          <line key={`nosing-line-${i}`} x1={nosingX} y1={ty} x2={nosingX} y2={ty + STEP_THICKNESS}
            stroke="hsl(220, 90%, 56%)" strokeWidth={1} strokeDasharray="4 2" />
        );
        // Label on first visible nosing
        if (i === 1) {
          // Nosing dimension line
          const nLineY = ty + STEP_THICKNESS + 20;
          stepPaths.push(
            <line key="nosing-dim-line" x1={nosingX - nosing} y1={nLineY} x2={nosingX} y2={nLineY}
              stroke="hsl(220, 90%, 56%)" strokeWidth={1} />
          );
          stepPaths.push(
            <text key="nosing-label" x={nosingX - nosing / 2} y={nLineY + 28}
              fontSize={28} fill="hsl(220, 90%, 56%)" fontFamily="Lato, sans-serif" textAnchor="middle">
              n={nosing}
            </text>
          );
        }
      }
    }

    const rx = ox + (i < numTreads ? i * treadDepth : numTreads * treadDepth);
    stepPaths.push(
      <line key={`riser-${i}`} x1={rx} y1={oy - i * riserHeight} x2={rx} y2={oy - (i + 1) * riserHeight}
        stroke="hsl(220, 14%, 10%)" strokeWidth={1.5} />
    );
  }

  // Slab
  const slabX = ox + numTreads * treadDepth;
  const slabY = oy - totalHeight;
  const slabWidth = treadDepth + 100;
  stepPaths.push(
    <rect key="slab" x={slabX} y={slabY} width={slabWidth} height={STEP_THICKNESS}
      fill="hsl(220, 14%, 90%)" stroke="hsl(220, 14%, 10%)" strokeWidth={2} />
  );
  stepPaths.push(
    <text key="slab-label" x={slabX + slabWidth / 2} y={slabY - 10}
      fontSize={28} fill="hsl(220, 9%, 46%)" fontFamily="Lato, sans-serif" textAnchor="middle">
      SLAB
    </text>
  );

  // Floor line
  stepPaths.push(
    <line key="floor" x1={ox - 50} y1={oy} x2={ox + 200} y2={oy}
      stroke="hsl(220, 14%, 10%)" strokeWidth={2} />
  );

  // Angle arc
  const arcRadius = 400;
  const angleRad = (result.angle * Math.PI) / 180;
  const arcEndX = ox + arcRadius * Math.cos(angleRad);
  const arcEndY = oy - arcRadius * Math.sin(angleRad);

  // Height dimension – positioned at end of slab
  const dimX = slabX + slabWidth + 60;
  const dimY = oy + 80;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Section View</h3>
      <svg viewBox={viewBox} className="w-full" style={{ minHeight: 500 }}>
        {gridLinesH.map((y) => (
          <line key={`gh-${y}`} x1={0} y1={oy - y} x2={svgW} y2={oy - y} stroke="hsl(220, 14%, 94%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}
        {gridLinesV.map((x) => (
          <line key={`gv-${x}`} x1={ox + x} y1={0} x2={ox + x} y2={svgH} stroke="hsl(220, 14%, 94%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}

        {/* Stair line */}
        <line x1={ox} y1={oy} x2={ox + flightRun} y2={oy - totalHeight} stroke="hsl(220, 90%, 56%)" strokeWidth={1} strokeDasharray="10 5" />

        {stepPaths}

        {/* Angle arc */}
        <path d={`M ${ox + arcRadius} ${oy} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}`} fill="none" stroke="hsl(220, 90%, 56%)" strokeWidth={1} />
        <text x={ox + arcRadius * 0.6} y={oy - arcRadius * 0.15} fontSize={30} fill="hsl(220, 90%, 56%)" fontFamily="Lato, sans-serif">
          {result.angle.toFixed(1)}°
        </text>

        {/* Height dimension */}
        <line x1={dimX} y1={oy} x2={dimX} y2={oy - totalHeight} stroke="hsl(220, 9%, 46%)" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-up)" />
        <text x={dimX + 14} y={oy - totalHeight / 2} fontSize={28} fill="hsl(220, 9%, 46%)" fontFamily="Lato, sans-serif" dominantBaseline="middle">
          {totalHeight} mm
        </text>

        {/* Flight run dimension */}
        <line x1={ox} y1={dimY} x2={ox + flightRun} y2={dimY} stroke="hsl(220, 9%, 46%)" strokeWidth={1} />
        <text x={ox + flightRun / 2} y={dimY + 34} fontSize={28} fill="hsl(220, 9%, 46%)" fontFamily="Lato, sans-serif" textAnchor="middle">
          {flightRun} mm
        </text>

        {/* Riser height annotation */}
        <line x1={ox - 60} y1={oy} x2={ox - 60} y2={oy - riserHeight} stroke="hsl(220, 90%, 56%)" strokeWidth={1} />
        <text x={ox - 74} y={oy - riserHeight / 2} fontSize={26} fill="hsl(220, 90%, 56%)" fontFamily="Lato, sans-serif" textAnchor="end" dominantBaseline="middle">
          {riserHeight.toFixed(1)}
        </text>

        {/* Tread depth annotation */}
        <line x1={ox} y1={oy - riserHeight - 50} x2={ox + treadDepth} y2={oy - riserHeight - 50} stroke="hsl(220, 90%, 56%)" strokeWidth={1} />
        <text x={ox + treadDepth / 2} y={oy - riserHeight - 68} fontSize={26} fill="hsl(220, 90%, 56%)" fontFamily="Lato, sans-serif" textAnchor="middle">
          {treadDepth.toFixed(1)}
        </text>

        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(220, 9%, 46%)" />
          </marker>
          <marker id="arrowhead-up" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(220, 9%, 46%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
