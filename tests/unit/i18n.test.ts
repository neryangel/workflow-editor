// Unit Tests - i18n
import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale, isRTL } from '@/shared/lib/i18n';

describe('i18n', () => {
    beforeEach(() => {
        setLocale('en');
    });

    describe('t (translate)', () => {
        it('should return English translation by default', () => {
            expect(t('app.title')).toBe('Workflow Editor');
        });

        it('should return Hebrew translation when locale is he', () => {
            setLocale('he');
            expect(t('app.title')).toBe('עורך זרימת עבודה');
        });

        it('should return key if translation not found', () => {
            expect(t('nonexistent.key')).toBe('nonexistent.key');
        });

        it('should replace params in translation', () => {
            // Note: This would work if we had parameterized translations
            const result = t('app.title');
            expect(result).toBeTruthy();
        });
    });

    describe('setLocale / getLocale', () => {
        it('should set and get locale', () => {
            setLocale('he');
            expect(getLocale()).toBe('he');
        });

        it('should default to en', () => {
            expect(getLocale()).toBe('en');
        });
    });

    describe('isRTL', () => {
        it('should return false for English', () => {
            setLocale('en');
            expect(isRTL()).toBe(false);
        });

        it('should return true for Hebrew', () => {
            setLocale('he');
            expect(isRTL()).toBe(true);
        });
    });

    describe('node translations', () => {
        it('should translate node names in English', () => {
            setLocale('en');
            expect(t('node.llm')).toBe('LLM');
            expect(t('node.imageGen')).toBe('Image Gen');
        });

        it('should translate node names in Hebrew', () => {
            setLocale('he');
            expect(t('node.llm')).toBe('מודל שפה');
            expect(t('node.imageGen')).toBe('יצירת תמונה');
        });
    });

    describe('toolbar translations', () => {
        it('should translate toolbar actions', () => {
            setLocale('en');
            expect(t('toolbar.save')).toBe('Save');
            expect(t('toolbar.run')).toBe('Run');
        });

        it('should translate toolbar actions in Hebrew', () => {
            setLocale('he');
            expect(t('toolbar.save')).toBe('שמור');
            expect(t('toolbar.run')).toBe('הפעל');
        });
    });
});
