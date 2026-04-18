import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function autoClassifyMaterial(name: string): string {
  if (!name) return "Hardware";
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("plywood") || lowerName.includes("wood") || lowerName.includes("laminate") || lowerName.includes("mdf") || lowerName.includes("veneer") || lowerName.includes("board") || lowerName.includes("timber") || lowerName.includes("mica")) return "Wood & Boards";
  if (lowerName.includes("paint") || lowerName.includes("primer") || lowerName.includes("putty") || lowerName.includes("polish") || lowerName.includes("enamel") || lowerName.includes("thinner") || lowerName.includes("color")) return "Paints & Finishes";
  if (lowerName.includes("tile") || lowerName.includes("marble") || lowerName.includes("granite") || lowerName.includes("flooring") || lowerName.includes("skirting") || lowerName.includes("ceramic")) return "Tiles & Flooring";
  if (lowerName.includes("wire") || lowerName.includes("cable") || lowerName.includes("switch") || lowerName.includes("socket") || lowerName.includes("light") || lowerName.includes("led") || lowerName.includes("mcb") || lowerName.includes("conduit") || lowerName.includes("fan")) return "Electrical";
  if (lowerName.includes("pipe") || lowerName.includes("valve") || lowerName.includes("tap") || lowerName.includes("faucet") || lowerName.includes("shower") || lowerName.includes("sink") || lowerName.includes("basin") || lowerName.includes("cpvc") || lowerName.includes("upvc") || lowerName.includes("tank")) return "Plumbing";
  if (lowerName.includes("cement") || lowerName.includes("sand") || lowerName.includes("brick") || lowerName.includes("concrete") || lowerName.includes("steel") || lowerName.includes("tmt") || lowerName.includes("aggregate") || lowerName.includes("block") || lowerName.includes("rod")) return "Construction";
  
  return "Hardware";
}
