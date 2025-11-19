import { Token } from '../token.ts';
import { keywordTokenTypeMap, ScannerMode, TokenType } from '../constants.ts';

export class Scanner {
  source: string;
  startPos: number = 0;
  currentPos: number = 0;
  line: number = 0;
  tokens: Token[] = [];
  modeStack: ScannerMode[] = [ScannerMode.Text];
  neverChar = '__NEVER_CHAR';
  alphabeticRegexp = /^[a-zA-Z]$/;

  constructor(source: string) {
    this.source = source;
  }

  // helpers methods start
  getMode() {
    return this.modeStack[this.modeStack.length - 1];
  }

  pushMode(m: ScannerMode) {
    this.modeStack.push(m);
  }

  popMode() {
    return this.modeStack.pop();
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

  advanceWhile(predicate: (char: string) => boolean) {
    while (!this.isEnd() && predicate(this.peek())) {
      this.incrementCurrPos();
    }
  }
  // helpers methods end

  // scan methods start
  scanTagStart() {
    if (this.matchAlphabetChar()) {
      this.addToken(TokenType.TagOpen);
      this.pushMode(ScannerMode.OpenTag);
    } else if (this.matchChar('/')) {
      this.incrementCurrPos();
      this.addToken(TokenType.TagEndClose);
      this.pushMode(ScannerMode.CloseTag);
    }
  }

  scanTagEnd() {
    this.addToken(TokenType.TagClose);
    while (this.getMode() !== ScannerMode.Text) {
      this.popMode();
    }
  }

  scanOpenOrCloseTagName() {
    this.advanceWhile((currChar) => !['>', ' '].includes(currChar));
    this.addToken(TokenType.TagName);
  }

  scanQuote() {
    this.addToken(TokenType.Quote);
    if (this.getMode() === ScannerMode.AttrValue) {
      // twice popMode(), to pop attrValue and attrName. Returning to tagOpen
      this.popMode();
      this.popMode();
    } else if (this.getMode() === ScannerMode.AttrName) {
      this.pushMode(ScannerMode.AttrValue);
    }
  }

  scanEqual() {
    this.addToken(TokenType.Equal);
  }

  scanSpace() {
    const mode = this.getMode();
    if (mode === ScannerMode.OpenTag && this.matchAlphabetChar()) {
      this.pushMode(ScannerMode.AttrName);
    }
  }

  scanOpenBracket() {
    if (this.matchChar('{')) {
      this.incrementCurrPos();
      this.addToken(TokenType.VarOpen);
      this.pushMode(ScannerMode.VarIdentifier);
    } else if (this.matchChar('%')) {
      this.incrementCurrPos();
      this.addToken(TokenType.StmtOpen);
      this.pushMode(ScannerMode.Statement);
    }
  }

  scanCloseBracket() {
    if (this.matchChar('}')) {
      this.incrementCurrPos();
      this.addToken(TokenType.VarClose);
      this.popMode();
    }
  }

  scanAttrName() {
    this.advanceWhile((currChar) => !['=', '>', ' '].includes(currChar));
    this.addToken(TokenType.AttrName);
  }

  scanAttrValue() {
    this.advanceWhile((currChar) => !['"', ' ', '{'].includes(currChar));
    this.addToken(TokenType.AttrValue);
  }

  scanVarIdentifier() {
    this.advanceWhile((currChar) => currChar !== '}');
    this.addToken(TokenType.Identifier);
  }

  scanText() {
    this.advanceWhile((currChar) => !['<', '{'].includes(currChar));
    this.addToken(TokenType.Text);
  }

  scanPercent() {
    if (this.matchChar('}')) {
      this.incrementCurrPos();
      this.addToken(TokenType.StmtClose);
      this.popMode();
    }
  }

  scanStatement() {
    this.advanceWhile((currChar) => currChar !== ' ');
    const keyWord = this.source.slice(this.startPos, this.currentPos);
    if (keyWord in keywordTokenTypeMap) {
      this.addToken(keywordTokenTypeMap[keyWord as keyof typeof keywordTokenTypeMap]);
    } else {
      this.addToken(TokenType.Identifier);
    }
  }
  // scan methods end

  // aggregation scan methods start
  scanByMode() {
    switch (this.getMode()) {
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

      case ScannerMode.Statement:
        this.scanStatement();
        break;

      default:
        this.scanText();
        break;
    }
  }

  scanByChar(char: string) {
    switch (char) {
      case '<':
        this.scanTagStart();
        break;

      case '>':
        this.scanTagEnd();
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

      case '%':
        this.scanPercent();
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
