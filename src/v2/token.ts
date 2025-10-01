import { TokenType } from './tokenType.ts';

export class Token {
  tokenType: TokenType;
  lexeme: string;
  line: number;

  constructor(tokenType: TokenType, lexeme: string, line: number) {
    this.tokenType = tokenType;
    this.lexeme = lexeme;
    this.line = line;
  }
}
