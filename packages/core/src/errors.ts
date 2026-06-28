// Tagged domain errors. The HTTP/transport edge catches DomainError and maps `.code` to a status;
// services and repositories return typed failures via Result<T, DomainError>. See INFRASTRUCTURE.md §6.

export type DomainErrorCode = "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "VALIDATION_ERROR";

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  constructor(code: DomainErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DomainError";
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not found", options?: ErrorOptions) {
    super("NOT_FOUND", message, options);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden", options?: ErrorOptions) {
    super("FORBIDDEN", message, options);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends DomainError {
  constructor(message = "Conflict", options?: ErrorOptions) {
    super("CONFLICT", message, options);
    this.name = "ConflictError";
  }
}

export interface ValidationIssue {
  path: string[];
  message: string;
}

export class ValidationError extends DomainError {
  readonly issues: readonly ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = [], options?: ErrorOptions) {
    super("VALIDATION_ERROR", message, options);
    this.name = "ValidationError";
    this.issues = issues;
  }
}
