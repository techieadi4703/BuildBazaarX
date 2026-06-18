import fs from 'fs';
import path from 'path';

const profilePath = path.resolve('src/pages/Profile.tsx');
let content = fs.readFileSync(profilePath, 'utf8');

content = content.replaceAll('text-[#131b2e]', 'text-[var(--text-primary)]');
content = content.replaceAll('text-gray-700', 'text-[var(--text-secondary)]');
content = content.replaceAll('text-gray-600', 'text-[var(--text-secondary)]');
content = content.replaceAll('text-[#45464d]', 'text-muted-foreground');
content = content.replaceAll('bg-[#fafafa]', 'bg-[var(--bg-surface)]');
content = content.replaceAll('text-gray-400', 'text-muted-foreground');
content = content.replaceAll('hover:bg-red-50', 'hover:bg-red-500/10');

fs.writeFileSync(profilePath, content, 'utf8');
console.log('Profile.tsx colors updated successfully');
