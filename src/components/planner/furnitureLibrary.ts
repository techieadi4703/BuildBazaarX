import { useGLTF } from '@react-three/drei';

export type FurnitureCategory = 'bed' | 'sofa' | 'table' | 'chair' | 'wardrobe' | 'lighting' | 'decor';

export interface FurnitureLibraryItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  modelUrl: string;
  price: number;
  defaultScale: number;
  productId?: string;
  thumbnailUrl?: string; // Optional thumbnail image for UI
}

// We use a simple Box placeholder for development.
const PLACEHOLDER_GLB = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb';

export const furnitureLibrary: FurnitureLibraryItem[] = [
  { id: 'f-bed-1', name: 'Modern Platform Bed', category: 'bed', modelUrl: PLACEHOLDER_GLB, price: 15999, defaultScale: 1 },
  { id: 'f-bed-2', name: 'Classic Wooden Bed', category: 'bed', modelUrl: PLACEHOLDER_GLB, price: 18499, defaultScale: 1 },
  { id: 'f-sofa-1', name: '3-Seater Fabric Sofa', category: 'sofa', modelUrl: PLACEHOLDER_GLB, price: 21999, defaultScale: 1 },
  { id: 'f-sofa-2', name: 'Leather Recliner', category: 'sofa', modelUrl: PLACEHOLDER_GLB, price: 34999, defaultScale: 1 },
  { id: 'f-table-1', name: 'Dining Table (6 Seater)', category: 'table', modelUrl: PLACEHOLDER_GLB, price: 14500, defaultScale: 1 },
  { id: 'f-table-2', name: 'Coffee Table Glass', category: 'table', modelUrl: PLACEHOLDER_GLB, price: 4200, defaultScale: 1 },
  { id: 'f-chair-1', name: 'Ergonomic Office Chair', category: 'chair', modelUrl: PLACEHOLDER_GLB, price: 6500, defaultScale: 1 },
  { id: 'f-chair-2', name: 'Accent Lounge Chair', category: 'chair', modelUrl: PLACEHOLDER_GLB, price: 8900, defaultScale: 1 },
  { id: 'f-ward-1', name: 'Sliding Door Wardrobe', category: 'wardrobe', modelUrl: PLACEHOLDER_GLB, price: 28000, defaultScale: 1 },
  { id: 'f-light-1', name: 'Floor Lamp Minimalist', category: 'lighting', modelUrl: PLACEHOLDER_GLB, price: 2100, defaultScale: 1 },
];

// Preload models so they render immediately when dropped in
if (typeof window !== 'undefined') {
  furnitureLibrary.forEach(item => {
    useGLTF.preload(item.modelUrl);
  });
}
