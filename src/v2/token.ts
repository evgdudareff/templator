import { ScannerMode, TokenType } from './constants.ts';

export class Token {
  tokenType: TokenType;
  lexeme: string;
  line: number;
  // mode: ScannerMode | '' = '';

  constructor(tokenType: TokenType, lexeme: string, line: number) {
    this.tokenType = tokenType;
    this.lexeme = lexeme;
    this.line = line;
    // this.mode = mode || '';
  }
}
