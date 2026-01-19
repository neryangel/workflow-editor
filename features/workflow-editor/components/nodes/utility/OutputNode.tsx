'use client';

import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { CheckCircle2, Loader2 } from 'lucide-react';

function OutputNodeComponent({ data, selected }: NodeProps) {
    const nodeData = data as unknown as NodeData;
    const textValue = nodeData.inputs?.in_text?.value as string | undefined;
    const imageValue = nodeData.inputs?.in_image?.value as string | undefined;
    const videoValue = nodeData.inputs?.in_video?.value as string | undefined;

    const hasContent = textValue || imageValue || videoValue;

    return (
        <BaseNode
            label={nodeData.label}
            status={hasContent ? 'success' : nodeData.status}
            error={nodeData.error}
            selected={selected}
            icon={<CheckCircle2 className="w-4 h-4" />}
        >
            <div className="flex flex-col gap-3">
                <div
                    className="min-h-[100px] rounded-lg p-3 flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#0f172a' }}
                >
                    {nodeData.status === 'running' ? (
                        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    ) : imageValue ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={imageValue}
                            alt="Output"
                            className="max-w-full max-h-[150px] rounded object-contain"
                        />
                    ) : videoValue ? (
                        <video
                            src={videoValue}
                            controls
                            className="max-w-full max-h-[150px] rounded"
                        />
                    ) : textValue ? (
                        <p className="text-sm text-slate-300 leading-relaxed">{textValue}</p>
                    ) : (
                        <p className="text-xs text-slate-600">Connect inputs to see output</p>
                    )}
                </div>

                <HandleRow
                    inputs={[
                        { id: 'in_text', type: 'text', label: 'text' },
                        { id: 'in_image', type: 'image', label: 'image' },
                        { id: 'in_video', type: 'video', label: 'video' },
                    ]}
                    outputs={[]}
                />
            </div>
        </BaseNode>
    );
}

export const OutputNode = memo(OutputNodeComponent);
