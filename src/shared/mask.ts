/**
 * Mask a credential for list / current-site display.
 * Account: keep first 2 + last 2 with "***" in the middle (email: te***13@gmail.com).
 * Password: always fully masked when not expanded.
 */
export function maskAccount(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const at = trimmed.indexOf("@");
  if (at > 0 && at < trimmed.length - 1) {
    const local = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1);
    return `${maskKeepEnds(local)}@${domain}`;
  }

  return maskKeepEnds(trimmed);
}

export function maskPassword(_value: string): string {
  return "••••••";
}

function maskKeepEnds(value: string): string {
  if (value.length <= 2) {
    return "*".repeat(value.length);
  }
  if (value.length <= 4) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}
