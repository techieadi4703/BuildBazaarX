import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const { pattern, replacement } of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Fix Contact.tsx form visibility and font sizes
replaceInFile(path.join(process.cwd(), 'src/pages/Contact.tsx'), [
  {
    pattern: /text-5xl md:text-8xl/g,
    replacement: 'text-4xl md:text-5xl lg:text-6xl'
  },
  {
    pattern: /className="space-y-4 md:space-y-8 bg-\[var\(--accent-warm\)\] p-5 md:p-12/g,
    replacement: 'className="space-y-4 md:space-y-8 bg-[var(--bg-card)] p-5 md:p-12'
  },
  {
    pattern: /bg-\[var\(--accent\)\]\/5/g,
    replacement: 'bg-[var(--bg-surface)]/50'
  },
  {
    pattern: /bg-\[var\(--bg-card\)\]/g,
    replacement: 'bg-[var(--bg-surface)]'
  }
]);

// 2. Fix About.tsx font sizes
replaceInFile(path.join(process.cwd(), 'src/pages/About.tsx'), [
  {
    pattern: /text-5xl md:text-8xl/g,
    replacement: 'text-4xl md:text-5xl lg:text-6xl'
  },
  {
    pattern: /text-4xl md:text-6xl/g,
    replacement: 'text-3xl md:text-4xl lg:text-5xl'
  }
]);

// 3. Fix DesignDetail.tsx form inputs and button
replaceInFile(path.join(process.cwd(), 'src/pages/DesignDetail.tsx'), [
  {
    pattern: /bg-secondary\/30/g,
    replacement: 'bg-[var(--bg-card)] border border-[var(--border-subtle)]'
  },
  {
    pattern: /bg-primary px-8/g,
    replacement: 'bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-8'
  },
  {
    pattern: /text-\[var\(--text-primary\)\] relative overflow-hidden/g,
    replacement: 'text-[var(--text-primary)] relative overflow-hidden'
  },
  {
    pattern: /className="h-14 rounded-2xl font-black/g,
    replacement: 'className="h-14 rounded-2xl font-black bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
  }
]);

// 4. Remove mix-blend-multiply from all files to fix invisible images
const SRC_DIR = path.join(process.cwd(), 'src');
function removeMixBlend(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      removeMixBlend(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath, [
        { pattern: / mix-blend-multiply/g, replacement: '' }
      ]);
    }
  }
}
removeMixBlend(SRC_DIR);

console.log('All fixes applied!');
