import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const { pattern, replacement } of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Fix RawMaterialDetail.tsx dark text colors
replaceInFile(path.join(process.cwd(), 'src/pages/RawMaterialDetail.tsx'), [
  { pattern: /text-gray-900/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /text-gray-800/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /text-gray-700/g, replacement: 'text-[var(--text-primary)]' },
  { pattern: /text-gray-600/g, replacement: 'text-[var(--text-secondary)]' },
  { pattern: /text-gray-400/g, replacement: 'text-[var(--text-tertiary)]' },
]);

// 2. Fix DesignsCatalog.tsx Verified Badge and Plus Icon Position
const catalogPath = path.join(process.cwd(), 'src/pages/DesignsCatalog.tsx');
if (fs.existsSync(catalogPath)) {
  let content = fs.readFileSync(catalogPath, 'utf8');
  
  // Replace the Verified Design badge
  content = content.replace(
    /className="bg-\[var\(--bg-base\)\]\/90 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full text-\[8px\] md:text-\[9px\] font-bold uppercase tracking-widest md:tracking-\[0\.2em\] flex items-center gap-1 md:gap-2 shadow-sm border border-\[var\(--border-subtle\)\]"/g,
    'className="bg-[var(--bg-surface)] backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest md:tracking-[0.2em] flex items-center gap-1 md:gap-2 shadow-md border-[var(--border-default)] border border-[var(--border-subtle)] text-[var(--text-primary)]"'
  );

  // Fix the image container and plus icon position
  // We need to change the image container to not hide overflow, and wrap the image in an overflow-hidden div
  // Original:
  // <div className={`relative overflow-hidden bg-[var(--bg-card)] md:mb-6 ${isFeatured ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-square'}`}>
  //   <img ... />
  //   ...
  // </div>
  
  // Let's replace the whole block carefully.
  content = content.replace(
    /<div className={`relative overflow-hidden bg-\[var\(--bg-card\)\] md:mb-6 \${isFeatured \? 'aspect-\[16\/10\]' : 'aspect-\[4\/5\] md:aspect-square'}`}>\s*<img\s*src=\{cdnImg\(design\.image, 600\)\}\s*alt=\{design\.name\}\s*loading="lazy"\s*width=\{800\}\s*height=\{800\}\s*className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"\s*decoding="async" \/>/g,
    `<div className={\`relative md:mb-6 \${isFeatured ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-square'}\`}>
      <div className="absolute inset-0 overflow-hidden rounded-t-2xl md:rounded-2xl bg-[var(--bg-card)]">
        <img
          src={cdnImg(design.image, 600)}
          alt={design.name}
          loading="lazy"
          width={800}
          height={800}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
          decoding="async" />
      </div>`
  );

  // Then move the Hover FAB to inside the image container, but outside the overflow-hidden inset-0
  // First, find the hover FAB block:
  const fabBlock = `{/* Hover FAB - Add to Cart / Quantity Controller */}
                        <div className={\`absolute opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-30 \${isFeatured ? 'bottom-8 right-8 md:bottom-12 md:right-12' : 'bottom-[70px] right-4 md:bottom-20 md:right-4'}\`}>
                          {(() => {
                            const cartItem = cartItems.find(i => i.id === design.id);
                            if (cartItem) {
                              return (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(design.id, 0); // removes from cart
                                    toast.success(\`\${design.name} removed from cart.\`);
                                  }}
                                  className="w-10 h-10 md:w-12 md:h-12 bg-[#ba1a1a] text-[var(--text-primary)] rounded-full flex items-center justify-center hover:bg-[#8a1212] transition-all shadow-[var(--shadow-md)]"
                                  title="Remove from cart"
                                >
                                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                              );
                            }
                            return (
                              <button
                                onClick={(e) => handleAddToCart(e, design)}
                                className="w-10 h-10 md:w-12 md:h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] hover:scale-110 transition-all shadow-[var(--shadow-md)]"
                              >
                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            );
                          })()}
                        </div>`;

  // We need to move it into the image container (which ends before the <div className="p-3 md:p-0 md:space-y-3...>)
  // So we will remove it from the bottom, and insert it before `{!isFeatured && (` that wraps the content, wait.
  // Actually, let's just use replace to do it cleanly.
  
  // We'll replace the old hover FAB block with an empty string
  content = content.replace(
    /\{\/\* Hover FAB - Add to Cart \/ Quantity Controller \*\/\}\s*<div className=\{\`absolute opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-30 \$\{isFeatured \? 'bottom-8 right-8 md:bottom-12 md:right-12' : 'bottom-\[70px\] right-4 md:bottom-20 md:right-4'\}\`\}>\s*\{\(\(\) => \{\s*const cartItem = cartItems\.find\(i => i\.id === design\.id\);\s*if \(cartItem\) \{\s*return \(\s*<button\s*onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*updateQuantity\(design\.id, 0\); \/\/ removes from cart\s*toast\.success\(`\$\{design\.name\} removed from cart\.`\);\s*\}\}\s*className="w-10 h-10 md:w-12 md:h-12 bg-\[#ba1a1a\] text-\[var\(--text-primary\)\] rounded-full flex items-center justify-center hover:bg-\[#8a1212\] transition-all shadow-\[var\(--shadow-md\)\]"\s*title="Remove from cart"\s*>\s*<Minus className="w-4 h-4 md:w-5 md:h-5" \/>\s*<\/button>\s*\);\s*\}\s*return \(\s*<button\s*onClick=\{\(e\) => handleAddToCart\(e, design\)\}\s*className="w-10 h-10 md:w-12 md:h-12 bg-\[var\(--accent\)\] text-white rounded-full flex items-center justify-center hover:bg-\[var\(--accent-hover\)\] hover:scale-110 transition-all shadow-\[var\(--shadow-md\)\]"\s*>\s*<Plus className="w-4 h-4 md:w-5 md:h-5" \/>\s*<\/button>\s*\);\s*\}\)\(\)\}\s*<\/div>/g,
    ''
  );

  // Now, we inject the modified hover FAB at the end of the image container.
  // The image container ends with:
  //                             )}
  // 
  //                           </div>
  // Let's replace that specific closing with the injected FAB + closing.
  
  const modifiedFab = `{/* Hover FAB - Add to Cart / Quantity Controller */}
                            <div className={\`absolute opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-30 \${isFeatured ? 'bottom-8 right-8 md:bottom-12 md:right-12' : '-bottom-5 md:-bottom-6 right-4 md:right-6'}\`}>
                              {(() => {
                                const cartItem = cartItems.find(i => i.id === design.id);
                                if (cartItem) {
                                  return (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(design.id, 0);
                                        toast.success(\`\${design.name} removed from cart.\`);
                                      }}
                                      className="w-10 h-10 md:w-14 md:h-14 bg-[#ba1a1a] text-[var(--text-primary)] rounded-full flex items-center justify-center hover:bg-[#8a1212] transition-all shadow-xl"
                                      title="Remove from cart"
                                    >
                                      <Minus className="w-4 h-4 md:w-6 md:h-6" />
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    onClick={(e) => handleAddToCart(e, design)}
                                    className="w-10 h-10 md:w-14 md:h-14 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] hover:scale-110 transition-all shadow-xl"
                                  >
                                    <Plus className="w-4 h-4 md:w-6 md:h-6" />
                                  </button>
                                );
                              })()}
                            </div>
                          </div>`;
                          
  content = content.replace(
    /                            \)\}\s*<\/div>/g,
    `                            )}\n\n${modifiedFab}`
  );

  // Also remove `overflow-hidden` from the Link so the plus button can protrude out of it if it needs to.
  // className="h-full flex flex-col bg-[var(--bg-card)] md:bg-transparent rounded-2xl md:rounded-none overflow-hidden shadow-sm md:shadow-none border border-[var(--border-subtle)] md:border-none relative"
  content = content.replace(
    /className="h-full flex flex-col bg-\[var\(--bg-card\)\] md:bg-transparent rounded-2xl md:rounded-none overflow-hidden shadow-sm md:shadow-none border border-\[var\(--border-subtle\)\] md:border-none relative"/g,
    'className="h-full flex flex-col bg-[var(--bg-card)] md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-[var(--border-subtle)] md:border-none relative"'
  );

  fs.writeFileSync(catalogPath, content, 'utf8');
}

console.log('Fixed DesignsCatalog plus icon and RawMaterialDetail colors.');
