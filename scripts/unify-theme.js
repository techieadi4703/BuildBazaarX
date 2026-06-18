import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'src/pages');

// These regexes target the hardcoded colors in the pages and replace them with our new variables.
const replacements = [
  // Backgrounds
  { pattern: /bg-primary-container/g, replacement: 'bg-[var(--bg-base)]' },
  { pattern: /bg-\[#0B132B\]/g, replacement: 'bg-[var(--bg-base)]' },
  { pattern: /bg-\[#131b2E\]/g, replacement: 'bg-[var(--bg-surface)]' },
  { pattern: /bg-\[#fcf9f6\]/g, replacement: 'bg-[var(--bg-base)]' },
  { pattern: /bg-\[#F4F0EA\]/g, replacement: 'bg-[var(--bg-surface)]' },
  { pattern: /bg-\[#E5DACE\]/g, replacement: 'bg-[var(--bg-card)] border-[var(--border-subtle)]' },
  { pattern: /bg-\[#c4c6cc\]/g, replacement: 'bg-[var(--border-default)]' },
  { pattern: /bg-\[#f6f3f0\]/g, replacement: 'bg-[var(--bg-card)]' },
  { pattern: /bg-\[#1c1c1a\]/g, replacement: 'bg-[var(--accent)]' },
  { pattern: /hover:bg-\[#735c00\]/g, replacement: 'hover:bg-[var(--accent-hover)]' },
  
  // Gold / Brass colors
  { pattern: /text-\[#C5A572\]/g, replacement: 'text-[var(--accent-warm)]' },
  { pattern: /bg-\[#C5A572\]/g, replacement: 'bg-[var(--accent-warm)]' },
  { pattern: /border-\[#C5A572\]/g, replacement: 'border-[var(--accent-warm)]' },
  { pattern: /from-\[#C5A572\]/g, replacement: 'from-[var(--accent-warm)]' },
  { pattern: /ring-\[#C5A572\]/g, replacement: 'ring-[var(--accent-warm)]' },
  { pattern: /text-\[#735c00\]/g, replacement: 'text-[var(--accent-warm)]' },
  { pattern: /bg-\[#735c00\]/g, replacement: 'bg-[var(--accent-warm)]' },
  { pattern: /border-\[#735c00\]/g, replacement: 'border-[var(--accent-warm)]' },

  // Text Colors
  { pattern: /text-\[#1c1c1a\]/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /text-\[#44474c\]/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-\[#74777d\]/g, replacement: 'text-[var(--text-tertiary)]' },
  
  // Black and white text on these pages should be theme aware now since backgrounds are theme aware
  { pattern: /text-black\/60/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-black\/80/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /text-black\/40/g, replacement: 'text-[var(--text-tertiary)]' },
  { pattern: /text-black\/10/g, replacement: 'text-[var(--border-default)]' },
  { pattern: /text-black/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /bg-black/g, replacement: 'bg-[var(--accent)]' },
  { pattern: /border-black/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /hover:bg-black\/80/g, replacement: 'hover:bg-[var(--accent-hover)]' },
  
  // White text replacements (since backgrounds are now light/dark responsive)
  { pattern: /text-white\/60/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-white\/70/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-white\/50/g, replacement: 'text-[var(--text-tertiary)]' },
  { pattern: /border-white\/20/g, replacement: 'border-[var(--border-subtle)]' },
  { pattern: /border-white\/10/g, replacement: 'border-[var(--border-subtle)]' },
  // Be careful replacing 'text-white' globally, let's only do it for specific classes.
  // We'll replace text-white with text-[var(--text-primary)] EXCEPT when inside a button or specific element.
  // Actually, since these pages were mostly dark, all their "text-white" was just for contrast.
  // We can safely replace it in these specific files because we changed the backgrounds to responsive ones.
];

// Special replacements for text-white
const whiteTextReplacements = [
  { pattern: /text-white(?!.*?(button|text-white))/g, replacement: 'text-[var(--text-primary)]' }
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

      // Safe replace of text-white. We'll do a simple replace, but we might hit buttons.
      // Since Button component handles its own colors via variants (text-white inside variant definition), 
      // the 'text-white' utility class is only used manually. 
      // Let's replace 'text-white' with 'text-[var(--text-primary)]' unless it's inside a button definition, but here we just replace the string.
      // A better way: replace text-white only if it's followed by " or space
      content = content.replace(/text-white([ "'])/g, 'text-[var(--text-primary)]$1');
      
      // Let's ensure Buttons still use text-white if they explicitly had it before we replaced it.
      // Wait, Buttons in our app use variants, so they don't have text-white in their className prop usually.
      // Example: <Button className="... bg-[var(--accent)] text-white ...">
      // If we replaced it with text-[var(--text-primary)], we can fix it:
      content = content.replace(/bg-\[var\(--accent\)\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--accent)] text-white');
      content = content.replace(/bg-\[var\(--accent-warm\)\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--accent-warm)] text-white');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Unified theme in: ${fullPath}`);
      }
    }
  }
}

processDirectory(PAGES_DIR);

// Also process components/home and components/shared
processDirectory(path.join(process.cwd(), 'src/components/home'));
processDirectory(path.join(process.cwd(), 'src/components/shared'));

console.log('Done unifying theme!');
