import { useMemo, useState } from "react";
import { calculateStairs, FLIGHT_RUN_OPTIONS, type StairResult } from "@/lib/stairCalculations";

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

interface Props {
  onSelect: (config: { totalHeight: number; flightRun: number; numTreads: number; nosing: number }) => void;
}

export default function StairSummaryTable({ onSelect }: Props) {
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);

  const allConfigs = useMemo(() => {
    const configs: ValidConfig[] = [];

    for (const height of HEIGHT_OPTIONS) {
      for (const run of FLIGHT_RUN_OPTIONS) {
        // Try different step counts with nosing 0 and 25
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
              configs.push({
                height,
                flightRun: run,
                numSteps: steps,
                numTreads,
                hasNosing: nosing > 0,
                nosing,
                result,
              });
            }
          }
        }
      }
    }
    return configs;
  }, []);

  const heights = HEIGHT_OPTIONS;
  const filteredConfigs = selectedHeight
    ? allConfigs.filter((c) => c.height === selectedHeight)
    : allConfigs;

  // Group by height
  const grouped = useMemo(() => {
    const map = new Map<number, ValidConfig[]>();
    for (const c of filteredConfigs) {
      const arr = map.get(c.height) || [];
      arr.push(c);
      map.set(c.height, arr);
    }
    return map;
  }, [filteredConfigs]);

  return (
    <div className="space-y-4">
      {/* Height filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Filter by height:</span>
        <button
          onClick={() => setSelectedHeight(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedHeight === null
              ? "bg-foreground text-background shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {heights.map((h) => (
          <button
            key={h}
            onClick={() => setSelectedHeight(h === selectedHeight ? null : h)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-mono transition-all ${
              selectedHeight === h
                ? "bg-foreground text-background shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden backdrop-blur-sm bg-card/80">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Height</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Run</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Steps</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Treads</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Nosing</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Riser H</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Tread D</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Angle</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase">Blondel</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground tracking-wide text-xs uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from(grouped.entries()).map(([height, configs]) =>
                configs.map((c, i) => (
                  <tr
                    key={`${c.height}-${c.flightRun}-${c.numSteps}-${c.nosing}`}
                    className="border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer group"
                    onClick={() =>
                      onSelect({
                        totalHeight: c.height,
                        flightRun: c.flightRun,
                        numTreads: c.numTreads,
                        nosing: c.nosing,
                      })
                    }
                  >
                    <td className="px-4 py-2.5 font-mono text-foreground">
                      {i === 0 ? <span className="font-semibold">{height}</span> : ""}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.flightRun}</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.numSteps}</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.numTreads}</td>
                    <td className="px-4 py-2.5">
                      {c.hasNosing ? (
                        <span className="text-xs font-medium text-success">Y {c.nosing}mm</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">N</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.result.riserHeight.toFixed(1)}</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.result.treadDepth.toFixed(1)}</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.result.angle.toFixed(1)}°</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">{c.result.blondel.toFixed(0)}</td>
                    <td className="px-4 py-2.5">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary font-medium">
                        Select →
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No valid configurations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-secondary/30 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filteredConfigs.length} valid configuration{filteredConfigs.length !== 1 ? "s" : ""} · Click a row to load it in the calculator
          </p>
        </div>
      </div>
    </div>
  );
}
