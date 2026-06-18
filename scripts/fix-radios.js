import fs from 'fs';
import path from 'path';

function fixRadios(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Find all classNames that contain border-[var(--border-default)] and add accent-[var(--accent-warm)]
  content = content.replace(/className="([^"]*?border-\[var\(--border-default\)\][^"]*?)"/g, (match, p1) => {
    if (!p1.includes('accent-')) {
      return `className="${p1} accent-[var(--accent-warm)]"`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed radios in ${filePath}`);
  }
}

fixRadios(path.join(process.cwd(), 'src/pages/DesignsCatalog.tsx'));
fixRadios(path.join(process.cwd(), 'src/pages/RawMaterials.tsx'));

