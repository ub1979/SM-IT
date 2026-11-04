import { promises as fs } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parse } from 'dotenv';
import { socialAppCredentialKeys } from '@tl_smp/helpers/utils/social-provider-setup';

let writes = Promise.resolve();

export function saveSocialEnv(path: string, values: Record<string, string>) {
  const write = writes.then(async () => {
    let source = '';
    try {
      source = await fs.readFile(path, 'utf8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }
    let output = source;
    for (const [key, value] of Object.entries(values)) {
      if (!socialAppCredentialKeys.has(key) || /[\r\n\0]/.test(value))
        throw new Error('Invalid credential');
      // Match quoted multiline values too; remove duplicates so dotenv cannot prefer an old key.
      const entry = new RegExp(
        `^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=[ \\t]*(?:"(?:\\\\.|[^"\\\\])*"|'[^']*'|\x60[^\x60]*\x60|[^\\r\\n]*)(?:[^\\r\\n]*)`,
        'gm'
      );
      const encoded = value.includes("'")
        ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
        : `'${value}'`;
      let replaced = false;
      output = output.replace(entry, () => {
        if (replaced) return '';
        replaced = true;
        return `${key}=${encoded}`;
      });
      if (!replaced)
        output += `${
          output && !output.endsWith('\n') ? '\n' : ''
        }${key}=${encoded}\n`;
    }
    const parsed = parse(output);
    if (Object.entries(values).some(([key, value]) => parsed[key] !== value))
      throw new Error('Cannot safely encode credentials');
    const temporary = `${path}.${randomBytes(12).toString('hex')}.tmp`;
    try {
      await fs.writeFile(temporary, output, { mode: 0o600, flag: 'wx' });
      await fs.rename(temporary, path);
    } finally {
      await fs.rm(temporary, { force: true });
    }
  });
  writes = write.catch(() => {});
  return write;
}
