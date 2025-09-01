import { TokenizerParseError } from './errors.ts';
import { TokenizerValidator } from './tokenizerValidator.ts';
import { ResultType } from './types.ts';
import { isError } from './typeGuards.ts';

type TextToken = {
  type: 'text';
  value: string;
};

type VarToken = {
  type: 'var';
  name: string;
};

type Token = TextToken | VarToken;

export class Tokenizer {
  validator = new TokenizerValidator();

  parse(text: string): ResultType<Token[], TokenizerParseError | Error> {
    const tokens: Token[] = [];
    const textPattern = '(?<textValue>[^{]+)';
    const varPattern = '\\{\\{\\s*(?<varName>.{1,50}?)\\s*\\}\\}';
    const textAndVarRegex = new RegExp(`${textPattern}|${varPattern}`, 'gu');

    let result: RegExpExecArray | null = null;
    while ((result = textAndVarRegex.exec(text))) {
      const groups = result.groups;
      if (groups?.['varName']) {
        const varName = groups.varName;

        try {
          this.validator.validateVariableMatch({
            inputText: result.input,
            openBracketsMatchIndex: result.index,
            varName,
          });
        } catch (error) {
          return {
            success: false,
            error: isError(error) ? error : new Error(`unknown error occurred: ${error}`),
          };
        }

        tokens.push({ type: 'var', name: varName });
      }

      if (groups?.['textValue']) {
        tokens.push({ type: 'text', value: groups.textValue });
      }
    }

    return { success: true, value: tokens };
  }
}
