export class TokenValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TokenizerParseError extends Error {
  constructor(message: string, cause: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}
