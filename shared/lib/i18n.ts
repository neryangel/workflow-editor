// i18n Translation System
// Simple translation utility for Hebrew/English

export type Locale = 'en' | 'he';

interface Translations {
    [key: string]: string;
}

const translations: Record<Locale, Translations> = {
    en: {
        // General
        'app.title': 'Workflow Editor',
        'app.subtitle': 'Visual AI Workflow Builder',

        // Sidebar
        'sidebar.title': 'Nodes',
        'sidebar.inputs': 'Inputs',
        'sidebar.models': 'Models',
        'sidebar.utilities': 'Utilities',

        // Nodes
        'node.inputText': 'Text Input',
        'node.inputImage': 'Image Input',
        'node.inputVideo': 'Video Input',
        'node.inputAudio': 'Audio Input',
        'node.llm': 'LLM',
        'node.imageGen': 'Image Gen',
        'node.videoGen': 'Video Gen',
        'node.extractFrame': 'Extract Frame',
        'node.output': 'Output',

        // Toolbar
        'toolbar.save': 'Save',
        'toolbar.load': 'Load',
        'toolbar.export': 'Export',
        'toolbar.import': 'Import',
        'toolbar.run': 'Run',
        'toolbar.undo': 'Undo',
        'toolbar.redo': 'Redo',

        // Messages
        'message.saved': 'Workflow saved',
        'message.loaded': 'Workflow loaded',
        'message.error': 'An error occurred',
        'message.success': 'Success',
    },
    he: {
        // General
        'app.title': 'עורך זרימת עבודה',
        'app.subtitle': 'בונה זרימות עבודה ויזואלי עם AI',

        // Sidebar
        'sidebar.title': 'רכיבים',
        'sidebar.inputs': 'קלטים',
        'sidebar.models': 'מודלים',
        'sidebar.utilities': 'כלים',

        // Nodes
        'node.inputText': 'קלט טקסט',
        'node.inputImage': 'קלט תמונה',
        'node.inputVideo': 'קלט וידאו',
        'node.inputAudio': 'קלט אודיו',
        'node.llm': 'מודל שפה',
        'node.imageGen': 'יצירת תמונה',
        'node.videoGen': 'יצירת וידאו',
        'node.extractFrame': 'חילוץ פריים',
        'node.output': 'פלט',

        // Toolbar
        'toolbar.save': 'שמור',
        'toolbar.load': 'טען',
        'toolbar.export': 'ייצוא',
        'toolbar.import': 'ייבוא',
        'toolbar.run': 'הפעל',
        'toolbar.undo': 'בטל',
        'toolbar.redo': 'בצע שוב',

        // Messages
        'message.saved': 'זרימת העבודה נשמרה',
        'message.loaded': 'זרימת העבודה נטענה',
        'message.error': 'אירעה שגיאה',
        'message.success': 'הצלחה',
    },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
    currentLocale = locale;
    if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    }
}

export function getLocale(): Locale {
    return currentLocale;
}

export function t(key: string, params?: Record<string, string>): string {
    let text = translations[currentLocale][key] || translations.en[key] || key;

    if (params) {
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(`{${param}}`, value);
        });
    }

    return text;
}

export function isRTL(): boolean {
    return currentLocale === 'he';
}
