import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { FloorPlan, Room } from './types';
import { FurnitureModel } from './FurnitureModel';
import { usePlannerStore } from './store';

interface RoomMeshProps {
  room: Room;
  wallHeight: number;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const RoomMesh: React.FC<RoomMeshProps> = ({ room, wallHeight, isSelected, onClick }) => {
  const floorShape = useMemo(() => {
    const shape = new THREE.Shape();
    room.polygon.forEach(([x, z], index) => {
      if (index === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    return shape;
  }, [room.polygon]);

  const walls = useMemo(() => {
    const edges = [];
    for (let i = 0; i < room.polygon.length; i++) {
      const p1 = room.polygon[i];
      const p2 = room.polygon[(i + 1) % room.polygon.length];
      const dx = p2[0] - p1[0];
      const dz = p2[1] - p1[1];
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const cx = (p1[0] + p2[0]) / 2;
      const cz = (p1[1] + p2[1]) / 2;
      edges.push({ cx, cz, length, angle });
    }
    return edges;
  }, [room.polygon]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onClick(room.id);
  };

  const baseWallColor = room.materials?.wallColorHex || '#e5e7eb';
  const wallColor = baseWallColor;

  const defaultFloorColors: Record<string, string> = {
    bedroom: '#dbeafe',
    living: '#fef3c7',
    kitchen: '#dcfce7',
    bathroom: '#f3e8ff',
    balcony: '#f3f4f6'
  };
  const baseFloorColor = room.materials?.floorColorHex || room.color || defaultFloorColors[room.type] || '#f3f4f6';
  const floorColor = baseFloorColor;
  
  const emissive = isSelected ? '#222222' : '#000000';
  const wallEmissive = isSelected ? '#111111' : '#000000';

  const [floorTexture, setFloorTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let active = true;
    const url = room.materials?.floorTextureUrl;
    if (url) {
      new THREE.TextureLoader().load(url, (texture) => {
        if (!active) {
          texture.dispose();
          return;
        }
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.5, 0.5); // 1 repeat per 2 meters
        setFloorTexture(texture);
      });
    } else {
      setFloorTexture(null);
    }
    return () => {
      active = false;
    };
  }, [room.materials?.floorTextureUrl]);

  React.useEffect(() => {
    return () => {
      if (floorTexture) floorTexture.dispose();
    };
  }, [floorTexture]);

  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        onPointerDown={handlePointerDown}
      >
        <shapeGeometry args={[floorShape]} />
        <meshStandardMaterial 
          color={floorTexture ? '#ffffff' : floorColor} 
          map={floorTexture}
          emissive={emissive}
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Walls */}
      {walls.map((wall, index) => (
        <mesh 
          key={index} 
          position={[wall.cx, wallHeight / 2, wall.cz]} 
          rotation={[0, -wall.angle, 0]}
        >
          <boxGeometry args={[wall.length, wallHeight, 0.1]} />
          <meshStandardMaterial 
            color={wallColor} 
            emissive={wallEmissive}
          />
        </mesh>
      ))}
    </group>
  );
};

interface PlannerSceneProps {
  plan: FloorPlan;
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
}

export const PlannerScene: React.FC<PlannerSceneProps> = ({ plan, selectedRoomId, onSelectRoom }) => {
  const { setSelectedFurnitureId } = usePlannerStore();
  return (
    <div className="w-full h-full relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <Canvas camera={{ position: [0, 15, 20], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        
        <Bounds fit clip observe margin={1.2}>
          <group>
            {plan.rooms.map((room) => (
              <group key={room.id}>
                <RoomMesh 
                  room={room}
                  wallHeight={plan.wallHeight}
                  isSelected={selectedRoomId === room.id}
                  onClick={(id) => onSelectRoom(id)}
                />
                {room.furniture?.map((f) => (
                  <FurnitureModel key={f.instanceId} furniture={f} roomId={room.id} />
                ))}
              </group>
            ))}
          </group>
        </Bounds>

        {/* Click outside to deselect */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          onPointerDown={() => {
            onSelectRoom(null);
            setSelectedFurnitureId(null);
          }}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Grid 
          infiniteGrid 
          cellSize={1} 
          sectionSize={5} 
          fadeDistance={50} 
          fadeStrength={1} 
          cellColor="#d1d5db" 
          sectionColor="#9ca3af" 
        />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
};

