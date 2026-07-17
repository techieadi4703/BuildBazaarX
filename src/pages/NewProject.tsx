import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Bot,
  Building2,
  Home,
  Store,
  Briefcase,
  TreePine,
  Plus,
  Minus,
  Upload,
  Video,
  FileUp,
  Users,
  Baby,
  PersonStanding,
  PawPrint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";

// ─── Types ──────────────────────────────────────────────────────────────────

type PropertyType = "Apartment" | "Villa" | "Independent House" | "Office" | "Shop";
type DesignStyle =
  | "Modern"
  | "Luxury"
  | "Minimal"
  | "Scandinavian"
  | "Contemporary"
  | "Traditional"
  | "Industrial"
  | "Bohemian";
type ColorTheme = "White" | "Grey" | "Beige" | "Wooden" | "Black" | "Blue" | "Green";
type Material = "Laminate" | "Veneer" | "Acrylic" | "Glass" | "Marble" | "Granite" | "Tiles";
type RoomType =
  | "Living Room"
  | "Dining Room"
  | "Kitchen"
  | "Master Bedroom"
  | "Bedroom 2"
  | "Bedroom 3"
  | "Bathroom"
  | "Balcony"
  | "Study Room"
  | "Office";

interface WizardState {
  propertyType: PropertyType;
  carpetArea: number;
  builtUpArea: number;
  floors: number;
  rooms: RoomType[];
  adults: number;
  children: number;
  seniors: number;
  pets: number;
  workFromHome: boolean;
  cookDaily: boolean;
  extraStorage: boolean;
  kidsRoom: boolean;
  homeOffice: boolean;
  pujaRoom: boolean;
  shoeStorage: boolean;
  designStyle: DesignStyle;
  colorTheme: ColorTheme;
  budget: number;
  materials: Material[];
}

const initialState: WizardState = {
  propertyType: "Apartment",
  carpetArea: 1450,
  builtUpArea: 1650,
  floors: 1,
  rooms: [
    "Living Room",
    "Dining Room",
    "Kitchen",
    "Master Bedroom",
    "Bedroom 2",
    "Bedroom 3",
    "Bathroom",
  ],
  adults: 2,
  children: 1,
  seniors: 0,
  pets: 1,
  workFromHome: true,
  cookDaily: true,
  extraStorage: true,
  kidsRoom: true,
  homeOffice: true,
  pujaRoom: true,
  shoeStorage: true,
  designStyle: "Modern",
  colorTheme: "White",
  budget: 12,
  materials: ["Laminate", "Veneer", "Tiles"],
};

// ─── Step Progress Bar ───────────────────────────────────────────────────────

const TOTAL_STEPS = 12;

const StepProgress = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 flex-wrap justify-center mb-8">
    {Array.from({ length: TOTAL_STEPS }, (_, i) => {
      const stepNum = i + 1;
      const isDone = stepNum < current;
      const isActive = stepNum === current;
      return (
        <React.Fragment key={stepNum}>
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
              isDone
                ? "bg-[var(--success)] text-white"
                : isActive
                ? "bg-[var(--accent-warm)] text-white scale-110 shadow-[var(--shadow-md)]"
                : "bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
            }`}
          >
            {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
          </div>
          {stepNum < TOTAL_STEPS && (
            <div
              className={`h-0.5 w-3 rounded transition-all duration-500 ${
                isDone ? "bg-[var(--success)]" : "bg-[var(--border-default)]"
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Bot Bubble ──────────────────────────────────────────────────────────────

const BotBubble = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--accent-warm-faint)] border border-[var(--accent-warm)] flex items-center justify-center">
      <Bot className="w-4 h-4 text-[var(--accent-warm)]" />
    </div>
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-[var(--shadow-sm)]">
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{text}</p>
    </div>
  </div>
);

// ─── Step transitions ────────────────────────────────────────────────────────

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

// ─── Tile Button ─────────────────────────────────────────────────────────────

const TileButton = ({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium cursor-pointer select-none ${
      selected
        ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
        : "border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm-faint)]"
    }`}
  >
    {selected && (
      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--success)] flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-white" />
      </span>
    )}
    {icon && <span className="text-xl">{icon}</span>}
    <span className="text-center leading-tight">{label}</span>
  </button>
);

// ─── Quantity Stepper ────────────────────────────────────────────────────────

const QuantityStepper = ({
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-8 h-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <span className="w-6 text-center font-semibold text-[var(--text-primary)]">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-8 h-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Yes/No Toggle ───────────────────────────────────────────────────────────

const YesNoToggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex gap-1">
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        value
          ? "bg-[var(--success)] text-white"
          : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--success)]"
      }`}
    >
      Yes
    </button>
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        !value
          ? "bg-[var(--error)] text-white"
          : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--error)]"
      }`}
    >
      No
    </button>
  </div>
);

// ─── Navigation Buttons ──────────────────────────────────────────────────────

const NavButtons = ({
  step,
  onNext,
  onBack,
  nextLabel = "Next",
}: {
  step: number;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
}) => (
  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
    {step > 1 ? (
      <Button
        variant="ghost"
        onClick={onBack}
        className="rounded-full gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    ) : (
      <span />
    )}
    <Button
      onClick={onNext}
      className="rounded-full px-6 gap-2 bg-[var(--success)] hover:bg-[#255f3d] text-white shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:scale-105 transition-all duration-200"
    >
      {nextLabel}
      <ArrowRight className="w-4 h-4" />
    </Button>
  </div>
);

// ─── Area Input ──────────────────────────────────────────────────────────────

const AreaInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm font-medium text-[var(--text-primary)] min-w-[160px]">{label}</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(100, value - 50))}
        className="w-8 h-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-24 text-center rounded-xl border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)]"
      />
      <button
        type="button"
        onClick={() => onChange(value + 50)}
        className="w-8 h-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─── Color Tile ───────────────────────────────────────────────────────────────

const colorMap: Record<ColorTheme, string> = {
  White: "#FFFFFF",
  Grey: "#9CA3AF",
  Beige: "#D4B896",
  Wooden: "#A0714F",
  Black: "#1F2937",
  Blue: "#3B82F6",
  Green: "#22C55E",
};

const ColorTile = ({
  color,
  selected,
  onClick,
}: {
  color: ColorTheme;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
      selected
        ? "border-[var(--success)] shadow-[var(--shadow-md)]"
        : "border-[var(--border-default)] hover:border-[var(--accent-warm)]"
    }`}
  >
    <div
      className="w-12 h-12 rounded-lg border border-black/10 relative"
      style={{ backgroundColor: colorMap[color] }}
    >
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
    <span className="text-xs font-medium text-[var(--text-secondary)]">{color}</span>
  </button>
);

// ─── Material Tile ───────────────────────────────────────────────────────────

const materialPatterns: Record<Material, string> = {
  Laminate:
    "linear-gradient(135deg, #f5f0eb 25%, #ede5d8 25%, #ede5d8 50%, #f5f0eb 50%, #f5f0eb 75%, #ede5d8 75%)",
  Veneer:
    "repeating-linear-gradient(90deg, #c8a97a 0px, #c8a97a 2px, #d4b58a 2px, #d4b58a 12px)",
  Acrylic: "linear-gradient(135deg, #e0f0ff, #b0d8ff)",
  Glass: "linear-gradient(135deg, #e8f4f8 0%, #c5e8f5 50%, #e8f4f8 100%)",
  Marble:
    "radial-gradient(ellipse at 20% 50%, #f0ece8 0%, #e4ddd4 40%, #f8f5f2 70%, #ede7e0 100%)",
  Granite:
    "repeating-conic-gradient(#6b6560 0%, #6b6560 10%, #7a736e 10%, #7a736e 20%)",
  Tiles:
    "repeating-linear-gradient(0deg, transparent, transparent 14px, #d0c8be 14px, #d0c8be 15px), repeating-linear-gradient(90deg, transparent, transparent 14px, #d0c8be 14px, #d0c8be 15px)",
};

const MaterialTile = ({
  material,
  selected,
  onClick,
}: {
  material: Material;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
      selected
        ? "border-[var(--success)] shadow-[var(--shadow-md)]"
        : "border-[var(--border-default)] hover:border-[var(--accent-warm)]"
    }`}
  >
    <div
      className="w-14 h-14 rounded-lg relative border border-black/10 overflow-hidden"
      style={{ background: materialPatterns[material], backgroundSize: "15px 15px" }}
    >
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--success)]/20">
          <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
    <span className="text-xs font-medium text-[var(--text-secondary)]">{material}</span>
  </button>
);

// ─── Style Tile ───────────────────────────────────────────────────────────────

const styleColors: Record<DesignStyle, string> = {
  Modern: "linear-gradient(135deg, #f0f4f8, #d9e8f5)",
  Luxury: "linear-gradient(135deg, #fdf0e0, #f5d78e)",
  Minimal: "linear-gradient(135deg, #f8f8f8, #e8e8e8)",
  Scandinavian: "linear-gradient(135deg, #e8f0eb, #c8dece)",
  Contemporary: "linear-gradient(135deg, #ede9f5, #c8baeb)",
  Traditional: "linear-gradient(135deg, #f5ede0, #e0c090)",
  Industrial: "linear-gradient(135deg, #3d3d3d, #6b6b6b)",
  Bohemian: "linear-gradient(135deg, #f5e0d8, #e8b090)",
};

const StyleTile = ({
  style,
  selected,
  onClick,
}: {
  style: DesignStyle;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
      selected
        ? "border-[var(--success)] shadow-[var(--shadow-md)]"
        : "border-[var(--border-default)] hover:border-[var(--accent-warm)]"
    }`}
  >
    <div
      className="w-full h-16 rounded-lg relative border border-black/10"
      style={{ background: styleColors[style] }}
    >
      <svg viewBox="0 0 80 50" className="w-full h-full opacity-30">
        <rect x="5" y="25" width="30" height="20" rx="2" fill="currentColor" />
        <rect x="40" y="30" width="15" height="15" rx="1" fill="currentColor" />
        <rect x="58" y="20" width="18" height="25" rx="2" fill="currentColor" />
        <line x1="5" y1="45" x2="75" y2="45" stroke="currentColor" strokeWidth="1" />
      </svg>
      {selected && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
    <span className="text-xs font-medium text-[var(--text-secondary)] text-center">{style}</span>
  </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const NewProject: React.FC = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);
  const { toast } = useToast();

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const toggleRoom = (room: RoomType) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.includes(room)
        ? prev.rooms.filter((r) => r !== room)
        : [...prev.rooms, room],
    }));
  };

  const toggleMaterial = (material: Material) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter((m) => m !== material)
        : [...prev.materials, material],
    }));
  };

  const handleGenerate = () => {
    toast({
      title: "🚀 AI generation coming soon",
      description: "We're building the AI engine. Stay tuned!",
    });
    console.log("AI generation requested", state);
  };

  const propertyTypes: { type: PropertyType; icon: React.ReactNode }[] = [
    { type: "Apartment", icon: <Building2 className="w-5 h-5" /> },
    { type: "Villa", icon: <TreePine className="w-5 h-5" /> },
    { type: "Independent House", icon: <Home className="w-5 h-5" /> },
    { type: "Office", icon: <Briefcase className="w-5 h-5" /> },
    { type: "Shop", icon: <Store className="w-5 h-5" /> },
  ];

  const roomOptions: RoomType[] = [
    "Living Room",
    "Dining Room",
    "Kitchen",
    "Master Bedroom",
    "Bedroom 2",
    "Bedroom 3",
    "Bathroom",
    "Balcony",
    "Study Room",
    "Office",
  ];

  const roomIcons: Record<RoomType, string> = {
    "Living Room": "🛋️",
    "Dining Room": "🍽️",
    Kitchen: "🍳",
    "Master Bedroom": "🛏️",
    "Bedroom 2": "🛏️",
    "Bedroom 3": "🛏️",
    Bathroom: "🚿",
    Balcony: "🌿",
    "Study Room": "📚",
    Office: "💼",
  };

  const lifestyleRows: { key: keyof WizardState; label: string }[] = [
    { key: "workFromHome", label: "Work From Home" },
    { key: "cookDaily", label: "Do you cook daily?" },
    { key: "extraStorage", label: "Need Extra Storage?" },
    { key: "kidsRoom", label: "Kids Room?" },
    { key: "homeOffice", label: "Need Home Office?" },
    { key: "pujaRoom", label: "Need Puja Room?" },
    { key: "shoeStorage", label: "Need Shoe Storage?" },
  ];

  const allColors: ColorTheme[] = ["White", "Grey", "Beige", "Wooden", "Black", "Blue", "Green"];
  const allStyles: DesignStyle[] = [
    "Modern",
    "Luxury",
    "Minimal",
    "Scandinavian",
    "Contemporary",
    "Traditional",
    "Industrial",
    "Bohemian",
  ];
  const allMaterials: Material[] = [
    "Laminate",
    "Veneer",
    "Acrylic",
    "Glass",
    "Marble",
    "Granite",
    "Tiles",
  ];

  const familyRows: {
    key: "adults" | "children" | "seniors" | "pets";
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "adults", label: "Adults", icon: <Users className="w-4 h-4" /> },
    { key: "children", label: "Children", icon: <Baby className="w-4 h-4" /> },
    { key: "seniors", label: "Senior Citizens", icon: <PersonStanding className="w-4 h-4" /> },
    { key: "pets", label: "Pets", icon: <PawPrint className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-base)] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[var(--accent-warm-faint)] text-[var(--accent-warm)] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              AI-Powered Interior Planner
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">
              New Project
            </h1>
          </div>

          {/* Step progress indicator */}
          <StepProgress current={step} />

          {/* Animated step card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-[var(--shadow-lg)]">

                {/* ── Step 1: Welcome ────────────────────────────────── */}
                {step === 1 && (
                  <div className="text-center">
                    <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-[#e8eef7] to-[#c8d8ef]">
                      <svg
                        viewBox="0 0 400 200"
                        className="w-full h-full"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <rect x="0" y="150" width="400" height="50" fill="#d4c9b8" />
                        <rect x="0" y="0" width="400" height="150" fill="#e8eef7" />
                        <rect x="60" y="110" width="140" height="45" rx="8" fill="#a8b8d8" />
                        <rect x="55" y="100" width="150" height="20" rx="5" fill="#8fa8c8" />
                        <rect x="55" y="100" width="18" height="55" rx="4" fill="#7898b8" />
                        <rect x="187" y="100" width="18" height="55" rx="4" fill="#7898b8" />
                        <rect x="75" y="112" width="35" height="28" rx="4" fill="#c8d4e8" />
                        <rect x="117" y="112" width="35" height="28" rx="4" fill="#c8d4e8" />
                        <rect x="159" y="112" width="35" height="28" rx="4" fill="#c8d4e8" />
                        <rect x="90" y="148" width="80" height="5" rx="2" fill="#b8a890" />
                        <rect x="94" y="153" width="5" height="12" rx="1" fill="#a0907a" />
                        <rect x="161" y="153" width="5" height="12" rx="1" fill="#a0907a" />
                        <rect x="280" y="70" width="4" height="85" rx="2" fill="#c8b898" />
                        <ellipse cx="282" cy="68" rx="25" ry="15" fill="#f8e870" opacity="0.8" />
                        <ellipse cx="282" cy="155" rx="15" ry="5" fill="#b8a878" />
                        <rect x="330" y="120" width="15" height="35" rx="3" fill="#8a7a5a" />
                        <ellipse cx="337" cy="118" rx="25" ry="30" fill="#4a9060" />
                        <ellipse cx="325" cy="110" rx="15" ry="20" fill="#5aa870" />
                        <ellipse cx="350" cy="112" rx="18" ry="22" fill="#3a8050" />
                        <rect x="280" y="20" width="90" height="70" rx="4" fill="#c8e0f8" opacity="0.7" />
                        <line x1="325" y1="20" x2="325" y2="90" stroke="#a0b8d0" strokeWidth="2" />
                        <line x1="280" y1="55" x2="370" y2="55" stroke="#a0b8d0" strokeWidth="2" />
                        <circle cx="360" cy="30" r="20" fill="#fff8a0" opacity="0.5" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-2">
                      Welcome to AI Interior Planner
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                      Let's design your dream home in just 5 minutes.
                    </p>
                    <Button
                      onClick={next}
                      className="rounded-full px-8 py-6 gap-2 text-base bg-[var(--success)] hover:bg-[#255f3d] text-white shadow-[var(--shadow-md)] hover:scale-105 transition-all duration-200"
                    >
                      Start Project
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* ── Step 2: Property Details ───────────────────────── */}
                {step === 2 && (
                  <div>
                    <BotBubble text="Great! Let's start with your property details." />
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                        Property Type
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {propertyTypes.map(({ type, icon }) => (
                          <TileButton
                            key={type}
                            label={type}
                            icon={icon}
                            selected={state.propertyType === type}
                            onClick={() => update("propertyType", type)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 mb-4">
                      <AreaInput
                        label="Carpet Area (sq.ft.)"
                        value={state.carpetArea}
                        onChange={(v) => update("carpetArea", v)}
                      />
                      <AreaInput
                        label="Built-up Area (sq.ft.)"
                        value={state.builtUpArea}
                        onChange={(v) => update("builtUpArea", v)}
                      />
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-[var(--text-primary)] min-w-[160px]">
                          Number of Floors
                        </span>
                        <QuantityStepper
                          value={state.floors}
                          onChange={(v) => update("floors", v)}
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 3: Room Details ───────────────────────────── */}
                {step === 3 && (
                  <div>
                    <BotBubble text="Which rooms do you have? (Select all that apply)" />
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 mb-4">
                      {roomOptions.map((room) => (
                        <TileButton
                          key={room}
                          label={room}
                          icon={roomIcons[room]}
                          selected={state.rooms.includes(room)}
                          onClick={() => toggleRoom(room)}
                        />
                      ))}
                    </div>
                    {state.rooms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {state.rooms.map((r) => (
                          <Badge
                            key={r}
                            variant="secondary"
                            className="bg-[var(--success-bg)] text-[var(--success)] text-xs"
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 4: Family Details ─────────────────────────── */}
                {step === 4 && (
                  <div>
                    <BotBubble text="Tell me about your family." />
                    <div className="space-y-4 mb-4">
                      {familyRows.map(({ key, label, icon }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]"
                        >
                          <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                            <span className="text-[var(--accent-warm)]">{icon}</span>
                            {label}
                          </div>
                          <QuantityStepper
                            value={state[key] as number}
                            onChange={(v) => update(key, v)}
                          />
                        </div>
                      ))}
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 5: Lifestyle ──────────────────────────────── */}
                {step === 5 && (
                  <div>
                    <BotBubble text="Help me understand your lifestyle better." />
                    <div className="space-y-3 mb-4">
                      {lifestyleRows.map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]"
                        >
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {label}
                          </span>
                          <YesNoToggle
                            value={state[key] as boolean}
                            onChange={(v) => update(key, v)}
                          />
                        </div>
                      ))}
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 6: Design Style ───────────────────────────── */}
                {step === 6 && (
                  <div>
                    <BotBubble text="What design style do you prefer?" />
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {allStyles.map((style) => (
                        <StyleTile
                          key={style}
                          style={style}
                          selected={state.designStyle === style}
                          onClick={() => update("designStyle", style)}
                        />
                      ))}
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 7: Color Preference ───────────────────────── */}
                {step === 7 && (
                  <div>
                    <BotBubble text="Choose your favorite color theme." />
                    <div className="flex flex-wrap gap-3 justify-center mb-4">
                      {allColors.map((color) => (
                        <ColorTile
                          key={color}
                          color={color}
                          selected={state.colorTheme === color}
                          onClick={() => update("colorTheme", color)}
                        />
                      ))}
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 8: Budget ─────────────────────────────────── */}
                {step === 8 && (
                  <div>
                    <BotBubble text="What is your estimated budget?" />
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-[var(--accent-warm)] font-mono">
                        ₹{state.budget} Lakh
                      </span>
                    </div>
                    <div className="px-2 mb-2">
                      <Slider
                        min={3}
                        max={50}
                        step={1}
                        value={[state.budget]}
                        onValueChange={([v]) => update("budget", v)}
                      />
                      <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
                        <span>₹3 Lakh</span>
                        <span>₹50 Lakh</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-5 p-4 rounded-xl bg-[var(--accent-warm-faint)] border border-[var(--accent-warm)]/30">
                      <Sparkles className="w-4 h-4 text-[var(--accent-warm)] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[var(--accent-warm)]">
                        We will customize the design and materials according to your budget.
                      </p>
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 9: Material Preference ────────────────────── */}
                {step === 9 && (
                  <div>
                    <BotBubble text="Select the materials you prefer." />
                    <div className="grid grid-cols-4 gap-3 mb-4 sm:grid-cols-7">
                      {allMaterials.map((material) => (
                        <MaterialTile
                          key={material}
                          material={material}
                          selected={state.materials.includes(material)}
                          onClick={() => toggleMaterial(material)}
                        />
                      ))}
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 10: Upload ────────────────────────────────── */}
                {step === 10 && (
                  <div>
                    <BotBubble text="Upload your floor plan, photos or videos (optional)." />
                    <div className="space-y-5 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Floor Plan
                        </p>
                        <label className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm-faint)] transition-all">
                          <FileUp className="w-6 h-6 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)]">
                            Upload Floor Plan
                          </span>
                          <input type="file" accept=".pdf,image/*" className="hidden" />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                          House Photos
                        </p>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-20 h-20 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)]"
                            >
                              <Upload className="w-5 h-5" />
                            </div>
                          ))}
                          <label className="w-20 h-20 rounded-xl bg-[var(--accent-warm-faint)] border-2 border-dashed border-[var(--accent-warm)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6 text-[var(--accent-warm)]" />
                            <input type="file" accept="image/*" multiple className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Videos
                        </p>
                        <label className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm-faint)] transition-all">
                          <Video className="w-6 h-6 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)]">
                            Upload Video
                          </span>
                          <input type="file" accept="video/*" className="hidden" />
                        </label>
                      </div>
                    </div>
                    <NavButtons step={step} onNext={next} onBack={back} />
                  </div>
                )}

                {/* ── Step 11: AI Summary ────────────────────────────── */}
                {step === 11 && (
                  <div>
                    <BotBubble text="Here is your project summary." />
                    <div className="space-y-2 mb-4">
                      {[
                        { label: "Property", value: state.propertyType },
                        {
                          label: "Area",
                          value: `${state.carpetArea} sq.ft. carpet / ${state.builtUpArea} sq.ft. built-up`,
                        },
                        { label: "Floors", value: String(state.floors) },
                        {
                          label: "Family",
                          value: `${state.adults} adults, ${state.children} children, ${state.seniors} seniors, ${state.pets} pets`,
                        },
                        { label: "Rooms", value: `${state.rooms.length} rooms selected` },
                        { label: "Style", value: state.designStyle },
                        { label: "Theme", value: state.colorTheme },
                        { label: "Budget", value: `₹${state.budget} Lakh` },
                        {
                          label: "Materials",
                          value: state.materials.join(", ") || "None selected",
                        },
                        {
                          label: "Kitchen",
                          value: state.cookDaily ? "Daily cooking" : "Minimal cooking",
                        },
                        {
                          label: "Storage",
                          value: state.extraStorage
                            ? "Extra storage needed"
                            : "Standard storage",
                        },
                        { label: "WFH", value: state.workFromHome ? "Yes" : "No" },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex justify-between items-start py-2.5 px-4 rounded-xl bg-[var(--bg-surface)] gap-4"
                        >
                          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider min-w-[80px]">
                            {label}
                          </span>
                          <span className="text-sm font-medium text-[var(--text-primary)] text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <NavButtons
                      step={step}
                      onNext={next}
                      onBack={back}
                      nextLabel="Looks Good!"
                    />
                  </div>
                )}

                {/* ── Step 12: Generate Design ───────────────────────── */}
                {step === 12 && (
                  <div className="text-center">
                    <BotBubble text="Ready to generate your AI Interior design?" />

                    {/* Preview hero */}
                    <div className="w-full h-44 rounded-2xl mb-6 overflow-hidden relative">
                      <svg
                        viewBox="0 0 400 180"
                        className="w-full h-full"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <rect x="0" y="0" width="400" height="180" fill="#1a2535" />
                        <rect x="0" y="130" width="400" height="50" fill="#131c27" />
                        <rect x="50" y="90" width="160" height="50" rx="8" fill="#263547" />
                        <rect x="45" y="78" width="170" height="22" rx="6" fill="#1f2e40" />
                        <rect x="45" y="78" width="20" height="62" rx="4" fill="#1a2535" />
                        <rect x="195" y="78" width="20" height="62" rx="4" fill="#1a2535" />
                        <circle cx="300" cy="60" r="25" fill="#d4893a" opacity="0.3" />
                        <circle cx="300" cy="60" r="12" fill="#d4893a" opacity="0.7" />
                        <rect x="298" y="72" width="4" height="60" fill="#8a6030" />
                        <ellipse cx="300" cy="132" rx="18" ry="5" fill="#6a4820" />
                        <line x1="0" y1="130" x2="400" y2="130" stroke="#d4893a" strokeWidth="1" opacity="0.5" />
                        <circle cx="350" cy="25" r="2" fill="#f8e870" opacity="0.8" />
                        <circle cx="370" cy="45" r="1.5" fill="#f8e870" opacity="0.6" />
                        <circle cx="360" cy="15" r="1" fill="#f8e870" opacity="0.9" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1a2535]/30">
                        <div className="text-center">
                          <Sparkles className="w-8 h-8 text-[var(--accent-warm)] mx-auto mb-1 animate-pulse" />
                          <p className="text-white text-sm font-semibold drop-shadow">
                            AI Preview
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      id="generate-ai-design-btn"
                      onClick={handleGenerate}
                      className="rounded-full px-8 py-6 gap-2 text-base w-full bg-[var(--success)] hover:bg-[#255f3d] text-white shadow-[var(--shadow-lg)] hover:scale-105 transition-all duration-200 mb-4"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate AI Interior Design
                    </Button>

                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                      AI will create your space planning, 3D design, BOQ, cost estimate and
                      shopping list.
                    </p>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
                      <Button
                        variant="ghost"
                        onClick={back}
                        className="rounded-full gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <span />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default NewProject;
