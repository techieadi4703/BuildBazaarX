const fs = require('fs');
const path = require('path');

const profilePath = path.join(__dirname, 'src/pages/Profile.tsx');
let content = fs.readFileSync(profilePath, 'utf8');

// Replace hardcoded dark colors with appropriate theme variables
const replacements = [
  { search: /text-\[#131b2e\]/g, replace: 'text-[var(--text-primary)]' },
  { search: /text-gray-700/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-gray-600/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-[#45464d]/g, replace: 'text-muted-foreground' },
  { search: /bg-\[#fafafa\]/g, replace: 'bg-[var(--bg-surface)]' },
  { search: /text-gray-400/g, replace: 'text-muted-foreground' },
  { search: /hover:bg-red-50/g, replace: 'hover:bg-red-500/10' },
  { search: /hover:bg-\[#eceef0\]\/30/g, replace: 'hover:bg-[var(--bg-surface)]' }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(profilePath, content, 'utf8');
console.log('Profile.tsx colors updated');
