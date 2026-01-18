// Node Registry Unit Tests
// Tests for node definitions, registry helpers, and categories

import { describe, it, expect } from 'vitest';
import {
    NODE_REGISTRY,
    getNodeDefinition,
    getNodesByCategory,
    NodeTypeDefinition,
} from '@features/workflow-editor/constants/nodeRegistry';
import { WorkflowNodeType, NodeCategory } from '@features/workflow-editor/types';

describe('NODE_REGISTRY', () => {
    describe('structure validation', () => {
        it('should have at least 10 node types defined', () => {
            expect(NODE_REGISTRY.length).toBeGreaterThanOrEqual(10);
        });

        it('should have unique node types', () => {
            const types = NODE_REGISTRY.map((n) => n.type);
            const uniqueTypes = new Set(types);
            expect(types.length).toBe(uniqueTypes.size);
        });

        it('should have all required properties for each node', () => {
            for (const node of NODE_REGISTRY) {
                expect(node.type).toBeDefined();
                expect(node.label).toBeDefined();
                expect(node.description).toBeDefined();
                expect(node.category).toBeDefined();
                expect(node.defaultData).toBeDefined();
            }
        });

        it('should have valid default data structure', () => {
            for (const node of NODE_REGISTRY) {
                expect(node.defaultData.label).toBeDefined();
                expect(node.defaultData.status).toBe('idle');
                expect(node.defaultData.inputs).toBeDefined();
                expect(node.defaultData.outputs).toBeDefined();
            }
        });
    });

    describe('input nodes', () => {
        const inputTypes: WorkflowNodeType[] = [
            'inputText',
            'inputImage',
            'inputVideo',
            'inputAudio',
        ];

        it('should have all input node types', () => {
            for (const type of inputTypes) {
                const node = NODE_REGISTRY.find((n) => n.type === type);
                expect(node).toBeDefined();
                expect(node?.category).toBe('input');
            }
        });

        it('input nodes should have no inputs and one output', () => {
            for (const type of inputTypes) {
                const node = NODE_REGISTRY.find((n) => n.type === type);
                expect(Object.keys(node!.defaultData.inputs)).toHaveLength(0);
                expect(Object.keys(node!.defaultData.outputs).length).toBeGreaterThan(0);
            }
        });
    });

    describe('model nodes', () => {
        it('should have LLM node with correct configuration', () => {
            const llm = NODE_REGISTRY.find((n) => n.type === 'llm');
            expect(llm).toBeDefined();
            expect(llm?.category).toBe('models');
            expect(llm?.defaultData.inputs.in_text).toBeDefined();
            expect(llm?.defaultData.outputs.out_text).toBeDefined();
            expect(llm?.defaultData.meta?.model).toBe('gemini-2.5-flash');
        });

        it('should have imageGen node with text and image inputs', () => {
            const imageGen = NODE_REGISTRY.find((n) => n.type === 'imageGen');
            expect(imageGen).toBeDefined();
            expect(imageGen?.category).toBe('models');
            expect(imageGen?.defaultData.inputs.in_text).toBeDefined();
            expect(imageGen?.defaultData.inputs.in_image).toBeDefined();
            expect(imageGen?.defaultData.outputs.out_image).toBeDefined();
        });

        it('should have videoGen node with text and image inputs', () => {
            const videoGen = NODE_REGISTRY.find((n) => n.type === 'videoGen');
            expect(videoGen).toBeDefined();
            expect(videoGen?.category).toBe('models');
            expect(videoGen?.defaultData.inputs.in_text).toBeDefined();
            expect(videoGen?.defaultData.outputs.out_video).toBeDefined();
        });

        it('should have extractFrame node with video input', () => {
            const extractFrame = NODE_REGISTRY.find((n) => n.type === 'extractFrame');
            expect(extractFrame).toBeDefined();
            expect(extractFrame?.defaultData.inputs.in_video).toBeDefined();
            expect(extractFrame?.defaultData.outputs.out_image).toBeDefined();
        });
    });

    describe('utility nodes', () => {
        it('should have comment node with no I/O', () => {
            const comment = NODE_REGISTRY.find((n) => n.type === 'comment');
            expect(comment).toBeDefined();
            expect(comment?.category).toBe('utility');
            expect(Object.keys(comment!.defaultData.inputs)).toHaveLength(0);
            expect(Object.keys(comment!.defaultData.outputs)).toHaveLength(0);
        });

        it('should have variable node with any type I/O', () => {
            const variable = NODE_REGISTRY.find((n) => n.type === 'variable');
            expect(variable).toBeDefined();
            expect(variable?.defaultData.inputs.in_value?.type).toBe('any');
            expect(variable?.defaultData.outputs.out_value?.type).toBe('any');
        });

        it('should have output node with multiple inputs', () => {
            const output = NODE_REGISTRY.find((n) => n.type === 'output');
            expect(output).toBeDefined();
            expect(output?.defaultData.inputs.in_text).toBeDefined();
            expect(output?.defaultData.inputs.in_image).toBeDefined();
            expect(output?.defaultData.inputs.in_video).toBeDefined();
        });
    });
});

describe('getNodeDefinition', () => {
    it('should return node definition for valid type', () => {
        const result = getNodeDefinition('llm');
        expect(result).toBeDefined();
        expect(result?.type).toBe('llm');
        expect(result?.label).toBe('Gemini 2.5 Flash');
    });

    it('should return undefined for invalid type', () => {
        const result = getNodeDefinition('invalidType' as WorkflowNodeType);
        expect(result).toBeUndefined();
    });

    it('should return correct definition for each input type', () => {
        expect(getNodeDefinition('inputText')?.label).toBe('Text');
        expect(getNodeDefinition('inputImage')?.label).toBe('Image');
        expect(getNodeDefinition('inputVideo')?.label).toBe('Video');
        expect(getNodeDefinition('inputAudio')?.label).toBe('Audio');
    });

    it('should return correct definition for each model type', () => {
        expect(getNodeDefinition('llm')?.label).toBe('Gemini 2.5 Flash');
        expect(getNodeDefinition('imageGen')?.label).toBe('Nano Banana Pro');
        expect(getNodeDefinition('videoGen')?.label).toBe('Gen-4');
        expect(getNodeDefinition('extractFrame')?.label).toBe('Extract Frame');
    });
});

describe('getNodesByCategory', () => {
    it('should return all input nodes for input category', () => {
        const inputNodes = getNodesByCategory('input');
        expect(inputNodes.length).toBeGreaterThanOrEqual(4);
        expect(inputNodes.every((n) => n.category === 'input')).toBe(true);
    });

    it('should return all model nodes for models category', () => {
        const modelNodes = getNodesByCategory('models');
        expect(modelNodes.length).toBeGreaterThanOrEqual(3);
        expect(modelNodes.every((n) => n.category === 'models')).toBe(true);
    });

    it('should return all utility nodes for utility category', () => {
        const utilityNodes = getNodesByCategory('utility');
        expect(utilityNodes.length).toBeGreaterThanOrEqual(2);
        expect(utilityNodes.every((n) => n.category === 'utility')).toBe(true);
    });

    it('should return empty array for invalid category', () => {
        const invalidNodes = getNodesByCategory('invalid' as NodeCategory);
        expect(invalidNodes).toEqual([]);
    });

    it('should not include nodes from other categories', () => {
        const inputNodes = getNodesByCategory('input');
        const modelNodes = getNodesByCategory('models');

        const inputTypes = new Set(inputNodes.map((n) => n.type));
        const modelTypes = new Set(modelNodes.map((n) => n.type));

        // No overlap between categories
        for (const type of inputTypes) {
            expect(modelTypes.has(type)).toBe(false);
        }
    });
});
