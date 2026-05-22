// Since RawMaterials.tsx imports from @/lib/rawMaterialsData,
// let's resolve the path to src/lib/rawMaterialsData.ts.
// We can use a dynamic import or ts-node, but since we want to run it in Node,
// we can write a self-contained ES module or use the compiled JS.
// Wait, we can just compile or run it using a ts-node or vite-node if available,
// or we can write a cjs script that reads and parses the JSON if we convert the ts to js.
// Even simpler, let's write a small script that loads the ts file using tsx or vite-node.
// Let's check if tsx or ts-node is installed in package.json.
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
console.log("devDependencies:", pkg.devDependencies);
console.log("dependencies:", pkg.dependencies);
