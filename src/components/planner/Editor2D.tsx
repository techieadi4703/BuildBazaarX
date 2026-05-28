import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Shape } from 'react-konva';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { usePlannerStore } from './store';
import { Room } from './types';

const SCALE = 40; // 40px = 1 metre
const SNAP = 0.25; // Snap to 0.25 metres

let cachedEditorState: { scale: number, x: number, y: number } | null = null;
let lastPlanId: string | null = null;

// Helper to extract Rect bounds from polygon (assuming axis-aligned rectangle)
const getRectFromPolygon = (polygon: [number, number][]) => {
  if (polygon.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = polygon.map(p => p[0]);
  const ys = polygon.map(p => p[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
};

// Helper to rebuild polygon from Rect bounds
const getPolygonFromRect = (x: number, y: number, width: number, height: number): [number, number][] => {
  return [
    [x, y],
    [x, y + height],
    [x + width, y + height],
    [x + width, y]
  ];
};

interface RoomShapeProps {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newRoom: Room) => void;
}

const RoomShape: React.FC<RoomShapeProps> = ({ room, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const rect = getRectFromPolygon(room.polygon);
  const widthFt = (rect.width * 3.28084).toFixed(1);
  const heightFt = (rect.height * 3.28084).toFixed(1);

  const fillColors = {
    bedroom: '#dbeafe', // blue-100
    living: '#fef3c7',  // amber-100
    kitchen: '#dcfce7', // green-100
    bathroom: '#f3e8ff',// purple-100
    balcony: '#f3f4f6'  // gray-100
  };

  const color = room.color || fillColors[room.type] || '#f3f4f6';
  const strokeColor = isSelected ? '#735c00' : '#9ca3af';

  return (
    <React.Fragment>
      <Group
        x={rect.x * SCALE}
        y={rect.y * SCALE}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          if (e.target !== e.currentTarget) return;

          let x = Math.round(e.target.x() / SCALE / SNAP) * SNAP;
          let y = Math.round(e.target.y() / SCALE / SNAP) * SNAP;
          
          onChange({
            ...room,
            polygon: getPolygonFromRect(x, y, rect.width, rect.height)
          });
        }}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'move';
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'grab';
        }}
      >
        <Rect
          ref={shapeRef}
          width={rect.width * SCALE}
          height={rect.height * SCALE}
          fill={color}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 1}
          shadowBlur={isSelected ? 10 : 2}
          shadowColor="rgba(0,0,0,0.2)"
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            
            const rectX = node.x();
            const rectY = node.y();

            node.scaleX(1);
            node.scaleY(1);
            node.x(0);
            node.y(0);

            let newWidth = Math.round((rect.width * scaleX) / SNAP) * SNAP;
            let newHeight = Math.round((rect.height * scaleY) / SNAP) * SNAP;
            newWidth = Math.max(SNAP, newWidth);
            newHeight = Math.max(SNAP, newHeight);

            const newWorldX = Math.round((rect.x + rectX / SCALE) / SNAP) * SNAP;
            const newWorldY = Math.round((rect.y + rectY / SCALE) / SNAP) * SNAP;

            onChange({
              ...room,
              polygon: getPolygonFromRect(newWorldX, newWorldY, newWidth, newHeight)
            });
          }}
        />
        <Text
          text={`${room.name}\n${widthFt}' x ${heightFt}'`}
          width={rect.width * SCALE}
          height={rect.height * SCALE}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="#374151"
          padding={4}
          listening={false}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < SCALE * SNAP || newBox.height < SCALE * SNAP) {
              return oldBox;
            }
            return newBox;
          }}
          flipEnabled={false}
          rotateEnabled={false} // Disable rotation for now to keep axis-aligned
        />
      )}
    </React.Fragment>
  );
};

export const Editor2D: React.FC = () => {
  const { plan, selectedRoomId, setSelectedRoomId, updateRoom } = usePlannerStore();
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom State
  const [scale, setScale] = useState(cachedEditorState?.scale || 1);
  const [position, setPosition] = useState({ x: cachedEditorState?.x || 0, y: cachedEditorState?.y || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(!!cachedEditorState && lastPlanId === plan.id);

  // Cache state to survive unmounts (e.g. switching to 3D tab and back)
  useEffect(() => {
    if (hasInitialized) {
      cachedEditorState = { scale, x: position.x, y: position.y };
      lastPlanId = plan.id;
    }
  }, [scale, position, plan.id, hasInitialized]);

  // Resize handler using ResizeObserver to handle tab changes and element resizing correctly
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync cursor style on stage content container
  useEffect(() => {
    if (containerRef.current) {
      const stageContent = containerRef.current.querySelector('.konvajs-content') as HTMLElement;
      if (stageContent) {
        stageContent.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    }
  }, [isDragging]);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedRoomId(null);
    }
  };

  // Bounding box of the plan
  const getPlanBounds = () => {
    if (!plan.rooms || plan.rooms.length === 0) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    plan.rooms.forEach(room => {
      const rect = getRectFromPolygon(room.polygon);
      const x1 = rect.x * SCALE;
      const y1 = rect.y * SCALE;
      const x2 = (rect.x + rect.width) * SCALE;
      const y2 = (rect.y + rect.height) * SCALE;
      
      if (x1 < minX) minX = x1;
      if (y1 < minY) minY = y1;
      if (x2 > maxX) maxX = x2;
      if (y2 > maxY) maxY = y2;
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const fitToScreen = () => {
    if (!plan.rooms || plan.rooms.length === 0) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }
    const bounds = getPlanBounds();
    const padding = 60; // Padding around the plan
    
    const scaleX = (containerSize.width - padding * 2) / bounds.width;
    const scaleY = (containerSize.height - padding * 2) / bounds.height;
    
    let newScale = Math.min(scaleX, scaleY);
    if (!isFinite(newScale) || newScale <= 0) {
      newScale = 1;
    }
    // Clamp zoom scale
    newScale = Math.max(0.3, Math.min(2.5, newScale));

    const x = (containerSize.width - bounds.width * newScale) / 2 - bounds.x * newScale;
    const y = (containerSize.height - bounds.height * newScale) / 2 - bounds.y * newScale;

    setScale(newScale);
    setPosition({ x, y });
  };

  // Center/Fit to screen on first render when dimensions are ready
  useEffect(() => {
    if (containerSize.width > 100 && plan.rooms.length > 0 && !hasInitialized) {
      fitToScreen();
      setHasInitialized(true);
    }
  }, [containerSize.width, plan.rooms.length, hasInitialized]);

  // Center when plan changes (e.g. switching templates or loading new plan)
  useEffect(() => {
    if (hasInitialized && plan.rooms.length > 0) {
      fitToScreen();
    }
  }, [plan.id]);

  // Handle zoom on mouse wheel
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = scale;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Mouse position relative to drawing coordinates
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const boundedScale = Math.max(0.2, Math.min(4, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };

    setScale(boundedScale);
    setPosition(newPos);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => {
      const newScale = Math.min(4, prevScale * 1.2);
      setPosition((prevPos) => {
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const localX = (centerX - prevPos.x) / prevScale;
        const localY = (centerY - prevPos.y) / prevScale;
        return {
          x: centerX - localX * newScale,
          y: centerY - localY * newScale,
        };
      });
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(0.2, prevScale / 1.2);
      setPosition((prevPos) => {
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const localX = (centerX - prevPos.x) / prevScale;
        const localY = (centerY - prevPos.y) / prevScale;
        return {
          x: centerX - localX * newScale,
          y: centerY - localY * newScale,
        };
      });
      return newScale;
    });
  };

  // Generate grid line calculations dynamically based on stage position and scale
  const gridSize = SNAP * SCALE; // 10px
  const localMinX = -position.x / scale;
  const localMaxX = (containerSize.width - position.x) / scale;
  const localMinY = -position.y / scale;
  const localMaxY = (containerSize.height - position.y) / scale;

  const startX = Math.floor(localMinX / gridSize) * gridSize;
  const endX = localMaxX;
  const startY = Math.floor(localMinY / gridSize) * gridSize;
  const endY = localMaxY;

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative overflow-hidden select-none">
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        onDragStart={(e) => {
          if (e.target === e.target.getStage()) {
            setIsDragging(true);
          }
        }}
        onDragMove={(e) => {
          if (e.target === e.target.getStage()) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setIsDragging(false);
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        onWheel={handleWheel}
      >
        <Layer>
          {/* Dynamic Grid Layer */}
          <Shape
            sceneFunc={(context, shape) => {
              // Draw minor grid lines
              context.beginPath();
              for (let x = startX; x <= endX + gridSize; x += gridSize) {
                if (Math.abs(Math.round(x)) % 40 !== 0) {
                  context.moveTo(x, startY);
                  context.lineTo(x, endY + gridSize);
                }
              }
              for (let y = startY; y <= endY + gridSize; y += gridSize) {
                if (Math.abs(Math.round(y)) % 40 !== 0) {
                  context.moveTo(startX, y);
                  context.lineTo(endX + gridSize, y);
                }
              }
              context.strokeStyle = '#f1f5f9'; // slate-100, very subtle
              context.lineWidth = 0.5;
              context.strokeShape(shape);

              // Draw major grid lines
              context.beginPath();
              const majorGridSize = 40;
              const majorStartX = Math.floor(localMinX / majorGridSize) * majorGridSize;
              const majorStartY = Math.floor(localMinY / majorGridSize) * majorGridSize;
              for (let x = majorStartX; x <= endX + majorGridSize; x += majorGridSize) {
                context.moveTo(x, startY);
                context.lineTo(x, endY + majorGridSize);
              }
              for (let y = majorStartY; y <= endY + majorGridSize; y += majorGridSize) {
                context.moveTo(startX, y);
                context.lineTo(endX + majorGridSize, y);
              }
              context.strokeStyle = '#e2e8f0'; // slate-200, slightly darker
              context.lineWidth = 1;
              context.strokeShape(shape);
            }}
            listening={false}
          />
        </Layer>
        <Layer>
          {plan.rooms.map((room) => (
            <RoomShape
              key={room.id}
              room={room}
              isSelected={room.id === selectedRoomId}
              onSelect={() => setSelectedRoomId(room.id)}
              onChange={(newRoom) => updateRoom(newRoom.id, newRoom)}
            />
          ))}
        </Layer>
      </Stage>

      {/* Sleek, Premium Floating Zoom & Navigation Panel (Horizontal layout to prevent clipping) */}
      <div className="absolute bottom-6 right-6 flex flex-row items-center gap-2 z-50 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-xl border border-slate-200/80">
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-800 active:scale-95 transition-all"
          title="Zoom Out"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-800 active:scale-95 transition-all"
          title="Zoom In"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <div className="w-px bg-slate-200 self-stretch my-1 mx-1" />
        <button
          onClick={fitToScreen}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-800 active:scale-95 transition-all"
          title="Fit to Screen"
        >
          <Maximize2 size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Help tooltip */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/80 text-xs text-slate-500 pointer-events-none select-none">
        Drag background to pan • Scroll to zoom
      </div>
    </div>
  );
};
