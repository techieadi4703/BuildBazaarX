import fs from 'fs';

const darkGlassClass = "h-11 sm:h-14 w-full rounded-2xl bg-black/10 backdrop-blur-md border border-white/20 focus:bg-black/20 focus:ring-2 focus:ring-white/30 transition-all font-medium text-white placeholder:text-white/60 shadow-sm px-4";

// 1. LeadCaptureForm.tsx and Checkout.tsx old class:
const oldClass1 = "h-11 sm:h-14 rounded-2xl bg-background border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] shadow-sm";

// 2. Contact.tsx old class:
const oldClass2 = "rounded-2xl h-14 bg-secondary/30 border border-[var(--border-subtle)] focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/70 text-sm font-bold px-5";

const filesToUpdate = [
  'src/components/shared/LeadCaptureForm.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Contact.tsx'
];

filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace occurrences of oldClass1
  content = content.split(oldClass1).join(darkGlassClass);
  // Replace occurrences of oldClass2
  content = content.split(oldClass2).join(darkGlassClass);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated exact classes in ${filePath}`);
  }
});
