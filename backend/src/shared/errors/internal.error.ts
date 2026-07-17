import { AppError } from "./app.error";
import { ErrorCode } from "./error-codes";

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, ErrorCode.INTERNAL_ERROR);
  }
}
