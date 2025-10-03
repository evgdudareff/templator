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
  isInVarIdentifier: boolean = false;

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
    this.incrementCurrPos();
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
    const char = this.peek();
    return char === this.neverChar ? false : this.alphabeticRegexp.test(char);
  }

  matchTagNameDigit() {
    if (this.isEnd()) {
      return false;
    }
    const char = this.peek();
    return char === this.neverChar ? false : char >= '1' && char <= '6';
  }

  startScan() {
    while (!this.isEnd()) {
      this.startPos = this.currentPos;

      const char = this.advance();

      switch (char) {
        case '"':
          this.addToken(TokenType.Quote);
          if (this.isInOpenTag && this.isInAttrValue && this.matchChar(' ')) {
            this.isInAttrValue = false;
          }
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
          if (this.isInOpenTag && !this.isInAttrValue && this.matchAlphabetChar()) {
            this.isInAttrName = true;
          }
          break;
        }

        case '{': {
          if (this.matchChar('{')) {
            this.incrementCurrPos();
            this.addToken(TokenType.VarOpen);
            this.isInVarIdentifier = true;
          }
          break;
        }

        case '}': {
          if (this.matchChar('}')) {
            this.incrementCurrPos();
            this.addToken(TokenType.VarClose);
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

          if (this.isInVarIdentifier) {
            while (!this.isEnd() && this.peek() !== '}') {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.identifier);
            this.isInVarIdentifier = false;
            break;
          }

          if (this.isInAttrValue) {
            while (!this.isEnd() && !['"', ' ', '{'].includes(this.peek())) {
              this.incrementCurrPos();
            }
            this.addToken(TokenType.Text);
            if (this.peek() === '"') {
              this.isInAttrValue = false;
            }

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

// const scanner = new Scanner(`
//     <h1 class="class-1 {{customClass1}} class-2 {{customClass2}}" id="1234" data-user-on>
//         <span>Scanner</span>
//         Some text
//     </h1>
// `);
//
// const tokens = scanner.startScan();
//
// tokens.forEach((token) => {
//   console.log(token);
// });

// отрефакторить
// написать тесты для готового функционала
