import { describe, it, expect } from "vitest";
import { parseFeetInches, formatInches, inchesToPx, UnitParseError } from "../units";

describe("parseFeetInches", () => {
  it("parses 13'0\"", () => {
    expect(parseFeetInches("13'0\"")).toBe(156);
  });

  it("parses 13' 0\"", () => {
    expect(parseFeetInches("13' 0\"")).toBe(156);
  });

  it("parses 13ft", () => {
    expect(parseFeetInches("13ft")).toBe(156);
  });

  it("parses 10'-10\"", () => {
    expect(parseFeetInches("10'-10\"")).toBe(130);
  });

  it("parses 4'11\"", () => {
    expect(parseFeetInches("4'11\"")).toBe(59);
  });

  it("parses 3'6\"", () => {
    expect(parseFeetInches("3'6\"")).toBe(42);
  });

  it("parses 2'6\"", () => {
    expect(parseFeetInches("2'6\"")).toBe(30);
  });

  it("parses 3'0\"", () => {
    expect(parseFeetInches("3'0\"")).toBe(36);
  });

  it("parses 5'0\"", () => {
    expect(parseFeetInches("5'0\"")).toBe(60);
  });

  it("parses 13.5ft", () => {
    expect(parseFeetInches("13.5ft")).toBe(162);
  });

  it("parses bare inch number", () => {
    expect(parseFeetInches("60")).toBe(60);
  });

  it("throws UnitParseError on garbage input", () => {
    expect(() => parseFeetInches("abc")).toThrow(UnitParseError);
  });

  it("throws UnitParseError on empty string", () => {
    expect(() => parseFeetInches("")).toThrow(UnitParseError);
  });

  it("throws UnitParseError when inches part >= 12", () => {
    expect(() => parseFeetInches("4'13\"")).toThrow(UnitParseError);
  });
});

describe("formatInches", () => {
  it("formats 156 as 13'0\"", () => {
    expect(formatInches(156)).toBe("13'0\"");
  });

  it("formats 130 as 10'10\"", () => {
    expect(formatInches(130)).toBe("10'10\"");
  });

  it("formats 59 as 4'11\"", () => {
    expect(formatInches(59)).toBe("4'11\"");
  });

  it("round-trips parseFeetInches → formatInches for 10'-10\"", () => {
    const inches = parseFeetInches("10'-10\"");
    expect(formatInches(inches)).toBe("10'10\"");
  });

  it("round-trips parseFeetInches → formatInches for 4'11\"", () => {
    const inches = parseFeetInches("4'11\"");
    expect(formatInches(inches)).toBe("4'11\"");
  });
});

describe("inchesToPx", () => {
  it("converts 12 inches at scale 2 to 24px", () => {
    expect(inchesToPx(12, 2)).toBe(24);
  });

  it("converts 130 inches at scale 2.2 to 286px", () => {
    expect(inchesToPx(130, 2.2)).toBeCloseTo(286);
  });
});
