// i18n Translation System
// Comprehensive translation utility for Hebrew/English

export type Locale = 'en' | 'he';

interface Translations {
    [key: string]: string;
}

const translations: Record<Locale, Translations> = {
    en: {
        // ========== General ==========
        'app.title': 'Workflow Editor',
        'app.subtitle': 'Visual AI Workflow Builder',

        // ========== Sidebar ==========
        'sidebar.title': 'Nodes',
        'sidebar.search': 'Search nodes...',
        'sidebar.inputs': 'Inputs',
        'sidebar.models': 'AI Models',
        'sidebar.utilities': 'Utilities',

        // ========== Nodes ==========
        'node.inputText': 'Text',
        'node.inputText.tooltip': 'Enter text prompts or descriptions',
        'node.inputImage': 'Image',
        'node.inputImage.tooltip': 'Upload or select an image',
        'node.inputVideo': 'Video',
        'node.inputVideo.tooltip': 'Upload or select a video',
        'node.inputAudio': 'Audio',
        'node.inputAudio.tooltip': 'Upload or select an audio file',
        'node.systemPrompt': 'System Prompt',
        'node.systemPrompt.tooltip': 'Define behavior instructions for AI',
        'node.llm': 'Gemini 2.5 Flash',
        'node.llm.tooltip': 'AI language model for text generation',
        'node.imageGen': 'Nano Banana Pro',
        'node.imageGen.tooltip': 'Generate images from text descriptions',
        'node.videoGen': 'Gen-4',
        'node.videoGen.tooltip': 'Generate videos from images',
        'node.extractFrame': 'Extract Frame',
        'node.extractFrame.tooltip': 'Extract a single frame from video',
        'node.upscaler': 'Upscaler',
        'node.upscaler.tooltip': 'Enhance image resolution',
        'node.comment': 'Comment',
        'node.comment.tooltip': 'Add notes to your workflow',
        'node.output': 'Output',
        'node.output.tooltip': 'Final result of the workflow',

        // ========== Toolbar ==========
        'toolbar.file': 'File',
        'toolbar.new': 'New Workflow',
        'toolbar.save': 'Save',
        'toolbar.open': 'Open...',
        'toolbar.export': 'Export JSON',
        'toolbar.import': 'Import JSON',
        'toolbar.templates': 'Templates',
        'toolbar.templates.tooltip': 'Choose a ready-made workflow template',
        'toolbar.run': 'Run all',
        'toolbar.run.tooltip': 'Execute the entire workflow',
        'toolbar.cancel': 'Cancel',

        // ========== Context Menu ==========
        'menu.delete': 'Delete',
        'menu.duplicate': 'Duplicate',

        // ========== Templates ==========
        'templates.title': 'Choose a Template',
        'templates.directorPipeline': 'Director Pipeline',
        'templates.directorPipeline.desc':
            'Upload an image and describe your vision. AI analyzes and generates multiple scenes.',
        'templates.faceReference': 'Face Reference Generator',
        'templates.faceReference.desc':
            'Generate images with consistent faces from reference photos.',
        'templates.videoCreator': 'Video Creator',
        'templates.videoCreator.desc': 'Create videos from images with AI-generated motion.',

        // ========== Help ==========
        'help.title': 'How to use',
        'help.step1': '1. Drag nodes from the sidebar to the canvas',
        'help.step2': '2. Connect nodes by dragging from outputs to inputs',
        'help.step3': '3. Configure each node (text, images, etc.)',
        'help.step4': '4. Click "Run all" to execute the workflow',
        'help.shortcuts': 'Keyboard Shortcuts',
        'help.delete': 'Delete - Remove selected node',
        'help.selectAll': 'Ctrl+A - Select all nodes',

        // ========== Messages ==========
        'message.saved': 'Workflow saved',
        'message.loaded': 'Workflow loaded',
        'message.error': 'An error occurred',
        'message.success': 'Success',
        'message.running': 'Running...',
        'message.noNodes': 'No nodes selected',
    },
    he: {
        // ========== כללי ==========
        'app.title': 'עורך זרימת עבודה',
        'app.subtitle': 'בונה זרימות עבודה ויזואלי עם AI',

        // ========== סרגל צד ==========
        'sidebar.title': 'רכיבים',
        'sidebar.search': 'חפש רכיבים...',
        'sidebar.inputs': 'קלטים',
        'sidebar.models': 'מודלי AI',
        'sidebar.utilities': 'כלים',

        // ========== רכיבים (Nodes) ==========
        'node.inputText': 'טקסט',
        'node.inputText.tooltip': 'הכנס פרומפט או תיאור טקסטואלי',
        'node.inputImage': 'תמונה',
        'node.inputImage.tooltip': 'העלה או בחר תמונה מהמחשב',
        'node.inputVideo': 'וידאו',
        'node.inputVideo.tooltip': 'העלה או בחר קובץ וידאו',
        'node.inputAudio': 'אודיו',
        'node.inputAudio.tooltip': 'העלה או בחר קובץ שמע',
        'node.systemPrompt': 'הוראות מערכת',
        'node.systemPrompt.tooltip': 'הגדר התנהגות ותדרוך ל-AI',
        'node.llm': 'Gemini 2.5 Flash',
        'node.llm.tooltip': 'מודל שפה לעיבוד טקסט והפקת תוכן',
        'node.imageGen': 'Nano Banana Pro',
        'node.imageGen.tooltip': 'יצירת תמונות מתיאור טקסטואלי',
        'node.videoGen': 'Gen-4',
        'node.videoGen.tooltip': 'יצירת וידאו מתמונה',
        'node.extractFrame': 'חילוץ פריים',
        'node.extractFrame.tooltip': 'הוצאת תמונה בודדת מתוך וידאו',
        'node.upscaler': 'הגדלת רזולוציה',
        'node.upscaler.tooltip': 'שיפור איכות ורזולוציית תמונה',
        'node.comment': 'הערה',
        'node.comment.tooltip': 'הוספת הערות ותיעוד לזרימת העבודה',
        'node.output': 'פלט',
        'node.output.tooltip': 'התוצאה הסופית של זרימת העבודה',

        // ========== סרגל כלים ==========
        'toolbar.file': 'קובץ',
        'toolbar.new': 'זרימה חדשה',
        'toolbar.save': 'שמור',
        'toolbar.open': 'פתח...',
        'toolbar.export': 'ייצוא JSON',
        'toolbar.import': 'ייבוא JSON',
        'toolbar.templates': 'תבניות',
        'toolbar.templates.tooltip': 'בחר תבנית זרימת עבודה מוכנה מראש',
        'toolbar.run': 'הפעל הכל',
        'toolbar.run.tooltip': 'הרץ את כל זרימת העבודה',
        'toolbar.cancel': 'בטל',

        // ========== תפריט הקשר ==========
        'menu.delete': 'מחק',
        'menu.duplicate': 'שכפל',

        // ========== תבניות ==========
        'templates.title': 'בחר תבנית',
        'templates.directorPipeline': 'צינור במאי',
        'templates.directorPipeline.desc':
            'העלה תמונה ותאר את החזון שלך. ה-AI מנתח ומייצר סצנות מרובות.',
        'templates.faceReference': 'מחולל פנים עקביות',
        'templates.faceReference.desc': 'יצירת תמונות עם פנים עקביות מתמונות ייחוס.',
        'templates.videoCreator': 'יוצר וידאו',
        'templates.videoCreator.desc': 'יצירת וידאו מתמונה עם תנועה שנוצרה ע"י AI.',

        // ========== עזרה ====
        'help.title': 'איך להשתמש',
        'help.step1': '1. גרור רכיבים מסרגל הצד אל הקנבס',
        'help.step2': '2. חבר רכיבים ע"י גרירה מפלט לקלט',
        'help.step3': "3. הגדר כל רכיב (טקסט, תמונות וכו')",
        'help.step4': '4. לחץ על "הפעל הכל" להרצת זרימת העבודה',
        'help.shortcuts': 'קיצורי מקלדת',
        'help.delete': 'Delete - מחיקת רכיב נבחר',
        'help.selectAll': 'Ctrl+A - בחירת כל הרכיבים',

        // ========== הודעות ==========
        'message.saved': 'זרימת העבודה נשמרה',
        'message.loaded': 'זרימת העבודה נטענה',
        'message.error': 'אירעה שגיאה',
        'message.success': 'הצלחה',
        'message.running': 'רץ...',
        'message.noNodes': 'לא נבחרו רכיבים',
    },
};

let currentLocale: Locale = 'he'; // Default to Hebrew

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

// Get all translation keys for a given prefix
export function getTranslationsForPrefix(prefix: string): Record<string, string> {
    const result: Record<string, string> = {};
    const locale = translations[currentLocale];

    Object.entries(locale).forEach(([key, value]) => {
        if (key.startsWith(prefix)) {
            result[key] = value;
        }
    });

    return result;
}
