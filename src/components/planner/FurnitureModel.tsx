import React, { useMemo } from 'react';
import { useGLTF, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { PlacedFurniture } from './types';
import { usePlannerStore } from './store';
import { furnitureLibrary } from './furnitureLibrary';

interface FurnitureModelProps {
  furniture: PlacedFurniture;
  roomId: string;
}

export const FurnitureModel: React.FC<FurnitureModelProps> = ({ furniture, roomId }) => {
  const libraryItem = furnitureLibrary.find((item) => item.id === furniture.libraryId);
  const { selectedFurnitureId, setSelectedFurnitureId, updateFurniture, transformMode } = usePlannerStore();
  
  const isSelected = selectedFurnitureId === furniture.instanceId;
  
  // Safe load if missing url
  const { scene } = useGLTF(libraryItem?.modelUrl || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb');
  
  // Clone scene so multiple instances of same GLB can exist
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  if (!libraryItem) return null;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setSelectedFurnitureId(furniture.instanceId);
  };

  if (isSelected) {
    return (
      <TransformControls
        mode={transformMode}
        showY={transformMode === 'translate' ? false : true} // Lock Y translation
        showX={transformMode === 'translate' || transformMode === 'rotate' ? true : false}
        showZ={transformMode === 'translate' || transformMode === 'rotate' ? true : false}
        position={furniture.position}
        rotation={[0, furniture.rotationY, 0]}
        scale={[furniture.scale, furniture.scale, furniture.scale]}
        onMouseUp={(e: any) => {
          if (e?.target?.object) {
            const obj = e.target.object;
            updateFurniture(roomId, furniture.instanceId, {
              position: [obj.position.x, 0, obj.position.z], // Ensure it stays on the floor
              rotationY: obj.rotation.y,
            });
          }
        }}
      >
        <group onPointerDown={handlePointerDown}>
          <primitive object={clonedScene} />
        </group>
      </TransformControls>
    );
  }

  return (
    <group
      position={furniture.position}
      rotation={[0, furniture.rotationY, 0]}
      scale={[furniture.scale, furniture.scale, furniture.scale]}
      onPointerDown={handlePointerDown}
    >
      <primitive object={clonedScene} />
    </group>
  );
};
