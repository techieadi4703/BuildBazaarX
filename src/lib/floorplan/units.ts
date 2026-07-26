/**
 * Unit helpers for the floor-plan pipeline.
 * All internal measurements are stored in **inches**.
 */

// ─── Typed error ─────────────────────────────────────────────────────────────

export class UnitParseError extends Error {
  constructor(
    public readonly input: string,
    message: string,
  ) {
    super(`UnitParseError: "${input}" — ${message}`);
    this.name = "UnitParseError";
  }
}

// ─── parseFeetInches ─────────────────────────────────────────────────────────

/**
 * Parse a human-typed dimension string into total inches.
 *
 * Accepted formats:
 *   13'0"  |  13' 0"  |  13ft  |  10'-10"  |  4'11"  |  13.5ft  |  160in
 *
 * Throws `UnitParseError` on invalid / negative input.
 */
export function parseFeetInches(input: string): number {
  if (typeof input !== "string" || input.trim() === "") {
    throw new UnitParseError(input, "empty or non-string input");
  }
  const s = input.trim();

  // ── pattern A: feet+inches  e.g. 13'0"  13' 0"  10'-10"  4'11"
  const feetInches = /^(\d+(?:\.\d+)?)[''′]\s*-?\s*(\d+(?:\.\d+)?)[""″]?$/.exec(s);
  if (feetInches) {
    const feet = parseFloat(feetInches[1]);
    const inches = parseFloat(feetInches[2]);
    if (inches >= 12) throw new UnitParseError(input, "inches part ≥ 12");
    return feet * 12 + inches;
  }

  // ── pattern B: feet only  e.g. 13ft  13.5ft  13'
  const feetOnly = /^(\d+(?:\.\d+)?)\s*(?:ft|feet|'|′)$/.exec(s);
  if (feetOnly) {
    return parseFloat(feetOnly[1]) * 12;
  }

  // ── pattern C: inches only  e.g. 160in  160"
  const inchesOnly = /^(\d+(?:\.\d+)?)\s*(?:in|inch(?:es)?|[""″])$/.exec(s);
  if (inchesOnly) {
    return parseFloat(inchesOnly[1]);
  }

  // ── pattern D: bare number (treat as inches if integer, fail otherwise)
  const bareNumber = /^\d+$/.exec(s);
  if (bareNumber) {
    return parseInt(bareNumber[0], 10);
  }

  throw new UnitParseError(input, "unrecognised format");
}

// ─── formatInches ─────────────────────────────────────────────────────────────

/**
 * Format total inches back to `13'0"` display form.
 */
export function formatInches(inches: number): string {
  const totalInches = Math.round(inches);
  const feet = Math.floor(totalInches / 12);
  const remaining = totalInches % 12;
  return `${feet}'${remaining}"`;
}

// ─── inchesToPx ───────────────────────────────────────────────────────────────

/**
 * Convert inches to SVG pixels using a given scale factor.
 * @param inches  Measurement in inches
 * @param scale   Pixels per inch (e.g. 2.2)
 */
export function inchesToPx(inches: number, scale: number): number {
  return inches * scale;
}
