import {
  FileQuestion,
  FileText,
  FlaskConical,
  Layers,
  PenLine,
  Presentation,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import type { ResourceType } from "@prisma/client";

/**
 * The gradient colours and lucide icon used on every resource cover —
 * shared between resource cards, the creator portal and the upload form
 * so the look stays consistent.
 */
export const RESOURCE_TYPE_STYLE: Record<
  ResourceType,
  { from: string; to: string; icon: LucideIcon }
> = {
  HANDWRITTEN: { from: "#fbbf24", to: "#f97316", icon: PenLine },
  TYPED: { from: "#818cf8", to: "#8b5cf6", icon: FileText },
  PPT_SUMMARY: { from: "#fb7185", to: "#ec4899", icon: Presentation },
  LAB_RECORD: { from: "#2dd4bf", to: "#10b981", icon: FlaskConical },
  PYQ: { from: "#38bdf8", to: "#3b82f6", icon: FileQuestion },
  FORMULA_SHEET: { from: "#e879f9", to: "#a855f7", icon: Sigma },
  FLASHCARDS: { from: "#22d3ee", to: "#14b8a6", icon: Layers },
};
