import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { calculateStairs } from "@/lib/stairCalculations";
import StairResultsTable from "./StairResultsTable";
import StairSectionView from "./StairSectionView";
import StairTopView from "./StairTopView";
import Stair3DView from "./Stair3DView";
import StairSummaryTable from "./StairSummaryTable";

type Tab = "summary" | "calculator";

export default function StairCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [totalHeight, setTotalHeight] = useState(3040);
  const [nosing, setNosing] = useState(20);
  const [flightRunOverride, setFlightRunOverride] = useState<number | undefined>(undefined);
  const [numTreadsOverride, setNumTreadsOverride] = useState<number | undefined>(undefined);
  const [riserHeightOverride, setRiserHeightOverride] = useState<number | undefined>(undefined);
  const [numRisersOverride, setNumRisersOverride] = useState<number | undefined>(undefined);

  const result = useMemo(
    () => calculateStairs({ totalHeight, gridValue: 600, maxAngle: 41, nosing, flightRunOverride, numTreadsOverride, riserHeightOverride, numRisersOverride }),
    [totalHeight, nosing, flightRunOverride, numTreadsOverride, riserHeightOverride, numRisersOverride]
  );

  const handleNumTreadsChange = (v: number | undefined) => {
    setNumTreadsOverride(v);
    setRiserHeightOverride(undefined);
    setNumRisersOverride(undefined);
  };

  const handleRiserHeightChange = (v: number | undefined) => {
    setRiserHeightOverride(v);
    setNumTreadsOverride(undefined);
    setNumRisersOverride(undefined);
  };

  const handleNumRisersChange = (v: number | undefined) => {
    setNumRisersOverride(v);
    setNumTreadsOverride(undefined);
    setRiserHeightOverride(undefined);
  };

  // no longer needed - summary handles its own detail view

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Stair Calculator
          </h1>
          {/* Segmented control */}
          <div className="flex items-center bg-secondary/60 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "summary"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Valid Configurations
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "calculator"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calculator
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                All compliant stair designs · rise ≤190mm · tread ≥280mm · angle 30°–41° · Blondel 600–660mm
              </p>
            </div>
            <StairSummaryTable onSelect={handleSummarySelect} />
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="space-y-8">
            {/* Controls */}
            <div className="glass rounded-2xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Nosing (internal)
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider min={0} max={25} step={1} value={[nosing]} onValueChange={([v]) => setNosing(v)} className="flex-1" />
                    <span className="font-mono text-sm text-foreground w-16 text-right">{nosing} mm</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Grid</span>
                    <p className="font-mono text-sm text-foreground">600 mm</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max Angle</span>
                    <p className="font-mono text-sm text-foreground">41°</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Step Thickness</span>
                    <p className="font-mono text-sm text-foreground">20 mm</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Width</span>
                    <p className="font-mono text-sm text-foreground">1400 mm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <StairResultsTable
              result={result}
              onTotalHeightChange={setTotalHeight}
              onFlightRunChange={setFlightRunOverride}
              onNumTreadsChange={handleNumTreadsChange}
              onRiserHeightChange={handleRiserHeightChange}
              onNumRisersChange={handleNumRisersChange}
            />

            {/* 3D View */}
            <Stair3DView result={result} />

            {/* 2D Drawings */}
            <div className="grid grid-cols-1 gap-8">
              <StairSectionView result={result} />
              <StairTopView result={result} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
