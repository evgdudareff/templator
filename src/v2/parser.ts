import { Token } from './token.ts';
import {
  AttributeExpr,
  ElementNodeExpr,
  Expr,
  ForNodeExpr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.ts';
import { TokenType } from './constants.ts';
import { Scanner } from './scanner.ts';

export class Parser {
  private current: number = 0;

  constructor(public readonly tokens: Token[]) {}

  // utils methods start
  private tokensToString(tokens: Token[]): string {
    return tokens.map((token: Token) => token.lexeme).join(' ');
  }

  private isAtEnd(): boolean {
    return this.current > this.tokens.length - 1;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token {
    return this.tokens[this.current + 1];
  }

  private advance(step: number = 1): Token {
    if (!this.isAtEnd()) {
      this.current += step;
    }
    return this.previous();
  }

  private match(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().tokenType == type;
  }

  private matchNext(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peekNext().tokenType == type;
  }
  // utils methods end

  // parse methods start
  private expression(): Expr {
    const children = [];

    const currToken = this.peek();
    switch (currToken.tokenType) {
      case TokenType.TagOpen: {
        const elementNode = this.parseElementNode();
        children.push(elementNode);
        break;
      }

      case TokenType.VarOpen: {
        const variableExpr = this.parseVariableExpr();
        children.push(variableExpr);
        break;
      }

      case TokenType.StmtOpen: {
        if (this.matchNext(TokenType.If)) {
          const ifElse = this.parseIfElse();
          children.push(ifElse);
        } else if (this.matchNext(TokenType.For)) {
          const forStmt = this.parseForStmt();
          children.push(forStmt);
        }
        break;
      }

      case TokenType.Text: {
        const textNode = new TextNodeExpr(this.tokensToString([this.advance()]));
        children.push(textNode);
        break;
      }
    }
    return children;
  }

  private parseForStmt(): ForNodeExpr {
    let pos = this.current;
    const isValidOpenStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.For &&
      tokens[pos + 2].tokenType === TokenType.Identifier &&
      tokens[pos + 3].tokenType === TokenType.In &&
      tokens[pos + 4].tokenType === TokenType.Identifier &&
      tokens[pos + 5].tokenType === TokenType.StmtClose;

    if (!isValidOpenStatement) {
      throw new Error(`Malware open statement tokens at line ${tokens[pos].line}`);
    }

    const iterateVariable = new VariableExpr(tokens[pos + 2].lexeme);
    const collectionVariable = new VariableExpr(tokens[pos + 4].lexeme);
    this.advance(6);

    const expression = this.expression();
    pos = this.current;
    const isValidCloseStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.EndFor &&
      tokens[pos + 2].tokenType === TokenType.StmtClose;

    if (!isValidCloseStatement) {
      throw new Error(`Malware close statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(3);
    return new ForNodeExpr(iterateVariable, collectionVariable, expression);
  }
  private parseIfElse(): IfNodeExpr {
    let pos = this.current;
    const isValidOpenStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.If &&
      tokens[pos + 2].tokenType === TokenType.Identifier &&
      tokens[pos + 3].tokenType === TokenType.StmtClose &&
      tokens[pos + 4].tokenType === TokenType.AttrValue;

    if (!isValidOpenStatement) {
      throw new Error(`Malware open statement tokens at line ${tokens[pos].line}`);
    }
    const ifMatchVariable = new VariableExpr(tokens[pos + 2].lexeme);
    const ifBranchTemplate = new TextNodeExpr(tokens[pos + 4].lexeme);
    let elseBranchTemplate;

    this.advance(5);
    pos = this.current;

    const hasElseBranchStatement =
      isValidOpenStatement &&
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.Else;

    const isValidElseStatement =
      hasElseBranchStatement &&
      tokens[pos + 1].tokenType === TokenType.Else &&
      tokens[pos + 2].tokenType === TokenType.StmtClose &&
      tokens[pos + 3].tokenType === TokenType.AttrValue;

    if (hasElseBranchStatement && !isValidElseStatement) {
      throw new Error(`Malware else branch statement tokens at line ${tokens[pos].line}`);
    }

    if (hasElseBranchStatement) {
      elseBranchTemplate = isValidElseStatement
        ? new TextNodeExpr(tokens[pos + 3].lexeme)
        : undefined;
      this.advance(4);
    }

    pos = this.current;

    const isValidCloseStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.EndIf &&
      tokens[pos + 2].tokenType === TokenType.StmtClose;

    if (!isValidCloseStatement) {
      throw new Error(`Malware close statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(3);

    return new IfNodeExpr(ifMatchVariable, ifBranchTemplate, elseBranchTemplate);
  }

  private parseVariableExpr(): VariableExpr {
    const pos = this.current;
    const isValidVariableExpr =
      tokens[pos].tokenType === TokenType.VarOpen &&
      tokens[pos + 1].tokenType === TokenType.Identifier &&
      tokens[pos + 2].tokenType === TokenType.VarClose;

    if (!isValidVariableExpr) {
      throw new Error(`Malware variable statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(3);
    return new VariableExpr(tokens[pos + 1].lexeme);
  }

  private parseAttributes(): AttributeExpr[] {
    const attributes: AttributeExpr[] = [];

    while (!this.match(TokenType.TagClose)) {
      let attrName = '';
      const attrValue = [];

      if (this.match(TokenType.AttrName)) {
        attrName = this.peek().lexeme;
        this.advance();

        while (!this.match(TokenType.AttrName) && !this.match(TokenType.TagClose)) {
          if (this.match(TokenType.AttrValue)) {
            attrValue.push(this.peek().lexeme);
          } else if (this.match(TokenType.VarOpen)) {
            const variableExpr = this.parseVariableExpr();
            attrValue.push(variableExpr);
          } else if (this.match(TokenType.StmtOpen)) {
            const ifNodeExpr = this.parseIfElse();
            attrValue.push(ifNodeExpr);
          }
          this.advance();
        }
      }

      if (attrName) {
        const attribute = new AttributeExpr(attrName, attrValue);
        attributes.push(attribute);
      }
    }

    return attributes;
  }

  private parseOpenTag() {
    const tagName = this.advance();
    const parsedAttributes = this.parseAttributes();

    this.advance();
    return { openTagName: tagName.lexeme, attributes: parsedAttributes };
  }

  private parseCloseTag() {
    const tagName = this.advance();

    while (!this.match(TokenType.TagClose)) {
      this.advance();
    }
    this.advance();

    return tagName.lexeme;
  }

  private parseElementNode(): ElementNodeExpr {
    this.advance();
    const { openTagName, attributes } = this.parseOpenTag();

    const children = [];
    while (!this.match(TokenType.TagEndClose)) {
      const expression = this.expression();
      children.push(expression);
    }

    if (this.peek().tokenType !== TokenType.TagEndClose) {
      throw new Error('Unexpected token type for close');
    }
    this.advance();

    const closeTagName = this.parseCloseTag();
    if (closeTagName !== openTagName) {
      throw new Error('Unexpected closeTagName for close');
    }

    return new ElementNodeExpr(openTagName, children, attributes);
  }
  // parse methods end

  // main method: accept and parse first of next: <someTag>expr</someTag> or varStmt or ifElseStmt or forStmt or text
  public parse() {
    return this.expression();
  }
}

// const scanner = new Scanner(
//   `<div class="div-wrapper div-wrapper-big"><span class="{% if isPrimary %}btn-primary{% else %}btn-secondary{% endif %}" data-qa="{% if isPrimary %} main-title {% endif %}">{{customText}}</span>{{otherText}}</div>`,
// );
// const scanner = new Scanner(`Hello world! <div>someText</div> Whis is suffix text)`);
// const scanner = new Scanner(`<div>someText</div><div>someText</div>`);
// const scanner = new Scanner(`
//    <button class="{% if isPrimary %}btn-primary{% else %}btn-secondary{% endif %}" data-qa="{% if isPrimary %} main-title {% endif %}">
//   Click me
// </button>
//     `);
const scanner = new Scanner(`
     <ul>
      {% for user in users %}
        <li>{{ user.name }}</li>
      {% endfor %}
    </ul>
  `);
const tokens = scanner.startScan();

const parser = new Parser(tokens);
const expr = parser.parse();
console.log(expr);
