import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PRODUCT_BUCKET = 'product-images';
const DESIGN_BUCKET = 'design-images';

const getContentType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
};

const cdnMap: Record<string, string> = {};

async function uploadFile(filePath: string, bucket: string, filename: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = getContentType(filename);

  console.log(`Uploading ${filename} to ${bucket}...`);
  const { data, error } = await supabase.storage.from(bucket).upload(filename, fileBuffer, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });

  if (error) {
    console.error(`Error uploading ${filename}:`, error.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);
  cdnMap[filename] = publicUrlData.publicUrl;
  console.log(`Uploaded! Public URL: ${publicUrlData.publicUrl}`);
}

async function uploadProducts() {
  const productsDir = path.join(rootDir, 'public', 'products');
  if (!fs.existsSync(productsDir)) {
    console.warn(`Directory not found: ${productsDir}`);
    return;
  }

  const files = fs.readdirSync(productsDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      const filePath = path.join(productsDir, file);
      await uploadFile(filePath, PRODUCT_BUCKET, file);
    }
  }
}

async function uploadDesigns() {
  const assetsDir = path.join(rootDir, 'src', 'assets');
  const designFiles = [
    'hero-interior.jpg',
    'kitchen-design.jpg',
    'bedroom-design.jpg',
    'livingroom-design.jpg',
    'wardrobe-design.jpg',
    'fullhome-design.jpg',
    'branding_hero.png',
    'logo.png',
    'logo-icon.png'
  ];

  for (const file of designFiles) {
    const filePath = path.join(assetsDir, file);
    if (fs.existsSync(filePath)) {
      await uploadFile(filePath, DESIGN_BUCKET, file);
    } else {
      console.warn(`Design file not found, skipping: ${file}`);
    }
  }
}

async function main() {
  console.log("Starting upload process...");
  await uploadProducts();
  await uploadDesigns();

  const mapPath = path.join(__dirname, 'cdn-url-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(cdnMap, null, 2));
  console.log(`\nUpload complete! Map saved to ${mapPath}`);
  console.log(`Total items uploaded: ${Object.keys(cdnMap).length}`);
}

main().catch(console.error);
