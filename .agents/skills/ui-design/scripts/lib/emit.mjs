import { mkdir, open, readFile, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { effectiveTokens, flattenTokens, resolveToken, validateTokens } from './tokens.mjs';

const variable = (tokenPath) =>
  `--ui-${tokenPath.replace(/^(primitive|semantic)\./, '').replaceAll('.', '-')}`;
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function cssValue(value) {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${variable(match[1])})` : value;
}

export function emitCss(tokens) {
  const declarations = (node) =>
    flattenTokens(node)
      .map(([key, value]) => `  ${variable(key)}: ${cssValue(value)};`)
      .join('\n');
  let css = `/* Generated from design-tokens.json. Merge deliberately into an existing theme. */\n:root {\n${declarations(effectiveTokens(tokens))}\n}\n`;
  if (tokens.modes?.dark)
    css += `\n.dark,\n[data-theme="dark"] {\n${declarations({ semantic: effectiveTokens(tokens, 'dark').semantic })}\n}\n`;
  return css;
}

export function emitTheme(tokens) {
  const namespaces = {
    color: 'color',
    font: 'font',
    text: 'text',
    spacing: 'spacing',
    radius: 'radius',
    shadow: 'shadow',
    weight: 'font-weight',
    leading: 'leading',
  };
  const lines = [];
  for (const [key] of flattenTokens(tokens.primitive)) {
    const [group, ...tail] = key.split('.');
    lines.push(`  --${namespaces[group]}-${tail.join('-')}: var(${variable(`primitive.${key}`)});`);
  }
  for (const [key] of flattenTokens(tokens.semantic))
    lines.push(`  --${key.replaceAll('.', '-')}: var(${variable(`semantic.${key}`)});`);
  return `@import "tailwindcss";\n@import "./tokens.css";\n\n@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));\n\n@theme inline {\n${lines.join('\n')}\n}\n`;
}

function markdownText(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('`', '\\`')
    .replace(/[\r\n]+/g, ' ')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function emitDesign(tokens) {
  const heading = markdownText(tokens.meta.name);
  const table = (group) =>
    `| Token | Value |\n| --- | --- |\n${Object.entries(tokens.primitive[group])
      .map(
        ([key, value]) => `| ${markdownText(key)} | ${markdownText(resolveToken(value, tokens))} |`,
      )
      .join('\n')}`;
  const roles = Object.keys(tokens.semantic.color)
    .map(
      (role) =>
        `| ${role} | ${resolveToken(`{semantic.color.${role}}`, tokens)} | ${tokens.modes?.dark ? resolveToken(`{semantic.color.${role}}`, tokens, { mode: 'dark' }) : '—'} |`,
    )
    .join('\n');
  return `# ${heading} design system\n\nThis is a generated starter. The user or agent should record personality decisions here: audience, tone, density, typography, corner style, visual hierarchy, and references. Validate those choices in the real interface.\n\n## Source and integration\n\n- Edit design-tokens.json as the source of truth. Values reference absolute paths, for example {primitive.color.brand.600} and {semantic.color.primary}.\n- Colors support #rgb and #rrggbb only. RGB/HSL functions, alpha, named colors, and color-mix are unsupported.\n- Use semantic color roles in components; reserve primitive color ramps for defining those roles.\n- For Tailwind CSS v4, import theme.css into the application entry stylesheet. It imports Tailwind and tokens.css and exposes utilities such as bg-primary, text-primary-foreground, rounded-md, font-semibold, and p-4.\n- For framework-neutral use, load tokens.css and use var(--ui-color-background), var(--ui-color-foreground), and the other runtime variables.\n- Apply .dark or data-theme="dark" to an ancestor to select dark mode. The preview toggle applies it to the document root.\n- Preserve an existing project theme. Generate into a new directory, review the diff, then merge the chosen roles and scales. The CLI never overwrites conflicting output files.\n- To regenerate after edits, emit into a fresh directory and review the result. An input design-tokens.json may share its output path; other changed outputs still conflict.\n\n## Semantic color roles\n\n| Role | Light | Dark |\n| --- | --- | --- |\n${roles}\n\nUse background/foreground for page content, card/card-foreground for raised surfaces, and muted/muted-foreground for supporting information. Use primary for the main action, secondary for lower emphasis actions, and destructive/success/warning for status. Pair each fill with its matching foreground role. Primary-hover shares primary-foreground. Ring identifies focus against background. Border is decorative; input defines the input boundary against page and card surfaces. Use the background role for the input fill. Destructive also supports form error text on page and card surfaces. Check any new adjacent surfaces or text combinations explicitly in pairs.\n\n## Type\n\nUse a small number of sizes to establish hierarchy; body text starts at base. Use semibold for emphasis and tight leading for headings. Font stacks stay local and require no network request.\n\n${table('font')}\n\n${table('text')}\n\n${table('weight')}\n\n${table('leading')}\n\n## Spacing\n\nUse small intervals within related groups and larger intervals between sections. Keep repeated layouts on this scale.\n\n${table('spacing')}\n\n## Radius and elevation\n\nKeep corner treatments consistent. Use shadows to communicate elevation; do not rely on shadows alone to distinguish controls.\n\n${table('radius')}\n\n${table('shadow')}\n\n## Color ramps\n\nStop 500 anchors the supplied color. The ramp bisects lightness, compensates saturation, and caps hue rotation at 20 degrees. Very light or dark anchors adapt the endpoints; pure black or white can repeat at an endpoint. Inspect the result visually before adopting it.\n\n${Object.entries(
    tokens.primitive.color,
  )
    .filter(([, value]) => value && typeof value === 'object')
    .map(
      ([name, ramp]) =>
        `### ${name}\n\n| Stop | Hex |\n| --- | --- |\n${Object.entries(ramp)
          .map(([stop, hex]) => `| ${stop} | ${hex} |`)
          .join('\n')}`,
    )
    .join(
      '\n\n',
    )}\n\n## Contrast and decisions to record\n\nValidation resolves token aliases again for each declared mode. Normal text requires 4.5:1; text at least 24px, or at least 18.6667px with weight 700 or greater, requires 3:1. UI pairs require 3:1. These checks cover declared pairs only; verify actual components, focus states, disabled states, images, and content in context.\n\nRecord approved personality choices, exceptions, newly tested pairs, and the reason for each scale change here.\n`;
}

export function emitPreview(tokens) {
  const e = escapeHtml;
  const name = e(tokens.meta.name);
  const ramps = Object.entries(tokens.primitive.color)
    .filter(([, value]) => value && typeof value === 'object')
    .map(
      ([ramp, colors]) =>
        `<h3>${e(ramp)}</h3><div class="ramp">${Object.entries(colors)
          .map(
            ([stop, value]) =>
              `<div class="swatch"><i style="background:var(${variable(`primitive.color.${ramp}.${stop}`)})"></i><code>${e(stop)}</code><code>${e(value)}</code></div>`,
          )
          .join('')}</div>`,
    )
    .join('');
  const type = Object.entries(tokens.primitive.text)
    .map(
      ([key, value]) =>
        `<div class="row"><code>${e(key)} · ${e(value)}</code><span style="font-size:var(${variable(`primitive.text.${key}`)})">Clear ideas, useful details</span></div>`,
    )
    .join('');
  const spacing = Object.entries(tokens.primitive.spacing)
    .map(
      ([key, value]) =>
        `<div class="row"><code>${e(key)} · ${e(value)}</code><i class="space" style="width:var(${variable(`primitive.spacing.${key}`)})"></i></div>`,
    )
    .join('');
  const samples = (group, property) =>
    Object.entries(tokens.primitive[group])
      .map(
        ([key, value]) =>
          `<div class="sample" style="${property}:var(${variable(`primitive.${group}.${key}`)})"><strong>${e(key)}</strong><code>${e(value)}</code></div>`,
      )
      .join('');
  const semantics = Object.keys(tokens.semantic.color)
    .map(
      (role) =>
        `<div class="swatch"><i style="background:var(--ui-color-${e(role)})"></i><code>${e(role)}</code></div>`,
    )
    .join('');
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Design system</title><style>\n${emitCss(tokens)}\n*{box-sizing:border-box}html{color-scheme:light}html.dark{color-scheme:dark}body{margin:0;background:var(--ui-color-background);color:var(--ui-color-foreground);font:var(--ui-text-base)/var(--ui-leading-normal) var(--ui-font-sans)}main{max-width:1100px;margin:auto;padding:32px 24px}header{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}h1{font-size:var(--ui-text-3xl);line-height:var(--ui-leading-tight)}h2{font-size:var(--ui-text-xl);margin-top:48px}h3{font-size:var(--ui-text-base)}p{max-width:65ch}.muted{color:var(--ui-color-muted-foreground);background:var(--ui-color-muted);padding:12px;border-radius:var(--ui-radius-md)}code{font-family:var(--ui-font-mono);font-size:var(--ui-text-xs);overflow-wrap:anywhere}.ramp,.samples,.actions{display:flex;gap:12px;flex-wrap:wrap}.swatch{display:grid;gap:4px;width:80px}.swatch i{display:block;height:48px;border-radius:var(--ui-radius-sm);border:1px solid var(--ui-color-border)}.row{display:flex;align-items:center;gap:24px;padding:12px 0;border-bottom:1px solid var(--ui-color-border);flex-wrap:wrap}.row>code{width:100px;flex-shrink:0}.row>span{min-width:0;max-width:100%;flex:1 1 180px;overflow-wrap:anywhere}.space{display:block;max-width:100%;height:12px;background:var(--ui-color-primary)}.sample{display:flex;flex-direction:column;gap:8px;padding:24px;background:var(--ui-color-card);color:var(--ui-color-card-foreground);border:1px solid var(--ui-color-border);max-width:260px}.card{padding:24px;border:1px solid var(--ui-color-border);border-radius:var(--ui-radius-lg);box-shadow:var(--ui-shadow-md);background:var(--ui-color-card);color:var(--ui-color-card-foreground)}button,input{font:inherit;border-radius:var(--ui-radius-md);padding:8px 16px}button{cursor:pointer;border:1px solid transparent;font-weight:var(--ui-weight-semibold);background:var(--ui-color-secondary);color:var(--ui-color-secondary-foreground)}button:focus-visible,input:focus-visible{outline:3px solid var(--ui-color-ring);outline-offset:3px}.primary{background:var(--ui-color-primary);color:var(--ui-color-primary-foreground)}.primary:hover{background:var(--ui-color-primary-hover)}.destructive{background:var(--ui-color-destructive);color:var(--ui-color-destructive-foreground)}.success{background:var(--ui-color-success);color:var(--ui-color-success-foreground)}.warning{background:var(--ui-color-warning);color:var(--ui-color-warning-foreground)}input{display:block;margin:8px 0 24px;max-width:100%;background:var(--ui-color-background);color:var(--ui-color-foreground);border:1px solid var(--ui-color-input)}@media(max-width:600px){main{padding:20px 16px}.swatch{width:64px}.row{gap:12px}}\n</style></head><body><main><header><div><h1>${name}</h1><p>A starting system for deliberate design decisions.</p></div>${tokens.modes?.dark ? '<button id="theme-toggle" type="button" aria-pressed="false">Dark theme</button>' : ''}</header><section aria-labelledby="components"><h2 id="components">Components</h2><div class="card"><h3>Build a clear hierarchy</h3><p>Use semantic roles to keep surfaces, content, and actions consistent.</p><p class="muted">Supporting information uses the muted surface and foreground.</p><label for="sample-name">Project name</label><input id="sample-name" value="${name}" autocomplete="off"><div class="actions"><button class="primary">Primary action</button><button>Secondary</button><button class="destructive">Delete</button><button class="success">Success</button><button class="warning">Warning</button></div></div></section><section><h2>Semantic colors</h2><div class="ramp">${semantics}</div><h2>Color ramps</h2>${ramps}</section><section><h2>Typography</h2>${type}</section><section><h2>Spacing</h2>${spacing}</section><section><h2>Elevation</h2><div class="samples">${samples('shadow', 'box-shadow')}</div><h2>Radius</h2><div class="samples">${samples('radius', 'border-radius')}</div></section></main>${tokens.modes?.dark ? '<script>document.getElementById("theme-toggle").addEventListener("click",function(){const dark=document.documentElement.classList.toggle("dark");this.setAttribute("aria-pressed",String(dark));this.textContent=dark?"Light theme":"Dark theme";});</script>' : ''}</body></html>\n`;
}

export function buildArtifacts(tokens) {
  const report = validateTokens(tokens);
  if (!report.valid) {
    const failures = report.results
      .filter((result) => !result.pass)
      .map(
        (result) =>
          `${result.mode}/${result.name}: ${result.ratio.toFixed(2)}:1 needs ${result.minimum}:1`,
      )
      .join('; ');
    throw new Error(`Contrast validation failed: ${failures}`);
  }
  return {
    'design-tokens.json': `${JSON.stringify(tokens, null, 2)}\n`,
    'tokens.css': emitCss(tokens),
    'theme.css': emitTheme(tokens),
    'DESIGN.md': emitDesign(tokens),
    'preview.html': emitPreview(tokens),
  };
}

export async function writeArtifacts(artifacts, out, { dryRun = false, inputPath } = {}) {
  const directory = path.resolve(out);
  const sourcePath = inputPath ? await realpath(inputPath) : undefined;
  const files = [];
  for (const [filename, content] of Object.entries(artifacts)) {
    if (path.basename(filename) !== filename)
      throw new Error(`Invalid artifact filename: ${filename}`);
    const target = path.join(directory, filename);
    let status;
    try {
      const existing = await readFile(target, 'utf8');
      let sameSource = false;
      if (
        filename === 'design-tokens.json' &&
        sourcePath &&
        sourcePath === (await realpath(target))
      ) {
        try {
          sameSource = isDeepStrictEqual(JSON.parse(existing), JSON.parse(content));
        } catch {
          /* Treat invalid JSON as a conflict. */
        }
      }
      status = existing === content || sameSource ? 'unchanged' : 'conflict';
    } catch (error) {
      if (error.code === 'ENOENT') status = 'create';
      else if (['EISDIR', 'ENOTDIR'].includes(error.code)) status = 'conflict';
      else throw error;
    }
    files.push({ file: filename, path: target, status });
  }
  const conflicts = files.filter((file) => file.status === 'conflict').map((file) => file.path);
  const report = { dryRun, directory, files, conflicts };
  if (dryRun) return report;
  if (conflicts.length)
    throw new Error(
      `Output conflicts; no files were written:\n${conflicts.join('\n')}\nGenerate into a new directory and merge deliberately.`,
    );
  const pending = files.filter((file) => file.status === 'create');
  if (!pending.length) return report;
  await mkdir(directory, { recursive: true });
  const written = [];
  try {
    for (const file of pending) {
      const handle = await open(file.path, 'wx');
      written.push(file.path);
      try {
        await handle.writeFile(artifacts[file.file], 'utf8');
      } finally {
        await handle.close();
      }
    }
  } catch (error) {
    // Never remove pre-existing files when rolling back a failed batch.
    await Promise.all(written.map((file) => unlink(file)));
    throw new Error(
      `Could not write output batch; newly written files rolled back: ${error.message}`,
      { cause: error },
    );
  }
  return report;
}
