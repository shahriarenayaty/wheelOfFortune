import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppErrorResponseDto } from './app-error-response.dto';

/**
 * Catches any exception that is not an instance of HttpException or MoleculerError.
 * This acts as a final safety net, ensuring that no unhandled exceptions are sent to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the full error for debugging, as this should not happen in a well-behaved app.
    this.logger.error(
      'Unhandled exception caught by AllExceptionsFilter:',
      exception,
    );

    const errorResponse: AppErrorResponseDto = {
      success: false,
      message: 'An unexpected internal server error occurred.',
      reason:
        exception instanceof Error
          ? exception.message
          : 'An unknown error occurred.',
    };

    // Only include stack traces in development environments
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
