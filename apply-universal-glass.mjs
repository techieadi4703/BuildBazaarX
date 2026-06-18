import fs from 'fs';

// This universal glass class works perfectly in both Light and Dark themes.
// It uses Tailwind's dark: modifier and CSS variables to ensure text is visible in both modes.
const universalGlassClass = "h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4";

// The class we applied previously (which broke light mode text color)
const oldGlassClass = "h-11 sm:h-14 w-full rounded-2xl bg-black/10 backdrop-blur-md border border-white/20 focus:bg-black/20 focus:ring-2 focus:ring-white/30 transition-all font-medium text-white placeholder:text-white/60 shadow-sm px-4";

// The textarea class we applied previously
const oldTextareaClass = "w-full rounded-2xl bg-black/10 backdrop-blur-md border border-white/20 focus:bg-black/20 focus:ring-2 focus:ring-white/30 transition-all font-medium text-white placeholder:text-white/60 shadow-sm p-5 resize-none";

// The new textarea class
const universalTextareaClass = "w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm p-5 resize-none";

const filesToUpdate = [
  'src/components/shared/LeadCaptureForm.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Contact.tsx'
];

filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace exact classes
  content = content.split(oldGlassClass).join(universalGlassClass);
  content = content.split(oldTextareaClass).join(universalTextareaClass);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated to universal glass in ${filePath}`);
  }
});
