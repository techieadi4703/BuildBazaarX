const fs = require('fs');
const path = require('path');

const adminDir = '/Users/adityasrivastava/Downloads/Startup/buildbazaarx-v2/src/pages/admin';

const replacements = [
  // Table wrappers and panels
  {
    target: 'border rounded-lg bg-background overflow-x-auto',
    replacement: 'border border-white/20 rounded-xl glass overflow-x-auto shadow-glass'
  },
  {
    target: 'border rounded-lg bg-background',
    replacement: 'border border-white/20 rounded-xl glass shadow-glass'
  },
  {
    target: 'border rounded-md',
    replacement: 'border border-white/20 rounded-xl glass shadow-glass'
  },
  {
    target: 'w-full md:w-auto overflow-x-auto border rounded-lg p-1 bg-muted/50',
    replacement: 'w-full md:w-auto overflow-x-auto border border-white/20 rounded-xl p-1 glass-subtle shadow-glass'
  },
  
  // Tabs active styles
  {
    target: 'data-[state=active]:bg-background',
    replacement: 'data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20'
  },

  // Color Badges / Status Chips
  {
    target: 'bg-green-100 text-green-800',
    replacement: 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-yellow-100 text-yellow-800',
    replacement: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-blue-100 text-blue-800',
    replacement: 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-purple-100 text-purple-800',
    replacement: 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-red-100 text-red-800',
    replacement: 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-orange-100 text-orange-800',
    replacement: 'bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-gray-100 text-gray-800',
    replacement: 'bg-muted-foreground/10 border border-muted-foreground/20 text-muted-foreground backdrop-blur-sm rounded-full'
  },
  {
    target: 'bg-slate-100 text-slate-800',
    replacement: 'bg-muted-foreground/10 border border-muted-foreground/20 text-muted-foreground backdrop-blur-sm rounded-full'
  },

  // Active user status badge
  {
    target: 'text-green-600 bg-green-50 border-green-200 flex w-fit items-center gap-1',
    replacement: 'text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 flex w-fit items-center gap-1 backdrop-blur-sm rounded-full'
  },

  // Background and border modifications
  {
    target: 'bg-muted/30',
    replacement: 'bg-white/5 backdrop-blur-sm'
  },
  {
    target: 'bg-muted/50',
    replacement: 'bg-white/5'
  },
  {
    target: 'bg-muted',
    replacement: 'bg-white/10 dark:bg-white/5'
  },

  // Export buttons in Reports.tsx
  {
    target: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
    replacement: 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 shadow-glass'
  },
  {
    target: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
    replacement: 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 shadow-glass'
  },
  {
    target: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200',
    replacement: 'bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 shadow-glass'
  },

  // Tickets details in Tickets.tsx
  {
    target: 'bg-blue-50/50 border border-blue-100 rounded-lg text-sm whitespace-pre-wrap text-blue-900',
    replacement: 'bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm whitespace-pre-wrap text-blue-600 dark:text-blue-400'
  },

  // Input styles updates in Settings.tsx
  {
    target: 'className="border-gray-300 focus:border-[#735c00]"',
    replacement: 'className="border-white/20 focus:border-secondary/50 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/10 dark:bg-white/5 text-foreground"'
  }
];

fs.readdirSync(adminDir).forEach(file => {
  const filePath = path.join(adminDir, file);
  if (fs.statSync(filePath).isFile() && file.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ target, replacement }) => {
      if (content.includes(target)) {
        content = content.split(target).join(replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${file}`);
    }
  }
});
