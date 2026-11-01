import { COLOR_ROLES, resolveToken } from './tokens.mjs';

const SECTION_ORDER = [
  'overview',
  'colors',
  'typography',
  'layout',
  'elevation',
  'shapes',
  'components',
  'dos',
];
const SECTION_HEADINGS = {
  overview: 'Overview',
  colors: 'Colors',
  typography: 'Typography',
  layout: 'Layout',
  elevation: 'Elevation & Depth',
  shapes: 'Shapes',
  components: 'Components',
  dos: "Do's and Don'ts",
};
const SECTION_ALIASES = new Map([
  ['overview', 'overview'],
  ['brand & style', 'overview'],
  ['colors', 'colors'],
  ['typography', 'typography'],
  ['layout', 'layout'],
  ['layout & spacing', 'layout'],
  ['elevation & depth', 'elevation'],
  ['elevation', 'elevation'],
  ['shapes', 'shapes'],
  ['components', 'components'],
  ["do's and don'ts", 'dos'],
]);
const OMITTED_GROUPS = new Map([
  ['spacing', 'layout'],
  ['rounded', 'shapes'],
]);
const TOP_LEVEL = new Set([
  'version',
  'name',
  'description',
  'omitted',
  'colors',
  'typography',
  'rounded',
  'spacing',
  'components',
]);
const ROLE_ALIASES = new Map([
  ['surface', 'background'],
  ['on-surface', 'foreground'],
  ['error', 'destructive'],
]);
const COLOR_USES = new Map([
  ['background', 'page backgrounds'],
  ['foreground', 'primary text'],
  ['card', 'raised surfaces'],
  ['card-foreground', 'text on raised surfaces'],
  ['muted', 'quiet supporting surfaces'],
  ['muted-foreground', 'secondary text'],
  ['primary', 'main actions and active states'],
  ['primary-foreground', 'text on primary actions'],
  ['primary-hover', 'the primary action on hover'],
  ['secondary', 'supporting actions'],
  ['secondary-foreground', 'text on supporting actions'],
  ['destructive', 'validation errors and destructive actions'],
  ['destructive-foreground', 'text on destructive actions'],
  ['success', 'success status'],
  ['success-foreground', 'text on success status'],
  ['warning', 'warning status'],
  ['warning-foreground', 'text on warning status'],
  ['border', 'boundaries between regions'],
  ['input', 'input boundaries'],
  ['ring', 'focus rings'],
  ['surface', 'page backgrounds'],
  ['on-surface', 'primary text'],
  ['error', 'validation errors and destructive actions'],
  ['primary-ink', 'brand text and links'],
  ['sidebar', 'the sidebar surface'],
]);
const PENDING_COLOR_USE = 'State what this color is for before treating the system as approved.';
const COMPONENT_PROPERTIES = new Set([
  'backgroundColor',
  'textColor',
  'typography',
  'rounded',
  'padding',
  'size',
  'height',
  'width',
]);
const NAMED_COLORS = new Set(
  `transparent currentcolor black silver gray grey white maroon red purple fuchsia magenta green lime olive yellow navy blue teal aqua cyan aliceblue antiquewhite aquamarine azure beige bisque blanchedalmond blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen gainsboro ghostwhite gold goldenrod greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow limegreen linen mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite oldlace olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue rebeccapurple rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna skyblue slateblue slategray slategrey snow springgreen steelblue tan thistle tomato turquoise violet wheat whitesmoke yellowgreen`.split(
    /\s+/,
  ),
);

const KEY = /^(?:"(?:\\.|[^"\\])*"|'(?:[^']|'')*'|[A-Za-z_][A-Za-z0-9_-]*)/;
const REFERENCE = /^\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}$/;
const DIMENSION = /^-?(?:\d+|\d*\.\d+)(?:px|em|rem)$/;
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function canonicalSection(heading) {
  const name = heading.trim().toLowerCase().replaceAll('’', "'").replace(/\s+/g, ' ');
  return SECTION_ALIASES.get(name) ?? null;
}

function omittedSection(entry) {
  const raw = typeof entry === 'string' ? entry : entry?.section;
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('omitted: expected a section name');
  return canonicalSection(raw) ?? OMITTED_GROUPS.get(raw.trim()) ?? null;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function inline(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replace(/[\r\n]+/g, ' ')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('`', '\\`');
}

function plainScalar(value) {
  return (
    /^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(value) &&
    !/^(?:true|false|null|~)$/.test(value) &&
    !NUMBER.test(value)
  );
}

function yamlKey(key) {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : JSON.stringify(String(key));
}

function yamlScalar(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('cannot encode a non-finite number');
    return String(value);
  }
  const text = String(value);
  return plainScalar(text) ? text : JSON.stringify(text);
}

function emitYaml(value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value
      .map((item) => {
        if (isObject(item)) {
          const nested = emitYaml(item, indent + 2).split('\n');
          return `${pad}- ${nested[0].trim()}${nested.length > 1 ? `\n${nested.slice(1).join('\n')}` : ''}`;
        }
        return `${pad}- ${yamlScalar(item)}`;
      })
      .join('\n');
  }
  return Object.entries(value)
    .map(([key, item]) => {
      if (isObject(item) || Array.isArray(item))
        return `${pad}${yamlKey(key)}:\n${emitYaml(item, indent + 2)}`;
      return `${pad}${yamlKey(key)}: ${yamlScalar(item)}`;
    })
    .join('\n');
}

function numericToken(value) {
  return typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : undefined;
}

function spacingReference(spacing, px) {
  const key = Object.entries(spacing).find(([, value]) => value === px)?.[0];
  return key ? `{spacing.${key}}` : px;
}

function colorRoles(tokens) {
  const present = Object.keys(tokens.semantic.color);
  return [
    ...COLOR_ROLES.filter((role) => present.includes(role)),
    ...present.filter((role) => !COLOR_ROLES.includes(role)),
  ];
}

function colorUse(name) {
  return COLOR_USES.get(name) ?? PENDING_COLOR_USE;
}

function designTree(tokens) {
  const colors = {};
  const roles = colorRoles(tokens);
  for (const role of roles) colors[role] = resolveToken(`{semantic.color.${role}}`, tokens);
  const aliases = [
    ['surface', 'background'],
    ['on-surface', 'foreground'],
    ['error', 'destructive'],
  ];
  for (const [alias, target] of aliases) {
    if (!Object.hasOwn(colors, alias) && Object.hasOwn(colors, target))
      colors[alias] = `{colors.${target}}`;
  }
  if (tokens.modes?.dark) {
    for (const role of roles)
      colors[`${role}-dark`] = resolveToken(`{semantic.color.${role}}`, tokens, { mode: 'dark' });
    for (const [alias, target] of aliases) {
      if (colors[alias] === `{colors.${target}}`)
        colors[`${alias}-dark`] = `{colors.${target}-dark}`;
    }
  }

  const family = tokens.primitive.font.sans ?? Object.values(tokens.primitive.font)[0];
  const weight = (key) => numericToken(tokens.primitive.weight[key]);
  const leading = (key) => numericToken(tokens.primitive.leading[key]);
  const text = tokens.primitive.text;
  const typeToken = (fontSize, emphasis) => {
    if (!fontSize) return undefined;
    const token = { fontFamily: family, fontSize };
    const fontWeight = weight(emphasis ? 'semibold' : 'normal');
    const lineHeight = leading(emphasis ? 'tight' : 'normal');
    if (fontWeight !== undefined) token.fontWeight = fontWeight;
    if (lineHeight !== undefined) token.lineHeight = lineHeight;
    return token;
  };
  const level = (size, emphasis) => typeToken(text[size], emphasis);
  const typography = {};
  const levels = [
    ['headline-lg', level('5xl', true) ?? level('4xl', true)],
    ['headline-md', level('3xl', true)],
    ['body-lg', level('lg', false)],
    ['body-md', level('base', false)],
    ['body-sm', level('sm', false)],
    ['label-md', level('xs', true)],
  ];
  for (const [name, token] of levels) if (token) typography[name] = token;
  for (const [name, fontSize] of Object.entries(text)) {
    if (!typography[name]) typography[name] = typeToken(fontSize, false);
  }
  if (!Object.keys(typography).length) {
    const [name, fontSize] = Object.entries(text)[0] ?? [];
    if (name) typography[name] = { fontFamily: family, fontSize };
  }

  const spacing = { ...tokens.primitive.spacing };
  for (const [name, px] of Object.entries({
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px',
  })) {
    if (!Object.hasOwn(spacing, name) && Object.values(spacing).includes(px))
      spacing[name] = spacingReference(tokens.primitive.spacing, px);
  }
  const rounded = { ...tokens.primitive.radius };
  const radius = Object.hasOwn(rounded, 'md')
    ? '{rounded.md}'
    : `{rounded.${Object.keys(rounded)[0]}}`;
  const padding = spacingReference(tokens.primitive.spacing, '8px');
  const tree = {
    version: 'alpha',
    name: tokens.meta.name,
    colors,
    typography,
    rounded,
    spacing,
    components: {
      'button-primary': {
        backgroundColor: '{colors.primary}',
        textColor: '{colors.primary-foreground}',
        rounded: radius,
        padding,
      },
      'button-primary-hover': {
        backgroundColor: '{colors.primary-hover}',
        textColor: '{colors.primary-foreground}',
      },
      'button-secondary': {
        backgroundColor: '{colors.secondary}',
        textColor: '{colors.secondary-foreground}',
        rounded: radius,
        padding,
      },
      input: {
        backgroundColor: '{colors.surface}',
        textColor: '{colors.on-surface}',
        rounded: radius,
        padding,
      },
    },
  };
  if (typeof tokens.meta.description === 'string' && tokens.meta.description.trim())
    tree.description = tokens.meta.description.trim();
  return tree;
}

function renderProse(tokens, tree) {
  const name = inline(tokens.meta.name);
  const overview = tree.description
    ? inline(tree.description)
    : `The visual direction for ${name} is not yet decided. Record the audience, personality, and density in this section before treating the system as approved.`;
  const colorValue = (name) => resolveDesignRef(tree.colors[name], tree, `colors.${name}`, false);
  const typeLine = (label, token) => {
    if (!token) return undefined;
    const weight = token.fontWeight === undefined ? '' : `, ${token.fontWeight}`;
    return `- **${label}:** ${inline(token.fontFamily)}${weight}, ${inline(token.fontSize)}`;
  };
  const ramps = Object.entries(tokens.primitive.color)
    .filter(([, value]) => isObject(value))
    .map(
      ([ramp, stops]) =>
        `### ${inline(ramp)}\n\n| Stop | Hex |\n| --- | --- |\n${Object.entries(stops)
          .map(([stop, hex]) => `| ${inline(stop)} | ${inline(hex)} |`)
          .join('\n')}`,
    )
    .join('\n\n');
  const colorLines = Object.keys(tree.colors)
    .filter((name) => !name.endsWith('-dark'))
    .map((name) => `- **${inline(name)}** (${inline(colorValue(name))}): ${colorUse(name)}`);
  const scale = Object.entries(tokens.primitive.text)
    .map(([name, fontSize]) => `${inline(name)} ${inline(fontSize)}`)
    .join(', ');
  const shadows = Object.entries(tokens.primitive.shadow ?? {});
  const elevation = shadows.length
    ? `Separate raised surfaces with the shadow set below. In dark mode, surface lightness or a border may carry the same distinction.\n\n${shadows
        .map(([key, value]) => `- **${inline(key)}:** ${inline(value)}`)
        .join('\n')}`
    : 'No shadow scale is defined. Separate surfaces with surface color or a border.';
  const radiusStep = Object.hasOwn(tree.rounded, 'md') ? 'md' : Object.keys(tree.rounded)[0];
  const sections = [
    ['overview', overview],
    [
      'colors',
      [...colorLines, '', 'A name ending in `-dark` is that color in dark mode.', '', ramps].join(
        '\n',
      ),
    ],
    [
      'typography',
      [
        'Use one family. Headlines use the semibold weight. Body text stays on the regular weight.',
        '',
        typeLine('Headlines', tree.typography['headline-lg']),
        typeLine('Body', tree.typography['body-md']),
        typeLine('Labels', tree.typography['label-md']),
        ...(scale ? ['', `Size steps: ${scale}.`] : []),
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    [
      'layout',
      'Space related items with the smaller spacing steps and separate sections with the larger ones. Spacing tokens hold the scale and any layout measure already in the token file. Keep repeated layouts on this scale.',
    ],
    ['elevation', elevation],
    [
      'shapes',
      radiusStep
        ? `Keep every corner on the rounded scale. Buttons and inputs use the ${radiusStep} step.`
        : 'Keep every corner on the rounded scale.',
    ],
    [
      'components',
      [
        `- **Buttons:** primary uses the primary fill and foreground. Secondary is the quieter action. Hover uses button-primary-hover. Buttons use the ${radiusStep ?? 'recorded'} radius and the button padding token.`,
        '- **Inputs:** fill with surface, text with on-surface, and draw the boundary with the input color.',
      ].join('\n'),
    ],
    [
      'dos',
      [
        '- Do use primary for the main action and secondary for quieter actions.',
        '- Do keep corner radii on the rounded scale.',
        '- Do meet 4.5:1 for normal text and 3:1 for declared UI pairs, then confirm those pairs in the interface.',
        '- Review these constraints against the product before treating them as approved.',
      ].join('\n'),
    ],
  ];
  return `# ${name} design system\n\n${sections
    .map(([key, body]) => `## ${SECTION_HEADINGS[key]}\n\n${body}`)
    .join('\n\n')}\n`;
}

export function renderDesignDocument(tokens) {
  const tree = designTree(tokens);
  const { version, name, description, ...groups } = tree;
  const frontMatter = description
    ? { version, name, description, ...groups }
    : { version, name, ...groups };
  return `---\n${emitYaml(frontMatter)}\n---\n\n${renderProse(tokens, tree)}`;
}

function stripComment(text) {
  let quote = '';
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (char === '\\' && quote === '"') index += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '#' && (index === 0 || text[index - 1] === ' '))
      return text.slice(0, index).trim();
  }
  return text.trim();
}

function parseDouble(text, line) {
  let value = '';
  for (let index = 1; index < text.length; index++) {
    const char = text[index];
    if (char === '\\') {
      const next = text[++index];
      if (next === 'n') value += '\n';
      else if (next === 't') value += '\t';
      else if (next === '"' || next === '\\' || next === '/') value += next;
      else throw new Error(`line ${line}: bad escape`);
      continue;
    }
    if (char === '"') {
      const rest = text.slice(index + 1).trim();
      if (rest && !rest.startsWith('#')) throw new Error(`line ${line}: trailing content`);
      return value;
    }
    value += char;
  }
  throw new Error(`line ${line}: unterminated string`);
}

function parseSingle(text, line) {
  let value = '';
  for (let index = 1; index < text.length; index++) {
    if (text[index] === "'") {
      if (text[index + 1] === "'") {
        value += "'";
        index += 1;
        continue;
      }
      const rest = text.slice(index + 1).trim();
      if (rest && !rest.startsWith('#')) throw new Error(`line ${line}: trailing content`);
      return value;
    }
    value += text[index];
  }
  throw new Error(`line ${line}: unterminated string`);
}

function parseScalar(raw, line) {
  const text = stripComment(raw);
  if (!text) throw new Error(`line ${line}: expected a value`);
  if (text.startsWith('"')) return parseDouble(text, line);
  if (text.startsWith("'")) return parseSingle(text, line);
  if (/^(?:\{|\[|&|\*|\||>|!)/.test(text)) throw new Error(`line ${line}: unsupported YAML syntax`);
  if (NUMBER.test(text)) return Number(text);
  return text;
}

function textLooksLikeEntry(text) {
  const keyText = KEY.exec(text)?.[0];
  return Boolean(keyText && text[keyText.length] === ':');
}

function splitEntry(text, line) {
  const keyText = KEY.exec(text)?.[0];
  if (!keyText || text[keyText.length] !== ':') throw new Error(`line ${line}: expected a key`);
  const key =
    keyText.startsWith('"') || keyText.startsWith("'") ? parseScalar(keyText, line) : keyText;
  return [key, text.slice(keyText.length + 1).trim()];
}

function yamlLines(source) {
  return source
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap((text, index) => {
      if (!text.trim() || stripComment(text) === '') return [];
      const indent = text.search(/\S/);
      if (text.slice(0, indent).includes('\t'))
        throw new Error(`line ${index + 1}: tabs are not allowed`);
      return [{ indent, text: text.slice(indent), line: index + 1 }];
    });
}

function parseYamlSubset(source) {
  const lines = yamlLines(source);
  let cursor = 0;
  function peek() {
    return lines[cursor];
  }
  function parseNode(path) {
    const item = peek();
    if (!item) throw new Error(`${path}: expected nested content`);
    if (item.text.startsWith('-')) return parseList(item.indent, path);
    return parseMap(item.indent, path);
  }
  function parseMap(indent, path) {
    const map = {};
    const start = cursor;
    while (peek() && peek().indent === indent && !peek().text.startsWith('-')) {
      const current = lines[cursor++];
      const [key, inline] = splitEntry(current.text, current.line);
      const nextPath = path ? `${path}.${key}` : key;
      if (Object.hasOwn(map, key)) throw new Error(`duplicate key ${nextPath}`);
      if (!inline) {
        const next = peek();
        map[key] = next && next.indent > indent ? parseNode(nextPath) : {};
      } else map[key] = parseScalar(inline, current.line);
    }
    if (cursor === start)
      throw new Error(`line ${peek()?.line ?? source.length}: expected a mapping`);
    return map;
  }
  function parseList(indent, path) {
    const list = [];
    while (peek() && peek().indent === indent && peek().text.startsWith('-')) {
      const current = lines[cursor++];
      const rest = current.text.replace(/^-\s?/, '');
      if (!rest) {
        const next = peek();
        list.push(next && next.indent > indent ? parseNode(`${path}[${list.length}]`) : null);
        continue;
      }
      if (textLooksLikeEntry(rest)) {
        const item = {};
        const [key, inline] = splitEntry(rest, current.line);
        const itemPath = `${path}[${list.length}]`;
        if (!inline) {
          const next = peek();
          item[key] = next && next.indent > indent ? parseNode(`${itemPath}.${key}`) : {};
        } else item[key] = parseScalar(inline, current.line);
        while (peek() && peek().indent > indent && !peek().text.startsWith('-')) {
          const row = lines[cursor++];
          const [childKey, childInline] = splitEntry(row.text, row.line);
          if (Object.hasOwn(item, childKey))
            throw new Error(`duplicate key ${itemPath}.${childKey}`);
          if (!childInline) {
            const next = peek();
            item[childKey] =
              next && next.indent > row.indent ? parseNode(`${itemPath}.${childKey}`) : {};
          } else item[childKey] = parseScalar(childInline, row.line);
        }
        list.push(item);
        continue;
      }
      list.push(parseScalar(rest, current.line));
    }
    return list;
  }
  if (!lines.length) return {};
  if (lines[0].indent !== 0 || lines[0].text.startsWith('-'))
    throw new Error('line 1: YAML block must be a mapping');
  const value = parseMap(0, '');
  if (cursor !== lines.length) throw new Error(`line ${lines[cursor].line}: unexpected content`);
  return value;
}

function splitDesignSource(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  let body = text;
  const blocks = [];
  if (text.startsWith('---\n')) {
    const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
    if (!match) throw new Error('unterminated front matter');
    blocks.push(match[1]);
    body = text.slice(match[0].length);
  }
  body = body.replace(/^```yaml\n([\s\S]*?)^```$/gm, (_, yaml) => {
    blocks.push(yaml);
    return '';
  });
  return { blocks, body };
}

function parseSections(prose) {
  const sections = [];
  const seen = new Map();
  for (const chunk of prose.split(/\n(?=## )/)) {
    if (!chunk.startsWith('## ')) continue;
    const newline = chunk.indexOf('\n');
    const heading = (newline === -1 ? chunk.slice(3) : chunk.slice(3, newline)).trim();
    const key = canonicalSection(heading);
    if (key && seen.has(key)) throw new Error(`duplicate section ${heading}`);
    if (key) seen.set(key, heading);
    sections.push({
      heading,
      key,
      body: newline === -1 ? '' : chunk.slice(newline + 1),
    });
  }
  const present = sections.filter((section) => section.key);
  for (let index = 1; index < present.length; index++) {
    if (SECTION_ORDER.indexOf(present[index].key) < SECTION_ORDER.indexOf(present[index - 1].key))
      throw new Error(
        `sections out of order: ${present[index - 1].heading} before ${present[index].heading}`,
      );
  }
  return sections;
}

function readOmitted(tokens) {
  if (tokens.omitted === undefined) return new Set();
  if (!Array.isArray(tokens.omitted)) throw new Error('omitted: expected a list');
  const names = new Set();
  for (const entry of tokens.omitted) {
    if (isObject(entry)) {
      for (const key of Object.keys(entry))
        if (key !== 'section' && key !== 'reason') throw new Error(`omitted.${key}: unknown field`);
      if (entry.reason !== undefined && typeof entry.reason !== 'string')
        throw new Error('omitted.reason: expected a string');
    } else if (typeof entry !== 'string') throw new Error('omitted: expected a section name');
    const section = omittedSection(entry);
    if (!section)
      throw new Error(
        `omitted: unknown section ${typeof entry === 'string' ? entry : entry.section}`,
      );
    names.add(section);
  }
  return names;
}

function isColor(value) {
  if (typeof value !== 'string') return false;
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return true;
  if (NAMED_COLORS.has(value.toLowerCase())) return true;
  if (!/^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix|color)\(/i.test(value))
    return false;
  if (/[{}<>;]|\/\*|\*\/|(?:url|expression)\s*\(/i.test(value)) return false;
  let depth = 0;
  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0 && value.endsWith(')');
}

function resolveDesignRef(value, tokens, path, composite) {
  const trail = [];
  function resolve(current, currentPath) {
    if (typeof current !== 'string') throw new Error(`${currentPath}: expected a string`);
    const match = REFERENCE.exec(current);
    if (!match) {
      if (/[{}]/.test(current))
        throw new Error(`${currentPath}: invalid reference ${JSON.stringify(current)}`);
      return current;
    }
    const target = match[1];
    if (trail.includes(target))
      throw new Error(`${currentPath}: circular token reference ${target}`);
    trail.push(target);
    let node = tokens;
    for (const part of target.split('.')) {
      if (!isObject(node) || !Object.hasOwn(node, part))
        throw new Error(`${currentPath}: unresolved token reference {${target}}`);
      node = node[part];
    }
    if (isObject(node)) {
      if (!composite) throw new Error(`${currentPath}: reference {${target}} points to a group`);
      return node;
    }
    return resolve(node, currentPath);
  }
  return resolve(value, path);
}

function assertDimension(value, path) {
  if (typeof value !== 'string' || !DIMENSION.test(value))
    throw new Error(`${path}: expected a px, em, or rem dimension`);
}

function assertTypography(token, path) {
  if (!isObject(token)) throw new Error(`${path}: expected a typography token`);
  if (typeof token.fontFamily !== 'string' || !token.fontFamily.trim())
    throw new Error(`${path}.fontFamily: expected a string`);
  assertDimension(token.fontSize, `${path}.fontSize`);
  if (
    token.fontWeight !== undefined &&
    !(
      typeof token.fontWeight === 'number' ||
      (typeof token.fontWeight === 'string' && NUMBER.test(token.fontWeight))
    )
  )
    throw new Error(`${path}.fontWeight: expected a number`);
  if (
    token.lineHeight !== undefined &&
    typeof token.lineHeight !== 'number' &&
    !(typeof token.lineHeight === 'string' && NUMBER.test(token.lineHeight))
  )
    assertDimension(token.lineHeight, `${path}.lineHeight`);
  if (token.letterSpacing !== undefined)
    assertDimension(token.letterSpacing, `${path}.letterSpacing`);
  for (const key of ['fontFeature', 'fontVariation'])
    if (token[key] !== undefined && typeof token[key] !== 'string')
      throw new Error(`${path}.${key}: expected a string`);
}

function validateTokens(tokens, warnings) {
  for (const key of Object.keys(tokens))
    if (!TOP_LEVEL.has(key)) throw new Error(`unknown top-level key ${key}`);
  if (typeof tokens.name !== 'string' || !tokens.name.trim())
    throw new Error('name: expected a nonempty string');
  if (tokens.version !== undefined && typeof tokens.version !== 'string')
    throw new Error('version: expected a string');
  if (tokens.description !== undefined && typeof tokens.description !== 'string')
    throw new Error('description: expected a string');
  if (tokens.colors !== undefined) {
    if (!isObject(tokens.colors) || !Object.keys(tokens.colors).length)
      throw new Error('colors: expected a color map');
    if (!Object.hasOwn(tokens.colors, 'primary'))
      throw new Error('colors.primary: required color is missing');
    for (const [key, value] of Object.entries(tokens.colors)) {
      const resolved = resolveDesignRef(value, tokens, `colors.${key}`, false);
      if (!isColor(resolved)) throw new Error(`colors.${key}: expected a CSS color`);
    }
  }
  if (tokens.typography !== undefined) {
    if (!isObject(tokens.typography) || !Object.keys(tokens.typography).length)
      throw new Error('typography: expected a typography map');
    for (const [key, value] of Object.entries(tokens.typography)) {
      const resolved =
        typeof value === 'string'
          ? resolveDesignRef(value, tokens, `typography.${key}`, true)
          : value;
      assertTypography(resolved, `typography.${key}`);
    }
  }
  for (const group of ['rounded', 'spacing']) {
    if (tokens[group] === undefined) continue;
    if (!isObject(tokens[group]) || !Object.keys(tokens[group]).length)
      throw new Error(`${group}: expected a scale`);
    for (const [key, value] of Object.entries(tokens[group])) {
      const resolved =
        typeof value === 'string'
          ? resolveDesignRef(value, tokens, `${group}.${key}`, false)
          : value;
      if (group === 'spacing' && typeof resolved === 'number') continue;
      assertDimension(resolved, `${group}.${key}`);
    }
  }
  if (tokens.components !== undefined) {
    if (!isObject(tokens.components) || !Object.keys(tokens.components).length)
      throw new Error('components: expected a component map');
    for (const [name, component] of Object.entries(tokens.components)) {
      if (!isObject(component)) throw new Error(`components.${name}: expected a property map`);
      for (const [key, value] of Object.entries(component)) {
        const path = `components.${name}.${key}`;
        if (!COMPONENT_PROPERTIES.has(key)) {
          warnings.push(`${path}: unknown component property`);
          if (typeof value === 'string' && REFERENCE.test(value))
            resolveDesignRef(value, tokens, path, true);
          else if (typeof value !== 'string' && typeof value !== 'number')
            throw new Error(`${path}: expected a string`);
          continue;
        }
        const composite = key === 'typography';
        const resolved =
          typeof value === 'string' ? resolveDesignRef(value, tokens, path, composite) : value;
        if (key === 'backgroundColor' || key === 'textColor') {
          if (!isColor(resolved)) throw new Error(`${path}: expected a CSS color`);
        } else if (key === 'typography') assertTypography(resolved, path);
        else if (typeof resolved === 'string') assertDimension(resolved, path);
        else throw new Error(`${path}: expected a dimension`);
      }
    }
  }
}

export function parseDesignDocument(source) {
  if (typeof source !== 'string') throw new Error('DESIGN.md: expected a string');
  const { blocks, body } = splitDesignSource(source);
  const tokens = {};
  for (const block of blocks) {
    const parsed = parseYamlSubset(block);
    if (!isObject(parsed)) throw new Error('YAML block must be a mapping');
    for (const key of Object.keys(parsed)) {
      if (Object.hasOwn(tokens, key)) throw new Error(`duplicate top-level key ${key}`);
      tokens[key] = parsed[key];
    }
  }
  const sections = parseSections(body);
  const warnings = [];
  const omitted = readOmitted(tokens);
  const present = new Set(sections.filter((section) => section.key).map((section) => section.key));
  for (const key of SECTION_ORDER)
    if (!present.has(key) && !omitted.has(key)) warnings.push(`missing section ${key}`);
  validateTokens(tokens, warnings);
  return { tokens, sections, warnings };
}

function baseColorName(name) {
  return name.endsWith('-dark') ? name.slice(0, -'-dark'.length) : name;
}

export function projectColorModes(tokens) {
  if (!isObject(tokens?.colors)) return { light: {}, dark: {} };
  const light = {};
  const dark = {};
  const entries = Object.entries(tokens.colors);
  const ranked = [
    ...entries.filter(([name]) => !ROLE_ALIASES.has(baseColorName(name))),
    ...entries.filter(([name]) => ROLE_ALIASES.has(baseColorName(name))),
  ];
  for (const [name] of ranked) {
    const darkMode = name.endsWith('-dark');
    const base = baseColorName(name);
    const role = ROLE_ALIASES.get(base) ?? (COLOR_ROLES.includes(base) ? base : null);
    if (!role) continue;
    const value = resolveDesignRef(tokens.colors[name], tokens, `colors.${name}`, false);
    const bucket = darkMode ? dark : light;
    if (Object.hasOwn(bucket, role) && bucket[role] !== value)
      throw new Error(`colors.${name}: conflicts with ${role}`);
    if (!Object.hasOwn(bucket, role)) bucket[role] = value;
  }
  return { light, dark };
}
