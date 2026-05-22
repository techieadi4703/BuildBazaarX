

import {
  woodPlanksImg,
  luxuryPaintImg,
  italianMarbleImg,
  smartSwitchImg,
  plywoodBoardImg,
  cementBagImg,
  paintBucketImg,
  vitrifiedTileImg,
  wireCoilImg,
  ultratechCementImg,
  birlaCementImg,
  asianPaintsImg,
  duluxPaintImg,
  cabinetHingeImg,
  drawerSlideImg,
  astralPipeImg,
  finolexPipeImg,
  indigoPaintImg,
  bergerPaintImg,
  duroPlywoodImg,
  virgoLaminateImg,
  jswCementImg,
  dalmiaCementImg,
  godrejLockImg,
  doorHandleImg,
  dorsetLockImg,
  jaquarFaucetImg,
  rrKabelImg,
  groundLightsImg,
  polycabWireImg,
  anchorSwitchImg,
  ozoneFittingImg,
  actionTesaImg,
  ambujaCementImg,
  legrandSwitchImg,
  nerolacPaintImg,
  kingkonreeTileImg,
  vinylFlooringImg,
  indigoPlatinumImg,
  showerImg,
  ledLightImg,
  genericPaintImg,
  genericSwitchesImg,
  genericLaminateImg,
  genericCementImg,
  genericTilesImg,
  genericPlywoodImg
} from "./cdnImages";

import {
  Hammer,
  Droplets,
  HardHat,
  Grid3X3,
  Settings,
  Pipette,
  Zap,
} from "lucide-react";

export const categories = [
  { id: "wood", name: "Wood & Boards", count: 8, icon: Hammer },
  { id: "paints", name: "Paints & Finishes", count: 24, icon: Droplets },
  { id: "construction", name: "Construction", count: 12, icon: HardHat },
  { id: "tiles", name: "Tiles & Flooring", count: 19, icon: Grid3X3 },
  { id: "hardware", name: "Hardware", count: 42, icon: Settings },
  { id: "plumbing", name: "Plumbing", count: 15, icon: Pipette },
  { id: "electrical", name: "Electrical", count: 31, icon: Zap },
];

const categoryFallbackImages: Record<string, string> = {
  wood: plywoodBoardImg,
  paints: paintBucketImg,
  tiles: vitrifiedTileImg,
  electrical: wireCoilImg,
  plumbing: italianMarbleImg,
  construction: cementBagImg,
  hardware: smartSwitchImg,
};

export function getProductImage(product: {
  image_url: string | null;
  category: string | null;
}): string {
  if (product.image_url) return product.image_url;
  if (product.category && categoryFallbackImages[product.category])
    return categoryFallbackImages[product.category];
  return woodPlanksImg;
}

export type Product = {
  id: number | string;
  supplier_id?: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  rating: number | null;
  reviews: number | null;
  specs: string | null;
  in_stock: boolean;
  image_url: string | null;
  images?: string[];
  return_policy?: string;
  quality_details?: string[];
  description?: string;
};

export const premiumProducts: Product[] = [
  { 
    id: "new1", 
    name: "Premium Commercial Plywood 18mm", 
    brand: "CenturyPly", 
    category: "wood", 
    price: 2100, 
    original_price: 2400, 
    discount: 12, 
    rating: 4.8, 
    reviews: 312, 
    specs: "18mm, Commercial Grade", 
    in_stock: true, 
    image_url: plywoodBoardImg,
    images: [plywoodBoardImg, woodPlanksImg, genericPlywoodImg],
    return_policy: "7 Days Replacement",
    quality_details: ["IS 303 Certified", "Termite & Borer Proof", "High Density Hardwood"],
    description: "CenturyPly's premium commercial plywood is known for its durability and resistance to harsh weather conditions. Ideal for all interior applications where strength and longevity are required."
  },
  { 
    id: "new2", 
    name: "UltraTech Super Cement 50kg", 
    brand: "UltraTech", 
    category: "construction", 
    price: 420, 
    original_price: 450, 
    discount: 6, 
    rating: 4.9, 
    reviews: 856, 
    specs: "50kg, Premium Grade", 
    in_stock: true, 
    image_url: ultratechCementImg,
    images: [ultratechCementImg, cementBagImg, genericCementImg],
    return_policy: "No Returns",
    quality_details: ["Grade 53 OPC", "Quick Setting", "High Compressive Strength"],
    description: "The Engineer's Choice. UltraTech Super is a premium quality cement that provides superior strength and durability to your dream home."
  },
  { 
    id: "new4", 
    name: "Tractor Emulsion Paint 20L", 
    brand: "Asian Paints", 
    category: "paints", 
    price: 3200, 
    original_price: 3600, 
    discount: 11, 
    rating: 4.8, 
    reviews: 654, 
    specs: "20L, Smooth Finish", 
    in_stock: true, 
    image_url: asianPaintsImg,
    images: [asianPaintsImg, paintBucketImg, genericPaintImg],
    return_policy: "14 Days Return",
    quality_details: ["Lead Free", "High Coverage", "Matt Finish"],
    description: "Tractor Emulsion is the perfect way to make your walls look beautiful at an affordable price. It offers a smooth matt finish and a wide range of shades."
  },
  { 
    id: "new6", 
    name: "Polycab FR Wire 1.5 sq mm", 
    brand: "Polycab", 
    category: "electrical", 
    price: 1450, 
    original_price: 1600, 
    discount: 9, 
    rating: 4.8, 
    reviews: 567, 
    specs: "90m Coil, FR Grade Red", 
    in_stock: true, 
    image_url: polycabWireImg,
    images: [polycabWireImg, wireCoilImg, genericSwitchesImg],
    return_policy: "7 Days Replacement",
    quality_details: ["Flame Retardant", "99.9% Pure Copper", "High Conductivity"],
    description: "Polycab wires are manufactured using high-grade copper and advanced technology to ensure maximum safety and power efficiency for your home."
  },
  { 
    id: "new30", 
    name: "Jaquar Gold Faucet Basin Mixer", 
    brand: "Jaquar", 
    category: "plumbing", 
    price: 4200, 
    original_price: 4800, 
    discount: 12, 
    rating: 4.9, 
    reviews: 256, 
    specs: "PVD Gold Finish, Pillar Tap", 
    in_stock: true, 
    image_url: jaquarFaucetImg,
    images: [jaquarFaucetImg, showerImg, italianMarbleImg],
    return_policy: "7 Days Replacement",
    quality_details: ["PVD Gold Finish", "10 Year Warranty", "Smooth Operation"],
    description: "Add a touch of luxury to your bathroom with the Jaquar Gold series. Featuring advanced PVD coating for a long-lasting finish and flawless performance."
  }
];

// Add the rest of the products without extra details to maintain the catalog
export const otherProducts: Product[] = [
  { id: "new3", name: "Birla Shakti Cement 50kg", brand: "Birla", category: "construction", price: 410, original_price: 440, discount: 7, rating: 4.7, reviews: 345, specs: "50kg, Portland Pozzolana", in_stock: true, image_url: birlaCementImg },
  { id: "new5", name: "Luxury Interior Emulsion 20L", brand: "Dulux", category: "paints", price: 3400, original_price: 3800, discount: 10, rating: 4.6, reviews: 432, specs: "20L, Matte Finish", in_stock: true, image_url: duluxPaintImg },
  { id: "new7", name: "Anchor 6A Switch & Socket", brand: "Anchor", category: "electrical", price: 120, original_price: 150, discount: 20, rating: 4.5, reviews: 890, specs: "White, Polycarbonate", in_stock: true, image_url: anchorSwitchImg },
  { id: "new8", name: "Stainless Glass Patch Fitting", brand: "Ozone", category: "hardware", price: 1250, original_price: 1400, discount: 10, rating: 4.7, reviews: 210, specs: "SS 304, Frameless Doors", in_stock: true, image_url: ozoneFittingImg },
  { id: "new9", name: "Hafele Concealed Hinge", brand: "Hafele", category: "hardware", price: 250, original_price: 300, discount: 16, rating: 4.9, reviews: 540, specs: "Soft Close, Nickel Plated", in_stock: true, image_url: cabinetHingeImg },
  { id: "new10", name: "Telescopic Drawer Slides 20\"", brand: "Godrej", category: "hardware", price: 450, original_price: 520, discount: 13, rating: 4.6, reviews: 320, specs: "Pair, Heavy Duty Steel", in_stock: true, image_url: drawerSlideImg },
  { id: "new11", name: "Astral Aquarius uPVC Pipe", brand: "Astral", category: "plumbing", price: 850, original_price: 950, discount: 10, rating: 4.8, reviews: 410, specs: "3m length, Lead-Free", in_stock: true, image_url: astralPipeImg },
  { id: "new12", name: "Finolex PVC Pipe", brand: "Finolex", category: "plumbing", price: 780, original_price: 880, discount: 11, rating: 4.7, reviews: 380, specs: "3m length, High Pressure", in_stock: true, image_url: finolexPipeImg },
  { id: "new13", name: "Polished Vitrified Floor Tile", brand: "Kajaria", category: "tiles", price: 850, original_price: 950, discount: 10, rating: 4.6, reviews: 234, specs: "600x600mm, Box of 4", in_stock: true, image_url: vitrifiedTileImg },
  { id: "new14", name: "MDF Board 18mm", brand: "Action Tesa", category: "wood", price: 1800, original_price: 2100, discount: 14, rating: 4.7, reviews: 189, specs: "18mm, Interior Grade", in_stock: true, image_url: actionTesaImg },
  { id: "new15", name: "Calacatta Gold Quartz Slab", brand: "Silestone", category: "tiles", price: 8500, original_price: 9500, discount: 10, rating: 4.8, reviews: 89, specs: "Jumbo Slab, 20mm thickness", in_stock: true, image_url: italianMarbleImg },
  { id: "new16", name: "SmartControl Concealed Shower", brand: "Grohe", category: "plumbing", price: 45000, original_price: 52000, discount: 13, rating: 4.9, reviews: 56, specs: "Thermostatic, 3 Valves", in_stock: true, image_url: showerImg },
  { id: "new17", name: "Veil Intelligent Toilet", brand: "Kohler", category: "plumbing", price: 120000, original_price: 135000, discount: 11, rating: 4.7, reviews: 34, specs: "Auto flush, Bidet, Heated seat", in_stock: true, image_url: italianMarbleImg },
  { id: "new18", name: "Hue Play Gradient Lightstrip", brand: "Philips Hue", category: "electrical", price: 18000, original_price: 21000, discount: 14, rating: 4.9, reviews: 450, specs: "2m base kit, 16M colors", in_stock: true, image_url: ledLightImg },
  { id: "new19", name: "Canadian Pine Wood Logs", brand: "Global Woods", category: "wood", price: 3200, original_price: 3600, discount: 11, rating: 4.7, reviews: 45, specs: "Per cubic foot, Kiln Dried", in_stock: true, image_url: woodPlanksImg },
  { id: "new20", name: "Estate Emulsion - Hague Blue", brand: "Farrow & Ball", category: "paints", price: 14000, original_price: 15500, discount: 9, rating: 4.9, reviews: 78, specs: "5L, Signature matte", in_stock: true, image_url: luxuryPaintImg },
  { id: "new21", name: "Duro Lifetime Guarantee Plywood", brand: "Duro", category: "wood", price: 2800, original_price: 3200, discount: 12, rating: 4.8, reviews: 156, specs: "19mm, Marine Grade", in_stock: true, image_url: duroPlywoodImg },
  { id: "new22", name: "Virgo Premium Wood Laminate", brand: "Virgo Group", category: "wood", price: 1250, original_price: 1400, discount: 10, rating: 4.6, reviews: 98, specs: "1mm, Textured Finish", in_stock: true, image_url: virgoLaminateImg },
  { id: "new23", name: "JSW Cement GGBS 50kg", brand: "JSW", category: "construction", price: 390, original_price: 430, discount: 9, rating: 4.7, reviews: 412, specs: "50kg, Eco-friendly", in_stock: true, image_url: jswCementImg },
  { id: "new24", name: "Dalmia Infra Pro Cement 50kg", brand: "Dalmia", category: "construction", price: 430, original_price: 470, discount: 8, rating: 4.9, reviews: 532, specs: "50kg, High Strength", in_stock: true, image_url: dalmiaCementImg },
  { id: "new25", name: "Smart Digital Lock", brand: "Godrej", category: "hardware", price: 8500, original_price: 9500, discount: 10, rating: 4.8, reviews: 215, specs: "RFID, Pin, Fingerprint", in_stock: true, image_url: godrejLockImg },
  { id: "new26", name: "Exterior Wall Primer Gold Series", brand: "Indigo", category: "paints", price: 1500, original_price: 1800, discount: 16, rating: 4.6, reviews: 145, specs: "20L, High Coverage", in_stock: true, image_url: indigoPaintImg },
  { id: "new27", name: "Weathercoat Exterior Acrylic", brand: "Berger Paints", category: "paints", price: 3600, original_price: 4000, discount: 10, rating: 4.8, reviews: 310, specs: "16L, Lead Free", in_stock: true, image_url: bergerPaintImg },
  { id: "new28", name: "Stainless Steel Pull Handle", brand: "Dorma", category: "hardware", price: 1200, original_price: 1450, discount: 17, rating: 4.5, reviews: 112, specs: "D-Type, SS 304 Grade", in_stock: true, image_url: doorHandleImg },
  { id: "new29", name: "Dorset Euro Profile Cylinder Lock", brand: "Dorset", category: "hardware", price: 850, original_price: 1000, discount: 15, rating: 4.7, reviews: 345, specs: "60mm, With 3 Keys", in_stock: true, image_url: dorsetLockImg },
  { id: "new31", name: "RR Kabel FR Wire 1.5 sq mm", brand: "RR Kabel", category: "electrical", price: 1350, original_price: 1550, discount: 12, rating: 4.8, reviews: 412, specs: "90m Coil, Red, Lead Free", in_stock: true, image_url: rrKabelImg },
  { id: "new32", name: "LED Ground Uplighter 5W", brand: "Havells", category: "electrical", price: 950, original_price: 1150, discount: 17, rating: 4.6, reviews: 188, specs: "IP67 Waterproof, Warm White", in_stock: true, image_url: groundLightsImg },
  { id: "new33", name: "Ambuja Cement 50kg", brand: "Ambuja", category: "construction", price: 395, original_price: 430, discount: 8, rating: 4.8, reviews: 620, specs: "50kg, Portland Pozzolana", in_stock: true, image_url: ambujaCementImg },
  { id: "new34", name: "Advance Modular Switches", brand: "Legrand", category: "electrical", price: 180, original_price: 220, discount: 18, rating: 4.9, reviews: 340, specs: "10A, Polycarbonate", in_stock: true, image_url: legrandSwitchImg },
  { id: "new35", name: "Beauty Smooth Emulsion", brand: "Nerolac", category: "paints", price: 2800, original_price: 3100, discount: 10, rating: 4.6, reviews: 195, specs: "20L, Washable Finish", in_stock: true, image_url: nerolacPaintImg },
  { id: "new36", name: "Premium Designer Tiles", brand: "Kingkonree", category: "tiles", price: 1450, original_price: 1600, discount: 9, rating: 4.7, reviews: 112, specs: "800x800mm, Glossy", in_stock: true, image_url: kingkonreeTileImg },
  { id: "new37", name: "Luxury Vinyl Flooring", brand: "Armstrong", category: "tiles", price: 2100, original_price: 2400, discount: 12, rating: 4.8, reviews: 87, specs: "Box of 10 Sq Ft, Wooden Texture", in_stock: true, image_url: vinylFlooringImg },
  { id: "new38", name: "Platinum Interior Paint", brand: "Indigo", category: "paints", price: 4200, original_price: 4800, discount: 12, rating: 4.9, reviews: 250, specs: "20L, Stain Resistant", in_stock: true, image_url: indigoPlatinumImg },
  { id: "new39", name: "Premium Interior Paint", brand: "Generic", category: "paints", price: 1200, original_price: 1500, discount: 20, rating: 4.5, reviews: 89, specs: "10L, Matte", in_stock: true, image_url: genericPaintImg },
  { id: "new40", name: "Modular Switch Plate", brand: "Generic", category: "electrical", price: 450, original_price: 500, discount: 10, rating: 4.6, reviews: 112, specs: "8 Module, White", in_stock: true, image_url: genericSwitchesImg },
  { id: "new41", name: "Decorative Laminate Sheet", brand: "Generic", category: "wood", price: 800, original_price: 950, discount: 15, rating: 4.7, reviews: 67, specs: "1mm, Suede Finish", in_stock: true, image_url: genericLaminateImg },
  { id: "new42", name: "Portland Cement 50kg", brand: "Generic", category: "construction", price: 380, original_price: 400, discount: 5, rating: 4.8, reviews: 230, specs: "50kg, Grade 43", in_stock: true, image_url: genericCementImg },
  { id: "new43", name: "Ceramic Wall Tiles", brand: "Generic", category: "tiles", price: 450, original_price: 550, discount: 18, rating: 4.5, reviews: 145, specs: "300x450mm, Box of 6", in_stock: true, image_url: genericTilesImg },
  { id: "new44", name: "Commercial Plywood 12mm", brand: "Generic", category: "wood", price: 1200, original_price: 1400, discount: 14, rating: 4.6, reviews: 198, specs: "12mm, Moisture Resistant", in_stock: true, image_url: genericPlywoodImg },
];

export const allProducts: Product[] = [...premiumProducts, ...otherProducts];

export {
  woodPlanksImg,
  luxuryPaintImg,
  italianMarbleImg,
  smartSwitchImg,
  plywoodBoardImg,
  cementBagImg,
  paintBucketImg,
  vitrifiedTileImg,
  wireCoilImg,
  ultratechCementImg,
  birlaCementImg,
  asianPaintsImg,
  duluxPaintImg,
  cabinetHingeImg,
  drawerSlideImg,
  astralPipeImg,
  finolexPipeImg,
  indigoPaintImg,
  bergerPaintImg,
  duroPlywoodImg,
  virgoLaminateImg,
  jswCementImg,
  dalmiaCementImg,
  godrejLockImg,
  doorHandleImg,
  dorsetLockImg,
  jaquarFaucetImg,
  rrKabelImg,
  groundLightsImg,
  polycabWireImg,
  anchorSwitchImg,
  ozoneFittingImg,
  actionTesaImg,
  ambujaCementImg,
  legrandSwitchImg,
  nerolacPaintImg,
  kingkonreeTileImg,
  vinylFlooringImg,
  indigoPlatinumImg,
  showerImg,
  ledLightImg,
  genericPaintImg,
  genericSwitchesImg,
  genericLaminateImg,
  genericCementImg,
  genericTilesImg,
  genericPlywoodImg
};
