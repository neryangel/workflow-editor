// Prompt Composer - Assembles final prompts from multiple sources

import {
    BASE_SYSTEM_PROMPT,
    NODE_TYPE_INSTRUCTIONS,
    WORKFLOW_CONTEXT_TEMPLATE,
} from '../system/base';
import { Persona, getPersonaById, DEFAULT_PERSONA } from '../personas';

export interface PromptComposerInput {
    // User's custom system prompt (from SystemPromptNode connection)
    userSystemPrompt?: string;

    // The main user prompt/input text
    userPrompt: string;

    // Selected persona ID
    personaId?: string;

    // Node type for specific instructions
    nodeType?: string;

    // Workflow context
    context?: {
        nodeName?: string;
        connectedInputs?: string[];
        outputType?: string;
    };

    // Whether to include persona prompt
    usePersona?: boolean;
}

export interface ComposedPrompt {
    systemPrompt: string;
    userPrompt: string;

    // For debugging/transparency
    components: {
        base: string;
        persona?: string;
        nodeType?: string;
        context?: string;
        userCustom?: string;
    };
}

/**
 * Composes a complete prompt from multiple sources
 * Priority (later overrides earlier):
 * 1. Base system prompt
 * 2. Node-type specific instructions
 * 3. Persona prompt
 * 4. User's custom system prompt
 * 5. Workflow context
 */
export function composePrompt(input: PromptComposerInput): ComposedPrompt {
    const components: ComposedPrompt['components'] = {
        base: BASE_SYSTEM_PROMPT,
    };

    const systemParts: string[] = [BASE_SYSTEM_PROMPT];

    // Add node-type specific instructions
    if (input.nodeType && NODE_TYPE_INSTRUCTIONS[input.nodeType]) {
        const nodeInstructions = NODE_TYPE_INSTRUCTIONS[input.nodeType];
        components.nodeType = nodeInstructions;
        systemParts.push(`\n## Node-Specific Instructions\n${nodeInstructions}`);
    }

    // Add persona prompt if enabled
    if (input.usePersona !== false) {
        const persona: Persona = input.personaId
            ? getPersonaById(input.personaId) || DEFAULT_PERSONA
            : DEFAULT_PERSONA;

        components.persona = persona.systemPrompt;
        systemParts.push(`\n## Your Role: ${persona.name}\n${persona.systemPrompt}`);
    }

    // Add user's custom system prompt
    if (input.userSystemPrompt?.trim()) {
        components.userCustom = input.userSystemPrompt;
        systemParts.push(`\n## Additional Instructions\n${input.userSystemPrompt}`);
    }

    // Add workflow context
    if (input.context) {
        const contextStr = WORKFLOW_CONTEXT_TEMPLATE.replace(
            '{{nodeName}}',
            input.context.nodeName || 'Unknown'
        )
            .replace('{{connectedInputs}}', input.context.connectedInputs?.join(', ') || 'None')
            .replace('{{outputType}}', input.context.outputType || 'Text');

        components.context = contextStr;
        systemParts.push(contextStr);
    }

    return {
        systemPrompt: systemParts.join('\n'),
        userPrompt: input.userPrompt,
        components,
    };
}

/**
 * Simple helper for quick prompt composition without full options
 */
export function quickCompose(
    userPrompt: string,
    userSystemPrompt?: string,
    personaId?: string
): ComposedPrompt {
    return composePrompt({
        userPrompt,
        userSystemPrompt,
        personaId,
        usePersona: !!personaId,
    });
}

/**
 * Compose a prompt specifically for image generation enhancement
 */
export function composeImagePrompt(description: string): ComposedPrompt {
    return composePrompt({
        userPrompt: `Enhance this image description into an optimized prompt for AI image generation:\n\n${description}`,
        personaId: 'promptEngineer',
        nodeType: 'imagePromptEnhancer',
        usePersona: true,
    });
}

/**
 * Compose a prompt for scene analysis
 */
export function composeSceneAnalysisPrompt(
    description: string,
    imageProvided: boolean = false
): ComposedPrompt {
    const userPrompt = imageProvided
        ? `Analyze the provided image in detail. ${description ? `Additional context: ${description}` : ''}`
        : `Analyze this scene description and provide detailed production notes:\n\n${description}`;

    return composePrompt({
        userPrompt,
        personaId: 'sceneAnalyst',
        nodeType: 'sceneAnalyzer',
        usePersona: true,
    });
}
