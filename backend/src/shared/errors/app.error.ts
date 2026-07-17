import type { ErrorCode } from "./error-codes";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode
  ) {
    super(message);
    this.name = "AppError";
  }

  toJSON(): { error: string; code: ErrorCode } {
    return { error: this.message, code: this.code };
  }
}
