// Security Utilities
// Common security functions

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${prefix}${timestamp}-${randomPart}`;
}

/**
 * Check if a string might contain injection attempts
 */
export function detectInjection(input: string): boolean {
    const patterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /data:/i, /vbscript:/i];
    return patterns.some((pattern) => pattern.test(input));
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(value: string, visibleChars: number = 4): string {
    if (value.length <= visibleChars) {
        return '*'.repeat(value.length);
    }
    return value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars);
}
