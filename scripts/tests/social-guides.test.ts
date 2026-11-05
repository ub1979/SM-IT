import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { socialProviderGuides } from '../../libraries/helpers/src/utils/social-provider-guides';
import { socialProviderSetup } from '../../libraries/helpers/src/utils/social-provider-setup';

const directory = 'libraries/nestjs-libraries/src/integrations/';
const manager = readFileSync(`${directory}integration.manager.ts`, 'utf8');
const registrations = manager
  .split('export const socialIntegrationList:')[1]
  .split('@Injectable()')[0];
const classes = [...registrations.matchAll(/^[ \t]*new (\w+)\(/gm)].map(
  (match) => match[1]
);
const sources = classes.map((name) => {
  const declaration = new RegExp(
    `import \\{ ${name} \\} from '[^']*/social/([^']+)';`
  ).exec(manager);
  if (!declaration)
    throw new Error(`Cannot resolve registered provider ${name}`);
  const source = readFileSync(
    `${directory}social/${declaration[1]}.ts`,
    'utf8'
  );
  const identifier = /identifier\s*=\s*['"]([^'"]+)/.exec(source)![1];
  return { identifier, source };
});
const documentation = readFileSync('docs/social-channel-setup.md', 'utf8');

describe('Social channel tutorial coverage', () => {
  it('covers all registered connectors in both the app and the full tutorial', () => {
    expect(Object.keys(socialProviderGuides).sort()).toEqual(
      sources.map((item) => item.identifier).sort()
    );
    for (const { identifier } of sources) {
      const guide = socialProviderGuides[identifier];
      expect(guide.steps.length, identifier).toBeGreaterThanOrEqual(4);
      expect(guide.troubleshooting.length, identifier).toBeGreaterThan(0);
      expect(documentation).toContain(`<a id="${identifier}"></a>`);
      for (const link of guide.links)
        expect(new URL(link.url).protocol, identifier).toBe('https:');
    }
  });
  it('explains where to obtain every required app credential, including Google fallback fields', () => {
    for (const { identifier } of sources) {
      for (const environment of [
        {},
        {
          YOUTUBE_CLIENT_ID: 'fixture-id',
          YOUTUBE_CLIENT_SECRET: 'fixture-secret',
        },
      ]) {
        const setup = socialProviderSetup(identifier, environment);
        for (const key of setup?.requiredKeys || []) {
          expect(
            socialProviderGuides[identifier].fields[key],
            `${identifier}: ${key}`
          ).toBeTruthy();
        }
      }
    }
  });
  it('keeps documented permissions consistent with each registered connector', () => {
    for (const { identifier, source } of sources) {
      const array =
        /scopes\s*=\s*\[([\s\S]*?)\](?:\s+as\s+string\[\])?\s*;/.exec(source);
      const scopes = array
        ? [...array[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
        : [];
      expect(socialProviderGuides[identifier].permissions, identifier).toEqual(
        scopes
      );
    }
    expect(socialProviderGuides.medium.access).toContain('no longer');
    expect(socialProviderGuides.nostr.steps.join(' ')).toContain(
      '64-character hexadecimal'
    );
  });
});
