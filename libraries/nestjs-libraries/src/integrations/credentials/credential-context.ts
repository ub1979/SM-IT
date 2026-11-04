import { AsyncLocalStorage } from 'node:async_hooks';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from 'dotenv';
import { socialAppCredentialKeys } from '@tl_smp/helpers/utils/social-provider-setup';

const context = new AsyncLocalStorage<Record<string, string>>();

export function socialEnvPath() {
  let directory = process.cwd();
  while (!existsSync(join(directory, 'pnpm-workspace.yaml'))) {
    const parent = dirname(directory);
    if (parent === directory)
      throw new Error('Cannot find the app configuration directory');
    directory = parent;
  }
  return join(directory, '.env');
}

let cached: Record<string, string> = {};
let signature = '';
let checkedAt = 0;
function savedCredentials() {
  // Publishing workers pick up successful UI saves without restarting.
  if (Date.now() - checkedAt < 1000) return cached;
  checkedAt = Date.now();
  try {
    const path = socialEnvPath();
    const stat = statSync(path);
    const next = `${stat.mtimeMs}:${stat.ino}:${stat.size}`;
    if (next !== signature) {
      cached = parse(readFileSync(path));
      signature = next;
    }
  } catch {
    cached = {};
    signature = '';
  }
  return cached;
}

export function invalidateSocialCredentials() {
  checkedAt = 0;
  signature = '';
}

// Only provider credential reads use this proxy. A test never changes process.env.
export const socialCredentialEnv = new Proxy({} as NodeJS.ProcessEnv, {
  get: (_, key: string) =>
    context.getStore()?.[key] ??
    (socialAppCredentialKeys.has(key)
      ? savedCredentials()[key] || process.env[key]
      : process.env[key]),
});

export function withSocialCredentials<T>(
  values: Record<string, string>,
  action: () => T
): T {
  return context.run(values, action);
}
