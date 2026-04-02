import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { calculateStairs } from "@/lib/stairCalculations";
import StairResultsTable from "./StairResultsTable";
import StairSectionView from "./StairSectionView";
import StairTopView from "./StairTopView";
import Stair3DView from "./Stair3DView";
import StairSummaryTable from "./StairSummaryTable";

export default function StairCalculator() {
  const [totalHeight, setTotalHeight] = useState(3040);
  const [nosing, setNosing] = useState(20);
  const [flightRunOverride, setFlightRunOverride] = useState<number | undefined>(undefined);
  const [numTreadsOverride, setNumTreadsOverride] = useState<number | undefined>(undefined);
  const [riserHeightOverride, setRiserHeightOverride] = useState<number | undefined>(undefined);
  const [numRisersOverride, setNumRisersOverride] = useState<number | undefined>(undefined);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [calculatorOpen, setCalculatorOpen] = useState(true);

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

  const handleSummarySelect = (config: { totalHeight: number; flightRun: number; numTreads: number; nosing: number }) => {
    setTotalHeight(config.totalHeight);
    setFlightRunOverride(config.flightRun);
    setNumTreadsOverride(config.numTreads);
    setNosing(config.nosing);
    setRiserHeightOverride(undefined);
    setNumRisersOverride(undefined);
    setCalculatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Stair Calculator
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Section 1: Valid Configurations */}
        <section className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors"
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-foreground">Valid Configurations</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All compliant stair designs · rise ≤190mm · tread ≥280mm · angle 30°–41° · Blondel 600–660mm
              </p>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`} />
          </button>
          {summaryOpen && (
            <div className="px-6 pb-6">
              <StairSummaryTable onSelect={handleSummarySelect} />
            </div>
          )}
        </section>

        {/* Section 2: Calculator */}
        <section className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setCalculatorOpen(!calculatorOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors"
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-foreground">Calculator</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Edit parameters and view 3D model, section &amp; plan drawings
              </p>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${calculatorOpen ? "rotate-180" : ""}`} />
          </button>
          {calculatorOpen && (
            <div className="px-6 pb-6 space-y-8">
              {/* Controls */}
              <div className="rounded-xl border border-border/50 p-5 bg-secondary/20">
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
        </section>
      </main>
    </div>
  );
}
