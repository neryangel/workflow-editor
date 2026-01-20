// VariableSubstitution - Service for replacing variable placeholders in text

import { VariableContext } from '../../types';

export class VariableSubstitution {
  /**
   * Substitute variables in a text string
   * Supports {variableName} syntax
   */
  static substitute(text: string, context: VariableContext): string {
    if (!text || typeof text !== 'string') return text;

    return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, varName) => {
      const value = context[varName];
      if (value !== undefined && value !== null) {
        return String(value);
      }
      return match; // Keep original if variable not found
    });
  }

  /**
   * Substitute variables in an object recursively
   * Useful for node metadata
   */
  static substituteInObject<T>(obj: T, context: VariableContext): T {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.substituteInObject(item, context)) as T;
    }

    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        (result as any)[key] = this.substitute(value, context);
      } else if (typeof value === 'object' && value !== null) {
        (result as any)[key] = this.substituteInObject(value, context);
      } else {
        (result as any)[key] = value;
      }
    }

    return result;
  }

  /**
   * Extract variable names from a text string
   */
  static extractVariables(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    const matches = text.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
    return Array.from(matches).map(match => match[1]);
  }

  /**
   * Validate that all variables in text exist in context
   */
  static validateVariables(text: string, context: VariableContext): {
    valid: boolean;
    missing: string[];
  } {
    const variables = this.extractVariables(text);
    const missing = variables.filter(varName => !(varName in context));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
