export class ErrorHandler {
  private statusCode: number;
  private message: string;
  private isOperational: boolean;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;
  }
}
