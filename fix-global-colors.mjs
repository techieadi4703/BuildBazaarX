import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace hardcoded light backgrounds that break dark mode inputs
    content = content.replace(/bg-white/g, 'bg-[var(--bg-card)]');
    content = content.replace(/bg-\[\#fafafa\]/g, 'bg-[var(--bg-surface)]');
    content = content.replace(/bg-surface-container-lowest/g, 'bg-[var(--bg-surface)]');

    // 2. Ensure text colors adapt
    content = content.replace(/text-gray-700/g, 'text-[var(--text-secondary)]');
    content = content.replace(/text-\[\#131b2e\]/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-gray-900/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-black/g, 'text-[var(--text-primary)]');

    // 3. Make sure inputs have the right text variable if they don't have one
    // Actually just applying the replacements above is usually enough.
    // Let's also ensure border colors adapt
    content = content.replace(/border-gray-200/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-gray-300/g, 'border-[var(--border-default)]');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log('Global input colors scan complete.');
