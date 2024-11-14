export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Array<{
      path: string[];
      message: string;
      code: string;
    }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BlockValidationError extends ValidationError {
  constructor(
    public blockId: string,
    message: string,
    details: Array<{
      path: string[];
      message: string;
      code: string;
    }>
  ) {
    super(message, details);
    this.name = 'BlockValidationError';
  }
}

export class ContentValidationError extends ValidationError {
  constructor(
    message: string,
    details: Array<{
      path: string[];
      message: string;
      code: string;
    }>,
    public contentId?: string
  ) {
    super(message, details);
    this.name = 'ContentValidationError';
  }
}

export class SanitizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SanitizationError';
  }
}