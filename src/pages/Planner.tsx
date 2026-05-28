import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { PlannerScene } from '@/components/planner/PlannerScene';
import { samplePlan } from '@/components/planner/samplePlan';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

// Shoelace formula to calculate polygon area
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
    return !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

const Planner = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return samplePlan.rooms.find(r => r.id === selectedRoomId) || null;
  }, [selectedRoomId]);

  const areaSqMeters = useMemo(() => {
    if (!selectedRoom) return 0;
    return calculateArea(selectedRoom.polygon);
  }, [selectedRoom]);

  const areaSqFt = areaSqMeters * 10.7639;
  const webGLAvailable = useMemo(() => isWebGLAvailable(), []);

  return (
    <Layout>
      <Helmet>
        <title>3D Home Planner – BuildBazaarX</title>
        <meta name="description" content="View 3D floor plans and explore home layouts on BuildBazaarX." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">3D Home Planner</h1>
          <p className="text-gray-500 mt-2">Explore the {samplePlan.name} layout in 3D. Click on a room to see details.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 3D Canvas Container */}
          <div className="flex-1 min-h-[60vh] lg:min-h-[70vh] rounded-xl overflow-hidden shadow-sm">
            {webGLAvailable ? (
              <PlannerScene 
                plan={samplePlan} 
                selectedRoomId={selectedRoomId} 
                onSelectRoom={setSelectedRoomId} 
              />
            ) : (
              <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <div className="max-w-md space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">WebGL is Disabled or Unsupported</h3>
                  <p className="text-gray-600 text-sm">
                    We could not initialize a WebGL context. WebGL is required to render the 3D floor plan.
                  </p>
                  <div className="text-left bg-white p-4 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-2">
                    <p className="font-semibold text-gray-700">How to fix this:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Ensure <strong>Hardware Acceleration</strong> is enabled in your browser settings (Settings &rarr; System &rarr; Use graphics acceleration when available).</li>
                      <li>If you are using Chrome DevTools device simulation (e.g. iPhone 14 Pro Max), try toggling the mobile device toolbar off and on, or reload the page without simulation.</li>
                      <li>Check if WebGL works in your browser by visiting <a href="https://get.webgl.org" target="_blank" rel="noreferrer" className="text-[#735c00] underline font-semibold">get.webgl.org</a>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <Card className="shadow-sm border-gray-200 h-full">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-xl">Room Details</CardTitle>
                <CardDescription>Select a room in the 3D viewer</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {selectedRoom ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{selectedRoom.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {selectedRoom.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-800 font-medium mb-1">Floor Area</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-amber-900">
                            {areaSqFt.toFixed(1)}
                          </span>
                          <span className="text-amber-700 pb-1">sq ft</span>
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          ({areaSqMeters.toFixed(1)} m²)
                        </p>
                      </div>
                    </div>
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
