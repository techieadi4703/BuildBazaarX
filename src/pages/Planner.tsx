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
import { Info, Save, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Room } from '@/components/planner/types';
import { Input } from '@/components/ui/input';

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
  const { mode, plan, selectedRoomId, setMode, setPlan, setSelectedRoomId, updateRoom, addRoom, deleteRoom } = usePlannerStore();
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
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
            <Card className="shadow-sm border-gray-200 h-full">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Room Details</CardTitle>
                  <CardDescription>Select a room in the editor</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddRoom}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {selectedRoom ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Room Name</label>
                        <Input 
                          value={selectedRoom.name}
                          onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Room Color</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            '#f3f4f6', // Gray
                            '#dbeafe', // Blue
                            '#fef3c7', // Amber
                            '#dcfce7', // Green
                            '#f3e8ff', // Purple
                            '#ffe4e6', // Rose
                            '#ffedd5', // Orange
                            '#ccfbf1'  // Teal
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

                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{selectedRoom.type}</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <p className="text-sm text-amber-800 font-medium mb-1">Floor Area</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-amber-900">{areaSqFt.toFixed(1)}</span>
                        <span className="text-amber-700 pb-1">sq ft</span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">({areaSqMeters.toFixed(1)} m²)</p>
                    </div>

                    <Button variant="destructive" className="w-full mt-4" onClick={() => deleteRoom(selectedRoom.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                    </Button>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-center space-y-3">
                    <Info className="w-12 h-12 stroke-1 text-gray-300" />
                    <p>Click on any room in the floor plan to view its detailed dimensions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Planner;
