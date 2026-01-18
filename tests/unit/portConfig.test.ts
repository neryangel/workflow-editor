// Port Configuration Unit Tests
// Tests for port colors and compatibility

import { describe, it, expect } from 'vitest';
import {
    PORT_COLORS,
    PORT_COMPATIBILITY,
    arePortsCompatible,
} from '@features/workflow-editor/constants/portConfig';
import { PortType } from '@features/workflow-editor/types';

describe('PORT_COLORS', () => {
    it('should have color defined for text port', () => {
        expect(PORT_COLORS.text).toBe('#22c55e');
    });

    it('should have color defined for image port', () => {
        expect(PORT_COLORS.image).toBe('#ec4899');
    });

    it('should have color defined for video port', () => {
        expect(PORT_COLORS.video).toBe('#3b82f6');
    });

    it('should have color defined for audio port', () => {
        expect(PORT_COLORS.audio).toBe('#eab308');
    });

    it('should have color defined for any port', () => {
        expect(PORT_COLORS.any).toBe('#a855f7');
    });

    it('should have all port types defined', () => {
        const portTypes: PortType[] = ['text', 'image', 'video', 'audio', 'any'];
        for (const type of portTypes) {
            expect(PORT_COLORS[type]).toBeDefined();
            expect(typeof PORT_COLORS[type]).toBe('string');
        }
    });

    it('should have valid hex color format', () => {
        const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
        for (const [, color] of Object.entries(PORT_COLORS)) {
            expect(color).toMatch(hexColorPattern);
        }
    });
});

describe('PORT_COMPATIBILITY', () => {
    it('text should be compatible with text and any', () => {
        expect(PORT_COMPATIBILITY.text).toContain('text');
        expect(PORT_COMPATIBILITY.text).toContain('any');
        expect(PORT_COMPATIBILITY.text).toHaveLength(2);
    });

    it('image should be compatible with image and any', () => {
        expect(PORT_COMPATIBILITY.image).toContain('image');
        expect(PORT_COMPATIBILITY.image).toContain('any');
        expect(PORT_COMPATIBILITY.image).toHaveLength(2);
    });

    it('video should be compatible with video and any', () => {
        expect(PORT_COMPATIBILITY.video).toContain('video');
        expect(PORT_COMPATIBILITY.video).toContain('any');
        expect(PORT_COMPATIBILITY.video).toHaveLength(2);
    });

    it('audio should be compatible with audio and any', () => {
        expect(PORT_COMPATIBILITY.audio).toContain('audio');
        expect(PORT_COMPATIBILITY.audio).toContain('any');
        expect(PORT_COMPATIBILITY.audio).toHaveLength(2);
    });

    it('any should be compatible with all port types', () => {
        const allTypes: PortType[] = ['text', 'image', 'video', 'audio', 'any'];
        for (const type of allTypes) {
            expect(PORT_COMPATIBILITY.any).toContain(type);
        }
        expect(PORT_COMPATIBILITY.any).toHaveLength(5);
    });
});

describe('arePortsCompatible', () => {
    describe('Happy paths - same type connections', () => {
        it('should allow text to text connection', () => {
            expect(arePortsCompatible('text', 'text')).toBe(true);
        });

        it('should allow image to image connection', () => {
            expect(arePortsCompatible('image', 'image')).toBe(true);
        });

        it('should allow video to video connection', () => {
            expect(arePortsCompatible('video', 'video')).toBe(true);
        });

        it('should allow audio to audio connection', () => {
            expect(arePortsCompatible('audio', 'audio')).toBe(true);
        });

        it('should allow any to any connection', () => {
            expect(arePortsCompatible('any', 'any')).toBe(true);
        });
    });

    describe('Happy paths - any type connections', () => {
        it('should allow text to any connection', () => {
            expect(arePortsCompatible('text', 'any')).toBe(true);
        });

        it('should allow image to any connection', () => {
            expect(arePortsCompatible('image', 'any')).toBe(true);
        });

        it('should allow any to text connection', () => {
            expect(arePortsCompatible('any', 'text')).toBe(true);
        });

        it('should allow any to image connection', () => {
            expect(arePortsCompatible('any', 'image')).toBe(true);
        });

        it('should allow any to video connection', () => {
            expect(arePortsCompatible('any', 'video')).toBe(true);
        });

        it('should allow any to audio connection', () => {
            expect(arePortsCompatible('any', 'audio')).toBe(true);
        });
    });

    describe('Edge cases - incompatible types', () => {
        it('should reject text to image connection', () => {
            expect(arePortsCompatible('text', 'image')).toBe(false);
        });

        it('should reject text to video connection', () => {
            expect(arePortsCompatible('text', 'video')).toBe(false);
        });

        it('should reject image to text connection', () => {
            expect(arePortsCompatible('image', 'text')).toBe(false);
        });

        it('should reject image to video connection', () => {
            expect(arePortsCompatible('image', 'video')).toBe(false);
        });

        it('should reject video to text connection', () => {
            expect(arePortsCompatible('video', 'text')).toBe(false);
        });

        it('should reject video to audio connection', () => {
            expect(arePortsCompatible('video', 'audio')).toBe(false);
        });

        it('should reject audio to text connection', () => {
            expect(arePortsCompatible('audio', 'text')).toBe(false);
        });

        it('should reject audio to image connection', () => {
            expect(arePortsCompatible('audio', 'image')).toBe(false);
        });
    });

    describe('Edge cases - invalid inputs', () => {
        it('should return false for undefined source type', () => {
            expect(arePortsCompatible(undefined as unknown as PortType, 'text')).toBe(false);
        });

        it('should return false for null source type', () => {
            expect(arePortsCompatible(null as unknown as PortType, 'text')).toBe(false);
        });

        it('should return false for invalid source type', () => {
            expect(arePortsCompatible('invalid' as unknown as PortType, 'text')).toBe(false);
        });
    });
});
