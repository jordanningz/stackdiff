import * as path from 'path';
import * as fs from 'fs';

export interface ResolveOptions {
  basePath?: string;
  extensions?: string[];
  allowMissing?: boolean;
}

export interface ResolvedPath {
  absolute: string;
  relative: string;
  exists: boolean;
  extension: string;
}

const DEFAULT_EXTENSIONS = ['.env', '.json', '.yaml', '.yml', '.toml'];

export function resolvePath(
  filePath: string,
  options: ResolveOptions = {}
): ResolvedPath {
  const basePath = options.basePath ?? process.cwd();
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(basePath, filePath);

  const exists = fs.existsSync(absolute);
  const extension = path.extname(absolute);

  if (!exists && !options.allowMissing) {
    const tried = extensions
      .map((ext) => absolute + ext)
      .find((p) => fs.existsSync(p));

    if (tried) {
      return {
        absolute: tried,
        relative: path.relative(basePath, tried),
        exists: true,
        extension: path.extname(tried),
      };
    }
  }

  return {
    absolute,
    relative: path.relative(basePath, absolute),
    exists,
    extension,
  };
}

export function resolveMany(
  filePaths: string[],
  options: ResolveOptions = {}
): ResolvedPath[] {
  return filePaths.map((p) => resolvePath(p, options));
}

export function assertResolved(resolved: ResolvedPath): void {
  if (!resolved.exists) {
    throw new Error(`Config file not found: ${resolved.absolute}`);
  }
}
