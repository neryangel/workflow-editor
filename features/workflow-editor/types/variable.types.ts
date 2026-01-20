// Variable Types - Global workflow variables and parameters

export type VariableType = 'text' | 'number' | 'boolean' | 'image' | 'video' | 'audio';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  value: string | number | boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableSet {
  id: string;
  name: string;
  description?: string;
  variables: Variable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentProfile {
  id: string;
  name: string;
  description?: string;
  variableSet: VariableSet;
  isActive: boolean;
}

// Variable substitution context
export interface VariableContext {
  [key: string]: string | number | boolean;
}
