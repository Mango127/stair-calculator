export interface StairParams {
  totalHeight: number; // mm
  gridValue: number; // mm (600)
  maxAngle: number; // degrees
  nosing: number; // mm
  riserHeightOverride?: number; // mm, optional manual override
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

/**
 * Round down to nearest multiple of given value
 */
function roundToMultiple(value: number, multiple: number): number {
  return Math.floor(value / multiple) * multiple;
}

/**
 * Calculate flight run as multiple of 400mm
 * Formula: totalHeight / tan(radians(maxAngle)) → round to nearest multiple of 400
 */
export function calcFlightRun(totalHeight: number, maxAngle: number): number {
  const raw = totalHeight / Math.tan((maxAngle * Math.PI) / 180);
  return roundToMultiple(raw, 400);
}

/**
 * Find optimal number of risers for best Blondel compliance
 */
function optimizeRisers(totalHeight: number, flightRun: number, nosing: number): { numRisers: number; blondel: number } {
  let bestRisers = 16;
  let bestBlondelDiff = Infinity;

  // Try range of risers
  for (let r = 10; r <= 25; r++) {
    const riserH = totalHeight / r;
    if (riserH > 190 || riserH < 100) continue;
    const numTreads = r - 1;
    const treadD = flightRun / numTreads;
    if (treadD < 280) continue;

    const blondel = 2 * riserH + treadD;
    const diff = Math.abs(blondel - 630); // ideal Blondel ~630
    if (diff < bestBlondelDiff) {
      bestBlondelDiff = diff;
      bestRisers = r;
    }
  }
  const rH = totalHeight / bestRisers;
  const tD = flightRun / (bestRisers - 1);
  return { numRisers: bestRisers, blondel: 2 * rH + tD };
}

export function calculateStairs(params: StairParams): StairResult {
  const { totalHeight, maxAngle, nosing } = params;
  const errors: string[] = [];

  // 1. Flight run
  const flightRun = calcFlightRun(totalHeight, maxAngle);

  // 2. Optimize risers
  const { numRisers, blondel } = optimizeRisers(totalHeight, flightRun, nosing);

  // 3. Derived values
  const riserHeight = totalHeight / numRisers;
  const numTreads = numRisers - 1;
  const treadDepth = flightRun / numTreads;
  const angle = (Math.atan(totalHeight / flightRun) * 180) / Math.PI;
  const numSteps = numTreads + 1; // last step is slab
  const totalLength = flightRun + nosing; // nosing extends beyond last tread

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
