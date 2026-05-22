const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/rawMaterialsData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Regex to find: import varName from "@/assets/products/filename.ext";
const regex = /import (\w+) from "@\/assets\/products\/([^"]+)\.(png|jpg|jpeg)";/g;

content = content.replace(regex, (match, varName, filename) => {
  return `const ${varName} = "/products/${filename}.webp";`;
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated rawMaterialsData.ts');
