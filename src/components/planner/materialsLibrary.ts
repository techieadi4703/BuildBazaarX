export interface PaintSwatch {
  id: string;
  name: string;
  brand: string;
  hexColor: string;
  pricePerLitre: number;
  productId?: string;
}

export interface FloorMaterial {
  id: string;
  name: string;
  brand: string;
  textureUrl?: string; // If absent or loading fails, fallback to color
  fallbackColor: string;
  pricePerSqFt: number;
  productId?: string;
}

export const fallbackPaints: PaintSwatch[] = [
  { id: 'paint-1', name: 'Cotton White', brand: 'BuildBazaarX Basics', hexColor: '#F5F5F5', pricePerLitre: 450 },
  { id: 'paint-2', name: 'Warm Beige', brand: 'BuildBazaarX Basics', hexColor: '#E5D3B3', pricePerLitre: 480 },
  { id: 'paint-3', name: 'Muted Teal', brand: 'BuildBazaarX Basics', hexColor: '#4A8E8B', pricePerLitre: 520 },
  { id: 'paint-4', name: 'Charcoal Grey', brand: 'BuildBazaarX Basics', hexColor: '#36454F', pricePerLitre: 500 },
  { id: 'paint-5', name: 'Dusty Rose', brand: 'BuildBazaarX Basics', hexColor: '#DCAE96', pricePerLitre: 490 },
  { id: 'paint-6', name: 'Sage Green', brand: 'BuildBazaarX Basics', hexColor: '#9C9F84', pricePerLitre: 510 },
  { id: 'paint-7', name: 'Navy Blue', brand: 'BuildBazaarX Basics', hexColor: '#1A2A40', pricePerLitre: 550 },
  { id: 'paint-8', name: 'Terracotta', brand: 'BuildBazaarX Basics', hexColor: '#E2725B', pricePerLitre: 530 },
];

export const fallbackFloors: FloorMaterial[] = [
  { id: 'floor-1', name: 'Light Oak Laminate', brand: 'WoodCrafters', fallbackColor: '#D1B48C', textureUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 120 },
  { id: 'floor-2', name: 'Walnut Hardwood', brand: 'WoodCrafters', fallbackColor: '#5C4033', textureUrl: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 250 },
  { id: 'floor-3', name: 'White Marble', brand: 'StoneWorks', fallbackColor: '#FDFDFD', textureUrl: 'https://images.unsplash.com/photo-1590432326759-42b78ce13a96?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 350 },
  { id: 'floor-4', name: 'Grey Slate Tile', brand: 'StoneWorks', fallbackColor: '#708090', textureUrl: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 180 },
  { id: 'floor-5', name: 'Terracotta Tile', brand: 'Ceramica', fallbackColor: '#CC4E3C', textureUrl: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 110 },
  { id: 'floor-6', name: 'Polished Concrete', brand: 'BuildBazaarX Basics', fallbackColor: '#9E9E9E', textureUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=512&q=80', pricePerSqFt: 90 },
];
