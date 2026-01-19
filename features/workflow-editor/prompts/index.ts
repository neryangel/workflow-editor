// Prompt System - Main exports

export {
    BASE_SYSTEM_PROMPT,
    NODE_TYPE_INSTRUCTIONS,
    WORKFLOW_CONTEXT_TEMPLATE,
} from './system/base';
export {
    PERSONAS,
    DEFAULT_PERSONA,
    getPersonaById,
    getAllPersonas,
    type Persona,
} from './personas';
export {
    composePrompt,
    quickCompose,
    composeImagePrompt,
    composeSceneAnalysisPrompt,
    type PromptComposerInput,
    type ComposedPrompt,
} from './utils/prompt-composer';
