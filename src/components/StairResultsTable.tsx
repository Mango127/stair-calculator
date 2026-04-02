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

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
      ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
    }`}>
      {ok ? "✓" : "✕"}
    </span>
  );
}

function EditInput({ value, min, max, step, onChange, width = "w-20" }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; width?: string;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      key={`${Math.round(value * 100)}`}
      defaultValue={step < 1 ? Math.round(value * 10) / 10 : value}
      className={`h-8 text-xs font-mono ${width} bg-secondary/50 border-border/50 rounded-lg`}
      onBlur={(e) => {
        const v = step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value);
        if (!isNaN(v) && v >= min && v <= max) onChange(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = step < 1
            ? parseFloat((e.target as HTMLInputElement).value)
            : parseInt((e.target as HTMLInputElement).value);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }
      }}
    />
  );
}

export default function StairResultsTable({ result, onTotalHeightChange, onFlightRunChange, onNumTreadsChange, onRiserHeightChange, onNumRisersChange }: Props) {
  const rows: { label: string; value: string; constraint: string; valid: boolean; editor?: React.ReactNode }[] = [
    {
      label: "Total Height",
      value: `${result.totalHeight} mm`,
      constraint: "User choice",
      valid: true,
      editor: (
        <Select value={String(result.totalHeight)} onValueChange={(v) => onTotalHeightChange(Number(v))}>
          <SelectTrigger className="h-8 text-xs font-mono w-[130px] bg-secondary/50 border-border/50 rounded-lg">
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
          <SelectTrigger className="h-8 text-xs font-mono w-[130px] bg-secondary/50 border-border/50 rounded-lg">
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
    { label: "Width", value: "1400 mm", constraint: "Fixed", valid: true },
    {
      label: "# Risers",
      value: `${result.numRisers}`,
      constraint: "Treads + 1",
      valid: true,
      editor: <EditInput value={result.numRisers} min={5} max={25} step={1} onChange={onNumRisersChange} />,
    },
    {
      label: "Riser Height",
      value: `${result.riserHeight.toFixed(1)} mm`,
      constraint: "≤ 190 mm",
      valid: result.riserHeight <= 190,
      editor: <EditInput value={result.riserHeight} min={100} max={190} step={0.5} onChange={onRiserHeightChange} width="w-24" />,
    },
    {
      label: "# Treads",
      value: `${result.numTreads}`,
      constraint: "Risers − 1",
      valid: true,
      editor: <EditInput value={result.numTreads} min={5} max={24} step={1} onChange={onNumTreadsChange} />,
    },
    { label: "Tread Depth", value: `${result.treadDepth.toFixed(1)} mm`, constraint: "≥ 280 mm", valid: result.treadDepth >= 280 },
    { label: "Nosing", value: `${result.nosing} mm`, constraint: "0 – 25 mm (internal)", valid: result.nosing >= 0 && result.nosing <= 25 },
    {
      label: "# Steps",
      value: `${result.numSteps}`,
      constraint: "Treads + 1 (incl. slab)",
      valid: true,
      editor: <EditInput value={result.numSteps} min={6} max={25} step={1} onChange={(v) => onNumTreadsChange(v - 1)} />,
    },
    { label: "Blondel", value: `${result.blondel.toFixed(0)} mm`, constraint: "600 – 660 mm", valid: result.blondel >= 600 && result.blondel <= 660 },
    { label: "Total Length", value: `${result.totalLength.toFixed(0)} mm`, constraint: "= Flight Run", valid: true },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Parameter</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Value</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Edit</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Constraint</th>
            <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5 font-medium text-foreground">{r.label}</td>
              <td className="px-4 py-2.5 font-mono text-foreground">{r.value}</td>
              <td className="px-4 py-2.5">{r.editor ?? <span className="text-muted-foreground text-xs">—</span>}</td>
              <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.constraint}</td>
              <td className="px-4 py-2.5 text-center"><StatusDot ok={r.valid} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.errors.length > 0 && (
        <div className="px-4 py-3 bg-destructive/5 border-t border-destructive/20">
          {result.errors.map((e, i) => (
            <p key={i} className="text-destructive text-sm font-medium">⚠ {e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
