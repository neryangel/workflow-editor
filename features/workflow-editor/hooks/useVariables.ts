// useVariables - Hook for managing workflow variables

import { useState, useCallback, useEffect } from 'react';
import { Variable, VariableSet, VariableType, VariableContext } from '../types';

const STORAGE_KEY = 'workflow-variables';
const ACTIVE_SET_KEY = 'active-variable-set';

export interface UseVariablesReturn {
  // Current variables
  variables: Variable[];
  variableContext: VariableContext;

  // Variable management
  addVariable: (name: string, type: VariableType, value: string | number | boolean, description?: string) => void;
  updateVariable: (id: string, updates: Partial<Omit<Variable, 'id' | 'createdAt'>>) => void;
  removeVariable: (id: string) => void;
  getVariable: (id: string) => Variable | undefined;
  getVariableByName: (name: string) => Variable | undefined;

  // Variable sets
  variableSets: VariableSet[];
  activeSetId: string | null;
  createVariableSet: (name: string, description?: string) => void;
  loadVariableSet: (setId: string) => void;
  deleteVariableSet: (setId: string) => void;
  exportVariableSet: (setId: string) => string | null;
  importVariableSet: (json: string) => void;

  // Variable substitution
  substituteVariables: (text: string) => string;
}

export function useVariables(): UseVariablesReturn {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableSets, setVariableSets] = useState<VariableSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);

  // Load variables from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const activeSet = localStorage.getItem(ACTIVE_SET_KEY);

    if (stored) {
      try {
        const sets: VariableSet[] = JSON.parse(stored);
        setVariableSets(sets);

        if (activeSet) {
          const set = sets.find(s => s.id === activeSet);
          if (set) {
            setVariables(set.variables);
            setActiveSetId(activeSet);
          }
        }
      } catch (error) {
        console.error('Failed to load variables:', error);
      }
    }
  }, []);

  // Save variables to localStorage
  const saveToStorage = useCallback((sets: VariableSet[], activeId: string | null) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    if (activeId) {
      localStorage.setItem(ACTIVE_SET_KEY, activeId);
    } else {
      localStorage.removeItem(ACTIVE_SET_KEY);
    }
  }, []);

  // Create variable context object for substitution
  const variableContext: VariableContext = variables.reduce((acc, variable) => {
    acc[variable.name] = variable.value;
    return acc;
  }, {} as VariableContext);

  // Add a new variable
  const addVariable = useCallback(
    (name: string, type: VariableType, value: string | number | boolean, description?: string) => {
      const newVariable: Variable = {
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        value,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setVariables(prev => {
        const updated = [...prev, newVariable];

        // Update active set
        if (activeSetId) {
          setVariableSets(sets => {
            const updatedSets = sets.map(set =>
              set.id === activeSetId
                ? { ...set, variables: updated, updatedAt: new Date() }
                : set
            );
            saveToStorage(updatedSets, activeSetId);
            return updatedSets;
          });
        }

        return updated;
      });
    },
    [activeSetId, saveToStorage]
  );

  // Update a variable
  const updateVariable = useCallback(
    (id: string, updates: Partial<Omit<Variable, 'id' | 'createdAt'>>) => {
      setVariables(prev => {
        const updated = prev.map(v =>
          v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
        );

        // Update active set
        if (activeSetId) {
          setVariableSets(sets => {
            const updatedSets = sets.map(set =>
              set.id === activeSetId
                ? { ...set, variables: updated, updatedAt: new Date() }
                : set
            );
            saveToStorage(updatedSets, activeSetId);
            return updatedSets;
          });
        }

        return updated;
      });
    },
    [activeSetId, saveToStorage]
  );

  // Remove a variable
  const removeVariable = useCallback(
    (id: string) => {
      setVariables(prev => {
        const updated = prev.filter(v => v.id !== id);

        // Update active set
        if (activeSetId) {
          setVariableSets(sets => {
            const updatedSets = sets.map(set =>
              set.id === activeSetId
                ? { ...set, variables: updated, updatedAt: new Date() }
                : set
            );
            saveToStorage(updatedSets, activeSetId);
            return updatedSets;
          });
        }

        return updated;
      });
    },
    [activeSetId, saveToStorage]
  );

  // Get variable by ID
  const getVariable = useCallback(
    (id: string) => variables.find(v => v.id === id),
    [variables]
  );

  // Get variable by name
  const getVariableByName = useCallback(
    (name: string) => variables.find(v => v.name === name),
    [variables]
  );

  // Create a new variable set
  const createVariableSet = useCallback(
    (name: string, description?: string) => {
      const newSet: VariableSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        variables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setVariableSets(prev => {
        const updated = [...prev, newSet];
        saveToStorage(updated, newSet.id);
        return updated;
      });

      setVariables([]);
      setActiveSetId(newSet.id);
    },
    [saveToStorage]
  );

  // Load a variable set
  const loadVariableSet = useCallback(
    (setId: string) => {
      const set = variableSets.find(s => s.id === setId);
      if (set) {
        setVariables(set.variables);
        setActiveSetId(setId);
        localStorage.setItem(ACTIVE_SET_KEY, setId);
      }
    },
    [variableSets]
  );

  // Delete a variable set
  const deleteVariableSet = useCallback(
    (setId: string) => {
      setVariableSets(prev => {
        const updated = prev.filter(s => s.id !== setId);
        saveToStorage(updated, activeSetId === setId ? null : activeSetId);
        return updated;
      });

      if (activeSetId === setId) {
        setVariables([]);
        setActiveSetId(null);
      }
    },
    [activeSetId, saveToStorage]
  );

  // Export variable set as JSON
  const exportVariableSet = useCallback(
    (setId: string) => {
      const set = variableSets.find(s => s.id === setId);
      if (!set) return null;
      return JSON.stringify(set, null, 2);
    },
    [variableSets]
  );

  // Import variable set from JSON
  const importVariableSet = useCallback(
    (json: string) => {
      try {
        const set = JSON.parse(json) as VariableSet;
        const newSet: VariableSet = {
          ...set,
          id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setVariableSets(prev => {
          const updated = [...prev, newSet];
          saveToStorage(updated, newSet.id);
          return updated;
        });

        setVariables(newSet.variables);
        setActiveSetId(newSet.id);
      } catch (error) {
        console.error('Failed to import variable set:', error);
      }
    },
    [saveToStorage]
  );

  // Substitute variables in text (supports {variableName} syntax)
  const substituteVariables = useCallback(
    (text: string): string => {
      return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, varName) => {
        const variable = getVariableByName(varName);
        if (variable) {
          return String(variable.value);
        }
        return match; // Keep original if variable not found
      });
    },
    [getVariableByName]
  );

  return {
    variables,
    variableContext,
    addVariable,
    updateVariable,
    removeVariable,
    getVariable,
    getVariableByName,
    variableSets,
    activeSetId,
    createVariableSet,
    loadVariableSet,
    deleteVariableSet,
    exportVariableSet,
    importVariableSet,
    substituteVariables,
  };
}
