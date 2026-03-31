import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { calculateStairs } from "@/lib/stairCalculations";
import StairResultsTable from "./StairResultsTable";
import StairSectionView from "./StairSectionView";
import StairTopView from "./StairTopView";

export default function StairCalculator() {
  const [totalHeight, setTotalHeight] = useState(3040);
  const [nosing, setNosing] = useState(20);
  const [flightRunOverride, setFlightRunOverride] = useState<number | undefined>(undefined);
  const [numTreadsOverride, setNumTreadsOverride] = useState<number | undefined>(undefined);
  const [riserHeightOverride, setRiserHeightOverride] = useState<number | undefined>(undefined);

  const result = useMemo(
    () => calculateStairs({ totalHeight, gridValue: 600, maxAngle: 41, nosing, flightRunOverride, numTreadsOverride, riserHeightOverride }),
    [totalHeight, nosing, flightRunOverride, numTreadsOverride, riserHeightOverride]
  );

  const handleNumTreadsChange = (v: number | undefined) => {
    setNumTreadsOverride(v);
    setRiserHeightOverride(undefined); // clear conflicting override
  };

  const handleRiserHeightChange = (v: number | undefined) => {
    setRiserHeightOverride(v);
    setNumTreadsOverride(undefined); // clear conflicting override
  };

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

        {/* Nosing slider */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nosing (internal): <span className="font-mono text-primary">{nosing} mm</span>
              </label>
              <Slider min={0} max={25} step={1} value={[nosing]} onValueChange={([v]) => setNosing(v)} />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Grid: <span className="font-mono text-foreground">600 mm</span></p>
              <p>Max Angle: <span className="font-mono text-foreground">41°</span></p>
              <p>Step Thickness: <span className="font-mono text-foreground">20 mm</span></p>
              <p>Width: <span className="font-mono text-foreground">1400 mm</span></p>
            </div>
          </div>
        </div>

        {/* Results Table (editable) */}
        <StairResultsTable
          result={result}
          onTotalHeightChange={setTotalHeight}
          onFlightRunChange={setFlightRunOverride}
          onNumTreadsChange={handleNumTreadsChange}
          onRiserHeightChange={handleRiserHeightChange}
        />

        {/* Drawings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StairSectionView result={result} />
          <StairTopView result={result} />
        </div>
      </div>
    </div>
  );
}
