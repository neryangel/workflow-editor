// Validation Utilities
// Common validation functions for forms and API inputs

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateNodeId(id: string): ValidationResult {
    const errors: string[] = [];

    if (!id) {
        errors.push('Node ID is required');
    } else if (id.length < 1 || id.length > 100) {
        errors.push('Node ID must be 1-100 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        errors.push('Node ID can only contain letters, numbers, underscores, and hyphens');
    }

    return { valid: errors.length === 0, errors };
}

export function validateWorkflowName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
        errors.push('Workflow name is required');
    } else if (name.length > 100) {
        errors.push('Workflow name must be 100 characters or less');
    }

    return { valid: errors.length === 0, errors };
}

export function validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
        errors.push('Prompt is required');
    } else if (prompt.length > 10000) {
        errors.push('Prompt must be 10,000 characters or less');
    }

    return { valid: errors.length === 0, errors };
}

export function validateUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url) {
        errors.push('URL is required');
    } else {
        try {
            new URL(url);
        } catch {
            errors.push('Invalid URL format');
        }
    }

    return { valid: errors.length === 0, errors };
}
