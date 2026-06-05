import sharp from "sharp";
import path from "path";
import fs from "fs";

async function optimizeImages() {
  const imagesToOptimize = [
    {
      input: "src/assets/transformations/before.png",
      output: "src/assets/transformations/before.webp",
      maxWidth: 1600,
      quality: 72,
    },
    {
      input: "src/assets/transformations/after.png",
      output: "src/assets/transformations/after.webp",
      maxWidth: 1600,
      quality: 72,
    },
    {
      input: "public/branding_hero.png",
      output: "public/branding_hero.webp",
      maxWidth: 1600,
      quality: 72,
    },
  ];

  for (const img of imagesToOptimize) {
    if (fs.existsSync(img.input)) {
      console.log(`Optimizing ${img.input} -> ${img.output}...`);
      await sharp(img.input)
        .resize({ width: img.maxWidth, withoutEnlargement: true })
        .webp({ quality: img.quality })
        .toFile(img.output);
      console.log(`Done: ${img.output}`);
    } else {
      console.warn(`File not found: ${img.input}`);
    }
  }

  // Optimize favicon.ico (to a smaller webp or just 48x48 icon)
  const faviconInput = "public/favicon.ico";
  if (fs.existsSync(faviconInput)) {
    console.log(`Optimizing ${faviconInput}...`);
    const tempOutput = "public/favicon_temp.png";
    await sharp(faviconInput)
      .resize({ width: 48, height: 48, withoutEnlargement: true })
      .png({ quality: 80 })
      .toFile(tempOutput);
    
    // Replace the original favicon.ico with the resized png
    fs.renameSync(tempOutput, faviconInput);
    console.log(`Done: ${faviconInput}`);
  }
}

optimizeImages().catch((err) => {
  console.error("Error optimizing images:", err);
  process.exit(1);
});
