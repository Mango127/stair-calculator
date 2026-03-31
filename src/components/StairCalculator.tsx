import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { calculateStairs, calcFlightRun } from "@/lib/stairCalculations";
import StairResultsTable from "./StairResultsTable";
import StairSectionView from "./StairSectionView";
import StairTopView from "./StairTopView";

const HEIGHT_OPTIONS = [3040, 3140, 3240, 3340, 3440, 3540, 3640];

export default function StairCalculator() {
  const [totalHeight, setTotalHeight] = useState(3040);
  const [nosing, setNosing] = useState(20);

  const result = useMemo(
    () => calculateStairs({ totalHeight, gridValue: 600, maxAngle: 41, nosing }),
    [totalHeight, nosing]
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Straight Flight Stair Calculator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compliant with rise ≤190mm, tread ≥280mm, angle 30°–41° · 60×60cm grid · 140cm clear width
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card border border-border rounded-lg p-4">
          {/* Total Height */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Height</label>
            <Select value={String(totalHeight)} onValueChange={(v) => setTotalHeight(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEIGHT_OPTIONS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h} mm ({(h / 10).toFixed(0)} cm)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nosing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nosing: <span className="font-mono text-primary">{nosing} mm</span>
            </label>
            <Slider
              min={0}
              max={25}
              step={1}
              value={[nosing]}
              onValueChange={([v]) => setNosing(v)}
            />
          </div>

          {/* Fixed params display */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Grid: <span className="font-mono text-foreground">600 mm</span></p>
            <p>Max Angle: <span className="font-mono text-foreground">41°</span></p>
            <p>Step Thickness: <span className="font-mono text-foreground">20 mm</span></p>
            <p>Width: <span className="font-mono text-foreground">1400 mm</span></p>
          </div>
        </div>

        {/* Formulas */}
        <details className="bg-card border border-border rounded-lg p-4 text-sm">
          <summary className="font-medium text-foreground cursor-pointer">Formulas Used</summary>
          <div className="mt-3 space-y-1 text-muted-foreground font-mono text-xs">
            <p>Flight Run = FLOOR({totalHeight} / TAN(RAD(41)) / 400) × 400 = <span className="text-foreground">{result.flightRun} mm</span></p>
            <p>Angle = DEGREES(ATAN({totalHeight} / {result.flightRun})) = <span className="text-foreground">{result.angle.toFixed(2)}°</span></p>
            <p># Risers = optimized for best Blondel (2R + G ≈ 630) = <span className="text-foreground">{result.numRisers}</span></p>
            <p>Riser Height = {totalHeight} / {result.numRisers} = <span className="text-foreground">{result.riserHeight.toFixed(1)} mm</span></p>
            <p># Treads = {result.numRisers} − 1 = <span className="text-foreground">{result.numTreads}</span></p>
            <p>Tread Depth = {result.flightRun} / {result.numTreads} = <span className="text-foreground">{result.treadDepth.toFixed(1)} mm</span></p>
            <p>Blondel = 2 × {result.riserHeight.toFixed(1)} + {result.treadDepth.toFixed(1)} = <span className="text-foreground">{result.blondel.toFixed(0)} mm</span></p>
          </div>
        </details>

        {/* Results Table */}
        <StairResultsTable result={result} />

        {/* Drawings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StairSectionView result={result} />
          <StairTopView result={result} />
        </div>
      </div>
    </div>
  );
}
