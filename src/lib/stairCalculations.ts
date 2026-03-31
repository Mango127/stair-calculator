export interface StairParams {
  totalHeight: number;
  gridValue: number;
  maxAngle: number;
  nosing: number;
  flightRunOverride?: number;
  numTreadsOverride?: number;
  riserHeightOverride?: number;
  numRisersOverride?: number;
}

export interface StairResult {
  totalHeight: number;
  flightRun: number;
  angle: number;
  width: number;
  numRisers: number;
  riserHeight: number;
  numTreads: number;
  treadDepth: number;
  nosing: number;
  numSteps: number;
  totalLength: number;
  blondel: number;
  valid: boolean;
  errors: string[];
}

function roundToMultiple(value: number, multiple: number): number {
  return Math.floor(value / multiple) * multiple;
}

export function calcFlightRun(totalHeight: number, maxAngle: number): number {
  const raw = totalHeight / Math.tan((maxAngle * Math.PI) / 180);
  return roundToMultiple(raw, 400);
}

function optimizeRisers(totalHeight: number, flightRun: number): { numRisers: number; blondel: number } {
  let bestRisers = 16;
  let bestBlondelDiff = Infinity;

  for (let r = 10; r <= 25; r++) {
    const riserH = totalHeight / r;
    if (riserH > 190 || riserH < 100) continue;
    const numTreads = r - 1;
    const treadD = flightRun / numTreads;
    if (treadD < 280) continue;

    const blondel = 2 * riserH + treadD;
    const diff = Math.abs(blondel - 630);
    if (diff < bestBlondelDiff) {
      bestBlondelDiff = diff;
      bestRisers = r;
    }
  }
  const rH = totalHeight / bestRisers;
  const tD = flightRun / (bestRisers - 1);
  return { numRisers: bestRisers, blondel: 2 * rH + tD };
}

export const FLIGHT_RUN_OPTIONS = [3400, 4000, 4600, 5200, 5800, 6400, 7000, 7600, 8200, 8800, 9400, 10000];

export function calculateStairs(params: StairParams): StairResult {
  const { totalHeight, maxAngle, nosing, flightRunOverride, numTreadsOverride, riserHeightOverride, numRisersOverride } = params;
  const errors: string[] = [];

  // 1. Flight run
  const flightRun = flightRunOverride ?? calcFlightRun(totalHeight, maxAngle);

  // 2. Determine risers
  let numRisers: number;
  if (numRisersOverride) {
    numRisers = numRisersOverride;
  } else if (riserHeightOverride) {
    numRisers = Math.round(totalHeight / riserHeightOverride);
  } else if (numTreadsOverride) {
    numRisers = numTreadsOverride + 1;
  } else {
    numRisers = optimizeRisers(totalHeight, flightRun).numRisers;
  }
  if (numRisers < 2) numRisers = 2;

  // 3. Derived values
  const riserHeight = totalHeight / numRisers;
  const numTreads = numRisers - 1;
  const treadDepth = flightRun / numTreads;
  const angle = (Math.atan(totalHeight / flightRun) * 180) / Math.PI;
  const numSteps = numTreads + 1; // last step is slab
  const blondel = 2 * riserHeight + treadDepth;
  // Nosing is internal - does NOT add to total length
  const totalLength = flightRun;

  // Validate
  if (riserHeight > 190) errors.push("Riser height exceeds 190mm");
  if (riserHeight < 100) errors.push("Riser height below 100mm");
  if (treadDepth < 280) errors.push("Tread depth below 280mm");
  if (angle < 30) errors.push("Angle below 30°");
  if (angle > 41) errors.push("Angle exceeds 41°");
  if (blondel < 600 || blondel > 660) errors.push(`Blondel ${blondel.toFixed(0)}mm outside 600-660mm range`);

  return {
    totalHeight,
    flightRun,
    angle,
    width: 1400,
    numRisers,
    riserHeight,
    numTreads,
    treadDepth,
    nosing,
    numSteps,
    totalLength,
    blondel,
    valid: errors.length === 0,
    errors,
  };
}
