#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildArtifacts, writeArtifacts } from './lib/emit.mjs';
import { generatePalette } from './lib/palette.mjs';
import { createTokens, validateTokens } from './lib/tokens.mjs';

export { generatePalette, contrastRatio, hexToHsl } from './lib/palette.mjs';
export { createTokens, resolveToken, validateTokens } from './lib/tokens.mjs';
export { buildArtifacts, writeArtifacts } from './lib/emit.mjs';
export const SKILL_ROOT = fileURLToPath(new URL('..', import.meta.url));

const HELP = `Usage: node scripts/design-system.mjs <command> [options]

  init --brand '#0f766e' --name 'Lumen' --out DIR [--dry-run]
  palette --base '#0f766e'
  validate TOKENS.json
  emit TOKENS.json --out DIR [--dry-run]

init/emit produce design-tokens.json, tokens.css, theme.css (Tailwind v4),
DESIGN.md, and a self-contained preview.html. Existing conflicting files are
never overwritten. Dry-run reports every destination and writes nothing.
Colors support #rgb/#rrggbb only; other encodings and alpha are unsupported.
`;

function parseArguments(args) {
  const [command, ...rest] = args;
  if (!command || ['--help', '-h', 'help'].includes(command)) return { command: 'help' };
  const allowed = {
    init: ['brand', 'name', 'out', 'dry-run'],
    palette: ['base'],
    validate: [],
    emit: ['out', 'dry-run'],
  }[command];
  if (!allowed) throw new Error(`Unknown command ${command}. Use --help for usage.`);
  const options = {};
  const positional = [];
  for (let index = 0; index < rest.length; index++) {
    const argument = rest[index];
    if (!argument.startsWith('--')) {
      positional.push(argument);
      continue;
    }
    const key = argument.slice(2);
    if (!allowed.includes(key)) throw new Error(`${command}: unknown option ${argument}`);
    if (Object.hasOwn(options, key)) throw new Error(`${command}: duplicate option ${argument}`);
    if (key === 'dry-run') options[key] = true;
    else {
      const value = rest[++index];
      if (value === undefined || value.startsWith('--') || !value.trim())
        throw new Error(`${argument}: requires a value`);
      options[key] = value;
    }
  }
  const expected = ['validate', 'emit'].includes(command) ? 1 : 0;
  if (positional.length !== expected)
    throw new Error(
      `${command}: expected ${expected ? 'one token JSON path' : 'no positional arguments'}`,
    );
  for (const key of command === 'init'
    ? ['brand', 'name', 'out']
    : command === 'palette'
      ? ['base']
      : command === 'emit'
        ? ['out']
        : []) {
    if (!options[key]) throw new Error(`${command}: --${key} is required`);
  }
  return { command, options, inputPath: positional[0] };
}

export async function runCli(
  args = process.argv.slice(2),
  {
    stdout = (value) => process.stdout.write(value),
    stderr = (value) => process.stderr.write(value),
  } = {},
) {
  try {
    const { command, options, inputPath } = parseArguments(args);
    if (command === 'help') {
      stdout(HELP);
      return 0;
    }
    if (command === 'palette') {
      stdout(`${JSON.stringify(generatePalette(options.base), null, 2)}\n`);
      return 0;
    }
    const tokens =
      command === 'init'
        ? createTokens({ brand: options.brand, name: options.name })
        : JSON.parse(await readFile(inputPath, 'utf8'));
    if (command === 'validate') {
      const report = validateTokens(tokens);
      stdout(`${JSON.stringify(report, null, 2)}\n`);
      return report.valid ? 0 : 1;
    }
    const report = await writeArtifacts(buildArtifacts(tokens), options.out, {
      dryRun: Boolean(options['dry-run']),
      inputPath,
    });
    stdout(`${JSON.stringify(report, null, 2)}\n`);
    return report.conflicts.length ? 1 : 0;
  } catch (error) {
    stderr(`Error: ${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = await runCli();
