import { useMemo, useState } from "react";
import { calculateStairs, FLIGHT_RUN_OPTIONS, type StairResult } from "@/lib/stairCalculations";
import StairSectionView from "./StairSectionView";
import Stair3DView from "./Stair3DView";

const HEIGHT_OPTIONS = [3040, 3140, 3240, 3340, 3440, 3540, 3640];

interface ValidConfig {
  height: number;
  flightRun: number;
  numSteps: number;
  numTreads: number;
  hasNosing: boolean;
  nosing: number;
  result: StairResult;
}

export default function StairSummaryTable() {
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ValidConfig | null>(null);

  const allConfigs = useMemo(() => {
    const configs: ValidConfig[] = [];
    for (const height of HEIGHT_OPTIONS) {
      for (const run of FLIGHT_RUN_OPTIONS) {
        for (const nosing of [0, 25]) {
          for (let steps = 14; steps <= 25; steps++) {
            const numTreads = steps - 1;
            const result = calculateStairs({
              totalHeight: height,
              gridValue: 600,
              maxAngle: 41,
              nosing,
              flightRunOverride: run,
              numTreadsOverride: numTreads,
            });
            if (result.valid) {
              configs.push({ height, flightRun: run, numSteps: steps, numTreads, hasNosing: nosing > 0, nosing, result });
            }
          }
        }
      }
    }
    return configs;
  }, []);

  const filteredConfigs = selectedHeight
    ? allConfigs.filter((c) => c.height === selectedHeight)
    : allConfigs;

  const grouped = useMemo(() => {
    const map = new Map<number, ValidConfig[]>();
    for (const c of filteredConfigs) {
      const arr = map.get(c.height) || [];
      arr.push(c);
      map.set(c.height, arr);
    }
    return map;
  }, [filteredConfigs]);

  const configKey = (c: ValidConfig) => `${c.height}-${c.flightRun}-${c.numSteps}-${c.nosing}`;
  const isSelected = (c: ValidConfig) =>
    selectedConfig !== null && configKey(c) === configKey(selectedConfig);

  return (
    <div className="space-y-5">
      {/* Height filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Height:</span>
        <button
          onClick={() => { setSelectedHeight(null); setSelectedConfig(null); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedHeight === null
              ? "bg-foreground text-background"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {HEIGHT_OPTIONS.map((h) => (
          <button
            key={h}
            onClick={() => { setSelectedHeight(h === selectedHeight ? null : h); setSelectedConfig(null); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedHeight === h
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-card/60 backdrop-blur-sm">
        <div className="grid grid-cols-9 px-6 py-3 border-b border-border/40">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Height</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Run</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Steps</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Treads</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Nosing</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Riser H</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Tread D</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Angle</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Blondel</span>
        </div>

        <div className="divide-y divide-border/20">
          {Array.from(grouped.entries()).map(([height, configs]) =>
            configs.map((c, i) => (
              <div
                key={configKey(c)}
                onClick={() => setSelectedConfig(isSelected(c) ? null : c)}
                className={`grid grid-cols-9 px-6 py-3.5 items-center transition-colors cursor-pointer group ${
                  isSelected(c) ? "bg-primary/10" : "hover:bg-accent/5"
                }`}
              >
                <span className="text-sm text-foreground font-semibold">
                  {i === 0 ? height : ""}
                </span>
                <span className="text-sm text-foreground">{c.flightRun}</span>
                <span className="text-sm text-foreground">{c.numSteps}</span>
                <span className="text-sm text-foreground">{c.numTreads}</span>
                <span className="text-sm text-foreground">
                  {c.hasNosing ? `${c.nosing}` : "—"}
                </span>
                <span className="text-sm text-foreground">{c.result.riserHeight.toFixed(1)}</span>
                <span className="text-sm text-foreground">{c.result.treadDepth.toFixed(1)}</span>
                <span className="text-sm text-foreground">{c.result.angle.toFixed(1)}°</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{c.result.blondel.toFixed(0)}</span>
                  <span className={`transition-opacity text-sm text-primary ${isSelected(c) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    {isSelected(c) ? "✓" : "→"}
                  </span>
                </div>
              </div>
            ))
          )}
          {filteredConfigs.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No valid configurations found
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border/30 bg-secondary/20">
          <p className="text-sm text-muted-foreground">
            {filteredConfigs.length} configuration{filteredConfigs.length !== 1 ? "s" : ""} · Click a row to preview
          </p>
        </div>
      </div>

      {/* Selected config detail */}
      {selectedConfig && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-xl font-semibold text-foreground">Section and 3D</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StairSectionView result={selectedConfig.result} />
            <Stair3DView result={selectedConfig.result} />
          </div>
        </div>
      )}
    </div>
  );
}
