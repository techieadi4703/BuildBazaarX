/**
 * WizardState type extracted from NewProject.tsx.
 * Imported here and re-used in NewProject.tsx to avoid duplication.
 * This type is intentionally kept a pure TypeScript type (no Zod)
 * so the wizard remains independent of the schema pipeline.
 */

export type PropertyType =
  | "Apartment"
  | "Villa"
  | "Independent House"
  | "Office"
  | "Shop";

export type DesignStyle =
  | "Modern"
  | "Luxury"
  | "Minimal"
  | "Scandinavian"
  | "Contemporary"
  | "Traditional"
  | "Industrial"
  | "Bohemian";

export type ColorTheme =
  | "White"
  | "Grey"
  | "Beige"
  | "Wooden"
  | "Black"
  | "Blue"
  | "Green";

export type Material =
  | "Laminate"
  | "Veneer"
  | "Acrylic"
  | "Glass"
  | "Marble"
  | "Granite"
  | "Tiles";

export type RoomType =
  | "Living Room"
  | "Dining Room"
  | "Kitchen"
  | "Master Bedroom"
  | "Bedroom 2"
  | "Bedroom 3"
  | "Bathroom"
  | "Balcony"
  | "Study Room"
  | "Office";

export type PlotShape = "rectangular" | "l-shaped" | "square";
export type Orientation = "north" | "south" | "east" | "west";
export type BedroomPosition = "clustered" | "spread";

export interface WizardState {
  propertyType: PropertyType;
  carpetArea: number;
  builtUpArea: number;
  floors: number;
  rooms: RoomType[];
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  workFromHome: boolean;
  cookDaily: boolean;
  extraStorage: boolean;
  kidsRoom: boolean;
  homeOffice: boolean;
  pujaRoom: boolean;
  shoeStorage: boolean;
  designStyle: DesignStyle;
  colorTheme: ColorTheme;
  budget: number;
  materials: Material[];
  /** Plot/unit shape — affects layout aspect ratio */
  plotShape: PlotShape;
  /** Which direction the main entrance faces */
  orientation: Orientation;
  /** Whether bedrooms are grouped together or spread across the plan */
  bedroomPosition: BedroomPosition;
}
