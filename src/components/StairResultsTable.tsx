import type { StairResult } from "@/lib/stairCalculations";
import { FLIGHT_RUN_OPTIONS } from "@/lib/stairCalculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const HEIGHT_OPTIONS = [3040, 3140, 3240, 3340, 3440, 3540, 3640];

interface Props {
  result: StairResult;
  onTotalHeightChange: (v: number) => void;
  onFlightRunChange: (v: number | undefined) => void;
  onNumTreadsChange: (v: number | undefined) => void;
  onRiserHeightChange: (v: number | undefined) => void;
  onNumRisersChange: (v: number | undefined) => void;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${ok ? "bg-success" : "bg-destructive"}`} />
  );
}

export default function StairResultsTable({ result, onTotalHeightChange, onFlightRunChange, onNumTreadsChange, onRiserHeightChange }: Props) {
  const rows: { label: string; value: string; constraint: string; valid: boolean; editor?: React.ReactNode }[] = [
    {
      label: "Total Height",
      value: `${result.totalHeight} mm`,
      constraint: "User choice",
      valid: true,
      editor: (
        <Select value={String(result.totalHeight)} onValueChange={(v) => onTotalHeightChange(Number(v))}>
          <SelectTrigger className="h-7 text-xs font-mono w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEIGHT_OPTIONS.map((h) => (
              <SelectItem key={h} value={String(h)}>{h} mm</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      label: "Flight Run",
      value: `${result.flightRun} mm`,
      constraint: "Select from list",
      valid: FLIGHT_RUN_OPTIONS.includes(result.flightRun),
      editor: (
        <Select value={String(result.flightRun)} onValueChange={(v) => onFlightRunChange(Number(v))}>
          <SelectTrigger className="h-7 text-xs font-mono w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FLIGHT_RUN_OPTIONS.map((r) => (
              <SelectItem key={r} value={String(r)}>{r} mm</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { label: "Angle", value: `${result.angle.toFixed(1)}°`, constraint: "30° – 41°", valid: result.angle >= 30 && result.angle <= 41 },
    { label: "Width", value: "1400 mm (140 cm)", constraint: "Fixed", valid: true },
    {
      label: "# Risers",
      value: `${result.numRisers}`,
      constraint: "Treads + 1",
      valid: true,
      editor: (
        <Input
          type="number"
          min={5}
          max={25}
          step={1}
          defaultValue={result.numRisers}
          className="h-7 text-xs font-mono w-[80px]"
          onBlur={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 2 && v <= 30) onNumRisersChange(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v >= 2 && v <= 30) onNumRisersChange(v);
            }
          }}
        />
      ),
    },
    {
      label: "Riser Height",
      value: `${result.riserHeight.toFixed(1)} mm`,
      constraint: "≤ 190 mm",
      valid: result.riserHeight <= 190,
      editor: (
        <Input
          type="number"
          min={100}
          max={190}
          step={0.5}
          defaultValue={Math.round(result.riserHeight * 10) / 10}
          className="h-7 text-xs font-mono w-[100px]"
          onBlur={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 50 && v <= 250) onRiserHeightChange(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v >= 50 && v <= 250) onRiserHeightChange(v);
            }
          }}
        />
      ),
    },
    {
      label: "# Treads",
      value: `${result.numTreads}`,
      constraint: "Risers − 1",
      valid: true,
      editor: (
        <Input
          type="number"
          min={5}
          max={24}
          step={1}
          defaultValue={result.numTreads}
          className="h-7 text-xs font-mono w-[80px]"
          onBlur={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 2 && v <= 30) onNumTreadsChange(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v >= 2 && v <= 30) onNumTreadsChange(v);
            }
          }}
        />
      ),
    },
    { label: "Tread Depth", value: `${result.treadDepth.toFixed(1)} mm`, constraint: "≥ 280 mm", valid: result.treadDepth >= 280 },
    { label: "Nosing", value: `${result.nosing} mm`, constraint: "0 – 25 mm (internal)", valid: result.nosing >= 0 && result.nosing <= 25 },
    {
      label: "# Steps",
      value: `${result.numSteps}`,
      constraint: "Treads + 1 (incl. slab)",
      valid: true,
      editor: (
        <Input
          type="number"
          min={6}
          max={25}
          step={1}
          defaultValue={result.numSteps}
          className="h-7 text-xs font-mono w-[80px]"
          onBlur={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 3 && v <= 30) onNumTreadsChange(v - 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v >= 3 && v <= 30) onNumTreadsChange(v - 1);
            }
          }}
        />
      ),
    },
    { label: "Blondel", value: `${result.blondel.toFixed(0)} mm`, constraint: "600 – 660 mm ideal", valid: result.blondel >= 600 && result.blondel <= 660 },
    { label: "Total Length", value: `${result.totalLength.toFixed(0)} mm`, constraint: "= Flight Run", valid: true },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary">
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Parameter</th>
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Value</th>
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Edit</th>
            <th className="text-left px-3 py-2 font-semibold text-secondary-foreground">Constraint</th>
            <th className="px-3 py-2 font-semibold text-secondary-foreground">✓</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border hover:bg-muted/50">
              <td className="px-3 py-1.5 font-medium text-foreground">{r.label}</td>
              <td className="px-3 py-1.5 font-mono text-foreground">{r.value}</td>
              <td className="px-3 py-1.5">{r.editor ?? <span className="text-muted-foreground text-xs">—</span>}</td>
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
