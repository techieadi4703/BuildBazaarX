import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { PlannerScene } from '@/components/planner/PlannerScene';
import { Editor2D } from '@/components/planner/Editor2D';
import { usePlannerStore } from '@/components/planner/store';
import { templates } from '@/components/planner/templates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Info, Save, FolderOpen, Plus, Trash2, Box, Move, RotateCw, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Room } from '@/components/planner/types';
import { Input } from '@/components/ui/input';
import { fallbackPaints, fallbackFloors, PaintSwatch, FloorMaterial } from '@/components/planner/materialsLibrary';
import { furnitureLibrary } from '@/components/planner/furnitureLibrary';
import { BomSummary } from '@/components/planner/BomSummary';

const calculateArea = (polygon: [number, number][]): number => {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }
  return Math.abs(area / 2);
};

const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const Planner = () => {
  const { plan, setPlan, mode, setMode, selectedRoomId, setSelectedRoomId, updateRoom, addRoom, deleteRoom, addFurniture, deleteFurniture, selectedFurnitureId, transformMode, setTransformMode } = usePlannerStore();
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [bomOpen, setBomOpen] = React.useState(false);
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return plan.rooms.find(r => r.id === selectedRoomId) || null;
  }, [selectedRoomId, plan]);

  const areaSqMeters = useMemo(() => {
    if (!selectedRoom) return 0;
    return calculateArea(selectedRoom.polygon);
  }, [selectedRoom]);

  const areaSqFt = areaSqMeters * 10.7639;
  const webGLAvailable = useMemo(() => isWebGLAvailable(), []);

  const { data: savedPlans } = useQuery({
    queryKey: ['floor_plans', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('floor_plans').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: dbMaterials } = useQuery({
    queryKey: ['supplier_products_materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('is_published', true);
      if (error) throw error;
      return data;
    }
  });

  const availablePaints = useMemo(() => {
    const dbPaints: PaintSwatch[] = (dbMaterials || [])
      .filter(p => p.hex_color || p.category === 'Paints & Finishes')
      .map(p => ({
        id: `db-${p.id}`,
        name: p.name,
        brand: p.brand || 'Unknown',
        hexColor: p.hex_color || '#ffffff',
        pricePerLitre: p.price,
        productId: p.id
      }));
    return [...fallbackPaints, ...dbPaints];
  }, [dbMaterials]);

  const availableFloors = useMemo(() => {
    const dbFloors: FloorMaterial[] = (dbMaterials || [])
      .filter(p => p.texture_url || p.category === 'Wood & Timber' || p.category === 'Tiles & Flooring')
      .map(p => ({
        id: `db-${p.id}`,
        name: p.name,
        brand: p.brand || 'Unknown',
        textureUrl: p.texture_url || undefined,
        fallbackColor: p.hex_color || '#cccccc',
        pricePerSqFt: p.price,
        productId: p.id
      }));
    return [...fallbackFloors, ...dbFloors];
  }, [dbMaterials]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not logged in");
      
      const existing = savedPlans?.find(p => p.id === plan.id);
      
      if (existing) {
        const { error } = await supabase.from('floor_plans').update({
          name: plan.name,
          plan_data: plan as any
        }).eq('id', plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('floor_plans').insert({
          id: plan.id.length === 36 ? plan.id : crypto.randomUUID(),
          user_id: userId,
          name: plan.name,
          plan_data: plan as any
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Plan saved successfully!");
      queryClient.invalidateQueries({ queryKey: ['floor_plans', userId] });
    },
    onError: (e: any) => {
      toast.error("Failed to save plan: " + e.message);
    }
  });

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save your plans", {
        action: { label: "Sign In", onClick: () => navigate('/auth') }
      });
      return;
    }
    setSaveDialogOpen(true);
  };

  const loadTemplate = (templateId: string) => {
    const tpl = templates[templateId];
    if (tpl) {
      setPlan({ ...tpl, id: crypto.randomUUID() });
      setSelectedRoomId(null);
    }
  };

  const handleAddRoom = () => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: "New Room",
      type: "bedroom",
      polygon: [[0, 0], [0, 3], [3, 3], [3, 0]] // 3x3m default
    };
    addRoom(newRoom);
    setSelectedRoomId(newRoom.id);
  };

  return (
    <Layout>
      <Helmet>
        <title>3D Home Planner – BuildBazaarX</title>
        <meta name="description" content="View 3D floor plans and explore home layouts on BuildBazaarX." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Home Planner</h1>
            <p className="text-gray-500 mt-2">Design your layout in 2D and visualize it in 3D.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> New Plan</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => loadTemplate('blank')}>Blank Canvas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => loadTemplate('1bhk')}>1BHK Template</DropdownMenuItem>
                <DropdownMenuItem onClick={() => loadTemplate('2bhk')}>2BHK Template</DropdownMenuItem>
                <DropdownMenuItem onClick={() => loadTemplate('3bhk')}>3BHK Template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><FolderOpen className="w-4 h-4 mr-2" /> My Plans</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {!isAuthenticated && <DropdownMenuItem disabled>Sign in to view plans</DropdownMenuItem>}
                {isAuthenticated && savedPlans?.length === 0 && <DropdownMenuItem disabled>No saved plans</DropdownMenuItem>}
                {savedPlans?.map(p => (
                  <DropdownMenuItem key={p.id} onClick={() => setPlan(p.plan_data as any)}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSaveClick} className="bg-[#735c00] hover:bg-[#8a6e00]">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            
            <Button onClick={() => setBomOpen(true)} className="bg-primary hover:bg-primary/90">
              <ShoppingCart className="w-4 h-4 mr-2" /> Review & Build
            </Button>
            
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Floor Plan</DialogTitle>
                  <DialogDescription>
                    Give your design a name before saving it to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Design Name</label>
                  <Input 
                    value={plan.name} 
                    onChange={(e) => setPlan({...plan, name: e.target.value})} 
                    placeholder="E.g. My Dream Home"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                  <Button 
                    className="bg-[#735c00] hover:bg-[#8a6e00]" 
                    onClick={() => {
                      saveMutation.mutate();
                      setSaveDialogOpen(false);
                    }}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? "Saving..." : "Save Design"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">
          <div className="flex-1 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <Tabs value={mode} onValueChange={(v) => setMode(v as '2d'|'3d')} className="w-full h-full flex flex-col">
              <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
                <Input 
                  value={plan.name} 
                  onChange={(e) => setPlan({...plan, name: e.target.value})} 
                  className="w-64 font-semibold text-lg border-transparent hover:border-gray-200 focus:border-gray-300 shadow-none h-9"
                />
                <TabsList>
                  <TabsTrigger value="2d">2D Editor</TabsTrigger>
                  <TabsTrigger value="3d">3D Viewer</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 h-full bg-gray-50 relative">
                <TabsContent value="2d" className="m-0 h-full w-full absolute inset-0">
                  <Editor2D />
                </TabsContent>
                
                <TabsContent value="3d" className="m-0 h-full w-full absolute inset-0">
                  {webGLAvailable ? (
                    <PlannerScene 
                      plan={plan} 
                      selectedRoomId={selectedRoomId} 
                      onSelectRoom={setSelectedRoomId} 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                      <div className="max-w-md space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <Info className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">WebGL is Disabled or Unsupported</h3>
                        <p className="text-gray-600 text-sm">We could not initialize a WebGL context. WebGL is required to render the 3D floor plan.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-4">
            <Card className="shadow-sm border-gray-200 h-full flex flex-col">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
                <div>
                  <CardTitle className="text-xl">Room Details</CardTitle>
                  <CardDescription>Select a room in the editor</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddRoom}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
                {selectedRoom ? (
                  <div className="flex flex-col h-full gap-4">
                    <Tabs defaultValue="general" className="flex flex-col flex-1 min-h-0">
                      <TabsList className="w-full grid grid-cols-4 shrink-0">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="walls">Walls</TabsTrigger>
                        <TabsTrigger value="floor">Floor</TabsTrigger>
                        <TabsTrigger value="furnish">Furnish</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="general" className="flex-1 overflow-y-auto mt-4 pr-1 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Room Name</label>
                            <Input 
                              value={selectedRoom.name}
                              onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">2D Map Color</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[
                                '#f3f4f6', '#dbeafe', '#fef3c7', '#dcfce7', '#f3e8ff', '#ffe4e6', '#ffedd5', '#ccfbf1'
                              ].map((c) => {
                                const defaultColor = {
                                  bedroom: '#dbeafe',
                                  living: '#fef3c7',
                                  kitchen: '#dcfce7',
                                  bathroom: '#f3e8ff',
                                  balcony: '#f3f4f6'
                                }[selectedRoom.type] || '#f3f4f6';
                                const isSelected = selectedRoom.color === c || (!selectedRoom.color && c === defaultColor);
                                
                                return (
                                  <button
                                    key={c}
                                    onClick={() => updateRoom(selectedRoom.id, { color: c })}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${isSelected ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105 shadow-sm hover:shadow-md'}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="walls" className="flex-1 overflow-y-auto mt-4 pr-1">
                        <div className="grid grid-cols-2 gap-3 pb-1">
                          {availablePaints.map(paint => (
                            <button
                              key={paint.id}
                              onClick={() => updateRoom(selectedRoom.id, { materials: { ...selectedRoom.materials, wallColorHex: paint.hexColor, wallProductId: paint.productId } })}
                              className={`text-left p-2 rounded-lg border-2 transition-all ${selectedRoom.materials?.wallColorHex === paint.hexColor ? 'border-[#735c00] bg-amber-50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                            >
                              <div className="w-full h-8 rounded mb-2 shadow-inner" style={{ backgroundColor: paint.hexColor }} />
                              <p className="text-xs font-semibold truncate" title={paint.name}>{paint.name}</p>
                              <p className="text-[10px] text-gray-500 truncate" title={paint.brand}>{paint.brand}</p>
                              <p className="text-[10px] font-medium text-amber-700 mt-1">₹{paint.pricePerLitre}/L</p>
                            </button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="floor" className="flex-1 overflow-y-auto mt-4 pr-1">
                        <div className="grid grid-cols-2 gap-3 pb-1">
                          {availableFloors.map(floor => (
                            <button
                              key={floor.id}
                              onClick={() => updateRoom(selectedRoom.id, { materials: { ...selectedRoom.materials, floorTextureUrl: floor.textureUrl, floorColorHex: floor.fallbackColor, floorProductId: floor.productId } })}
                              className={`text-left p-2 rounded-lg border-2 transition-all ${((selectedRoom.materials?.floorTextureUrl === floor.textureUrl && selectedRoom.materials?.floorTextureUrl) || (!selectedRoom.materials?.floorTextureUrl && selectedRoom.materials?.floorColorHex === floor.fallbackColor)) ? 'border-[#735c00] bg-amber-50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                            >
                              <div 
                                className="w-full h-12 rounded mb-2 shadow-inner bg-cover bg-center" 
                                style={{ 
                                  backgroundColor: floor.fallbackColor,
                                  backgroundImage: floor.textureUrl ? `url(${floor.textureUrl})` : 'none'
                                }} 
                              />
                              <p className="text-xs font-semibold truncate" title={floor.name}>{floor.name}</p>
                              <p className="text-[10px] text-gray-500 truncate" title={floor.brand}>{floor.brand}</p>
                              <p className="text-[10px] font-medium text-amber-700 mt-1">₹{floor.pricePerSqFt}/sq.ft</p>
                            </button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="furnish" className="flex-1 overflow-y-auto mt-4 pr-1">
                        <div className="grid grid-cols-2 gap-3 pb-1">
                          {furnitureLibrary.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                let cx = 0, cz = 0;
                                selectedRoom.polygon.forEach(p => {
                                  cx += p[0];
                                  cz += p[1];
                                });
                                cx /= selectedRoom.polygon.length;
                                cz /= selectedRoom.polygon.length;
                                
                                // Place items in a tidy grid 1.5 meters apart based on existing count
                                const existingCount = selectedRoom.furniture?.length || 0;
                                const offsetX = ((existingCount % 3) - 1) * 1.5; 
                                const offsetZ = (Math.floor(existingCount / 3) - 1) * 1.5;
                                
                                addFurniture(selectedRoom.id, {
                                  instanceId: crypto.randomUUID(),
                                  libraryId: item.id,
                                  position: [cx + offsetX, 0, cz + offsetZ],
                                  rotationY: 0,
                                  scale: item.defaultScale,
                                });
                              }}
                              className="text-left p-2 rounded-lg border-2 border-gray-100 hover:border-gray-300 transition-all flex flex-col items-center justify-center text-center bg-white"
                            >
                              <div className="w-12 h-12 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                                <Box className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-semibold truncate w-full" title={item.name}>{item.name}</p>
                              <p className="text-[10px] text-gray-500 capitalize">{item.category}</p>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="shrink-0 mt-auto pt-2 space-y-4">
                      {selectedFurnitureId ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                          <p className="text-sm text-blue-800 font-medium">Selected Furniture</p>
                          <div className="flex gap-2">
                            <Button 
                              variant={transformMode === 'translate' ? 'default' : 'outline'} 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setTransformMode('translate')}
                            >
                              <Move className="w-4 h-4 mr-2" /> Move
                            </Button>
                            <Button 
                              variant={transformMode === 'rotate' ? 'default' : 'outline'} 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setTransformMode('rotate')}
                            >
                              <RotateCw className="w-4 h-4 mr-2" /> Rotate
                            </Button>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => deleteFurniture(selectedRoom.id, selectedFurnitureId)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Item
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                          <p className="text-sm text-amber-800 font-medium mb-1">Floor Area</p>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-amber-900">{areaSqFt.toFixed(1)}</span>
                            <span className="text-amber-700 pb-1">sq ft</span>
                          </div>
                          <p className="text-xs text-amber-600 mt-1">({areaSqMeters.toFixed(1)} m²)</p>
                        </div>
                      )}
  
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteRoom(selectedRoom.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-3">
                    <Info className="w-12 h-12 stroke-1 text-gray-300" />
                    <p>Click on any room in the floor plan to view its detailed dimensions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BomSummary open={bomOpen} onOpenChange={setBomOpen} />
    </Layout>
  );
};

export default Planner;
