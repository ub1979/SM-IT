import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { access, readFile } from 'fs/promises';
import { homedir } from 'os';
import { delimiter, dirname, isAbsolute, join } from 'path';
import { createInterface } from 'readline';

// One private worker preserves OAuth sessions across start/poll requests. No
// socket is opened and tokens stay inside Hermes. stderr is deliberately drained
// without logging because provider errors may include credentials.
export class HermesBridge {
  private child?: ChildProcessWithoutNullStreams;
  private starting?: Promise<ChildProcessWithoutNullStreams>;
  private nextId = 0;
  private pending = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  async request<T = any>(
    action: string,
    body: unknown = {},
    signal?: AbortSignal
  ): Promise<T> {
    if (signal?.aborted) throw new Error('AI request cancelled');
    const child = await this.worker();
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const finish = (error?: Error, value?: any) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        this.pending.delete(id);
        error ? reject(error) : resolve(value);
      };
      const abort = () => finish(new Error('AI request cancelled'));
      const timer = setTimeout(
        () => finish(new Error('The AI provider took too long. Try again.')),
        180_000
      );
      this.pending.set(id, {
        resolve: (value) => finish(undefined, value),
        reject: (error) => finish(error),
      });
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) {
        abort();
        return;
      }
      child.stdin.write(
        JSON.stringify({ id, action, body }) + '\n',
        (error) => {
          if (error) finish(new Error('The AI connection closed. Try again.'));
        }
      );
    });
  }

  close() {
    this.child?.kill();
    this.failPending();
    this.child = undefined;
  }

  private failPending() {
    for (const request of this.pending.values()) {
      request.reject(new Error('The AI connection closed. Try again.'));
    }
  }

  private async worker() {
    if (this.child) return this.child;
    if (!this.starting) {
      this.starting = this.startWorker().finally(() => {
        this.starting = undefined;
      });
    }
    return this.starting;
  }

  private async startWorker() {
    const python = await this.python();
    const script = await this.script();
    const child = spawn(python, ['-u', script], {
      cwd: homedir(),
      stdio: 'pipe',
    });
    await new Promise<void>((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', () =>
        reject(new Error('Hermes could not start. Check HERMES_PYTHON.'))
      );
    });
    this.child = child;
    child.stderr.resume();
    child.stdin.on('error', () => this.failPending());
    createInterface({ input: child.stdout }).on('line', (line) => {
      try {
        const reply = JSON.parse(line);
        const request = this.pending.get(reply.id);
        if (reply.error) request?.reject(new Error(reply.error));
        else request?.resolve(reply.value);
      } catch {
        // Ignore non-protocol output; never expose provider logs to clients.
      }
    });
    child.on('error', () => this.failPending());
    child.on('exit', () => {
      if (this.child === child) this.child = undefined;
      this.failPending();
    });
    return child;
  }

  private async script() {
    let directory = process.cwd();
    for (let depth = 0; depth < 8; depth++) {
      const candidate = join(directory, 'scripts/hermes_bridge.py');
      if (
        await access(candidate)
          .then(() => true)
          .catch(() => false)
      )
        return candidate;
      directory = dirname(directory);
    }
    throw new Error('The Hermes bridge script was not found.');
  }

  private async python() {
    if (process.env.HERMES_PYTHON) return process.env.HERMES_PYTHON;
    for (const folder of [
      ...(process.env.PATH || '').split(delimiter),
      join(homedir(), '.local/bin'),
    ]) {
      const firstLine = await readFile(join(folder, 'hermes'), 'utf8')
        .then((text) => text.split('\n')[0].slice(2).trim())
        .catch(() => '');
      // Only use direct executable shebangs. Never pass an /usr/bin/env command
      // plus arguments as a single executable filename.
      if (isAbsolute(firstLine) && !firstLine.includes(' ')) return firstLine;
    }
    throw new Error(
      'Hermes was not found. Set HERMES_PYTHON to the Python used by Appling.'
    );
  }
}
