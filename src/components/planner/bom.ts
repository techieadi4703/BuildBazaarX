import { FloorPlan, Room } from './types';
import { fallbackPaints, fallbackFloors } from './materialsLibrary';
import { furnitureLibrary } from './furnitureLibrary';

export interface BomLineItem {
  id: string;
  category: 'paint' | 'flooring' | 'furniture';
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  productId?: string;
  image?: string;
}

// 1 m^2 ≈ 10.7639 sq ft
const SQ_M_TO_SQ_FT = 10.7639;

export function roomFloorAreaSqFt(polygon: [number, number][]): number {
  if (polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
  }
  const areaSqM = Math.abs(area / 2);
  return areaSqM * SQ_M_TO_SQ_FT;
}

export function roomWallAreaSqFt(polygon: [number, number][], wallHeight: number = 3): number {
  if (polygon.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const dx = polygon[j][0] - polygon[i][0];
    const dy = polygon[j][1] - polygon[i][1];
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  const areaSqM = perimeter * wallHeight;
  return areaSqM * SQ_M_TO_SQ_FT;
}

export function paintLitres(wallAreaSqFt: number, coats: number = 2, coverageSqFtPerLitre: number = 110): number {
  if (wallAreaSqFt <= 0) return 0;
  return Math.ceil((wallAreaSqFt * coats) / coverageSqFtPerLitre);
}

export function tilesNeeded(floorAreaSqFt: number, wastagePct: number = 10): number {
  if (floorAreaSqFt <= 0) return 0;
  return Math.ceil(floorAreaSqFt * (1 + wastagePct / 100));
}

export function buildBom(plan: FloorPlan): BomLineItem[] {
  const items: BomLineItem[] = [];
  
  // Aggregate quantities by ID
  const paintNeeds = new Map<string, number>(); // wallAreaSqFt
  const floorNeeds = new Map<string, number>(); // floorAreaSqFt
  const furnitureNeeds = new Map<string, number>(); // count

  plan.rooms.forEach(room => {
    // 1. Paint
    if (room.materials?.wallColorHex) {
      let paint = fallbackPaints.find(p => p.productId === room.materials?.wallProductId);
      if (!paint) paint = fallbackPaints.find(p => p.hexColor === room.materials?.wallColorHex);
      
      if (paint) {
        const area = roomWallAreaSqFt(room.polygon, plan.wallHeight);
        paintNeeds.set(paint.id, (paintNeeds.get(paint.id) || 0) + area);
      }
    }

    // 2. Flooring
    if (room.materials?.floorTextureUrl || room.materials?.floorColorHex) {
      let floor = fallbackFloors.find(f => f.productId === room.materials?.floorProductId);
      if (!floor) floor = fallbackFloors.find(f => f.textureUrl === room.materials?.floorTextureUrl || f.fallbackColor === room.materials?.floorColorHex);
      
      if (floor) {
        const area = roomFloorAreaSqFt(room.polygon);
        floorNeeds.set(floor.id, (floorNeeds.get(floor.id) || 0) + area);
      }
    }

    // 3. Furniture
    if (room.furniture) {
      room.furniture.forEach(f => {
        furnitureNeeds.set(f.libraryId, (furnitureNeeds.get(f.libraryId) || 0) + 1);
      });
    }
  });

  // Convert aggregates to BomLineItem
  for (const [id, areaSqFt] of paintNeeds.entries()) {
    const paint = fallbackPaints.find(p => p.id === id);
    if (!paint) continue;
    const litres = paintLitres(areaSqFt);
    items.push({
      id: `bom-paint-${id}`,
      category: 'paint',
      name: paint.name,
      brand: paint.brand,
      quantity: litres,
      unit: 'Litre',
      unitPrice: paint.pricePerLitre,
      lineTotal: litres * paint.pricePerLitre,
      productId: paint.productId
    });
  }

  for (const [id, areaSqFt] of floorNeeds.entries()) {
    const floor = fallbackFloors.find(f => f.id === id);
    if (!floor) continue;
    const sqFt = tilesNeeded(areaSqFt);
    items.push({
      id: `bom-floor-${id}`,
      category: 'flooring',
      name: floor.name,
      brand: floor.brand,
      quantity: sqFt,
      unit: 'sq.ft',
      unitPrice: floor.pricePerSqFt,
      lineTotal: sqFt * floor.pricePerSqFt,
      productId: floor.productId,
      image: floor.textureUrl
    });
  }

  for (const [id, count] of furnitureNeeds.entries()) {
    const furn = furnitureLibrary.find(f => f.id === id);
    if (!furn) continue;
    items.push({
      id: `bom-furn-${id}`,
      category: 'furniture',
      name: furn.name,
      brand: 'BuildBazaarX Partners',
      quantity: count,
      unit: 'pcs',
      unitPrice: furn.price,
      lineTotal: count * furn.price,
      productId: furn.productId,
      image: furn.thumbnailUrl || furn.modelUrl
    });
  }

  return items;
}
