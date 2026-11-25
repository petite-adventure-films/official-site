// Article content colors, including approved migration corrections; not CMS theme colors.
export const legacyColorCorrections: Record<string, string> = {
  "#ff0000": "#d90000",
  "#0d8bd4": "#0b75b3",
};
export const legacyStyleKeys = ['color', 'fontFamily', 'fontSize'];
const colors: Record<string, string> = {
  '#d90000': '#d90000', 'rgb(217, 0, 0)': '#d90000',
  '#0b75b3': '#0b75b3', 'rgb(11, 117, 179)': '#0b75b3',
  '#0000ff': '#0000ff', 'rgb(0, 0, 255)': '#0000ff',
  '#ff0000': '#ff0000', 'rgb(255, 0, 0)': '#ff0000',
  '#000000': '#000000', 'rgb(0, 0, 0)': '#000000',
  '#0d8bd4': '#0d8bd4', 'rgb(13, 139, 212)': '#0d8bd4',
};
export const legacyFonts = ['Times New Roman,serif', 'ＭＳ Ｐ明朝,serif'];
export function legacyStyleFromElement(element: { getAttribute(name: string): string | null }): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const declaration of (element.getAttribute('style') ?? '').split(';').filter(v => v.trim())) {
    const colon = declaration.indexOf(':');
    const key = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    const field = ({ color: 'color', 'font-family': 'fontFamily', 'font-size': 'fontSize' } as Record<string, string>)[key];
    if (colon < 0 || !field || attrs[field]) throw Error('unsupported_legacy_style');
    if (field === 'color' && colors[value.toLowerCase()]) attrs.color = colors[value.toLowerCase()];
    else if (field === 'fontFamily' && legacyFonts.includes(value.split(',').map(part => part.trim().replace(/^(["'])(.*)\1$/, '$2')).join(','))) attrs.fontFamily = value.split(',').map(part => part.trim().replace(/^(["'])(.*)\1$/, '$2')).join(',');
    else if (field === 'fontSize' && value === 'medium') attrs.fontSize = value;
    else throw Error('unsupported_legacy_style');
  }
  if (!Object.keys(attrs).length) throw Error('empty_legacy_style');
  return attrs;
}
export function legacyStyleHtml(attrs: Record<string, unknown>): { style: string } {
  const declarations: string[] = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'color' && typeof value === 'string' && /^#[a-f0-9]{6}$/.test(value) && colors[value]) declarations.push(`color: ${value}`);
    else if (key === 'fontFamily' && typeof value === 'string' && legacyFonts.includes(value)) declarations.push(`font-family: ${value}`);
    else if (key === 'fontSize' && value === 'medium') declarations.push('font-size: medium');
    else throw Error('invalid_legacy_style');
  }
  if (!declarations.length) throw Error('empty_legacy_style');
  return { style: declarations.join('; ') };
}
