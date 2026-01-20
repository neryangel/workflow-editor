'use client';

// I18n Context Provider for Reactive Language Switching
// Professional implementation with localStorage persistence and no page reload

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react';
import {
    type Locale,
    setLocale as setGlobalLocale,
    t as translate,
    isRTL as checkRTL,
} from './i18n';

// Storage key for localStorage
const LOCALE_STORAGE_KEY = 'workflow-editor-locale';

// Get initial locale from localStorage or default
function getInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'he';
    try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === 'en' || stored === 'he') return stored;
    } catch {
        // localStorage not available
    }
    return 'he';
}

// Context type definition
interface I18nContextType {
    locale: Locale;
    isRTL: boolean;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: string, params?: Record<string, string>) => string;
}

// Create context with undefined default
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
interface I18nProviderProps {
    children: ReactNode;
    defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(() => defaultLocale ?? getInitialLocale());
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydration effect - sync with localStorage after mount
    useEffect(() => {
        const storedLocale = getInitialLocale();
        if (storedLocale !== locale) {
            setLocaleState(storedLocale);
        }
        setGlobalLocale(storedLocale);
        setIsHydrated(true);
    }, []);

    // Update document and localStorage when locale changes
    useEffect(() => {
        if (!isHydrated) return;

        setGlobalLocale(locale);

        try {
            localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        } catch {
            // localStorage not available
        }

        // Update document direction and language
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
        }
    }, [locale, isHydrated]);

    // Set locale handler
    const handleSetLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
    }, []);

    // Toggle between locales
    const toggleLocale = useCallback(() => {
        setLocaleState((prev) => (prev === 'he' ? 'en' : 'he'));
    }, []);

    // Translation function bound to current locale
    const t = useCallback(
        (key: string, params?: Record<string, string>) => {
            return translate(key, params);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [locale] // Re-create when locale changes to get fresh translations
    );

    // Memoized context value
    const contextValue = useMemo<I18nContextType>(
        () => ({
            locale,
            isRTL: locale === 'he',
            setLocale: handleSetLocale,
            toggleLocale,
            t,
        }),
        [locale, handleSetLocale, toggleLocale, t]
    );

    return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

// Custom hook for using i18n
export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);

    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }

    return context;
}

// Convenience hook for just translations
export function useTranslation() {
    const { t, locale, isRTL } = useI18n();
    return { t, locale, isRTL };
}
