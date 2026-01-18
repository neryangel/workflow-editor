// Port Configuration - Colors and compatibility

import { PortType } from "../types";

// Port color mapping for UI (Runway ML-inspired color scheme)
export const PORT_COLORS: Record<PortType, string> = {
  text: "#22c55e", // green for text
  image: "#ec4899", // pink for image
  video: "#3b82f6", // blue for video
  audio: "#eab308", // yellow for audio
  any: "#a855f7", // purple for any/universal
};

// Port type compatibility matrix
export const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  text: ["text", "any"],
  image: ["image", "any"],
  video: ["video", "any"],
  audio: ["audio", "any"],
  any: ["text", "image", "video", "audio", "any"],
};

// Check if two port types are compatible for connection
export function arePortsCompatible(
  sourceType: PortType,
  targetType: PortType,
): boolean {
  return PORT_COMPATIBILITY[sourceType]?.includes(targetType) ?? false;
}
