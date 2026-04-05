import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Hammer,
  BrickWall,
  Paintbrush,
  Zap,
  Droplets,
  Gem,
  GlassWater,
  Layers,
  Wrench,
  ShoppingCart,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const workerMaterials = [
  {
    workerType: "Carpenter",
    workType: "Furniture, cabinets, panels",
    materials: "Plywood, laminate, edge band, screws, adhesive",
    defaultQty: 120,
    unit: "sq.ft",
    icon: Hammer,
    category: "wood",
  },
  {
    workerType: "Mason",
    workType: "Tiles, plaster, civil work",
    materials: "Tiles, cement, sand, grout",
    defaultQty: 80,
    unit: "sq.ft",
    icon: BrickWall,
    category: "tiles",
  },
  {
    workerType: "Painter",
    workType: "Paint, polish, texture",
    materials: "Putty, primer, paint, polish",
    defaultQty: 200,
    unit: "sq.ft",
    icon: Paintbrush,
    category: "paints",
  },
  {
    workerType: "Electrician",
    workType: "Wiring, lights",
    materials: "Wires, switches, LED lights, conduits",
    defaultQty: 15,
    unit: "points",
    icon: Zap,
    category: "electrical",
  },
  {
    workerType: "Plumber",
    workType: "Water & sanitary",
    materials: "Pipes, fittings, valves, seal tape",
    defaultQty: 8,
    unit: "points",
    icon: Droplets,
    category: "plumbing",
  },
  {
    workerType: "Marble/Granite Worker",
    workType: "Countertops, stone",
    materials: "Granite/quartz slab, adhesive, polish",
    defaultQty: 25,
    unit: "sq.ft",
    icon: Gem,
    category: "tiles",
  },
  {
    workerType: "Glass/Aluminium Worker",
    workType: "Glass partitions, windows",
    materials: "Glass sheets, aluminium sections, sealant",
    defaultQty: 30,
    unit: "sq.ft",
    icon: GlassWater,
    category: "hardware",
  },
  {
    workerType: "False Ceiling Worker",
    workType: "Gypsum/POP ceiling",
    materials: "Gypsum boards, metal channels, screws",
    defaultQty: 100,
    unit: "sq.ft",
    icon: Layers,
    category: "construction",
  },
  {
    workerType: "Helper",
    workType: "Support work",
    materials: "General consumables, fasteners, cleaning materials",
    defaultQty: 1,
    unit: "set",
    icon: Wrench,
    category: "hardware",
  },
];

export const DesignPricingCalculator = () => {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    () => Object.fromEntries(workerMaterials.map((w, i) => [i, w.defaultQty]))
  );

  const updateQuantity = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [index]: num }));
  };

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <Card className="shadow-lg border-0 relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Raw Materials Required for This Design
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Materials needed by each worker type — click Buy to browse and purchase.
            </p>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Worker Type</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Work Type</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Raw Materials Used</TableHead>
                    <TableHead className="font-semibold text-center w-32">Est. Quantity</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerMaterials.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">{item.workerType}</span>
                              <p className="text-xs text-muted-foreground md:hidden">{item.workType}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {item.workType}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                          {item.materials}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Input
                              type="number"
                              min={0}
                              value={quantities[index]}
                              onChange={(e) => updateQuantity(index, e.target.value)}
                              className="w-20 h-8 text-center text-sm"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            asChild
                          >
                            <Link to={`/materials?category=${item.category}`}>
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Buy
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 md:px-6 bg-accent/10 border-t border-accent/20">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent font-bold">💡</span>
                Click "Buy" to browse and purchase raw materials for each work type from our verified sellers.
              </p>
            </div>
          </CardContent>

          {/* Sticky Buy All Bar */}
          <div className="sticky bottom-0 bg-primary text-primary-foreground p-4 rounded-b-lg flex items-center justify-between">
            <span className="font-semibold text-sm md:text-base">
              Need all materials? Buy everything in one go →
            </span>
            <Button variant="secondary" size="sm" className="rounded-full" asChild>
              <Link to="/materials">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse All Materials
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
