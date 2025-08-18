import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

// Define our standard error response structure (reused for consistency)
interface AppErrorResponse {
  success: boolean;
  message: string; // User-facing message
  reason: string; // Developer-facing reason
  stack?: string;
}

/**
 * Catches HttpExceptions thrown within the NestJS application (e.g., from controllers, services).
 * It transforms the standard NestJS error response into our custom AppErrorResponse format,
 * ensuring consistency with errors originating from microservices (handled by MoleculerErrorFilter).
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // HttpException.getResponse() can return a string or an object.
    const exceptionResponse = exception.getResponse();

    let userMessage: string;
    // The 'reason' is the more generic, developer-facing error name.
    // e.g., for a 404, this would be 'Not Found'.
    const devReason = exception.message;

    // Determine the user-facing message based on the exception response type.
    if (typeof exceptionResponse === 'string') {
      // e.g., throw new NotFoundException('The requested post does not exist');
      userMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      // This handles the default NestJS error object shape,
      // especially useful for validation errors from class-validator.
      // e.g., { "statusCode": 400, "message": ["email must be an email"], "error": "Bad Request" }
      const res = exceptionResponse as { message: string | string[] };
      userMessage = Array.isArray(res.message)
        ? res.message.join(', ')
        : res.message;
    } else {
      // A fallback if the exception has an unexpected structure.
      userMessage = 'An error occurred while processing your request.';
    }

    const errorResponse: AppErrorResponse = {
      success: false,
      message: userMessage,
      reason: devReason,
    };

    // IMPORTANT: Only include stack traces in development environments
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception.stack;
    } else {
      // In Production Mode, We remove messages because we don't want to leak sensitive information like input schemas
      if (exception instanceof BadRequestException) {
        errorResponse.message = 'Invalid request data';
      }
    }

    response.status(status).json(errorResponse);
  }
}
