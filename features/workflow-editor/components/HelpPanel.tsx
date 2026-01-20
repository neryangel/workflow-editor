'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/shared/lib/i18n-context';

export function HelpPanel() {
    const { t, isRTL } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 p-3 bg-emerald-600 hover:bg-emerald-500 
                           rounded-full shadow-lg transition-all group"
                title={t('help.title')}
            >
                <HelpCircle className="w-6 h-6 text-white" />
                <span
                    className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 
                                 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                    {t('help.title')}
                </span>
            </button>

            {/* Help Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl 
                                    max-w-md w-full mx-4 p-6 ${isRTL ? 'text-right' : 'text-left'}`}
                        onClick={(e) => e.stopPropagation()}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-emerald-400" />
                                {t('help.title')}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span
                                    className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-sm 
                                               font-medium rounded-full flex items-center justify-center"
                                >
                                    1
                                </span>
                                <p className="text-slate-300 text-sm">
                                    {t('help.step1').replace('1. ', '')}
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span
                                    className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-sm 
                                               font-medium rounded-full flex items-center justify-center"
                                >
                                    2
                                </span>
                                <p className="text-slate-300 text-sm">
                                    {t('help.step2').replace('2. ', '')}
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span
                                    className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-sm 
                                               font-medium rounded-full flex items-center justify-center"
                                >
                                    3
                                </span>
                                <p className="text-slate-300 text-sm">
                                    {t('help.step3').replace('3. ', '')}
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span
                                    className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-sm 
                                               font-medium rounded-full flex items-center justify-center"
                                >
                                    4
                                </span>
                                <p className="text-slate-300 text-sm">
                                    {t('help.step4').replace('4. ', '')}
                                </p>
                            </div>
                        </div>

                        {/* Keyboard Shortcuts Accordion */}
                        <div className="border border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setShowShortcuts(!showShortcuts)}
                                className="w-full flex items-center justify-between px-4 py-3 
                                           bg-slate-800/50 hover:bg-slate-800 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-300">
                                    {t('help.shortcuts')}
                                </span>
                                {showShortcuts ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>
                            {showShortcuts && (
                                <div className="px-4 py-3 space-y-2 bg-slate-800/30">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">{t('help.delete')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">
                                            {t('help.selectAll')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pro Tip */}
                        <div className="mt-6 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                            <p className="text-sm text-emerald-300">
                                💡{' '}
                                {isRTL
                                    ? 'טיפ: השתמש בתבניות מוכנות להתחלה מהירה!'
                                    : 'Tip: Use templates for a quick start!'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
