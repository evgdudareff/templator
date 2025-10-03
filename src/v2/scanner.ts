import { Token } from './token.ts';
import { ScannerMode, TokenType } from './constants.ts';

export class Scanner {
  source: string;
  startPos: number = 0;
  currentPos: number = 0;
  line: number = 0;
  tokens: Token[] = [];
  mode: ScannerMode = ScannerMode.Text;
  neverChar = '__NEVER_CHAR';
  alphabeticRegexp = /^[a-zA-Z]$/;

  constructor(source: string) {
    this.source = source;
  }

  // helpers methods start
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

  incrementCurrPosWhileIsNotEndAndPredicate(predicate: (...args: unknown[]) => boolean) {
    while (!this.isEnd() && predicate()) {
      this.incrementCurrPos();
    }
  }
  // helpers methods end

  // scan methods start
  scanOpenOrCloseTagStart() {
    if (this.matchAlphabetChar()) {
      this.addToken(TokenType.TagOpen);
      this.mode = ScannerMode.OpenTag;
    } else if (this.matchChar('/')) {
      this.incrementCurrPos();
      this.addToken(TokenType.TagEndClose);
      this.mode = ScannerMode.CloseTag;
    }
  }

  scanOpenOrCloseTagEnd() {
    this.addToken(TokenType.TagClose);
    this.mode = ScannerMode.Text;
  }

  scanOpenOrCloseTagName() {
    if (this.matchAlphabetChar() || this.matchTagNameDigit()) {
      this.incrementCurrPosWhileIsNotEndAndPredicate(() => !['>', ' '].includes(this.peek()));
      this.addToken(TokenType.TagName);
    }
  }

  scanQuote() {
    this.addToken(TokenType.Quote);
  }

  scanEqual() {
    this.addToken(TokenType.Equal);
    this.mode = ScannerMode.AttrValue;
  }

  scanSpace() {
    if (this.mode === ScannerMode.OpenTag && this.matchAlphabetChar()) {
      this.mode = ScannerMode.AttrName;
    }
  }

  scanOpenBracket() {
    if (this.matchChar('{')) {
      this.incrementCurrPos();
      this.addToken(TokenType.VarOpen);
      this.mode = ScannerMode.VarIdentifier;
    }
  }

  scanCloseBracket() {
    if (this.matchChar('}')) {
      this.incrementCurrPos();
      this.addToken(TokenType.VarClose);

      if (this.peek() === ' ') {
        this.mode = ScannerMode.AttrValue;
      } else {
        this.mode = ScannerMode.OpenTag;
      }
    }
  }

  scanAttrName() {
    this.incrementCurrPosWhileIsNotEndAndPredicate(() => !['=', '>', ' '].includes(this.peek()));
    this.addToken(TokenType.AttrName);
    this.mode = ScannerMode.Text;
  }

  scanAttrValue() {
    this.incrementCurrPosWhileIsNotEndAndPredicate(() => !['"', ' ', '{'].includes(this.peek()));
    this.addToken(TokenType.Text);
    if (this.peek() === '"') {
      this.mode = ScannerMode.OpenTag;
    }
  }

  scanVarIdentifier() {
    this.incrementCurrPosWhileIsNotEndAndPredicate(() => !['}'].includes(this.peek()));
    this.addToken(TokenType.identifier);
  }

  scanText() {
    this.incrementCurrPosWhileIsNotEndAndPredicate(() => !['<'].includes(this.peek()));
    this.addToken(TokenType.Text);
    this.mode = ScannerMode.Text;
  }
  // scan methods end

  // aggregation scan methods start
  scanByMode() {
    switch (this.mode) {
      case ScannerMode.AttrName:
        this.scanAttrName();
        break;

      case ScannerMode.AttrValue:
        this.scanAttrValue();
        break;

      case ScannerMode.VarIdentifier:
        this.scanVarIdentifier();
        break;

      case ScannerMode.OpenTag:
      case ScannerMode.CloseTag:
        this.scanOpenOrCloseTagName();
        break;

      default:
        this.scanText();
        break;
    }
  }

  scanByChar(char: string) {
    switch (char) {
      case '<':
        this.scanOpenOrCloseTagStart();
        break;

      case '>':
        this.scanOpenOrCloseTagEnd();
        break;

      case '"':
        this.scanQuote();
        break;

      case '=':
        this.scanEqual();
        break;

      case ' ':
        this.scanSpace();
        break;

      case '{':
        this.scanOpenBracket();
        break;

      case '}':
        this.scanCloseBracket();
        break;

      case '\n':
        this.line += 1;
        break;

      case '\t':
      case '\r':
        break;

      default:
        this.scanByMode();
    }
  }
  // aggregation scan methods end

  // main method
  startScan() {
    while (!this.isEnd()) {
      this.startPos = this.currentPos;
      this.scanByChar(this.advance());
    }

    return this.tokens;
  }
}

// const scanner = new Scanner(`
//     <h1 id="1234">
//         <span>{{customText}}</span>
//     </h1>
// `);
//
// const tokens = scanner.startScan();
//
// tokens.forEach((token) => {
//   console.log(token);
// });
