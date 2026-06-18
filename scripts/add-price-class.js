import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Simple regex to find className="..." immediately preceding a >₹ or > ₹
      // e.g. <span className="text-xl">₹{price}</span>
      // We will add price-display to className
      const regex = /className="([^"]*)"([^>]*>)\s*₹/g;
      
      content = content.replace(regex, (match, p1, p2) => {
        if (!p1.includes('price-display')) {
          return `className="${p1} price-display"${p2}₹`;
        }
        return match;
      });

      // Handle cases with template literals className={`...`}
      const regex2 = /className=\{`([^`]*)`\}([^>]*>)\s*₹/g;
      content = content.replace(regex2, (match, p1, p2) => {
        if (!p1.includes('price-display')) {
          return `className={\`${p1} price-display\`}${p2}₹`;
        }
        return match;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated price-display in: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Done adding price-display!');
