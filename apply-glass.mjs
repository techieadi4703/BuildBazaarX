import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const darkGlassClass = "h-11 sm:h-14 w-full rounded-2xl bg-black/10 backdrop-blur-md border border-white/20 focus:bg-black/20 focus:ring-2 focus:ring-white/30 transition-all font-medium text-white placeholder:text-white/60 shadow-sm px-4";

const targetFiles = [
  'src/components/shared/LeadCaptureForm.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Contact.tsx'
];

walkDir('src', function(filePath) {
  if (targetFiles.includes(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Find the standard class and replace it
    // Wait, Contact.tsx wasn't fully replaced by enforce-uniform.mjs.
    // I will replace ANY className="..." inside <Input, <SelectTrigger, <Textarea with the darkGlassClass
    // in these specific 3 files.

    const targetTags = ['<Input', '<Textarea', '<SelectTrigger'];
    
    targetTags.forEach(tag => {
      const regex = new RegExp(`(${tag}[^>]*?)className="([^"]+)"([^>]*?>)`, 'g');
      content = content.replace(regex, (match, before, className, after) => {
        return `${before}className="${darkGlassClass}"${after}`;
      });
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated to dark glass classes in ${filePath}`);
    }
  }
});
