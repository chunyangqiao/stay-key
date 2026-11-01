/**
 * Mask a credential for list display. Full value stays in memory for copy/edit.
 * Rules (PRD): account keep first 2 + last 2; email mask local part; password fully masked.
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
  return "••••••••";
}

function maskKeepEnds(value: string): string {
  if (value.length <= 2) {
    return "*".repeat(value.length);
  }
  if (value.length <= 4) {
    return `${value.slice(0, 1)}${"*".repeat(value.length - 2)}${value.slice(-1)}`;
  }
  return `${value.slice(0, 2)}${"*".repeat(Math.min(6, value.length - 4))}${value.slice(-2)}`;
}
