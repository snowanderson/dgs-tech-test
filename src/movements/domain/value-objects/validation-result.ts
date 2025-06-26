export class ValidationResult {
  private constructor(
    private readonly isValid: boolean,
    private readonly errors: ValidationError[] = [],
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static fail(message: string, details?: object): ValidationResult {
    return new ValidationResult(false, [{ message, details }]);
  }

  static combine(results: ValidationResult[]): ValidationResult {
    const errors = results
      .filter((result) => !result.isValid)
      .flatMap((result) => result.errors);

    return errors.length === 0
      ? ValidationResult.success()
      : new ValidationResult(false, errors);
  }

  combine(result: ValidationResult): ValidationResult {
    return ValidationResult.combine([this, result]);
  }

  hasErrors(): boolean {
    return !this.isValid;
  }

  getErrors(): ValidationError[] {
    return [...this.errors];
  }
}

export interface ValidationError {
  message: string;
  details?: any;
}
