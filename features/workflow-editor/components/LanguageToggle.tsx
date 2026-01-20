'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { setLocale, getLocale, type Locale } from '@/shared/lib/i18n';

export function LanguageToggle() {
    const [locale, setLocaleState] = useState<Locale>(() => getLocale());

    const toggleLanguage = () => {
        const newLocale: Locale = locale === 'he' ? 'en' : 'he';
        setLocale(newLocale);
        setLocaleState(newLocale);
        // Force page reload to apply new translations
        window.location.reload();
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 
                       rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            title={locale === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
            <Globe className="w-4 h-4" />
            <span>{locale === 'he' ? 'EN' : 'עב'}</span>
        </button>
    );
}
