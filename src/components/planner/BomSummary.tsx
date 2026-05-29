import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlannerStore } from './store';
import { buildBom } from './bom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ShoppingCart, LogIn, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const BomSummary = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { plan } = usePlannerStore();
  const [gstPct, setGstPct] = useState(18); // Default fallback
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch GST from platform settings
  useEffect(() => {
    if (open) {
      supabase.from('platform_settings').select('*').then(({ data }) => {
        if (data) {
          const gstSetting = data.find((s: any) => s.key === 'gst_pct');
          if (gstSetting && gstSetting.value) {
            setGstPct(parseFloat(gstSetting.value as string));
          }
        }
      });
    }
  }, [open]);

  if (!plan) return null;

  const bomItems = buildBom(plan);

  // Group items by category for UI
  const paints = bomItems.filter(i => i.category === 'paint');
  const flooring = bomItems.filter(i => i.category === 'flooring');
  const furniture = bomItems.filter(i => i.category === 'furniture');

  // Subtotals
  const materialsSubtotal = bomItems.reduce((sum, item) => sum + item.lineTotal, 0);
  
  // Execution Costs logic (approximate fallback based on area/counts)
  // Re-deriving approximate sq ft from paint and flooring quantities for labor calculations
  const paintAreaSqFt = paints.reduce((sum, i) => sum + (i.quantity * 110 / 2), 0); 
  const floorAreaSqFt = flooring.reduce((sum, i) => sum + i.quantity, 0);
  const furnCount = furniture.reduce((sum, i) => sum + i.quantity, 0);

  const paintLabor = paintAreaSqFt * 15; // ₹15 per sq.ft
  const floorLabor = floorAreaSqFt * 50; // ₹50 per sq.ft
  const furnLabor = furnCount * 500;     // ₹500 per piece
  const executionCost = paintLabor + floorLabor + furnLabor;

  const subtotal = materialsSubtotal + executionCost;
  const gstAmount = (subtotal * gstPct) / 100;
  const grandTotal = subtotal + gstAmount;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout your design.');
      navigate('/auth');
      return;
    }

    setIsAdding(true);
    let addedCount = 0;

    bomItems.forEach(item => {
      // Use productId if available (for exact catalog matches), else fallback to generated ID for visual tracking.
      // If we don't have a real productId, the cart might not fully process it in checkout, 
      // but it serves as an actionable line item in the visual cart estimate.
      const cartItemId = item.productId || item.id;
      
      const success = addToCart({
        id: cartItemId,
        name: item.name,
        brand: item.brand || 'BuildBazaarX Partners',
        image: item.image || '/placeholder.svg',
        price: item.unitPrice,
        originalPrice: item.unitPrice,
        specs: `Estimated ${item.category} requirement for 3D plan`,
        priceUnit: item.unit
      });

      if (success) {
        // Because addToCart defaults to qty 1, we must manually update it to the BOM quantity
        updateQuantity(cartItemId, item.quantity);
        addedCount++;
      }
    });

    setIsAdding(false);
    if (addedCount > 0) {
      toast.success(`Successfully added ${addedCount} required items to your cart!`);
      onOpenChange(false);
      navigate('/checkout');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            Review & Build
          </SheetTitle>
          <SheetDescription>
            Itemized Bill of Materials and execution estimates for {plan.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Raw Materials & Furniture</span>
                <span className="text-sm font-normal text-muted-foreground">{bomItems.length} items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Details</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-sm leading-tight">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {item.category} • {item.brand}
                          {item.productId && (
                            <span className="ml-2 inline-flex items-center text-primary" title="Linked to Catalog">
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-muted-foreground text-sm">
                        ₹{item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        ₹{item.lineTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bomItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No materials or furniture placed in this plan yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-lg">Estimated Execution (Labor)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {paintLabor > 0 && (
                    <TableRow>
                      <TableCell className="text-sm font-medium">Painting Labor</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">@ ₹15 / sq.ft</TableCell>
                      <TableCell className="text-right font-medium text-sm">₹{Math.round(paintLabor).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {floorLabor > 0 && (
                    <TableRow>
                      <TableCell className="text-sm font-medium">Tile & Flooring Laying</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">@ ₹50 / sq.ft</TableCell>
                      <TableCell className="text-right font-medium text-sm">₹{Math.round(floorLabor).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {furnLabor > 0 && (
                    <TableRow>
                      <TableCell className="text-sm font-medium">Furniture Assembly & Install</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">@ ₹500 / piece</TableCell>
                      <TableCell className="text-right font-medium text-sm">₹{Math.round(furnLabor).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {executionCost === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4 text-sm">
                        Add materials to calculate execution costs.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Materials Subtotal</span>
                  <span className="font-medium">₹{materialsSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Execution Subtotal</span>
                  <span className="font-medium">₹{Math.round(executionCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">GST ({gstPct}%)</span>
                  <span className="font-medium">₹{Math.round(gstAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-3 border-t border-primary/20">
                  <span>Grand Total Estimate</span>
                  <span className="text-primary">₹{Math.round(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-6">
              <Button 
                className="w-full text-base font-semibold py-6" 
                size="lg" 
                onClick={handleAddToCart} 
                disabled={isAdding || bomItems.length === 0}
              >
                {isAuthenticated ? (
                  <><ShoppingCart className="mr-2 h-5 w-5" /> Push to Cart & Checkout</>
                ) : (
                  <><LogIn className="mr-2 h-5 w-5" /> Sign in to Checkout</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
