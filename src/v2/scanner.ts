import { Token } from './token.ts';
import { TokenType } from './tokenType.ts';

export class Scanner {
  source: string;
  startPos: number = 0;
  currentPos: number = 0;
  line: number = 0;
  tokens: Token[] = [];
  isInOpenTag: boolean = false;
  isInCloseTag: boolean = false;
  isInAttrName: boolean = false;
  isInAttrValue: boolean = false;

  neverChar = '__NEVER_CHAR';
  alphabeticRegexp = /^[a-zA-Z]$/;

  constructor(source: string) {
    this.source = source;
  }

  isEnd() {
    return this.currentPos >= this.source.length;
  }

  incrementCurrPos() {
    this.currentPos += 1;
  }

  advance() {
    const currChar = this.source[this.currentPos];
    this.currentPos += 1;
    return currChar;
  }

  addToken(tokenType: TokenType) {
    this.tokens.push(
      new Token(tokenType, this.source.slice(this.startPos, this.currentPos), this.line),
    );
  }

  peek() {
    if (this.currentPos >= this.source.length) {
      return this.neverChar;
    }
    return this.source[this.currentPos];
  }

  matchChar(char: string) {
    if (this.isEnd()) {
      return false;
    }
    return char === this.peek();
  }

  matchAlphabetChar() {
    if (this.isEnd()) {
      return false;
    }
    return this.isAlphabetic(this.peek());
  }

  matchTagNameDigit() {
    if (this.isEnd()) {
      return false;
    }
    return this.isTagDigit(this.peek());
  }

  isAlphabetic(char: string) {
    return char === this.neverChar ? false : this.alphabeticRegexp.test(char);
  }

  isTagDigit(char: string) {
    return char === this.neverChar ? false : char >= '1' && char <= '6';
  }

  startScan() {
    while (!this.isEnd()) {
      this.startPos = this.currentPos;

      const char = this.advance();

      switch (char) {
        case '"':
          this.addToken(TokenType.Quote);
          break;

        case '>':
          this.addToken(TokenType.TagClose);
          if (this.isInOpenTag) {
            this.isInOpenTag = false;
          } else if (this.isInCloseTag) {
            this.isInCloseTag = false;
          }
          break;

        case '=':
          this.addToken(TokenType.Equal);
          this.isInAttrValue = true;
          break;

        case '<': {
          if (this.matchAlphabetChar()) {
            this.addToken(TokenType.TagOpen);
            this.isInOpenTag = true;
          } else if (this.matchChar('/')) {
            this.incrementCurrPos();
            this.addToken(TokenType.TagEndClose);
            this.isInCloseTag = true;
          }
          break;
        }

        case ' ': {
          if (this.isInOpenTag && this.matchAlphabetChar()) {
            this.isInAttrName = true;
          }
          break;
        }

        case '\n':
          this.line += 1;
          break;

        case '\t':
        case '\r':
          break;

        default:
          if (this.isInAttrName) {
            while (!this.isEnd() && !['=', '>', ' '].includes(this.peek())) {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.AttrName);
            this.isInAttrName = false;
            break;
          }

          if (this.isInAttrValue) {
            while (!this.isEnd() && this.peek() !== '"') {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.Text);
            this.isInAttrValue = false;
            break;
          }

          if (
            (this.isInOpenTag || this.isInCloseTag) &&
            (this.matchAlphabetChar() || this.matchTagNameDigit())
          ) {
            while (!this.isEnd() && !['>', ' '].includes(this.peek())) {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.TagName);
            break;
          }

          if (
            !this.isInOpenTag &&
            !this.isInCloseTag &&
            !this.isInAttrName &&
            !this.isInAttrValue
          ) {
            while (!this.isEnd() && this.peek() !== '<') {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.Text);
            break;
          }

          console.log(`Unknown character ${char}, line ${this.line}`);
      }
    }

    return this.tokens;
  }
}

// tokens.forEach((token) => {
//   console.log(token);
// });

// отрефакторить
// написать тесты для готового функционала
