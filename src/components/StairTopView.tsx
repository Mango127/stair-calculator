import type { StairResult } from "@/lib/stairCalculations";

interface Props {
  result: StairResult;
}

export default function StairTopView({ result }: Props) {
  const { flightRun, numTreads, treadDepth, width } = result;
  const wallThickness = 200;
  const totalWidth = width + 2 * wallThickness;
  const gridSize = 600;

  const margin = 250;
  const svgW = totalWidth + 2 * margin;
  const svgH = flightRun + 2 * margin;

  const ox = margin + wallThickness;
  const oy = margin;

  const viewBox = `0 0 ${svgW} ${svgH}`;

  const gridH: number[] = [];
  for (let y = 0; y <= flightRun + gridSize; y += gridSize) gridH.push(y);
  const gridV: number[] = [];
  for (let x = -wallThickness - margin; x <= totalWidth + margin; x += gridSize) gridV.push(x);

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card p-4">
      <h3 className="text-base font-semibold text-foreground mb-3 px-2">Top View (Plan)</h3>
      <svg viewBox={viewBox} className="w-full" style={{ minHeight: 500 }}>
        {/* Grid */}
        {gridH.map((y) => (
          <line key={`gh-${y}`} x1={0} y1={oy + y} x2={svgW} y2={oy + y} stroke="hsl(215, 15%, 90%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}
        {gridV.map((x) => (
          <line key={`gv-${x}`} x1={margin + wallThickness + x} y1={0} x2={margin + wallThickness + x} y2={svgH} stroke="hsl(215, 15%, 90%)" strokeWidth={0.5} strokeDasharray="8 4" />
        ))}

        {/* Walls */}
        <rect x={margin} y={oy - 20} width={wallThickness} height={flightRun + 40} fill="hsl(215, 15%, 85%)" stroke="hsl(217, 80%, 55%)" strokeWidth={2} />
        <rect x={margin + wallThickness + width} y={oy - 20} width={wallThickness} height={flightRun + 40} fill="hsl(215, 15%, 85%)" stroke="hsl(217, 80%, 55%)" strokeWidth={2} />

        {/* Treads */}
        {Array.from({ length: numTreads }).map((_, i) => {
          const ty = oy + flightRun - (i + 1) * treadDepth;
          return (
            <rect
              key={`tread-${i}`}
              x={ox}
              y={ty}
              width={width}
              height={treadDepth}
              fill="hsl(0, 0%, 99%)"
              stroke="hsl(220, 20%, 15%)"
              strokeWidth={1}
            />
          );
        })}

        {/* Slab at top */}
        <rect x={ox} y={oy - 20} width={width} height={20} fill="hsl(215, 15%, 85%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
        <text x={ox + width / 2} y={oy - 5} fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" textAnchor="middle">
          SLAB
        </text>

        {/* Width dimension */}
        <line x1={ox} y1={oy + flightRun + 60} x2={ox + width} y2={oy + flightRun + 60} stroke="hsl(220, 15%, 40%)" strokeWidth={1} />
        <text x={ox + width / 2} y={oy + flightRun + 85} fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" textAnchor="middle">
          1400 mm (140 cm)
        </text>

        {/* Run dimension */}
        <line x1={ox + width + 60} y1={oy} x2={ox + width + 60} y2={oy + flightRun} stroke="hsl(220, 15%, 40%)" strokeWidth={1} />
        <text x={ox + width + 75} y={oy + flightRun / 2} fontSize={22} fill="hsl(220, 15%, 40%)" fontFamily="monospace" dominantBaseline="middle" transform={`rotate(90, ${ox + width + 75}, ${oy + flightRun / 2})`}>
          {flightRun} mm
        </text>

        {/* Direction arrow */}
        <line x1={ox + width / 2} y1={oy + flightRun - 80} x2={ox + width / 2} y2={oy + 80} stroke="hsl(217, 80%, 55%)" strokeWidth={2} markerEnd="url(#arrow-top)" />
        <text x={ox + width / 2 + 15} y={oy + flightRun / 2} fontSize={11} fill="hsl(217, 80%, 55%)" fontFamily="monospace">
          UP
        </text>

        <defs>
          <marker id="arrow-top" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(217, 80%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
