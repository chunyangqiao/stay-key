/** Holds the master password only between onboarding steps; never persisted. */
let pendingMasterPassword: string | undefined;

export function setPendingMasterPassword(password: string): void {
  pendingMasterPassword = password;
}

export function takePendingMasterPassword(): string | undefined {
  const value = pendingMasterPassword;
  pendingMasterPassword = undefined;
  return value;
}

export function peekPendingMasterPassword(): string | undefined {
  return pendingMasterPassword;
}

export function clearPendingMasterPassword(): void {
  pendingMasterPassword = undefined;
}
