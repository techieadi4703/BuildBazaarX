import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const uniformClass = "h-11 sm:h-14 w-full rounded-2xl bg-[var(--bg-card)]/90 border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] shadow-sm px-4";

const targetTags = ['<Input', '<Textarea', '<SelectTrigger'];

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('/ui/')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    targetTags.forEach(tag => {
      // We look for the tag and its className
      const regex = new RegExp(`(${tag}[^>]*?)className="([^"]+)"([^>]*?>)`, 'g');
      content = content.replace(regex, (match, before, className, after) => {
        // preserve specific structural classes if needed, or just blast them
        return `${before}className="${uniformClass}"${after}`;
      });
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated uniform classes in ${filePath}`);
    }
  }
});
