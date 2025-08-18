import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Errors } from 'moleculer';
import { ERROR_MESSAGE_MAP } from './error';
import { AppErrorResponseDto } from './app-error-response.dto';

// This is the shape of the error Moleculer sends
interface MoleculerErrorResponse {
  name: string;
  message: string;
  code: number;
  type: string; // This is our machine-readable code (e.g., "USER_NOT_FOUND")
  data?: any;
  stack?: string;
}

@Catch(Errors.MoleculerError) // Catch only errors originating from Moleculer
export class MoleculerErrorFilter implements ExceptionFilter {
  catch(exception: Errors.MoleculerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Moleculer errors are structured, let's cast it for type safety
    const err = exception as MoleculerErrorResponse;

    const httpStatus =
      typeof err.code === 'number' && err.code >= 400
        ? err.code
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Look up the user-friendly message using the `type` property
    const userMessage =
      ERROR_MESSAGE_MAP[err.type] || ERROR_MESSAGE_MAP['DEFAULT'];

    const errorResponse: AppErrorResponseDto = {
      success: false,
      message: userMessage, // The translated, user-facing message
      reason: err.message, // The original developer-facing message from the service
    };

    // IMPORTANT: Only include stack traces in development environments
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
    }

    response.status(httpStatus).json(errorResponse);
  }
}
