'use client';

import { DragEvent, useMemo } from 'react';
import { NodeTypeDefinition, WorkflowNodeType } from '../../types';
import { NODE_REGISTRY, PORT_COLORS } from '../../constants';
import { useI18n } from '@/shared/lib/i18n-context';
import {
    Type,
    Sparkles,
    Image as ImageIcon,
    Video,
    Music,
    Film,
    Scissors,
    GripVertical,
    Search,
    MessageSquare,
    Database,
    CheckCircle2,
} from 'lucide-react';

const nodeIcons: Record<WorkflowNodeType, React.ReactNode> = {
    inputText: <Type className="w-5 h-5" />,
    inputImage: <ImageIcon className="w-5 h-5" />,
    inputVideo: <Video className="w-5 h-5" />,
    inputAudio: <Music className="w-5 h-5" />,
    systemPrompt: <Type className="w-5 h-5" />,
    llm: <Sparkles className="w-5 h-5" />,
    imageGen: <ImageIcon className="w-5 h-5" />,
    videoGen: <Film className="w-5 h-5" />,
    extractFrame: <Scissors className="w-5 h-5" />,
    upscaler: <ImageIcon className="w-5 h-5" />,
    audioGen: <Music className="w-5 h-5" />,
    comment: <MessageSquare className="w-5 h-5" />,
    variable: <Database className="w-5 h-5" />,
    output: <CheckCircle2 className="w-5 h-5" />,
};

interface PaletteNodeProps {
    node: NodeTypeDefinition;
    categoryColor: string;
}

function PaletteNode({ node, categoryColor }: PaletteNodeProps) {
    const { t } = useI18n();

    // Get translated label and description from i18n
    const translatedLabel = t(`node.${node.type}`) || node.label;
    const translatedDescription = t(`node.${node.type}.tooltip`) || node.description;

    const onDragStart = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('application/reactflow', node.type);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="group flex items-center gap-3 p-3 rounded-xl border cursor-grab
                 transition-all duration-200 hover:scale-[1.02]
                 active:cursor-grabbing active:scale-[0.98]
                 bg-slate-800/50 border-slate-700/50
                 hover:bg-slate-800 hover:border-slate-600"
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${categoryColor}20`;
                e.currentTarget.style.borderColor = `${categoryColor}50`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '';
            }}
        >
            <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                }}
            >
                {nodeIcons[node.type]}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-200 truncate">
                    {translatedLabel}
                </span>
                <span className="text-[10px] text-slate-500 truncate">{translatedDescription}</span>
            </div>
        </div>
    );
}

export function NodePalette() {
    const { t, isRTL, locale } = useI18n();

    // Translated category config - recalculates when locale changes
    const categoryConfig = useMemo(
        () => ({
            input: {
                label: t('sidebar.inputs'),
                color: PORT_COLORS.text,
            },
            models: {
                label: t('sidebar.models'),
                color: '#a855f7',
            },
            utility: {
                label: t('sidebar.utilities'),
                color: '#64748b',
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }),
        [locale]
    );

    const categories = ['input', 'models', 'utility'] as const;

    return (
        <div
            className={`w-64 h-full bg-slate-950 border-slate-800 flex flex-col ${isRTL ? 'border-l' : 'border-r'}`}
            suppressHydrationWarning
        >
            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRTL ? 'right-3' : 'left-3'}`}
                    />
                    <input
                        type="text"
                        placeholder={t('sidebar.search')}
                        className={`w-full py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-lg
                       text-slate-300 placeholder-slate-600
                       focus:outline-none focus:border-slate-700 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                    />
                </div>
            </div>

            {/* Node categories */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
                {categories.map((category) => {
                    const nodes = NODE_REGISTRY.filter((n) => n.category === category);
                    const config = categoryConfig[category];
                    if (nodes.length === 0) return null;

                    return (
                        <div key={category}>
                            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
                                {config.label}
                            </h3>
                            <div className="space-y-1.5">
                                {nodes.map((node) => (
                                    <PaletteNode
                                        key={node.type}
                                        node={node}
                                        categoryColor={config.color}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
