import { useState } from "react";
import {
  Hammer,
  BrickWall,
  Paintbrush,
  Zap,
  Droplets,
  Diamond,
  GlassWater,
  Layers,
  Users,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const executionData = [
  {
    worker: "Carpenter",
    workType: "Furniture & Modular Work",
    included: "Cabinets, wardrobes, panels, storage, cutting, assembly, fitting",
    rate: 320,
    icon: Hammer,
  },
  {
    worker: "Mason",
    workType: "Civil & Tile Work",
    included: "Wall prep, plaster, tile laying, platform",
    rate: 140,
    icon: BrickWall,
  },
  {
    worker: "Painter",
    workType: "Finishing Work",
    included: "Putty, primer, paint, polish, texture",
    rate: 90,
    icon: Paintbrush,
  },
  {
    worker: "Electrician",
    workType: "Electrical Work",
    included: "Wiring, switches, lighting points",
    rate: 70,
    icon: Zap,
  },
  {
    worker: "Plumber",
    workType: "Plumbing Work",
    included: "Sink fitting, pipelines, drainage",
    rate: 60,
    icon: Droplets,
  },
  {
    worker: "Marble/Granite Worker",
    workType: "Countertop Work",
    included: "Cutting, polishing, fitting",
    rate: 110,
    icon: Diamond,
  },
  {
    worker: "Glass/Aluminium Worker",
    workType: "Glass & Window Work",
    included: "Partitions, mirrors, sliding windows",
    rate: 95,
    icon: GlassWater,
  },
  {
    worker: "False Ceiling Worker",
    workType: "Ceiling Work",
    included: "Gypsum frame, board fitting, finishing",
    rate: 130,
    icon: Layers,
  },
];

export const ExecutionCostBreakdown = () => {
  const [area, setArea] = useState<number>(120);

  const totalRate = executionData.reduce((sum, item) => sum + item.rate, 0);
  const totalCost = totalRate * area;

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Execution Cost Breakdown
              <Badge variant="outline" className="ml-auto">
                Rate per Sq.ft
              </Badge>
            </CardTitle>

            {/* Area Input */}
            <div className="flex items-center gap-3 mt-4 max-w-xs">
              <Label htmlFor="area-input" className="whitespace-nowrap font-semibold">
                <Calculator className="inline h-4 w-4 mr-1" />
                Total Area
              </Label>
              <div className="relative flex-1">
                <Input
                  id="area-input"
                  type="number"
                  min={1}
                  value={area}
                  onChange={(e) => setArea(Math.max(1, Number(e.target.value) || 1))}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  sq.ft
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6 md:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Worker Type</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Work Type</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Included Work</TableHead>
                    <TableHead className="font-semibold text-right">Rate (₹/sq.ft)</TableHead>
                    <TableHead className="font-semibold text-right">Cost (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executionData.map((item, index) => {
                    const Icon = item.icon;
                    const cost = item.rate * area;
                    return (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <span>{item.worker}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                          {item.workType}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                          {item.included}
                        </TableCell>
                        <TableCell className="text-right font-semibold">₹{item.rate}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ₹{cost.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Total Row */}
                  <TableRow className="bg-primary/5 font-bold border-t-2 border-primary/20">
                    <TableCell colSpan={3} className="text-foreground hidden md:table-cell">
                      Total Execution Rate
                    </TableCell>
                    <TableCell colSpan={2} className="text-foreground md:hidden">
                      Total Execution Rate
                    </TableCell>
                    <TableCell className="text-right text-primary text-lg hidden md:table-cell">
                      ₹{totalRate} / sq.ft
                    </TableCell>
                    <TableCell className="text-right text-primary text-lg md:hidden">
                      ₹{totalRate}/sq.ft
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Sticky Total Bar */}
            <div className="sticky bottom-0 p-4 md:px-6 bg-primary text-primary-foreground rounded-b-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span className="font-semibold text-sm md:text-base">
                  Overall Execution Cost ({area} sq.ft)
                </span>
              </div>
              <span className="text-xl md:text-2xl font-bold">
                ₹{totalCost.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
