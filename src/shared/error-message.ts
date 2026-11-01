import { ZodError } from "zod";

export function getErrorMessage(error: unknown, fallback = "出了点问题，请重试。"): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
