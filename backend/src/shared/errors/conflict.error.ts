import { AppError } from "./app.error";
import { ErrorCode } from "./error-codes";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, ErrorCode.CONFLICT);
  }
}
