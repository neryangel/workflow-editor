// Port Types - Data types that flow between nodes

export type PortType = "text" | "image" | "video" | "audio" | "any";

export interface PortDefinition {
  type: PortType;
  value?: unknown;
}

export type PortDirection = "input" | "output";

export interface PortConfig {
  id: string;
  type: PortType;
  label?: string;
  required?: boolean;
}
