export type RoomType = 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'balcony';

export interface PlacedFurniture {
  instanceId: string;
  libraryId: string;
  productId?: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  color?: string;
  materials?: {
    wallColorHex?: string;
    wallProductId?: string;
    floorTextureUrl?: string;
    floorColorHex?: string;
    floorProductId?: string;
  };
  /**
   * Polygon representing the floor outline in metres on the X/Z plane.
   * Ordered clockwise. e.g., [[0,0], [0,5], [5,5], [5,0]]
   */
  polygon: [number, number][];
  furniture?: PlacedFurniture[];
}

export interface FloorPlan {
  id: string;
  name: string;
  wallHeight: number;
  rooms: Room[];
}
