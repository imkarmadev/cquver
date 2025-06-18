/**
 * Converts PascalCase to kebab-case
 * Example: UserCreatedEvent -> user-created-event
 */
export function toKebabCase(str: string): string {
    return str
        // Add dash before uppercase letters that follow lowercase/numbers
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // Add dash before uppercase letters that are followed by lowercase letters
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        // Convert to lowercase
        .toLowerCase()
        // Remove any leading dashes
        .replace(/^-/, '');
}

/**
 * Converts string to PascalCase
 * Example: user-created-event -> UserCreatedEvent
 */
export function toPascalCase(str: string): string {
    // If already in PascalCase, return as is
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
        return str;
    }

    return str
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * Ensures the name ends with the specified suffix (case-insensitive check)
 * Example: ensureSuffix('UserCreated', 'Event') -> 'UserCreatedEvent'
 */
export function ensureSuffix(name: string, suffix: string): string {
    const lowerName = name.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();

    if (lowerName.endsWith(lowerSuffix)) {
        return name;
    }

    return name + suffix;
}

/**
 * Generates handler name from the main class name
 * Example: UserCreatedEvent -> UserCreatedEventHandler
 */
export function generateHandlerName(className: string): string {
    return className + 'Handler';
}

/**
 * Creates a directory recursively if it doesn't exist
 */
export async function ensureDir(path: string): Promise<void> {
    try {
        await Deno.mkdir(path, { recursive: true });
    } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
            throw error;
        }
    }
} 