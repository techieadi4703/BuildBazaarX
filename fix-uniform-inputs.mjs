import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const uniformClass = "w-full px-4 h-11 sm:h-14 rounded-2xl bg-[var(--bg-card)]/90 border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] outline-none";

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') && filePath !== 'src/components/ui/input.tsx') {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Find all <input ... className="..."/> and replace className
    content = content.replace(/<input([^>]*?)className="([^"]+)"([^>]*?)>/g, (match, before, className, after) => {
      // Don't replace if it's a checkbox or radio
      if (before.includes('type="checkbox"') || before.includes('type="radio"') || after.includes('type="checkbox"') || after.includes('type="radio"')) {
        return match;
      }
      
      return `<input${before}className="${uniformClass}"${after}>`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated inputs in ${filePath}`);
    }
  }
});
