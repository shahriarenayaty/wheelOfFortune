// Define our standard error response structure
interface AppErrorResponseDto {
  success: boolean;
  message: string; // User-facing message
  reason: string; // Developer-facing reason
  stack?: string;
}
export { AppErrorResponseDto };
