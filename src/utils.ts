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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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

/**
 * Validates if a string follows conventional commit format
 * @param commitMessage - The commit message to validate
 * @returns true if valid, false otherwise
 */
export function isValidConventionalCommit(commitMessage: string): boolean {
  if (!commitMessage.includes(':')) {
    return false;
  }

  const prefix = commitMessage.split(':')[0];
  const type = prefix.replace(/\([^)]+\)/, '').replace('!', '');

  const validTypes = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ];

  return validTypes.includes(type);
}

/**
 * Formats a version string with proper semantic versioning
 * @param major - Major version number
 * @param minor - Minor version number  
 * @param patch - Patch version number
 * @param prerelease - Optional prerelease identifier
 * @returns Formatted version string
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  prerelease?: string,
): string {
  const baseVersion = `${major}.${minor}.${patch}`;
  return prerelease ? `${baseVersion}-${prerelease}` : baseVersion;
}

/**
 * Parses a semantic version string into its components
 * @param version - Version string to parse (e.g., "1.2.3" or "1.2.3-beta.1")
 * @returns Object with version components or null if invalid
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
} | null {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
  const match = version.match(semverRegex);
  
  if (!match) {
    return null;
  }
  
  const result = {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
  
  if (match[4]) {
    (result as any).prerelease = match[4];
  }
  
  return result;
}
