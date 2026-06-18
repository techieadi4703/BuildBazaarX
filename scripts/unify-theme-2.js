import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const replacements = [
  // Hardcoded hex colors from WhyChooseUs and Materials
  { pattern: /text-\[#0B132B\]\/[0-9]+/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-\[#0B132B\]/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /bg-\[#0B132B\]\/[0-9]+/g, replacement: 'bg-[var(--border-subtle)]' },
  { pattern: /bg-\[#0B132B\]/g, replacement: 'bg-[var(--bg-base)]' },
  { pattern: /border-\[#0B132B\]\/[0-9]+/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /border-\[#0B132B\]/g, replacement: 'border-[var(--border-default)]' },

  { pattern: /bg-\[#F8F6F1\]/g, replacement: 'bg-[var(--bg-card)]' },
  { pattern: /bg-\[#E6D5B8\]/g, replacement: 'bg-[var(--accent-warm)]' },
  { pattern: /hover:bg-\[#DBC49D\]/g, replacement: 'hover:bg-[var(--accent-warm-hover)]' },

  // Hardcoded hex from RawMaterials and DesignsCatalog
  { pattern: /border-\[#e5e2df\]/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /bg-\[#eae8e5\]/g, replacement: 'bg-[var(--bg-surface)]' },
  { pattern: /hover:bg-\[#eae8e5\]/g, replacement: 'hover:bg-[var(--bg-surface)]' },
  { pattern: /border-\[#c4c6cc\]/g, replacement: 'border-[var(--border-default)]' },

  // Fix native radio buttons accent color
  { pattern: /type="radio"\n(.*?)className="(.*?)"/g, replacement: 'type="radio"\n$1className="$2 accent-[var(--accent-warm)]"' },
  { pattern: /type="radio" (.*?)className="(.*?)"/g, replacement: 'type="radio" $1className="$2 accent-[var(--accent-warm)]"' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { pattern, replacement } of replacements) {
        content = content.replace(pattern, replacement);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed hardcoded colors in: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Done!');
