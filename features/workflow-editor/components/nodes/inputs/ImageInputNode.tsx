'use client';

import { memo, useCallback, useRef } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { PORT_COLORS } from '../../../constants';
import { Upload } from 'lucide-react';

function ImageInputNodeComponent({ id, data, selected }: NodeProps) {
    const { setNodes, setEdges } = useReactFlow();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nodeData = data as unknown as NodeData;
    const imageUrl = nodeData.outputs?.out_image?.value as string | undefined;
    const imageColor = PORT_COLORS.image;

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === id) {
                            const currentData = node.data as unknown as NodeData;
                            return {
                                ...node,
                                data: {
                                    ...currentData,
                                    outputs: {
                                        ...currentData.outputs,
                                        out_image: {
                                            ...currentData.outputs.out_image,
                                            value: base64,
                                        },
                                    },
                                },
                            };
                        }
                        return node;
                    })
                );
            };
            reader.readAsDataURL(file);
        },
        [id, setNodes]
    );

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [id, setNodes, setEdges]);

    const handleLabelChange = useCallback(
        (newLabel: string) => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        const currentData = node.data as unknown as NodeData;
                        return {
                            ...node,
                            data: {
                                ...currentData,
                                label: newLabel,
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [id, setNodes]
    );

    const handleDuplicate = useCallback(() => {
        const newId = `${id}-copy-${Date.now()}`;
        setNodes((nds) => {
            const nodeToDuplicate = nds.find((n) => n.id === id);
            if (!nodeToDuplicate) return nds;

            const newNode = {
                ...nodeToDuplicate,
                id: newId,
                position: {
                    x: nodeToDuplicate.position.x + 50,
                    y: nodeToDuplicate.position.y + 50,
                },
                selected: false,
            };

            return [...nds, newNode];
        });
    }, [id, setNodes]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
            onDelete={handleDelete}
            onLabelChange={handleLabelChange}
            onDuplicate={handleDuplicate}
        >
            <div className="flex flex-col gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed cursor-pointer
                     overflow-hidden flex items-center justify-center min-h-[100px] transition-colors"
                    style={{
                        borderColor: imageUrl ? `${imageColor}50` : '#334155',
                        backgroundColor: '#0f172a',
                    }}
                >
                    {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs text-slate-500">Click to upload</p>
                        </div>
                    )}
                </div>
                <HandleRow outputs={[{ id: 'out_image', type: 'image', label: 'image' }]} />
            </div>
        </BaseNode>
    );
}

export const ImageInputNode = memo(ImageInputNodeComponent);
