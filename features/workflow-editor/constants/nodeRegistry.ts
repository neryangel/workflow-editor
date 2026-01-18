// Node Registry - Definitions for all available nodes

import { NodeData, WorkflowNodeType, NodeCategory } from '../types';

export interface NodeTypeDefinition {
    type: WorkflowNodeType;
    label: string;
    description: string;
    category: NodeCategory;
    defaultData: NodeData;
}

export const NODE_REGISTRY: NodeTypeDefinition[] = [
    // === INPUT NODES ===
    {
        type: 'inputText',
        label: 'Text',
        description: 'Text prompt input',
        category: 'input',
        defaultData: {
            label: 'Text',
            status: 'idle',
            inputs: {},
            outputs: {
                out_text: { type: 'text' },
            },
        },
    },
    {
        type: 'inputImage',
        label: 'Image',
        description: 'Upload an image',
        category: 'input',
        defaultData: {
            label: 'Image',
            status: 'idle',
            inputs: {},
            outputs: {
                out_image: { type: 'image' },
            },
        },
    },
    {
        type: 'inputVideo',
        label: 'Video',
        description: 'Upload a video',
        category: 'input',
        defaultData: {
            label: 'Video',
            status: 'idle',
            inputs: {},
            outputs: {
                out_video: { type: 'video' },
            },
        },
    },
    {
        type: 'inputAudio',
        label: 'Audio',
        description: 'Upload audio',
        category: 'input',
        defaultData: {
            label: 'Audio',
            status: 'idle',
            inputs: {},
            outputs: {
                out_audio: { type: 'audio' },
            },
        },
    },
    {
        type: 'systemPrompt',
        label: 'System Prompt',
        description: 'System instructions for LLM',
        category: 'input',
        defaultData: {
            label: 'System Prompt',
            status: 'idle',
            inputs: {},
            outputs: {
                out_text: { type: 'text' },
            },
        },
    },

    // === MEDIA MODELS ===
    {
        type: 'llm',
        label: 'Gemini 2.5 Flash',
        description: 'AI language model (multi-modal)',
        category: 'models',
        defaultData: {
            label: 'Gemini 2.5 Flash',
            status: 'idle',
            inputs: {
                in_system: { type: 'text' },
                in_text: { type: 'text' },
                in_image: { type: 'image' },
            },
            outputs: {
                out_text: { type: 'text' },
            },
            meta: {
                model: 'gemini-2.5-flash',
            },
        },
    },
    {
        type: 'imageGen',
        label: 'Nano Banana Pro',
        description: 'Text/Image to Image',
        category: 'models',
        defaultData: {
            label: 'Nano Banana Pro',
            status: 'idle',
            inputs: {
                in_text: { type: 'text' },
                in_image: { type: 'image' },
            },
            outputs: {
                out_image: { type: 'image' },
            },
        },
    },
    {
        type: 'videoGen',
        label: 'Gen-4',
        description: 'Text/Image to Video',
        category: 'models',
        defaultData: {
            label: 'Gen-4',
            status: 'idle',
            inputs: {
                in_text: { type: 'text' },
                in_image: { type: 'image' },
            },
            outputs: {
                out_video: { type: 'video' },
            },
        },
    },
    {
        type: 'extractFrame',
        label: 'Extract Frame',
        description: 'Extract frame from video',
        category: 'models',
        defaultData: {
            label: 'Extract Frame',
            status: 'idle',
            inputs: {
                in_video: { type: 'video' },
            },
            outputs: {
                out_image: { type: 'image' },
            },
            meta: {
                timestamp: 0,
            },
        },
    },
    {
        type: 'upscaler',
        label: 'Upscaler',
        description: 'Upscale image 2x/4x',
        category: 'models',
        defaultData: {
            label: 'Upscaler',
            status: 'idle',
            inputs: {
                in_image: { type: 'image' },
            },
            outputs: {
                out_image: { type: 'image' },
            },
            meta: {
                scale: 2,
            },
        },
    },

    // === UTILITY NODES ===
    {
        type: 'comment',
        label: 'Comment',
        description: 'Add notes to workflow',
        category: 'utility',
        defaultData: {
            label: 'Comment',
            status: 'idle',
            inputs: {},
            outputs: {},
            meta: {
                text: '',
                color: '#fbbf24',
            },
        },
    },
    {
        type: 'variable',
        label: 'Variable',
        description: 'Store and retrieve values',
        category: 'utility',
        defaultData: {
            label: 'Var: value',
            status: 'idle',
            inputs: {
                in_value: { type: 'any' },
            },
            outputs: {
                out_value: { type: 'any' },
            },
            meta: {
                name: 'value',
            },
        },
    },
    {
        type: 'output',
        label: 'Output',
        description: 'Final output display',
        category: 'utility',
        defaultData: {
            label: 'Output',
            status: 'idle',
            inputs: {
                in_text: { type: 'text' },
                in_image: { type: 'image' },
                in_video: { type: 'video' },
            },
            outputs: {},
        },
    },
];

// Helper to get node definition by type
export function getNodeDefinition(type: WorkflowNodeType): NodeTypeDefinition | undefined {
    return NODE_REGISTRY.find((n) => n.type === type);
}

// Helper to get nodes by category
export function getNodesByCategory(category: NodeCategory): NodeTypeDefinition[] {
    return NODE_REGISTRY.filter((n) => n.category === category);
}
