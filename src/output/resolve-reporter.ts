import { ResolvedPath } from '../config/resolve';
import { dim, green, red, yellow } from './color';

export function reportResolvedPath(resolved: ResolvedPath, label?: string): void {
  const prefix = label ? `${dim(label + ':')} ` : '';
  const status = resolved.exists ? green('✔') : red('✘');
  const filePath = resolved.exists
    ? green(resolved.relative || resolved.absolute)
    : red(resolved.relative || resolved.absolute);
  console.log(`${prefix}${status} ${filePath}`);
}

export function reportResolvedPaths(
  paths: { label: string; resolved: ResolvedPath }[]
): void {
  console.log(dim('Resolved config paths:'));
  for (const { label, resolved } of paths) {
    reportResolvedPath(resolved, label);
  }
}

export function reportResolveSummary(
  paths: ResolvedPath[]
): void {
  const found = paths.filter((p) => p.exists).length;
  const missing = paths.length - found;

  if (missing === 0) {
    console.log(green(`All ${found} config file(s) resolved successfully.`));
  } else {
    console.log(
      yellow(`${found} resolved, `) + red(`${missing} missing.`)
    );
  }
}

export function reportResolveError(filePath: string): void {
  console.error(red(`Error: Could not resolve config file: ${filePath}`));
}
