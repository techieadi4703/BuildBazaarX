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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.mjs')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace bad background class with good one
    content = content.replace(/bg-\[var\(--bg-card\)\]\/90/g, "bg-background");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed background classes in ${filePath}`);
    }
  }
});
