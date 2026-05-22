const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'src/assets/products');
const outputDir = path.join(__dirname, 'public/products');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    const base = path.basename(file, ext);
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${base}.webp`);
    
    // Convert to webp, quality 75% to hit the <80KB target
    sharp(inputPath)
      .webp({ quality: 75 })
      .toFile(outputPath)
      .then(info => {
        console.log(`Converted ${file} -> ${base}.webp (${info.size} bytes)`);
      })
      .catch(err => {
        console.error(`Error converting ${file}:`, err);
      });
  }
});
