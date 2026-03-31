import type { StairResult } from "@/lib/stairCalculations";

interface Props {
  result: StairResult;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${ok ? "bg-success" : "bg-destructive"}`} />
  );
}

export default function StairResultsTable({ result }: Props) {
  const rows: { label: string; value: string; constraint: string; valid: boolean }[] = [
    { label: "Total Height", value: `${result.totalHeight} mm`, constraint: "User choice", valid: true },
    { label: "Flight Run", value: `${result.flightRun} mm`, constraint: "Multiple of 400mm", valid: result.flightRun % 400 === 0 },
    { label: "Angle", value: `${result.angle.toFixed(1)}°`, constraint: "30° – 41°", valid: result.angle >= 30 && result.angle <= 41 },
    { label: "Width", value: "1400 mm (140 cm)", constraint: "Fixed", valid: true },
    { label: "# Risers", value: `${result.numRisers}`, constraint: "—", valid: true },
    { label: "Riser Height", value: `${result.riserHeight.toFixed(1)} mm`, constraint: "≤ 190 mm", valid: result.riserHeight <= 190 },
    { label: "# Treads", value: `${result.numTreads}`, constraint: "Risers − 1", valid: true },
    { label: "Tread Depth", value: `${result.treadDepth.toFixed(1)} mm`, constraint: "≥ 280 mm", valid: result.treadDepth >= 280 },
    { label: "Nosing", value: `${result.nosing} mm`, constraint: "0 – 25 mm", valid: result.nosing >= 0 && result.nosing <= 25 },
    { label: "# Steps", value: `${result.numSteps}`, constraint: "Treads + 1 (incl. slab)", valid: true },
    { label: "Blondel", value: `${result.blondel.toFixed(0)} mm`, constraint: "600 – 660 mm ideal", valid: result.blondel >= 600 && result.blondel <= 660 },
    { label: "Total Length", value: `${result.totalLength.toFixed(0)} mm`, constraint: "Run + nosing", valid: true },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary">
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Parameter</th>
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Value</th>
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Constraint</th>
            <th className="px-3 py-2 font-semibold text-secondary-foreground">✓</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border hover:bg-muted/50">
              <td className="px-3 py-1.5 font-medium text-foreground">{r.label}</td>
              <td className="px-3 py-1.5 font-mono text-foreground">{r.value}</td>
              <td className="px-3 py-1.5 text-muted-foreground">{r.constraint}</td>
              <td className="px-3 py-1.5 text-center"><StatusBadge ok={r.valid} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.errors.length > 0 && (
        <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/30">
          {result.errors.map((e, i) => (
            <p key={i} className="text-destructive text-sm font-medium">⚠ {e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
