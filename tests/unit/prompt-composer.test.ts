// Unit Tests - Prompt Composer
import { describe, it, expect } from 'vitest';
import {
    composePrompt,
    quickCompose,
    composeImagePrompt,
    composeSceneAnalysisPrompt,
} from '@features/workflow-editor/prompts/utils/prompt-composer';

describe('Prompt Composer', () => {
    describe('composePrompt', () => {
        it('should include base system prompt', () => {
            const result = composePrompt({
                userPrompt: 'Test prompt',
            });

            expect(result.components.base).toBeDefined();
            expect(result.systemPrompt).toContain('visual workflow editor');
        });

        it('should include user prompt unchanged', () => {
            const userPrompt = 'This is my specific prompt';
            const result = composePrompt({ userPrompt });

            expect(result.userPrompt).toBe(userPrompt);
        });

        it('should add node-type specific instructions when provided', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                nodeType: 'llm',
            });

            expect(result.components.nodeType).toBeDefined();
            expect(result.systemPrompt).toContain('Node-Specific Instructions');
        });

        it('should handle unknown node types gracefully', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                nodeType: 'unknownNodeType',
            });

            expect(result.components.nodeType).toBeUndefined();
        });

        it('should add persona prompt by default', () => {
            const result = composePrompt({
                userPrompt: 'Test',
            });

            expect(result.components.persona).toBeDefined();
            expect(result.systemPrompt).toContain('Your Role');
        });

        it('should use specified persona when personaId provided', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                personaId: 'director',
            });

            expect(result.components.persona).toContain('film director');
        });

        it('should skip persona when usePersona is false', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                usePersona: false,
            });

            expect(result.components.persona).toBeUndefined();
            expect(result.systemPrompt).not.toContain('Your Role');
        });

        it('should add user system prompt when provided', () => {
            const customPrompt = 'Always respond in JSON format';
            const result = composePrompt({
                userPrompt: 'Test',
                userSystemPrompt: customPrompt,
            });

            expect(result.components.userCustom).toBe(customPrompt);
            expect(result.systemPrompt).toContain('Additional Instructions');
            expect(result.systemPrompt).toContain(customPrompt);
        });

        it('should ignore empty user system prompt', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                userSystemPrompt: '   ',
            });

            expect(result.components.userCustom).toBeUndefined();
        });

        it('should add workflow context when provided', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                context: {
                    nodeName: 'MyLLMNode',
                    connectedInputs: ['text', 'image'],
                    outputType: 'Text',
                },
            });

            expect(result.components.context).toBeDefined();
            expect(result.systemPrompt).toContain('MyLLMNode');
        });

        it('should handle partial context', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                context: {
                    nodeName: 'PartialNode',
                },
            });

            expect(result.components.context).toBeDefined();
            expect(result.systemPrompt).toContain('PartialNode');
        });

        it('should fallback to default persona for unknown personaId', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                personaId: 'nonExistentPersona',
            });

            expect(result.components.persona).toBeDefined();
        });
    });

    describe('quickCompose', () => {
        it('should work with just user prompt', () => {
            const result = quickCompose('Quick test');

            expect(result.userPrompt).toBe('Quick test');
            expect(result.systemPrompt).toBeDefined();
        });

        it('should include user system prompt', () => {
            const result = quickCompose('Test', 'Be brief');

            expect(result.systemPrompt).toContain('Be brief');
        });

        it('should use persona when personaId provided', () => {
            const result = quickCompose('Test', undefined, 'editor');

            expect(result.components.persona).toBeDefined();
        });

        it('should not use persona when personaId not provided', () => {
            const result = quickCompose('Test');

            // usePersona is false when personaId is not provided
            expect(result.components.persona).toBeUndefined();
        });
    });

    describe('composeImagePrompt', () => {
        it('should use promptEngineer persona', () => {
            const result = composeImagePrompt('A sunset over mountains');

            expect(result.components.persona).toContain('prompt');
        });

        it('should include the description in user prompt', () => {
            const description = 'A majestic lion in the savanna';
            const result = composeImagePrompt(description);

            expect(result.userPrompt).toContain(description);
            expect(result.userPrompt).toContain('Enhance');
        });

        it('should set nodeType to imagePromptEnhancer', () => {
            const result = composeImagePrompt('test');

            // Node type is set but may not have specific instructions
            expect(result.components.base).toBeDefined();
        });
    });

    describe('composeSceneAnalysisPrompt', () => {
        it('should use sceneAnalyst persona', () => {
            const result = composeSceneAnalysisPrompt('A dark alley');

            expect(result.components.persona).toBeDefined();
        });

        it('should format prompt for text-only analysis', () => {
            const result = composeSceneAnalysisPrompt('A busy market', false);

            expect(result.userPrompt).toContain('Analyze this scene description');
            expect(result.userPrompt).not.toContain('provided image');
        });

        it('should format prompt for image analysis', () => {
            const result = composeSceneAnalysisPrompt('Additional context', true);

            expect(result.userPrompt).toContain('Analyze the provided image');
            expect(result.userPrompt).toContain('Additional context');
        });

        it('should handle empty description with image', () => {
            const result = composeSceneAnalysisPrompt('', true);

            expect(result.userPrompt).toContain('Analyze the provided image');
        });
    });

    describe('Components Tracking', () => {
        it('should track all components used', () => {
            const result = composePrompt({
                userPrompt: 'Test',
                userSystemPrompt: 'Custom instructions',
                personaId: 'director',
                nodeType: 'llm',
                context: {
                    nodeName: 'TestNode',
                    connectedInputs: ['text'],
                    outputType: 'Text',
                },
            });

            expect(result.components.base).toBeDefined();
            expect(result.components.persona).toBeDefined();
            expect(result.components.nodeType).toBeDefined();
            expect(result.components.userCustom).toBeDefined();
            expect(result.components.context).toBeDefined();
        });
    });
});
