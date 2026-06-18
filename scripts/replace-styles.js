import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const replacements = [
  { pattern: /bg-white\s+dark:bg-gray-900/g, replacement: 'bg-[var(--bg-card)]' },
  { pattern: /bg-white/g, replacement: 'bg-[var(--bg-card)]' }, // fallbacks
  { pattern: /dark:bg-gray-900/g, replacement: 'bg-[var(--bg-card)]' },
  
  { pattern: /text-gray-500\s+dark:text-gray-400/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-gray-500/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /dark:text-gray-400/g, replacement: 'text-[var(--text-secondary)]' },
  
  { pattern: /border-gray-200\s+dark:border-gray-700/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /border-gray-200/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /dark:border-gray-700/g, replacement: 'border-[var(--border-subtle)]' },
  
  { pattern: /bg-blue-600\s+hover:bg-blue-700/g, replacement: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]' },
  { pattern: /bg-blue-600/g, replacement: 'bg-[var(--accent)]' },
  
  { pattern: /rounded-xl\s+shadow-lg/g, replacement: 'rounded-lg border border-[var(--border-subtle)]' },
  { pattern: /shadow-lg\s+rounded-xl/g, replacement: 'rounded-lg border border-[var(--border-subtle)]' },
  { pattern: /shadow-lg/g, replacement: 'shadow-[var(--shadow-md)]' }, // Fallback for stray shadow-lg
  { pattern: /rounded-xl/g, replacement: 'rounded-lg' },
  
  { pattern: /text-indigo-600\s+dark:text-indigo-400/g, replacement: 'text-[var(--accent)]' },
  { pattern: /text-indigo-600/g, replacement: 'text-[var(--accent)]' },
  { pattern: /dark:text-indigo-400/g, replacement: 'text-[var(--accent)]' },
  
  { pattern: /bg-gray-50\s+dark:bg-gray-800/g, replacement: 'bg-[var(--bg-surface)]' },
  { pattern: /bg-gray-50/g, replacement: 'bg-[var(--bg-surface)]' },
  { pattern: /dark:bg-gray-800/g, replacement: 'bg-[var(--bg-surface)]' }
];

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
      
      for (const { pattern, replacement } of replacements) {
        content = content.replace(pattern, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Done!');
