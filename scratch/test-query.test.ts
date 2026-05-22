import { describe, it } from 'vitest';
import { allProducts as rawMaterialsData } from '../src/lib/rawMaterialsData';

describe('rawMaterialsData count test', () => {
  it('should print the count and products', () => {
    console.log("rawMaterialsData length:", rawMaterialsData.length);
    console.log("premiumProducts:", rawMaterialsData.filter(p => p.id.toString().startsWith("new") && !isNaN(Number(p.id.toString().replace("new", ""))) && Number(p.id.toString().replace("new", "")) <= 30));
  });
});
