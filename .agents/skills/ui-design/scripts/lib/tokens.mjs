import { contrastRatio, generatePalette, hslToHex, normalizeHex } from './palette.mjs';

const REFERENCE = /^\{((?:primitive|semantic)\.[a-zA-Z0-9_.-]+)\}$/;
const KEY = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;
export const COLOR_ROLES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'muted',
  'muted-foreground',
  'primary',
  'primary-foreground',
  'primary-hover',
  'secondary',
  'secondary-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'border',
  'input',
  'ring',
];
export const PRIMITIVE_GROUPS = [
  'color',
  'font',
  'text',
  'spacing',
  'radius',
  'shadow',
  'weight',
  'leading',
];
const ref = (path) => `{${path}}`;
const colorRef = (ramp, stop) => ref(`primitive.color.${ramp}.${stop}`);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireObject(value, path) {
  if (!isObject(value)) throw new Error(`${path}: expected an object`);
}

export function effectiveTokens(tokens, mode = 'light') {
  if (mode === 'light') return { primitive: tokens.primitive, semantic: tokens.semantic };
  if (!tokens.modes?.[mode]) throw new Error(`modes.${mode}: unknown mode`);
  return {
    primitive: tokens.primitive,
    semantic: {
      ...tokens.semantic,
      color: { ...tokens.semantic.color, ...tokens.modes[mode].color },
    },
  };
}

export function resolveToken(value, tokens, { mode = 'light', path = 'value' } = {}) {
  const root = effectiveTokens(tokens, mode);
  function resolve(current, trail) {
    if (typeof current !== 'string') throw new Error(`${path}: expected a string token value`);
    const match = REFERENCE.exec(current);
    if (!match) {
      if (/[{}]/.test(current))
        throw new Error(
          `${path}: invalid reference ${JSON.stringify(current)}; use {primitive.path} or {semantic.path}`,
        );
      return current;
    }
    const target = match[1];
    if (trail.includes(target))
      throw new Error(`${path}: circular token reference: ${[...trail, target].join(' -> ')}`);
    let node = root;
    for (const part of target.split('.')) {
      if (!isObject(node) || !Object.hasOwn(node, part))
        throw new Error(`${path}: unresolved token reference {${target}} (missing ${part})`);
      node = node[part];
    }
    if (isObject(node))
      throw new Error(`${path}: reference {${target}} points to a group, not a value`);
    return resolve(node, [...trail, target]);
  }
  return resolve(value, []);
}

export function flattenTokens(node, prefix = '') {
  const values = [];
  for (const [key, value] of Object.entries(node)) {
    if (!KEY.test(key))
      throw new Error(
        `${prefix || 'tokens'}.${key}: token keys must contain only letters, digits and hyphens`,
      );
    const path = prefix ? `${prefix}.${key}` : key;
    if (isObject(value)) values.push(...flattenTokens(value, path));
    else values.push([path, value]);
  }
  return values;
}

function validateShape(tokens) {
  requireObject(tokens, 'tokens');
  if (tokens.version !== 1) throw new Error('version: expected 1');
  requireObject(tokens.meta, 'meta');
  if (typeof tokens.meta.name !== 'string' || !tokens.meta.name.trim())
    throw new Error('meta.name: expected a nonempty string');
  requireObject(tokens.primitive, 'primitive');
  for (const group of Object.keys(tokens.primitive)) {
    if (!PRIMITIVE_GROUPS.includes(group))
      throw new Error(`primitive.${group}: unsupported token group`);
  }
  for (const group of PRIMITIVE_GROUPS) {
    requireObject(tokens.primitive[group], `primitive.${group}`);
    if (!Object.keys(tokens.primitive[group]).length)
      throw new Error(`primitive.${group}: must not be empty`);
  }
  for (const ramp of ['brand', 'neutral', 'danger', 'success', 'warning']) {
    requireObject(tokens.primitive.color[ramp], `primitive.color.${ramp}`);
    for (const stop of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
      normalizeHex(tokens.primitive.color[ramp][stop], `primitive.color.${ramp}.${stop}`);
  }
  normalizeHex(tokens.primitive.color.white, 'primitive.color.white');
  requireObject(tokens.semantic, 'semantic');
  for (const group of Object.keys(tokens.semantic)) {
    if (group !== 'color') throw new Error(`semantic.${group}: only color roles are supported`);
  }
  requireObject(tokens.semantic.color, 'semantic.color');
  for (const role of COLOR_ROLES) {
    if (!Object.hasOwn(tokens.semantic.color, role))
      throw new Error(`semantic.color.${role}: required role is missing`);
  }
  if (tokens.modes !== undefined) {
    requireObject(tokens.modes, 'modes');
    for (const [mode, overrides] of Object.entries(tokens.modes)) {
      if (mode !== 'dark') throw new Error(`modes.${mode}: only dark mode is supported`);
      requireObject(overrides, `modes.${mode}`);
      if (Object.keys(overrides).some((key) => key !== 'color'))
        throw new Error(`modes.${mode}: only color overrides are supported`);
      requireObject(overrides.color, `modes.${mode}.color`);
    }
  }
  if (!Array.isArray(tokens.pairs) || !tokens.pairs.length)
    throw new Error('pairs: declare at least one actual foreground/background combination');
  for (const [index, pair] of tokens.pairs.entries()) {
    const path = `pairs[${index}]`;
    requireObject(pair, path);
    if (typeof pair.name !== 'string' || !pair.name.trim())
      throw new Error(`${path}.name: expected a nonempty string`);
    if (!['text', 'ui'].includes(pair.kind)) throw new Error(`${path}.kind: expected text or ui`);
    for (const key of ['fg', 'bg']) {
      if (typeof pair[key] !== 'string' || !REFERENCE.test(pair[key]))
        throw new Error(
          `${path}.${key}: use an absolute token reference such as {semantic.color.foreground}`,
        );
    }
    for (const key of ['fontSize', 'fontWeight']) {
      if (
        pair[key] !== undefined &&
        (typeof pair[key] !== 'number' || !Number.isFinite(pair[key]) || pair[key] <= 0)
      )
        throw new Error(`${path}.${key}: expected a positive number`);
    }
  }
}

export function validateTokens(tokens) {
  validateShape(tokens);
  const results = [];
  for (const mode of ['light', ...Object.keys(tokens.modes ?? {})]) {
    const effective = effectiveTokens(tokens, mode);
    const names = new Set();
    for (const [path, value] of flattenTokens(effective)) {
      const cssName = path.replace(/^(primitive|semantic)\./, '').replaceAll('.', '-');
      if (names.has(cssName))
        throw new Error(`${path}: CSS variable name collides with another token (${cssName})`);
      names.add(cssName);
      const resolved = resolveToken(value, tokens, { mode, path: `${mode}.${path}` });
      if (path.startsWith('primitive.color.') || path.startsWith('semantic.color.'))
        normalizeHex(resolved, `${mode}.${path}`);
      else if (
        !resolved.trim() ||
        /[;{}<>\\\r\n]/.test(resolved) ||
        /\/\*|\*\//.test(resolved) ||
        /(?:url|expression)\s*\(/i.test(resolved)
      )
        throw new Error(`${mode}.${path}: unsafe or empty CSS value`);
    }
    for (const [index, pair] of tokens.pairs.entries()) {
      const fg = normalizeHex(resolveToken(pair.fg, tokens, { mode, path: `pairs[${index}].fg` }));
      const bg = normalizeHex(resolveToken(pair.bg, tokens, { mode, path: `pairs[${index}].bg` }));
      const large = pair.fontSize >= 24 || (pair.fontSize >= 56 / 3 && pair.fontWeight >= 700);
      const minimum = pair.kind === 'ui' || large ? 3 : 4.5;
      const ratio = contrastRatio(fg, bg);
      results.push({
        mode,
        name: pair.name,
        kind: pair.kind,
        fg,
        bg,
        ratio,
        minimum,
        pass: ratio >= minimum,
      });
    }
  }
  return {
    valid: results.every((result) => result.pass),
    checked: results.length,
    failures: results.filter((result) => !result.pass).length,
    results,
  };
}

export function createTokens({ brand, name = 'Design system' } = {}) {
  const color = {
    brand: generatePalette(brand),
    neutral: generatePalette(hslToHex(220, 12, 50), { neutral: true }),
    danger: generatePalette('#dc2626'),
    success: generatePalette('#15803d'),
    warning: generatePalette('#eab308'),
    white: '#ffffff',
    black: '#000000',
  };
  const onColor = (hex) =>
    contrastRatio(color.white, hex) >= contrastRatio(color.black, hex)
      ? ref('primitive.color.white')
      : ref('primitive.color.black');
  function semanticMode(dark) {
    const background = dark ? color.neutral[950] : color.white;
    const card = dark ? color.neutral[900] : color.white;
    const surfaces = [background, card];
    const boundaryStop = [
      500,
      ...(dark ? [400, 300, 200, 100, 50] : [600, 700, 800, 900, 950]),
    ].find((stop) => surfaces.every((surface) => contrastRatio(color.neutral[stop], surface) >= 3));
    const roles = {
      background: dark ? colorRef('neutral', 950) : ref('primitive.color.white'),
      foreground: colorRef('neutral', dark ? 50 : 950),
      card: dark ? colorRef('neutral', 900) : ref('primitive.color.white'),
      'card-foreground': colorRef('neutral', dark ? 50 : 950),
      muted: colorRef('neutral', dark ? 800 : 100),
      'muted-foreground': colorRef('neutral', dark ? 200 : 700),
      secondary: colorRef('neutral', dark ? 800 : 100),
      'secondary-foreground': colorRef('neutral', dark ? 50 : 950),
      border: colorRef('neutral', dark ? 600 : 300),
      input: colorRef('neutral', boundaryStop),
    };
    for (const [role, ramp] of [
      ['primary', 'brand'],
      ['destructive', 'danger'],
      ['success', 'success'],
      ['warning', 'warning'],
    ]) {
      const stops = dark
        ? [400, 300, 200, 100, 50, 500, 600, 700, 800, 900, 950]
        : [600, 700, 800, 900, 950, 500, 400, 300, 200, 100, 50];
      const minimum = role === 'destructive' ? 4.5 : 3;
      const stop = stops.find((candidate) =>
        (role === 'destructive' ? surfaces : [background]).every(
          (surface) => contrastRatio(color[ramp][candidate], surface) >= minimum,
        ),
      );
      if (stop === undefined)
        throw new Error(
          `${ramp}: no shade reaches ${minimum}:1 against the ${dark ? 'dark' : 'light'} surfaces`,
        );
      roles[role] = colorRef(ramp, stop);
      roles[`${role}-foreground`] = onColor(color[ramp][stop]);
      if (role === 'primary') {
        const foreground =
          roles[`${role}-foreground`] === ref('primitive.color.white') ? color.white : color.black;
        const hoverStop =
          stops.find(
            (candidate) =>
              candidate !== stop &&
              contrastRatio(foreground, color[ramp][candidate]) >= 4.5 &&
              contrastRatio(background, color[ramp][candidate]) >= 3,
          ) ?? stop;
        roles['primary-hover'] = colorRef(ramp, hoverStop);
      }
    }
    roles.ring = roles.primary;
    return roles;
  }
  const textPair = (name, fg, bg) => ({
    name,
    fg: ref(`semantic.color.${fg}`),
    bg: ref(`semantic.color.${bg}`),
    kind: 'text',
  });
  return {
    version: 1,
    meta: { name, brand: normalizeHex(brand) },
    primitive: {
      color,
      font: { sans: 'ui-sans-serif, system-ui, sans-serif', mono: 'ui-monospace, monospace' },
      text: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
      shadow: {
        sm: '0 1px 2px rgb(0 0 0 / 0.08)',
        md: '0 4px 12px rgb(0 0 0 / 0.12)',
        lg: '0 12px 32px rgb(0 0 0 / 0.16)',
      },
      weight: { normal: '400', semibold: '600' },
      leading: { tight: '1.25', normal: '1.5' },
    },
    semantic: { color: semanticMode(false) },
    modes: { dark: { color: semanticMode(true) } },
    pairs: [
      textPair('Body text', 'foreground', 'background'),
      textPair('Card text', 'card-foreground', 'card'),
      textPair('Muted text', 'muted-foreground', 'muted'),
      textPair('Secondary action', 'secondary-foreground', 'secondary'),
      ...['primary', 'destructive', 'success', 'warning'].map((role) =>
        textPair(`${role} action`, `${role}-foreground`, role),
      ),
      textPair('Primary hover', 'primary-foreground', 'primary-hover'),
      { ...textPair('Input boundary on page', 'input', 'background'), kind: 'ui' },
      { ...textPair('Input boundary on card', 'input', 'card'), kind: 'ui' },
      textPair('Form error on page', 'destructive', 'background'),
      textPair('Form error on card', 'destructive', 'card'),
      { ...textPair('Focus ring', 'ring', 'background'), kind: 'ui' },
    ],
  };
}
