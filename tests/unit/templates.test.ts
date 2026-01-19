// Unit Tests - Templates
import { describe, it, expect } from 'vitest';
import {
    WORKFLOW_TEMPLATES,
    getTemplatesByCategory,
    getTemplateById,
} from '@features/workflow-editor/constants/templates';

describe('Templates', () => {
    describe('WORKFLOW_TEMPLATES', () => {
        it('should have at least one template', () => {
            expect(WORKFLOW_TEMPLATES.length).toBeGreaterThan(0);
        });

        it('should have unique IDs for all templates', () => {
            const ids = WORKFLOW_TEMPLATES.map((t) => t.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have valid structure for all templates', () => {
            WORKFLOW_TEMPLATES.forEach((template) => {
                expect(template).toHaveProperty('id');
                expect(template).toHaveProperty('name');
                expect(template).toHaveProperty('category');
                expect(template).toHaveProperty('nodes');
                expect(template).toHaveProperty('edges');
                expect(Array.isArray(template.nodes)).toBe(true);
                expect(Array.isArray(template.edges)).toBe(true);
            });
        });

        it('should have valid nodes with required properties', () => {
            WORKFLOW_TEMPLATES.forEach((template) => {
                template.nodes.forEach((node) => {
                    expect(node).toHaveProperty('id');
                    expect(node).toHaveProperty('type');
                    expect(node).toHaveProperty('position');
                    expect(node).toHaveProperty('data');
                    expect(node.position).toHaveProperty('x');
                    expect(node.position).toHaveProperty('y');
                });
            });
        });

        it('should have valid edges with required properties', () => {
            WORKFLOW_TEMPLATES.forEach((template) => {
                template.edges.forEach((edge) => {
                    expect(edge).toHaveProperty('id');
                    expect(edge).toHaveProperty('source');
                    expect(edge).toHaveProperty('target');
                });
            });
        });
    });

    describe('getTemplatesByCategory', () => {
        it('should return templates filtered by category', () => {
            const basicTemplates = getTemplatesByCategory('basic');
            basicTemplates.forEach((t) => {
                expect(t.category).toBe('basic');
            });
        });

        it('should return empty array for non-existent category', () => {
            const templates = getTemplatesByCategory('non-existent-category' as never);
            expect(templates).toEqual([]);
        });

        it('should return advanced templates', () => {
            const advancedTemplates = getTemplatesByCategory('advanced');
            advancedTemplates.forEach((t) => {
                expect(t.category).toBe('advanced');
            });
        });
    });

    describe('getTemplateById', () => {
        it('should return template by ID', () => {
            const firstTemplate = WORKFLOW_TEMPLATES[0];
            const found = getTemplateById(firstTemplate.id);
            expect(found).toEqual(firstTemplate);
        });

        it('should return undefined for non-existent ID', () => {
            const found = getTemplateById('non-existent-id');
            expect(found).toBeUndefined();
        });

        it('should find simple-text-to-image template', () => {
            const template = getTemplateById('simple-text-to-image');
            if (template) {
                expect(template.name).toBeDefined();
                expect(template.nodes.length).toBeGreaterThan(0);
            }
        });
    });
});
