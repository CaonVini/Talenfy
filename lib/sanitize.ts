export function sanitizeInput(input: string): string {
    if (!input) return '';

    let sanitized = input;

    sanitized = sanitized.replace(/<[^>]*>/g, '');

    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+=/gi, '');

    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    sanitized = sanitized.trim();

    return sanitized;
}
