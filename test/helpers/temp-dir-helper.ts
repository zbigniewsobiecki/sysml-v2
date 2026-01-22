/**
 * Temp directory helper for tests
 *
 * Provides utilities for creating and cleaning up temporary test directories.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TempDirContext {
    /** The absolute path to the temp directory */
    tempDir: string;
    /** Setup function to call in beforeEach */
    setup: () => Promise<void>;
    /** Teardown function to call in afterEach */
    teardown: () => Promise<void>;
    /** Helper to get a file path within the temp directory */
    filePath: (filename: string) => string;
    /** Helper to write a file to the temp directory */
    writeFile: (filename: string, content: string) => Promise<string>;
}

/**
 * Create a temp directory helper for use in test suites.
 *
 * Usage:
 * ```ts
 * const temp = useTempDir(__dirname);
 *
 * beforeEach(temp.setup);
 * afterEach(temp.teardown);
 *
 * it('should do something', async () => {
 *     const filePath = await temp.writeFile('test.sysml', 'package P;');
 *     // use filePath...
 * });
 * ```
 *
 * @param baseDir - The base directory (typically __dirname from the test file)
 * @param subdir - Optional subdirectory name (defaults to '../fixtures/.temp')
 * @returns An object with setup, teardown, and helper functions
 */
export function useTempDir(baseDir: string, subdir: string = '../fixtures/.temp'): TempDirContext {
    const tempDir = path.join(baseDir, subdir);

    const setup = async (): Promise<void> => {
        await fs.mkdir(tempDir, { recursive: true });
    };

    const teardown = async (): Promise<void> => {
        try {
            const files = await fs.readdir(tempDir);
            for (const file of files) {
                await fs.unlink(path.join(tempDir, file));
            }
            await fs.rmdir(tempDir);
        } catch {
            // Ignore cleanup errors
        }
    };

    const filePath = (filename: string): string => {
        return path.join(tempDir, filename);
    };

    const writeFile = async (filename: string, content: string): Promise<string> => {
        const fullPath = filePath(filename);
        await fs.writeFile(fullPath, content);
        return fullPath;
    };

    return {
        tempDir,
        setup,
        teardown,
        filePath,
        writeFile
    };
}
