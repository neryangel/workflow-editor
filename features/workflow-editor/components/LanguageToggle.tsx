'use client';

import { Globe } from 'lucide-react';
import { useI18n } from '@/shared/lib/i18n-context';

export function LanguageToggle() {
    const { locale, toggleLocale } = useI18n();

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 
                       rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            title={locale === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
            <Globe className="w-4 h-4" />
            <span>{locale === 'he' ? 'EN' : 'עב'}</span>
        </button>
    );
}
