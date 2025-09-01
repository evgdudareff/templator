import { TokenizerParseError, TokenValidationError } from './errors.ts';

export const VALIDATION_ERROR_MESSAGE = 'Validation Error';

export class TokenizerValidator {
  readonly FORBIDDEN_CHARS = /[{}|<>[\]'"`;=&$\\]/u;

  validateVariableMatch(variableMatch: {
    inputText: string;
    openBracketsMatchIndex: number | string;
    varName: string;
  }) {
    const varName = variableMatch.varName.trim();
    let validationError;

    if (varName === '') {
      validationError = new TokenValidationError(
        `Variable is undefined. Check ${variableMatch.openBracketsMatchIndex} text position`,
      );
    }

    let forbiddenCharMatch;
    if ((forbiddenCharMatch = varName.match(this.FORBIDDEN_CHARS))) {
      validationError = new TokenValidationError(
        `Forbidden chars ${forbiddenCharMatch[0]} in ${varName}`,
      );
    }

    if (validationError) {
      throw new TokenizerParseError(VALIDATION_ERROR_MESSAGE, validationError);
    }
  }
}
